"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingConfirmation = sendBookingConfirmation;
const config_1 = require("../config");
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
// Brevo transactional email API руу мэйл илгээх суурь функц
async function sendEmail({ to, subject, htmlContent, textContent }) {
    if (!config_1.config.BREVO_API_KEY || !config_1.config.MAIL_FROM_EMAIL) {
        console.warn('[mailer] BREVO_API_KEY эсвэл MAIL_FROM_EMAIL тохируулаагүй — мэйл илгээгдсэнгүй');
        return false;
    }
    try {
        const res = await fetch(BREVO_ENDPOINT, {
            method: 'POST',
            headers: {
                'api-key': config_1.config.BREVO_API_KEY,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify({
                sender: { email: config_1.config.MAIL_FROM_EMAIL, name: config_1.config.MAIL_FROM_NAME },
                to,
                subject,
                htmlContent,
                ...(textContent ? { textContent } : {}),
            }),
        });
        if (!res.ok) {
            const body = await res.text();
            console.error(`[mailer] Brevo алдаа ${res.status}: ${body}`);
            return false;
        }
        return true;
    }
    catch (err) {
        console.error('[mailer] Мэйл илгээхэд алдаа гарлаа:', err);
        return false;
    }
}
const esc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
// Захиалга баталгаажсан үед захиалагч руу илгээх мэйл (швед хэлээр)
async function sendBookingConfirmation(booking) {
    if (!booking.email)
        return false;
    const row = (label, value) => `
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:14px;">${esc(label)}</td>
      <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${esc(value)}</td>
    </tr>`;
    const html = `
  <div style="background:#f3f4f6;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#efbf04;padding:20px 24px;">
        <h1 style="margin:0;font-size:20px;color:#111827;">${esc(config_1.config.MAIL_FROM_NAME)}</h1>
      </div>
      <div style="padding:24px;">
        <div style="display:inline-block;background:#dcfce7;color:#166534;font-size:13px;font-weight:700;padding:6px 14px;border-radius:999px;margin-bottom:16px;">
          ✓ Bekräftad bokning
        </div>
        <p style="font-size:16px;color:#111827;margin:0 0 8px;">Hej ${esc(booking.name)},</p>
        <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 20px;">
          Din bokning är nu <strong>bekräftad</strong>. Tack för att du valde ${esc(config_1.config.MAIL_FROM_NAME)}!
          Nedan ser du detaljerna för din resa.
        </p>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;">
          ${row('Från', booking.from)}
          ${row('Till', booking.to)}
          ${row('Tid', booking.when)}
          ${row('Passagerare', booking.passengerCount)}
          ${booking.carSize ? row('Fordon', booking.carSize) : ''}
          ${booking.price > 0 ? row('Pris', `${booking.price} SEK`) : ''}
        </table>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:20px 0 0;">
          Har du frågor? Svara på detta mejl eller kontakta oss så hjälper vi dig.
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px 24px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">${esc(config_1.config.MAIL_FROM_NAME)} · Uppsala</p>
      </div>
    </div>
  </div>`;
    const text = `Hej ${booking.name},\n\n` +
        `Din bokning är nu bekräftad. Tack för att du valde ${config_1.config.MAIL_FROM_NAME}!\n\n` +
        `Från: ${booking.from}\n` +
        `Till: ${booking.to}\n` +
        `Tid: ${booking.when}\n` +
        `Passagerare: ${booking.passengerCount}\n` +
        (booking.carSize ? `Fordon: ${booking.carSize}\n` : '') +
        (booking.price > 0 ? `Pris: ${booking.price} SEK\n` : '') +
        `\nHar du frågor? Svara på detta mejl så hjälper vi dig.`;
    return sendEmail({
        to: [{ email: booking.email, name: booking.name }],
        subject: 'Din bokning är bekräftad ✓',
        htmlContent: html,
        textContent: text,
    });
}
