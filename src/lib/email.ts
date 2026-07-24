/** Escapes special HTML characters to prevent injection in email templates. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const FONT =
  "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const PARA = `margin:0 0 20px;${FONT};font-size:15px;line-height:1.6;color:#475569`;
const FOOTER_P = `margin:0 0 10px;${FONT};font-size:12px;line-height:1.5;color:#94a3b8`;
const FOOTER_A = "color:#64748b;text-decoration:underline";

/**
 * Verification mail markup.
 *
 * **Every style is inline and the layout is tables.** A `<style>` block in the
 * `<head>` is not reliable in mail: Gmail drops the whole block if it hits a
 * single declaration it dislikes (the modern `rgb(0 0 0 / .05)` colour syntax
 * used here did exactly that), which left the mail rendering as unstyled text.
 * Inline attributes are the one thing every client honours — keep it that way,
 * and don't reintroduce a stylesheet, shorthand colour functions, flexbox or
 * grid.
 *
 * Kept in sync with the mobile repo's `supabase/functions/send-verification-email`,
 * which sends the same mail for app sign-ups.
 */
function buildEmailHtml(verificationUrl: string, recipientName: string): string {
  const name = escapeHtml(recipientName || "Freund/in");

  return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light only">
    <title>E-Mail-Adresse verifizieren</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f8fafc;${FONT};-webkit-font-smoothing:antialiased;">
    <!-- Preheader: the grey preview line next to the subject in the inbox. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Nur noch ein Klick, dann ist deine E-Mail-Adresse bestätigt.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f8fafc" style="background-color:#f8fafc;">
      <tr>
        <td align="center" style="padding:32px 12px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
            <tr>
              <td align="center" bgcolor="#226622" style="background-color:#226622;padding:32px;border-radius:16px 16px 0 0;">
                <span style="${FONT};font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">places4friends</span>
              </td>
            </tr>
            <tr>
              <td style="padding:40px 32px;">
                <h1 style="margin:0 0 16px;${FONT};font-size:20px;font-weight:700;color:#0f172a;">Hallo ${name},</h1>
                <p style="${PARA}">vielen Dank für deine Registrierung bei places4friends! Um dein Konto vollständig zu verifizieren, bestätige bitte deine E-Mail-Adresse über den folgenden Button.</p>
                <p style="${PARA}">Du kannst die App in der Zwischenzeit bereits ganz normal nutzen.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px auto;">
                  <tr>
                    <td align="center" bgcolor="#226622" style="background-color:#226622;border-radius:12px;">
                      <a href="${verificationUrl}" style="display:inline-block;padding:14px 32px;${FONT};font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">E-Mail-Adresse bestätigen</a>
                    </td>
                  </tr>
                </table>
                <p style="${PARA}">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:</p>
                <p style="margin:0;${FONT};font-size:13px;line-height:1.5;color:#64748b;word-break:break-all;">${verificationUrl}</p>
              </td>
            </tr>
            <tr>
              <td bgcolor="#f8fafc" align="center" style="background-color:#f8fafc;padding:24px 32px;border-top:1px solid #e2e8f0;border-radius:0 0 16px 16px;">
                <p style="${FOOTER_P}">Diese E-Mail wurde automatisch versendet, weil mit dieser Adresse ein places4friends-Konto registriert wurde. Falls du dich nicht registriert hast, kannst du diese Nachricht ignorieren &ndash; es werden dir keine weiteren E-Mails gesendet.</p>
                <p style="${FOOTER_P}">Anbieter: Janick Braun &middot; Krottenkopfstr. 24a &middot; 82377 Penzberg &middot; Deutschland<br>Kontakt: <a href="mailto:mail@janickbraun.com" style="${FOOTER_A}">mail@janickbraun.com</a></p>
                <p style="margin:0;${FONT};font-size:12px;line-height:1.5;color:#94a3b8;"><a href="https://places4friends.com/impressum" style="${FOOTER_A}">Impressum</a> &middot; <a href="https://places4friends.com/datenschutz" style="${FOOTER_A}">Datenschutz</a> &middot; <a href="https://places4friends.com/agb" style="${FOOTER_A}">AGB</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/**
 * Plain-text alternative. Sent alongside the HTML: clients that prefer text get
 * something readable instead of a stripped-tag soup, and a multipart mail scores
 * better with spam filters than HTML alone.
 */
function buildEmailText(verificationUrl: string, recipientName: string): string {
  const name = recipientName || "Freund/in";
  return `Hallo ${name},

vielen Dank für deine Registrierung bei places4friends!

Bestätige deine E-Mail-Adresse über diesen Link:
${verificationUrl}

Du kannst die App in der Zwischenzeit bereits ganz normal nutzen.

---
Diese E-Mail wurde automatisch versendet, weil mit dieser Adresse ein
places4friends-Konto registriert wurde. Falls du dich nicht registriert hast,
kannst du diese Nachricht ignorieren - es werden dir keine weiteren E-Mails
gesendet.

Anbieter: Janick Braun, Krottenkopfstr. 24a, 82377 Penzberg, Deutschland
Kontakt: mail@janickbraun.com

Impressum: https://places4friends.com/impressum
Datenschutz: https://places4friends.com/datenschutz
AGB: https://places4friends.com/agb`;
}

export async function sendVerificationEmail(email: string, token: string, fullName?: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY is not defined in environment variables.");
    throw new Error("E-Mail-Dienst ist nicht konfiguriert.");
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `https://${process.env.NEXT_PUBLIC_SITE_URL}`
    : "http://localhost:3000";

  const verificationUrl = `${baseUrl}/auth/verify-email?token=${encodeURIComponent(token)}`;

  // Use onboarding@resend.dev as fallback sender if you haven't verified a custom domain on Resend
  const fromEmail = process.env.NEXT_PUBLIC_SITE_URL
    ? "places4friends <noreply@places4friends.com>"
    : "places4friends <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      reply_to: "mail@janickbraun.com",
      to: [email],
      subject: "Bestätige deine E-Mail-Adresse - places4friends",
      html: buildEmailHtml(verificationUrl, fullName || ""),
      text: buildEmailText(verificationUrl, fullName || ""),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Resend API error:", errorData);
    throw new Error(errorData.message || "Fehler beim Senden der Bestätigungs-E-Mail.");
  }

  return true;
}
