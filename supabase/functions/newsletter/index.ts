// Domotty · Edge Function "newsletter"
// Azioni: subscribe (invia l'email di conferma), confirm, unsubscribe.
// Due newsletter separate: Domotty (domotty.it) e Maistu (maistu.it), riconosciute dal campo «sito».
// Segreti Domotty: SMTP_USER, SMTP_PASS, MAIL_FROM
//   facoltativi: SMTP_HOST (default smtps.register.it), SMTP_PORT (default 465), SITE_URL, ALLOWED_ORIGINS
// Segreti Maistu: MAISTU_SMTP_USER, MAISTU_SMTP_PASS
//   facoltativi: MAISTU_MAIL_FROM (default «Maistu <assistenza@maistu.it>»), MAISTU_SMTP_HOST/PORT, MAISTU_SITE_URL
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import nodemailer from "npm:nodemailer@6.9.14";

const env = (k: string, d = "") => Deno.env.get(k) ?? d;
const SITE = env("SITE_URL", "https://domotty.it").replace(/\/$/, "");
const ALLOWED = env("ALLOWED_ORIGINS",
  "https://domotty.it,https://www.domotty.it,https://maistu.it,https://www.maistu.it,https://dreamtheatermarco-hub.github.io,https://domotty.github.io")
  .split(",").map((s) => s.trim()).filter(Boolean);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_RE = /^[A-Za-z0-9-]{20,80}$/;

