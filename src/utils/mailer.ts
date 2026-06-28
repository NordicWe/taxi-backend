import { config } from '../config';
import type { Book } from '../model/Book';

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

interface BrevoContact {
  email: string;
  name?: string;
}

interface SendEmailParams {
  to: BrevoContact[];
  subject: string;
  htmlContent: string;
  textContent?: string;
}

// Brevo transactional email API руу мэйл илгээх суурь функц
async function sendEmail({ to, subject, htmlContent, textContent }: SendEmailParams): Promise<boolean> {
  if (!config.BREVO_API_KEY || !config.MAIL_FROM_EMAIL) {
    console.warn('[mailer] BREVO_API_KEY эсвэл MAIL_FROM_EMAIL тохируулаагүй — мэйл илгээгдсэнгүй');
    return false;
  }

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': config.BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: config.MAIL_FROM_EMAIL, name: config.MAIL_FROM_NAME },
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
  } catch (err) {
    console.error('[mailer] Мэйл илгээхэд алдаа гарлаа:', err);
    return false;
  }
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Захиалга баталгаажсан үед захиалагч руу илгээх мэйл (швед хэлээр)
export async function sendBookingConfirmation(booking: Book): Promise<boolean> {
  if (!booking.email) return false;

  // Хоёр хэл дээрх шошго: швед / англи
  const row = (sv: string, en: string, value: unknown) => `
    <tr>
      <td style="padding:7px 0;color:#6b7280;font-size:14px;">${esc(sv)} <span style="color:#9ca3af;">/ ${esc(en)}</span></td>
      <td style="padding:7px 0;color:#111827;font-size:14px;font-weight:600;text-align:right;">${esc(value)}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;">
  <div style="background:#f3f4f6;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#efbf04;padding:20px 24px;">
        <h1 style="margin:0;font-size:20px;color:#111827;">${esc(config.MAIL_FROM_NAME)}</h1>
      </div>
      <div style="padding:24px;">
        <div style="display:inline-block;background:#dcfce7;color:#166534;font-size:13px;font-weight:700;padding:6px 14px;border-radius:999px;margin-bottom:16px;">
          &#10003; Bekräftad bokning / Booking confirmed
        </div>
        <p style="font-size:16px;color:#111827;margin:0 0 8px;">Hej ${esc(booking.name)}, / Hi ${esc(booking.name)},</p>
        <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 6px;">
          Din bokning är nu <strong>bekräftad</strong>. Tack för att du valde ${esc(config.MAIL_FROM_NAME)}! Nedan ser du detaljerna för din resa.
        </p>
        <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 20px;">
          Your booking is now <strong>confirmed</strong>. Thank you for choosing ${esc(config.MAIL_FROM_NAME)}! Below are the details of your trip.
        </p>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;">
          ${row('Från', 'From', booking.from)}
          ${row('Till', 'To', booking.to)}
          ${row('Tid', 'Time', booking.when)}
          ${row('Passagerare', 'Passengers', booking.passengerCount)}
          ${booking.carSize ? row('Fordon', 'Vehicle', booking.carSize) : ''}
          ${booking.price > 0 ? row('Pris', 'Price', `${booking.price} SEK`) : ''}
        </table>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:20px 0 0;">
          Har du frågor? Svara på detta mejl så hjälper vi dig.<br>
          Have questions? Just reply to this email and we'll help you.
        </p>
      </div>
      <div style="background:#f9fafb;padding:16px 24px;border-top:1px solid #e5e7eb;">
        <p style="margin:0;font-size:12px;color:#9ca3af;">${esc(config.MAIL_FROM_NAME)} &middot; Uppsala</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text =
    `Hej ${booking.name}, / Hi ${booking.name},\n\n` +
    `Din bokning är nu bekräftad. Tack för att du valde ${config.MAIL_FROM_NAME}!\n` +
    `Your booking is now confirmed. Thank you for choosing ${config.MAIL_FROM_NAME}!\n\n` +
    `Från / From: ${booking.from}\n` +
    `Till / To: ${booking.to}\n` +
    `Tid / Time: ${booking.when}\n` +
    `Passagerare / Passengers: ${booking.passengerCount}\n` +
    (booking.carSize ? `Fordon / Vehicle: ${booking.carSize}\n` : '') +
    (booking.price > 0 ? `Pris / Price: ${booking.price} SEK\n` : '') +
    `\nHar du frågor? Svara på detta mejl. / Have questions? Just reply to this email.`;

  return sendEmail({
    to: [{ email: booking.email, name: booking.name }],
    subject: 'Din bokning är bekräftad / Your booking is confirmed',
    htmlContent: html,
    textContent: text,
  });
}

// Шинэ захиалга үүсэх үед admin (NOTIFY_EMAIL) руу илгээх мэдэгдэл
export async function sendNewBookingNotification(booking: Book): Promise<boolean> {
  if (!config.NOTIFY_EMAIL) {
    console.warn('[mailer] NOTIFY_EMAIL тохируулаагүй — admin мэдэгдэл илгээгдсэнгүй');
    return false;
  }

  const row = (label: string, value: unknown) => `
    <tr>
      <td style="padding:7px 0;color:#6b7280;font-size:14px;width:130px;">${esc(label)}</td>
      <td style="padding:7px 0;color:#111827;font-size:14px;font-weight:600;">${esc(value)}</td>
    </tr>`;

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;">
  <div style="background:#f3f4f6;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#111827;padding:20px 24px;">
        <h1 style="margin:0;font-size:20px;color:#efbf04;">&#128276; Ny bokning / New booking</h1>
      </div>
      <div style="padding:24px;">
        <p style="font-size:14px;color:#374151;line-height:1.6;margin:0 0 16px;">
          En ny bokning har kommit in. / A new booking has arrived.
        </p>
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #e5e7eb;">
          ${row('Namn / Name', booking.name)}
          ${row('Telefon / Phone', booking.phone)}
          ${booking.email ? row('E-post / Email', booking.email) : ''}
          ${row('Från / From', booking.from)}
          ${row('Till / To', booking.to)}
          ${row('Tid / Time', booking.when)}
          ${row('Passagerare / Passengers', booking.passengerCount)}
          ${booking.carSize ? row('Fordon / Vehicle', booking.carSize) : ''}
          ${booking.havePet ? row('Husdjur / Pet', 'Ja / Yes') : ''}
          ${booking.childSeat ? row('Barnstol / Child seat', 'Ja / Yes') : ''}
          ${booking.price > 0 ? row('Pris / Price', `${booking.price} SEK`) : ''}
          ${booking.notes ? row('Anteckning / Notes', booking.notes) : ''}
        </table>
        <p style="font-size:13px;color:#6b7280;line-height:1.6;margin:20px 0 0;">
          Logga in i adminpanelen för att bekräfta bokningen.<br>
          Log in to the admin panel to confirm the booking.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const text =
    `Ny bokning / New booking\n\n` +
    `Namn / Name: ${booking.name}\n` +
    `Telefon / Phone: ${booking.phone}\n` +
    (booking.email ? `E-post / Email: ${booking.email}\n` : '') +
    `Från / From: ${booking.from}\n` +
    `Till / To: ${booking.to}\n` +
    `Tid / Time: ${booking.when}\n` +
    `Passagerare / Passengers: ${booking.passengerCount}\n` +
    (booking.carSize ? `Fordon / Vehicle: ${booking.carSize}\n` : '') +
    (booking.price > 0 ? `Pris / Price: ${booking.price} SEK\n` : '') +
    (booking.notes ? `Anteckning / Notes: ${booking.notes}\n` : '');

  return sendEmail({
    to: [{ email: config.NOTIFY_EMAIL }],
    subject: `Ny bokning: ${booking.name} (${booking.from} → ${booking.to})`,
    htmlContent: html,
    textContent: text,
  });
}
