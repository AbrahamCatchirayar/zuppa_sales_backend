import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailServiceRq {
  private readonly logger = new Logger(MailServiceRq.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'email-smtp.ap-south-1.amazonaws.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  private getBaseUrl(slug?: string): string {
    const isHttps = process.env.IS_HTTPS === 'true' ? 'https' : 'http';
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'localhost:3000';
    if (slug) {
      return `${isHttps}://${slug}.${frontendUrl}`;
    }
    return `${isHttps}://${frontendUrl}`;
  }

  public async send(pattern: string, data: any) {
    try {
      this.logger.log(`Sending email for pattern: ${pattern} to ${data?.email}`);
      const from = process.env.DEFAULT_EMAIL_FROM || process.env.SES_FROM_ADDRESS || '"Rubicr" <tech@impactree.ai>';

      let subject = 'Notification from Zuppa Sales';
      let title = 'Notification';
      let bodyText = '';
      let buttonText = '';
      let buttonUrl = '';
      let extraInfo = '';

      switch (pattern) {
        case 'tenent-invitation':
        case 'invite_user': {
          const workspaceUrl = this.getBaseUrl(data.slug);
          const inviteUrl = `${workspaceUrl}/accept_invitation?token=${data.token}&isAccount=${data.isAccount || false}`;
          subject = `You have been invited to join ${data.slug?.toUpperCase() || 'Zuppa Sales'}`;
          title = `Hi, ${data.name || 'there'}!`;
          bodyText = `${data.manager_name || 'An Administrator'} has invited you to join their workspace. Click the button below to accept your invitation and set up your account:`;
          buttonText = 'Accept Invitation';
          buttonUrl = inviteUrl;
          extraInfo = `Workspace URL: <a href="${workspaceUrl}">${workspaceUrl}</a>`;
          break;
        }

        case 'confirm_account': {
          const workspaceUrl = this.getBaseUrl(data.slug);
          const confirmUrl = `${workspaceUrl}/confirm_account?token=${data.token}`;
          subject = 'Confirm your Zuppa Sales Account';
          title = `Welcome, ${data.name || 'there'}!`;
          bodyText = 'Thank you for signing up. Please click the button below to verify your email and activate your account:';
          buttonText = 'Confirm Account';
          buttonUrl = confirmUrl;
          extraInfo = `Workspace URL: <a href="${workspaceUrl}">${workspaceUrl}</a>`;
          break;
        }

        case 'tenant-forgot_password':
        case 'admin-forgot_password': {
          const resetBase = data.slug ? this.getBaseUrl(data.slug) : this.getBaseUrl();
          const resetUrl = `${resetBase}/reset_password?token=${data.token}`;
          subject = 'Reset your password';
          title = 'Password Reset Request';
          bodyText = 'We received a request to reset your password. Click the button below to choose a new password:';
          buttonText = 'Reset Password';
          buttonUrl = resetUrl;
          extraInfo = 'If you did not request a password reset, you can safely ignore this email.';
          break;
        }

        case 'admin-invitation': {
          const adminBase = this.getBaseUrl();
          const inviteUrl = `${adminBase}/accept_invitation?token=${data.token}&isAccount=${data.isAccount || false}`;
          subject = 'Admin Invitation';
          title = `Hi, ${data.first_name || data.name || 'Admin'}!`;
          bodyText = 'You have been invited as an Administrator. Click below to accept the invitation and access the admin dashboard:';
          buttonText = 'Accept Admin Invitation';
          buttonUrl = inviteUrl;
          break;
        }

        default:
          this.logger.warn(`Unhandled email pattern: ${pattern}`);
          return;
      }

      const html = this.buildHtmlTemplate({
        title,
        bodyText,
        buttonText,
        buttonUrl,
        extraInfo,
      });

      const mailOptions = {
        from,
        to: data.email,
        subject,
        html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`✓ Email sent successfully to ${data.email} (MessageId: ${result.messageId})`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send email to ${data?.email} for pattern ${pattern}: ${error.message}`, error.stack);
    }
  }

  private buildHtmlTemplate({
    title,
    bodyText,
    buttonText,
    buttonUrl,
    extraInfo,
  }: {
    title: string;
    bodyText: string;
    buttonText?: string;
    buttonUrl?: string;
    extraInfo?: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7fafc; margin: 0; padding: 40px 15px; }
    .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .header { background: #1e293b; padding: 24px 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
    .content { padding: 36px 32px; color: #334155; line-height: 1.6; font-size: 15px; }
    .content h2 { margin-top: 0; font-size: 20px; color: #0f172a; font-weight: 600; }
    .button-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 13px 30px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 2px 4px rgba(37,99,235,0.2); }
    .link-fallback { word-break: break-all; font-size: 12px; color: #64748b; margin-top: 24px; padding: 12px; background: #f1f5f9; border-radius: 6px; }
    .extra-info { margin-top: 20px; font-size: 14px; color: #475569; }
    .footer { padding: 20px 32px; background: #f8fafc; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>ZUPPA SALES</h1>
    </div>
    <div class="content">
      <h2>${title}</h2>
      <p>${bodyText}</p>
      ${buttonText && buttonUrl ? `
        <div class="button-container">
          <a href="${buttonUrl}" class="btn" target="_blank">${buttonText}</a>
        </div>
        <div class="link-fallback">
          If the button above doesn't work, copy and paste this link into your browser:<br/>
          <a href="${buttonUrl}">${buttonUrl}</a>
        </div>
      ` : ''}
      ${extraInfo ? `<div class="extra-info">${extraInfo}</div>` : ''}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Zuppa Sales. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }
}
