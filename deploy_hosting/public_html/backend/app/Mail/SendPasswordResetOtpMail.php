<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SendPasswordResetOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $otp;
    public string $userName;

    public function __construct(string $otp, string $userName = 'Valued User')
    {
        $this->otp = $otp;
        $this->userName = $userName;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Password Reset OTP - SalvageReef',
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
        $safeName = htmlspecialchars($this->userName, ENT_QUOTES, 'UTF-8');
        $safeOtp = htmlspecialchars($this->otp, ENT_QUOTES, 'UTF-8');

        return "
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset='utf-8'>
          <title>SalvageReef Password Reset OTP</title>
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
                      <h2 style='margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 800;'>
                        Password Reset Verification Code
                      </h2>
                      <p style='margin: 0 0 24px 0; color: #475569; font-size: 14px; line-height: 1.6;'>
                        Hello <strong>{$safeName}</strong>,<br>
                        Enter the 6-digit verification code below to reset your password on SalvageReef:
                      </p>
                      <div style='margin: 28px 0; padding: 22px 32px; background-color: #fffbeb; border: 2px dashed #f59e0b; border-radius: 16px; display: inline-block;'>
                        <span style='font-family: monospace; font-size: 36px; font-weight: 900; color: #b45309; letter-spacing: 10px;'>
                          {$safeOtp}
                        </span>
                      </div>
                      <p style='margin: 20px 0 0 0; color: #64748b; font-size: 12px; line-height: 1.5;'>
                        This OTP is valid for <strong>10 minutes</strong>. For security reasons, please do not share this code with anyone.
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
