// Minimal SMTP client over raw TCP/TLS sockets (EHLO, AUTH LOGIN, MAIL
// FROM/RCPT TO/DATA) — no SMTP client library exists for Deno edge functions
// in this repo, and none is added here. Originally written for
// send-test-email (see docs/logs.md's 2026-08-07 entries for the two real
// hang bugs found and fixed against a real Hostinger server); extracted here
// so send-email (Phase 5 automated sequences) reuses the exact same,
// already-verified protocol implementation instead of a second copy that
// could drift and silently reintroduce either bug.
//
// Supports implicit TLS (port 465, e.g. Gmail/Hostinger) and STARTTLS (port
// 587/25, e.g. Brevo/SendGrid relay). TLS mode is derived primarily from the
// port (465 = implicit TLS is the near-universal convention), not just a
// "security_type" label, since attempting STARTTLS against a port that only
// speaks implicit TLS hangs rather than errors cleanly. Every network
// operation is wrapped with an explicit timeout — an unreachable/misconfigured
// host must fail within a bounded time, never hang the request indefinitely.

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

export interface SmtpSettingsValue {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  security_type?: "tls" | "ssl" | "none";
  from_email?: string;
  from_address?: string;
  from_name?: string;
}

export class SmtpClient {
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

  /** subject/body may be plain text or HTML — pass isHtml to set the right Content-Type. */
  async sendMail(from: string, to: string, subject: string, body: string, isHtml = false): Promise<void> {
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
      `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
      "",
      body.replace(/^\./gm, ".."), // dot-stuffing per RFC 5321 4.5.2 — a line starting with '.' would otherwise terminate DATA early
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

/**
 * Certificate trust failures are common enough (and confusing enough as a
 * raw Deno exception) to deserve a specific, actionable message — e.g. a
 * local antivirus/firewall TLS-inspection proxy re-signing outbound
 * connections with its own CA, which the server this function runs on won't
 * trust. See docs/logs.md's 2026-08-07 Avast diagnosis for the real-world
 * case this was written for.
 */
export function describeSmtpError(rawMessage: string): string {
  return /UnknownIssuer|invalid peer certificate/i.test(rawMessage)
    ? `${rawMessage} — the mail server's TLS certificate could not be verified. This can happen if the server running this app is behind a network proxy or antivirus that intercepts TLS connections (some antivirus "mail/web shield" features re-sign HTTPS/SMTP traffic with their own certificate), or if the SMTP host/port genuinely has a certificate problem.`
    : rawMessage;
}

/**
 * Connects, sends one message, and disconnects — the common case for both
 * send-test-email and send-email. Derives implicit-TLS-vs-STARTTLS from the
 * port per the module comment above.
 */
export async function sendSingleEmail(
  smtp: SmtpSettingsValue,
  to: string,
  subject: string,
  body: string,
  isHtml = false,
): Promise<void> {
  const host = smtp.host;
  const port = smtp.port ?? 587;
  const user = smtp.user;
  const password = smtp.password;
  const securityType = smtp.security_type ?? "tls";
  const fromEmail = smtp.from_email || smtp.from_address;
  const fromName = smtp.from_name;

  // user/password are optional, not required — sendMail() below only
  // attempts AUTH if the server actually advertises support for it (e.g.
  // local Mailpit/Inbucket and some no-auth relays accept mail with no
  // credentials at all). Requiring them unconditionally would make this
  // client unable to talk to a real no-auth relay even though the AUTH
  // logic already handles that case correctly.
  if (!host || !fromEmail) {
    throw new Error("SMTP is not fully configured yet — host and from email are required.");
  }

  const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
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
    // mail with no authentication at all.
    if (/(^|\n)250[- ]AUTH/im.test(ehloResponse)) {
      await client.authLogin(user, password);
    }

    await client.sendMail(fromEmail, to, subject, body, isHtml);
    await client.quit();
  } catch (err) {
    if (client) await client.quit().catch(() => {});
    const rawMessage = err instanceof Error ? err.message : String(err);
    throw new Error(describeSmtpError(rawMessage));
  }
}
