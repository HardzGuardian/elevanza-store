import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

const FROM = process.env.RESEND_FROM_EMAIL || 'Elevanza Store <noreply@elevanza.com>';
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your Elevanza password',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h1 style="font-size:22px;font-weight:700;color:#0a0a0a;margin-bottom:8px;">Reset your password</h1>
        <p style="color:#737373;font-size:14px;margin-bottom:28px;line-height:1.6;">
          We received a request to reset the password for your Elevanza account.
          Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#0a0a0a;color:#fff;font-size:14px;font-weight:600;
                 padding:12px 28px;border-radius:8px;text-decoration:none;letter-spacing:0.02em;">
          Reset Password
        </a>
        <p style="color:#a3a3a3;font-size:12px;margin-top:28px;line-height:1.6;">
          If you didn't request this, you can safely ignore this email.<br/>
          This link will expire in 1 hour.
        </p>
        <hr style="border:none;border-top:1px solid #f5f5f5;margin:28px 0;" />
        <p style="color:#d4d4d4;font-size:11px;">Elevanza Moderne · Luxury Fashion</p>
      </div>
    `,
  });
}
