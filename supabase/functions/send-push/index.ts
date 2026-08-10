// Sends a Web Push notification to every staff push_subscriptions row,
// invoked by the admin app right after a notification-triggering insert
// (new lead/booking/ticket/reply) fires the DB trigger in
// 0023_notifications.sql. Not itself a DB trigger — Postgres can't make
// outbound HTTPS calls, so the client calls this function immediately after
// the insert that created the notification.
//
// Implements Web Push (RFC 8291 message encryption + RFC 8292 VAPID) from
// scratch with Deno's built-in Web Crypto, no `web-push` npm package — same
// "smallest thing that actually talks the real protocol" approach already
// used for send-test-email's raw-socket SMTP client and the Stripe/Razorpay
// webhook HMAC verification. Admin/staff-only trigger (called from the
// authenticated admin app), but runs privileged (service-role) since it
// needs to read every staff member's push_subscriptions row, not just the
// caller's own.
//
// CREDENTIAL GAP: if VAPID_PRIVATE_KEY/VITE_VAPID_PUBLIC_KEY are unset, this
// fails soft (501) rather than silently no-op'ing — matches this project's
// convention (see stripe-webhook, razorpay-webhook) of never accepting a
// call it can't actually service.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, { status });
}

function base64UrlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((sum, a) => sum + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

/** Imports the raw VAPID private key (32-byte d value, base64url) as an ECDSA P-256 signing key. */
async function importVapidPrivateKey(privateKeyB64Url: string, publicKeyB64Url: string): Promise<CryptoKey> {
  const d = base64UrlToBytes(privateKeyB64Url);
  const pub = base64UrlToBytes(publicKeyB64Url); // uncompressed point: 0x04 || x(32) || y(32)
  const x = pub.subarray(1, 33);
  const y = pub.subarray(33, 65);
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    d: bytesToBase64Url(d),
    x: bytesToBase64Url(x),
    y: bytesToBase64Url(y),
    ext: true,
  };
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

/** Builds and signs the VAPID JWT (RFC 8292) authorizing this server to push to `audience` (the push service's origin). */
async function buildVapidHeader(
  audience: string,
  subject: string,
  publicKeyB64Url: string,
  privateKey: CryptoKey,
): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject,
  };
  const encoder = new TextEncoder();
  const headerB64 = bytesToBase64Url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const sigDer = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    encoder.encode(signingInput),
  );
  // Web Crypto returns raw (r||s) for ECDSA, not DER — exactly what the JWT needs.
  const sigB64 = bytesToBase64Url(new Uint8Array(sigDer));

  return `${signingInput}.${sigB64}`;
}

/**
 * Encrypts `payload` per RFC 8291 (aes128gcm content coding) using the push
 * subscription's p256dh (receiver public key) and auth secret. Returns the
 * full body to POST to the push service (salt + record-size + key-length +
 * key || ciphertext, per RFC 8188's aes128gcm framing).
 */
async function encryptPayload(
  payload: string,
  p256dhB64Url: string,
  authB64Url: string,
): Promise<Uint8Array> {
  const receiverPublicKeyBytes = base64UrlToBytes(p256dhB64Url);
  const authSecret = base64UrlToBytes(authB64Url);

  const receiverPublicKey = await crypto.subtle.importKey(
    "raw",
    receiverPublicKeyBytes,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    [],
  );

  const senderKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );
  const senderPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", senderKeyPair.publicKey),
  );

  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: receiverPublicKey },
    senderKeyPair.privateKey,
    256,
  );
  const sharedSecret = new Uint8Array(sharedSecretBits);

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const encoder = new TextEncoder();
  const hkdfKeyMaterial = await crypto.subtle.importKey("raw", sharedSecret, "HKDF", false, ["deriveBits"]);

  // PRK from the auth secret (RFC 8291 section 3.3)
  const authInfo = concatBytes(encoder.encode("WebPush: info\0"), receiverPublicKeyBytes, senderPublicKeyRaw);
  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: authSecret, info: authInfo },
      hkdfKeyMaterial,
      256,
    ),
  );

  const ikmKeyMaterial = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);

  const cekInfo = encoder.encode("Content-Encoding: aes128gcm\0");
  const cek = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: cekInfo }, ikmKeyMaterial, 128),
  );

  const nonceInfo = encoder.encode("Content-Encoding: nonce\0");
  const nonce = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: nonceInfo }, ikmKeyMaterial, 96),
  );

  const aesKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);

  // Plaintext gets a single 0x02 delimiter byte appended (last-record padding, RFC 8188).
  const plaintext = concatBytes(encoder.encode(payload), new Uint8Array([2]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, aesKey, plaintext),
  );

  // aes128gcm header: salt(16) || record_size(4, big-endian) || key_id_len(1) || key_id(senderPublicKeyRaw)
  const recordSize = new Uint8Array(4);
  new DataView(recordSize.buffer).setUint32(0, 4096, false);
  const keyIdLen = new Uint8Array([senderPublicKeyRaw.length]);

  return concatBytes(salt, recordSize, keyIdLen, senderPublicKeyRaw, ciphertext);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const vapidPublicKey = Deno.env.get("VITE_VAPID_PUBLIC_KEY");
  const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");
  if (!vapidPublicKey || !vapidPrivateKey || !vapidSubject) {
    return jsonResponse(
      { error: "Web Push is not configured yet — VAPID keys missing. Run scripts/generate-vapid-keys.mjs." },
      501,
    );
  }

  let body: { title?: string; body?: string; url?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  if (!body.title || !body.body) {
    return jsonResponse({ error: "title and body are required" }, 400);
  }

  const { data: subscriptions, error: subError } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");
  if (subError) {
    console.error("failed to load push_subscriptions", subError);
    return jsonResponse({ error: "Failed to load push subscriptions" }, 500);
  }
  if (!subscriptions || subscriptions.length === 0) {
    return jsonResponse({ sent: 0, failed: 0, message: "No push subscriptions registered." });
  }

  const privateKey = await importVapidPrivateKey(vapidPrivateKey, vapidPublicKey);
  const payloadJson = JSON.stringify({ title: body.title, body: body.body, url: body.url ?? "/admin" });

  let sent = 0;
  const staleIds: string[] = [];

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        const endpointUrl = new URL(sub.endpoint);
        const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
        const vapidHeader = await buildVapidHeader(audience, vapidSubject, vapidPublicKey, privateKey);
        const encryptedBody = await encryptPayload(payloadJson, sub.p256dh, sub.auth);

        const res = await fetch(sub.endpoint, {
          method: "POST",
          headers: {
            Authorization: `vapid t=${vapidHeader}, k=${vapidPublicKey}`,
            "Content-Type": "application/octet-stream",
            "Content-Encoding": "aes128gcm",
            TTL: "86400",
          },
          body: encryptedBody,
        });

        if (res.status === 404 || res.status === 410) {
          // Push service confirms this endpoint is gone (browser unsubscribed
          // or uninstalled) — prune it so future sends don't keep retrying it.
          staleIds.push(sub.id);
        } else if (res.ok) {
          sent++;
        } else {
          console.error(`push send failed for subscription ${sub.id}: ${res.status} ${await res.text()}`);
        }
      } catch (e) {
        console.error(`push send threw for subscription ${sub.id}`, e);
      }
    }),
  );

  if (staleIds.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", staleIds);
  }

  return jsonResponse({ sent, failed: subscriptions.length - sent - staleIds.length, pruned: staleIds.length });
});
