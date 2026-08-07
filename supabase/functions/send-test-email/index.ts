// Sends a real test email for the admin Settings > Email/SMTP "Send a test
// mail to" field. Admin-only: the caller's JWT is checked against
// profiles.role manually (verify_jwt = false, same reasoning as every other
// function in this project — see google-drive-oauth-start/index.ts for the
// full rationale on this repo's classic-JWT-key standardization).
//
// SMTP connection config + credentials are read from the `smtp` settings row
// (DB-stored per this session's secrets-handling decision — see
// docs/logs.md), not environment variables.
//
// No SMTP client library exists for Deno edge functions in this repo (and
// none is added here) — this implements a minimal SMTP client directly over
// TCP/TLS sockets: EHLO, AUTH LOGIN, MAIL FROM/RCPT TO/DATA. Supports
// implicit TLS (port 465, e.g. Gmail/Hostinger) and STARTTLS (port 587/25,
// e.g. Brevo/SendGrid relay) — the two connection modes covering the large
// majority of real SMTP providers. TLS mode is derived primarily from the
// port (465 = implicit TLS is the near-universal convention), not just the
// `security_type` label, since "TLS" in a settings UI commonly means
// "encrypted" without the admin knowing/caring about the implicit-vs-STARTTLS
// distinction — a mismatch here (e.g. attempting STARTTLS against a port
// that only speaks implicit TLS) hangs rather than errors, which is exactly
// the failure mode this function must not have. This mirrors the same
// "write the smallest thing that actually works over raw protocol" approach
// already used for Stripe/Razorpay webhook signature verification (HMAC
// computed directly, no SDK).
//
// Every network operation below is wrapped with an explicit timeout — a
// slow/unreachable/misconfigured host must fail with a clear error within a
// bounded time, never hang the request indefinitely (caught during real
// verification against a real host: an unreachable SMTP server otherwise
// hangs forever with no error surfaced to the admin).
//
// CREDENTIAL GAP: until real SMTP host/user/password are saved via the
// Settings UI, this fails soft with a clear "not configured" message.

import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const OPERATION_TIMEOUT_MS = 15_000;

async function withTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  let timer: number;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), OPERATION_TIMEOUT_MS);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
}

