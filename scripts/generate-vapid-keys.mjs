// Generates a VAPID keypair for Web Push (docs/07) using plain Node crypto —
// no `web-push` package dependency, matching this project's from-scratch
// precedent for SMTP/webhook HMAC (see send-test-email, stripe-webhook).
// Run once per environment: `node scripts/generate-vapid-keys.mjs`
import { generateKeyPairSync } from 'node:crypto'

const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' })

const pubDer = publicKey.export({ type: 'spki', format: 'der' })
const rawPublicKey = pubDer.subarray(pubDer.length - 65) // last 65 bytes = uncompressed EC point

const privJwk = privateKey.export({ format: 'jwk' })
const rawPrivateKey = Buffer.from(privJwk.d, 'base64url')

console.log('VITE_VAPID_PUBLIC_KEY=' + rawPublicKey.toString('base64url'))
console.log('VAPID_PRIVATE_KEY=' + rawPrivateKey.toString('base64url'))
console.log('\nAdd VITE_VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY to .env.local, and')
console.log('VAPID_PRIVATE_KEY (+ VITE_VAPID_PUBLIC_KEY, needed for the JWT "aud"/key pairing) to supabase/functions/.env')
