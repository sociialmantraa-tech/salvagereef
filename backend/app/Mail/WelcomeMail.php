<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $email;
    public string $loginId;

    public function __construct(string $userName, string $email, string $loginId)
    {
        $this->userName = $userName;
        $this->email = $email;
        $this->loginId = $loginId;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Welcome to SalvageReef - Registration Successful',
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
        $email = htmlspecialchars($this->email, ENT_QUOTES, 'UTF-8');
        $loginId = htmlspecialchars($this->loginId, ENT_QUOTES, 'UTF-8');
        $loginUrl = rtrim(config('app.frontend_url', 'http://localhost:5173'), '/') . '/login';

        return "
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='utf-8'>
          <title>Welcome to SalvageReef</title>
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
                      <p style='margin: 4px 0 0 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700;'>
                        Salvage Auction & Scrap Marketplace
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding: 40px 32px;'>
                      <h2 style='margin: 0 0 16px 0; color: #0f172a; font-size: 20px; font-weight: 800;'>
                        Account Created Successfully
                      </h2>
                      <p style='margin: 0 0 20px 0; color: #475569; font-size: 14px; line-height: 1.6;'>
                        Hello <strong>{$name}</strong>,<br><br>
                        Your SalvageReef account has been created successfully.
                      </p>

                      <div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0;'>
                        <p style='margin: 0 0 8px 0; font-size: 13px; color: #334155;'><strong>Login ID:</strong> <span style='font-family: monospace; font-size: 14px; font-weight: bold; color: #D48B1C;'>{$loginId}</span></p>
                        <p style='margin: 0; font-size: 13px; color: #334155;'><strong>Email Address:</strong> {$email}</p>
                      </div>

                      <p style='margin: 20px 0 28px 0; color: #475569; font-size: 13px;'>
                        You can now sign in using your Login ID or Email Address and the password you created during registration.
                      </p>

                      <div style='text-align: center;'>
                        <a href='{$loginUrl}' style='display: inline-block; padding: 14px 28px; background-color: #D48B1C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 12px; text-transform: uppercase;'>
                          Sign In to SalvageReef
                        </a>
                      </div>
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