function jsonResponse(payload: unknown, status = 200) {
  return Response.json(payload, {
    status,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface SmtpSettingsValue {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  security_type?: "tls" | "ssl" | "none";
  from_email?: string;
  from_address?: string;
  from_name?: string;
}

class SmtpClient {
  #conn: Deno.Conn;
  #reader: ReadableStreamDefaultReader<Uint8Array>;
  #decoder = new TextDecoder();
  #encoder = new TextEncoder();

  private constructor(conn: Deno.Conn) {
    this.#conn = conn;
    this.#reader = conn.readable.getReader();
  }

  static async connect(host: string, port: number, implicitTls: boolean): Promise<SmtpClient> {
    const conn = await withTimeout(
      implicitTls ? Deno.connectTls({ hostname: host, port }) : Deno.connect({ hostname: host, port }),
      `Timed out connecting to ${host}:${port}`,
    );
    const client = new SmtpClient(conn);
    await client.#readResponse();
    return client;
  }

  async #readResponse(): Promise<string> {
    const { value, done } = await withTimeout(this.#reader.read(), "Timed out waiting for SMTP server response");
    if (done || !value) throw new Error("SMTP connection closed unexpectedly");
    return this.#decoder.decode(value);
  }

  async #send(line: string): Promise<string> {
    await this.#conn.write(this.#encoder.encode(line + "\r\n"));
    return await this.#readResponse();
  }

  async ehlo(hostname: string): Promise<string> {
    return await this.#send(`EHLO ${hostname}`);
  }

  async startTls(host: string): Promise<void> {
    const res = await this.#send("STARTTLS");
    if (!res.startsWith("220")) throw new Error(`STARTTLS rejected: ${res.trim()}`);
    this.#reader.releaseLock();
    const tlsConn = await withTimeout(
      Deno.startTls(this.#conn as Deno.TcpConn, { hostname: host }),
      `Timed out negotiating STARTTLS with ${host}`,
    );
    this.#conn = tlsConn;
    this.#reader = tlsConn.readable.getReader();
  }

  async authLogin(user: string, password: string): Promise<void> {
    let res = await this.#send("AUTH LOGIN");
    if (!res.startsWith("334")) throw new Error(`AUTH LOGIN rejected: ${res.trim()}`);
    res = await this.#send(btoa(user));
    if (!res.startsWith("334")) throw new Error(`SMTP username rejected: ${res.trim()}`);
    res = await this.#send(btoa(password));
    if (!res.startsWith("235")) throw new Error(`SMTP authentication failed: ${res.trim()}`);
  }

  async sendMail(from: string, to: string, subject: string, body: string): Promise<void> {
    let res = await this.#send(`MAIL FROM:<${from}>`);
    if (!res.startsWith("250")) throw new Error(`MAIL FROM rejected: ${res.trim()}`);
    res = await this.#send(`RCPT TO:<${to}>`);
    if (!res.startsWith("250")) throw new Error(`RCPT TO rejected: ${res.trim()}`);
    res = await this.#send("DATA");
    if (!res.startsWith("354")) throw new Error(`DATA rejected: ${res.trim()}`);

    const message = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      body,
      ".",
    ].join("\r\n");

    res = await this.#send(message);
    if (!res.startsWith("250")) throw new Error(`Message rejected: ${res.trim()}`);
  }

  async quit(): Promise<void> {
    try {
      await this.#send("QUIT");
    } catch {
      // best-effort — connection may already be closing
    } finally {
      this.#reader.releaseLock();
      try {
        this.#conn.close();
      } catch {
        // already closed
      }
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return jsonResponse({ error: "Missing Authorization header" }, 401);

  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData?.user) return jsonResponse({ error: "Invalid session" }, 401);

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return jsonResponse({ error: "Admins only" }, 403);
  }

  let body: { to?: string };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const to = body.to?.trim();
  if (!to) return jsonResponse({ error: "A recipient email address is required" }, 400);

  const { data: setting, error: settingError } = await admin
    .from("settings")
    .select("value")
    .eq("key", "smtp")
    .maybeSingle();

  if (settingError) return jsonResponse({ error: "Failed to load SMTP settings" }, 500);

  const smtp = (setting?.value as SmtpSettingsValue | null) ?? {};
  const host = smtp.host;
  const port = smtp.port ?? 587;
  const user = smtp.user;
  const password = smtp.password;
  const securityType = smtp.security_type ?? "tls";
  const fromEmail = smtp.from_email || smtp.from_address;
  const fromName = smtp.from_name;

  if (!host || !user || !password || !fromEmail) {
    return jsonResponse(
      { error: "SMTP is not fully configured yet — host, user, password, and from email are all required. Save them in Settings first." },
      501,
    );
  }

  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

  // Implicit TLS (connect already encrypted) vs. STARTTLS (connect plain,
  // then upgrade) is a property of the port/provider, not really a free
  // choice — port 465 is implicit TLS almost universally (Gmail, Hostinger,
  // etc.), while 587/25 negotiate STARTTLS. Deriving primarily from the port
  // avoids a STARTTLS attempt against a server that only speaks implicit
  // TLS on 465, which just hangs instead of failing cleanly. `security_type:
  // "none"` is still honored as an explicit opt-out of TLS entirely.
  const useTls = securityType !== "none";
  const implicitTls = useTls && port === 465;
  const useStartTls = useTls && !implicitTls;

  let client: SmtpClient | null = null;
  try {
    client = await SmtpClient.connect(host, port, implicitTls);
    let ehloResponse = await client.ehlo(host);

    if (useStartTls) {
      await client.startTls(host);
      ehloResponse = await client.ehlo(host);
    }

    // Only attempt AUTH if the server actually advertises support for it —
    // some relays (and local dev SMTP catchers like Mailpit/Inbucket) accept
    // mail with no authentication at all, and blindly sending AUTH LOGIN to
    // one returns "502 Command not implemented" instead of proceeding.
    if (/(^|\n)250[- ]AUTH/im.test(ehloResponse)) {
      await client.authLogin(user, password);
    }

    await client.sendMail(
      fromEmail,
      to,
      "SynergyFirst Digital — SMTP test email",
      "This is a test email sent from the SynergyFirst Digital admin Settings page to confirm your SMTP configuration is working.",
    );
    await client.quit();

    return jsonResponse({ sent: true, to, from });
  } catch (err) {
    if (client) await client.quit().catch(() => {});
    const rawMessage = err instanceof Error ? err.message : String(err);
    console.error("send-test-email failed", rawMessage);

    // Certificate trust failures are common enough (and confusing enough as
    // a raw Deno exception) to deserve a specific, actionable message —
    // e.g. a local antivirus/firewall TLS-inspection proxy re-signing
    // outbound connections with its own CA, which the server this function
    // runs on won't trust, is a real scenario an admin could hit and needs
    // a pointer toward, not just "UnknownIssuer".
    const message = /UnknownIssuer|invalid peer certificate/i.test(rawMessage)
      ? `${rawMessage} — the mail server's TLS certificate could not be verified. This can happen if the server running this app is behind a network proxy or antivirus that intercepts TLS connections (some antivirus "mail/web shield" features re-sign HTTPS/SMTP traffic with their own certificate), or if the SMTP host/port genuinely has a certificate problem.`
      : rawMessage;

    return jsonResponse({ error: `Failed to send test email: ${message}` }, 502);
  }
});
