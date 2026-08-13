<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $userName;
    public string $verificationUrl;

    public function __construct(string $userName, string $verificationUrl)
    {
        $this->userName = $userName;
        $this->verificationUrl = $verificationUrl;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Your Email Address - SalvageReef',
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
        $url = htmlspecialchars($this->verificationUrl, ENT_QUOTES, 'UTF-8');

        return "
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='utf-8'>
          <title>Verify Email Address - SalvageReef</title>
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
                        Verify Your Email Address
                      </h2>
                      <p style='margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;'>
                        Hello <strong>{$name}</strong>,<br>
                        Please click the button below to verify your email address on SalvageReef.
                      </p>
                      <div style='margin: 30px 0;'>
                        <a href='{$url}' style='display: inline-block; padding: 14px 32px; background-color: #D48B1C; color: #ffffff; text-decoration: none; font-weight: 800; font-size: 13px; border-radius: 12px; text-transform: uppercase;'>
                          Verify Email Address
                        </a>
                      </div>
                      <p style='color: #64748b; font-size: 12px; margin-top: 20px;'>
                        This verification link expires in 24 hours. If you did not create an account, please ignore this email.
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