function cors(origin: string | null) {
  const allow = origin && ALLOWED.includes(origin) ? origin : ALLOWED[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Vary": "Origin",
  };
}
const json = (body: unknown, status: number, h: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...h, "Content-Type": "application/json" } });
type Sito = "domotty" | "maistu";
const MAISTU_ORIGINS = ["https://maistu.it", "https://www.maistu.it"];
const DOMOTTY_ORIGINS = ["https://domotty.it", "https://www.domotty.it"];
function quale(origin: string | null, campo: unknown): Sito {
  if (origin && MAISTU_ORIGINS.includes(origin)) return "maistu";
  if (origin && DOMOTTY_ORIGINS.includes(origin)) return "domotty";
  return campo === "maistu" ? "maistu" : "domotty";
}
function invio(sito: Sito) {
  const host = env("SMTP_HOST", "smtps.register.it"), port = Number(env("SMTP_PORT", "465"));
  return sito === "maistu"
    ? { from: env("MAISTU_MAIL_FROM", "Maistu <assistenza@maistu.it>"), site: env("MAISTU_SITE_URL", "https://maistu.it").replace(/\/$/, ""),
        host: env("MAISTU_SMTP_HOST", host), port: Number(env("MAISTU_SMTP_PORT", String(port))), user: env("MAISTU_SMTP_USER"), pass: env("MAISTU_SMTP_PASS") }
    : { from: env("MAIL_FROM"), site: SITE, host, port, user: env("SMTP_USER"), pass: env("SMTP_PASS") };
}
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
function confirmEmailMaistu(link: string, site: string) {
  const text = `Ciao!\n\nGrazie per esserti iscritto alle novità di Maistu.\nPer confermare l'iscrizione apri questo link:\n${link}\n\nSe non sei stato tu, ignora questa email: senza conferma non riceverai nulla.\n\nMaistu è il gestionale su misura di Domotty.\nDomotty S.r.l. · Via Monsignor Cherchi 26, 09027 San Sperate (CA)\nInformativa privacy: ${site}/privacy.html`;
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="dark light"><title>Conferma la tua iscrizione</title></head>
<body style="margin:0;padding:0;background:#0B1A33;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B1A33;"><tr><td align="center" style="padding:28px 16px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:584px;">
<tr><td style="padding:0 4px 18px;"><a href="${site}" style="text-decoration:none;"><img src="${site}/assets/img/email/maistu-logo-email.png" width="200" height="71" alt="Maistu · Il gestionale su misura" style="display:block;border:0;width:200px;height:auto;color:#F5F7FB;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;letter-spacing:6px;"></a></td></tr>
<tr><td style="background:#10223F;border:1px solid #23406A;border-radius:20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:22px 32px 0;"><img src="${site}/assets/img/email/maistu-cornice-email.png" width="120" height="6" alt="" style="display:block;border:0;width:120px;height:6px;"></td></tr>
<tr><td style="padding:16px 32px 30px;font-family:Poppins,Arial,Helvetica,sans-serif;">
<p style="margin:0 0 14px;color:#F7842A;font-family:'JetBrains Mono',Consolas,'Courier New',monospace;font-size:11px;letter-spacing:3px;text-transform:uppercase;">Il gestionale su misura</p>
<h1 style="margin:0 0 16px;color:#F5F7FB;font-size:26px;line-height:1.25;font-weight:700;">Conferma la tua iscrizione</h1>
<p style="margin:0 0 14px;color:#C3CEE0;font-size:16px;line-height:1.6;">Grazie per esserti iscritto alle novità di Maistu: nuovi moduli, consigli per lavorare meglio e le novità di Jana. Poche email, solo quando hanno qualcosa da dire.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px 0 6px;"><tr><td style="background:#F7842A;border-radius:999px;"><a href="${esc(link)}" style="display:inline-block;padding:13px 26px;color:#0B1A33;font-family:Poppins,Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;text-decoration:none;">Conferma l'iscrizione</a></td></tr></table>
<p style="margin:18px 0 0;color:#93A3BE;font-size:13px;line-height:1.5;">Se non sei stato tu, ignora questa email: senza conferma non riceverai nulla.</p>
</td></tr></table></td></tr>
<tr><td style="padding:18px 6px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#93A3BE;"><span style="color:#C3CEE0;">Maistu</span> è il gestionale su misura di Domotty.<br>Domotty S.r.l. · Via Monsignor Cherchi 26, 09027 San Sperate (CA)<br><a href="${site}" style="color:#F7842A;text-decoration:none;">maistu.it</a> · <a href="${site}/privacy.html" style="color:#F7842A;">Informativa privacy</a></td></tr>
</table></td></tr></table></body></html>`;
  return { text, html };
}
const token = () => crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "").slice(0, 8);

function confirmEmail(link: string) {
  const text = `Ciao!\n\nGrazie per esserti iscritto alla newsletter Domotty.\nPer confermare l'iscrizione apri questo link:\n${link}\n\nSe non sei stato tu, ignora questa email: senza conferma non riceverai nulla.\n\nDomotty S.r.l. · Via Monsignor Cherchi 26, 09027 San Sperate (CA)\nInformativa privacy: ${SITE}/privacy.html`;
  const html = `<div style="background:#0B1A33;padding:36px 16px;font-family:Arial,sans-serif">
  <div style="max-width:520px;margin:0 auto;background:#10223F;border-radius:20px;padding:32px;color:#C3CEE0">
    <p style="font-size:13px;letter-spacing:4px;color:#F7842A;font-weight:bold;margin:0 0 18px">DOMOTTY</p>
    <h1 style="color:#F5F7FB;font-size:26px;margin:0 0 14px">Conferma la tua iscrizione</h1>
    <p style="font-size:15px;line-height:1.6;margin:0 0 24px">Grazie per esserti iscritto alla newsletter Domotty: novità su domotica, software, automazione e IA. Poche email, solo quando hanno qualcosa da dire.</p>
    <a href="${link}" style="display:inline-block;background:#F7842A;color:#0B1A33;text-decoration:none;font-weight:bold;padding:14px 26px;border-radius:999px">Conferma l'iscrizione</a>
    <p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:#93A3BE">Se non sei stato tu, ignora questa email: senza conferma non riceverai nulla.</p>
  </div>
  <p style="max-width:520px;margin:16px auto 0;font-size:12px;color:#93A3BE;text-align:center">Domotty S.r.l. · Via Monsignor Cherchi 26, 09027 San Sperate (CA) · <a href="${SITE}/privacy.html" style="color:#F7842A">Informativa privacy</a></p>
</div>`;
  return { text, html };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const h = cors(origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers: h });
  if (req.method !== "POST") return json({ ok: false, error: "method" }, 405, h);
  if (origin && !ALLOWED.includes(origin)) return json({ ok: false, error: "origin" }, 403, h);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ ok: false, error: "bad_json" }, 400, h); }
  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
  const action = String(b.action || "subscribe");

  if (action === "confirm" || action === "unsubscribe") {
    const t = String(b.token || "");
    if (!TOKEN_RE.test(t)) return json({ ok: false, error: "token" }, 400, h);
    if (action === "confirm") {
      const { data, error } = await db.from("newsletter_subscribers")
        .update({ status: "active", confirmed_at: new Date().toISOString(), confirm_token: null })
        .eq("confirm_token", t).select("id");
      if (error) { console.error(error); return json({ ok: false, error: "db" }, 500, h); }
      if (!data?.length) return json({ ok: false, error: "token" }, 404, h);
      return json({ ok: true }, 200, h);
    }
    const { data, error } = await db.from("newsletter_subscribers")
      .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString(), confirm_token: null })
      .eq("unsubscribe_token", t).select("id");
    if (error) { console.error(error); return json({ ok: false, error: "db" }, 500, h); }
    if (!data?.length) return json({ ok: false, error: "token" }, 404, h);
    return json({ ok: true }, 200, h);
  }

  // subscribe
  if (String(b.website || "")) return json({ ok: true }, 200, h); // honeypot
  const email = String(b.email || "").trim().toLowerCase().slice(0, 200);
  if (!EMAIL_RE.test(email)) return json({ ok: false, error: "invalid" }, 422, h);
  const sito = quale(origin, b.sito);
  const out = invio(sito);

  const { data: existing } = await db.from("newsletter_subscribers")
    .select("id,status,confirm_sent_at").eq("sito", sito).eq("email", email).maybeSingle();
  // Già iscritto e confermato: rispondiamo ok senza rivelare nulla.
  if (existing?.status === "active") return json({ ok: true }, 200, h);
  // Evita invii ripetuti: al massimo una email di conferma ogni 2 minuti.
  if (existing?.confirm_sent_at && Date.now() - new Date(existing.confirm_sent_at).getTime() < 2 * 60 * 1000) {
    return json({ ok: true }, 200, h);
  }

  const ct = token();
  const now = new Date().toISOString();
  const res = existing
    ? await db.from("newsletter_subscribers").update({ status: "pending", confirm_token: ct, confirm_sent_at: now, unsubscribed_at: null }).eq("id", existing.id)
    : await db.from("newsletter_subscribers").insert({ sito, email, status: "pending", confirm_token: ct, confirm_sent_at: now });
  if (res.error) { console.error(res.error); return json({ ok: false, error: "db" }, 500, h); }

  try {
    const tx = nodemailer.createTransport({
      host: out.host, port: out.port, secure: true, auth: { user: out.user, pass: out.pass },
    });
    const link = `${out.site}/conferma.html?t=${ct}`;
    const { text, html } = sito === "maistu" ? confirmEmailMaistu(link, out.site) : confirmEmail(link);
    const subject = sito === "maistu" ? "Conferma la tua iscrizione alle novità di Maistu" : "Conferma la tua iscrizione alla newsletter Domotty";
    await tx.sendMail({ from: out.from, to: email, subject, text, html });
  } catch (e) {
    console.error("smtp", e);
    return json({ ok: false, error: "smtp" }, 502, h);
  }
  return json({ ok: true }, 200, h);
});
