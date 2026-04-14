import { Resend } from "resend";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  return new Resend(apiKey);
}

const EMAIL_FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";

export async function sendPasswordResetEmail(
  email: string,
  token: string
) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: "Reset your password — DealFlow CRM",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #0d9488, #115e59); padding: 32px 32px 24px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600; letter-spacing: -0.3px;">
                        DealFlow CRM
                      </h1>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 32px;">
                      <h2 style="margin: 0 0 12px; color: #18181b; font-size: 18px; font-weight: 600;">
                        Reset your password
                      </h2>
                      <p style="margin: 0 0 24px; color: #52525b; font-size: 14px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to choose a new one. This link expires in <strong>1 hour</strong>.
                      </p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${resetLink}" 
                               style="display: inline-block; background: linear-gradient(135deg, #0d9488, #115e59); color: #ffffff; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; letter-spacing: 0.2px;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 24px 0 0; color: #a1a1aa; font-size: 12px; line-height: 1.5;">
                        If you didn't request this, you can safely ignore this email. Your password won't be changed.
                      </p>
                      <hr style="margin: 24px 0; border: none; border-top: 1px solid #e4e4e7;" />
                      <p style="margin: 0; color: #d4d4d8; font-size: 11px; line-height: 1.4;">
                        If the button doesn't work, paste this link into your browser:<br />
                        <a href="${resetLink}" style="color: #0d9488; word-break: break-all;">${resetLink}</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  if (error) {
    console.error("[Resend error]", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
