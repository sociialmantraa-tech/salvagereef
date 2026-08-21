<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetSuccessMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;

    public function __construct(string $userName)
    {
        $this->userName = $userName;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Password Has Been Reset - SalvageReef',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->buildHtmlContent(),
        );
    }

    private function buildHtmlContent(): string
    {
        $name = htmlspecialchars($this->userName, ENT_QUOTES, 'UTF-8');
        $loginUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/') . '/login';

        return "
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='utf-8'>
          <title>Password Reset Successful - SalvageReef</title>
        </head>
        <body style='margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif;'>
          <table width='100%' cellpadding='0' cellspacing='0' style='padding: 40px 20px;'>
            <tr>
              <td align='center'>
                <table width='100%' style='max-width: 560px; background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);'>
                  <tr>
                    <td style='padding: 32px; background-color: #0B192C; text-align: center;'>
                      <h1 style='margin: 0; color: #ffffff; font-size: 24px; font-weight: 900;'>
                        SALVAGE<span style='color: #D48B1C;'>REEF</span>
                      </h1>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding: 40px 32px; text-align: center;'>
                      <h2 style='margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 800;'>
                        Password Reset Successful
                      </h2>
                      <p style='margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;'>
                        Hello <strong>{$name}</strong>,<br>
                        Your SalvageReef account password has been updated successfully. You can now log in with your new password.
                      </p>
                      <div style='margin: 28px 0;'>
                        <a href='{$loginUrl}' style='display: inline-block; padding: 14px 28px; background-color: #D48B1C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 12px; text-transform: uppercase;'>
                          Log In Now
                        </a>
                      </div>
                      <p style='color: #64748b; font-size: 12px; margin-top: 20px;'>
                        If you did not request this password change, please contact SalvageReef support immediately.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding: 24px 32px; background-color: #f1f5f9; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 11px;'>
                      &copy; " . date('Y') . " SalvageReef Operations Desk. Mumbai, Maharashtra.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        ";
    }
}
