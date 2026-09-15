const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Instagram" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent");
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendRegisterationEmail = async (userEmail, name) => {
    const subject = 'Welcome to Instagram!';
    const text = `Hi ${name},\n\nThank you for registering on Instagram! We're excited to have you on board.`;
    const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;background:#f2f3f5;font-family:Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:30px 0;background:linear-gradient(90deg,#feda75 0%,#d62976 50%,#4f5bd5 100%);">
              <table width="600" align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>
                  <td style="padding:18px 24px;color:#fff;text-align:center;font-size:28px;font-weight:700;">Instagram</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table width="600" align="center" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:6px;margin: -30px auto 0;box-shadow:0 6px 18px rgba(0,0,0,0.08);overflow:hidden;">
                <tr>
                  <td style="padding:32px 40px;color:#111;font-size:16px;line-height:1.5;">
                    <h1 style="margin:0 0 10px;font-size:20px;font-weight:600;color:#111;">Welcome to Instagram, ${name}!</h1>
                    <p style="margin:0 0 18px;color:#555;">Thanks for signing up. Start connecting with your friends and sharing your moments.</p>
                    <a href="https://instagram.com" style="display:inline-block;padding:10px 18px;background:linear-gradient(90deg,#feda75,#d62976);color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Visit Instagram</a>
                    <p style="margin:20px 0 0;color:#999;font-size:13px;">If you didn't create an account using this email, please ignore this message.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 40px 32px;color:#aaa;font-size:12px;text-align:center;background:#fafafa;">The Instagram Team</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

    await sendEmail(userEmail, subject, text, html);
};

exports.sendVerificationOtpEmail = async (userEmail, otp) => {
    const subject = 'Your Instagram verification code';
    const text = `Your verification code is: ${otp}`;
    const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body style="margin:0;padding:0;background:#f2f3f5;font-family:Helvetica,Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding:30px 0;background:linear-gradient(90deg,#feda75 0%,#d62976 50%,#4f5bd5 100%);">
              <table width="600" align="center" cellpadding="0" cellspacing="0" role="presentation" style="margin:0 auto;">
                <tr>
                  <td style="padding:18px 24px;color:#fff;text-align:center;font-size:28px;font-weight:700;">Instagram</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table width="600" align="center" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;border-radius:6px;margin: -30px auto 0;box-shadow:0 6px 18px rgba(0,0,0,0.08);overflow:hidden;">
                <tr>
                  <td style="padding:32px 40px;color:#111;font-size:16px;line-height:1.5;text-align:center;">
                    <h2 style="margin:0 0 10px;font-size:20px;font-weight:600;color:#111;">Your Instagram verification code</h2>
                    <p style="margin:0 0 22px;color:#555;">Enter the code below to verify your email address. This code will expire shortly.</p>
                    <div style="display:inline-block;padding:18px 28px;border-radius:8px;background:#f7f7fb;border:1px solid #eee;font-size:28px;font-weight:700;letter-spacing:6px;color:#111;">${otp}</div>
                    <p style="margin:22px 0 0;color:#999;font-size:13px;">If you did not request this code, you can safely ignore this email.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 40px 32px;color:#aaa;font-size:12px;text-align:center;background:#fafafa;">This code is valid for a limited time.</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    `;

    await sendEmail(userEmail, subject, text, html);
};

exports.sendPasswordResetLink = async (email, resetToken) => {
  const subject = 'Reset your Instagram password';

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const text = `
Sorry to hear you're having trouble logging into Instagram.

We received a request to reset your password. If this was you, you can reset your password using the link below:

${resetUrl}

If you didn't request a password reset, you can safely ignore this email.
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Reset your password</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #fafafa;
      font-family: Arial, Helvetica, sans-serif;
      color: #262626;
    }

    .wrapper {
      width: 100%;
      padding: 40px 0;
      background-color: #fafafa;
    }

    .container {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #dbdbdb;
      border-radius: 6px;
      overflow: hidden;
    }

    .content {
      padding: 40px 45px;
      text-align: center;
    }

    .brand {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -1.5px;
      margin-bottom: 35px;
    }

    .title {
      font-size: 20px;
      font-weight: 600;
      margin: 0 0 18px;
    }

    .text {
      font-size: 14px;
      line-height: 21px;
      color: #737373;
      margin: 0 auto 25px;
      max-width: 390px;
    }

    .button {
      display: inline-block;
      padding: 11px 24px;
      background-color: #0095f6;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      margin: 10px 0 25px;
    }

    .fallback {
      font-size: 12px;
      line-height: 18px;
      color: #8e8e8e;
      word-break: break-all;
      margin-top: 10px;
    }

    .fallback a {
      color: #00376b;
      text-decoration: none;
    }

    .divider {
      height: 1px;
      background-color: #efefef;
      margin: 30px 0;
    }

    .footer {
      padding: 20px 30px 30px;
      text-align: center;
      background-color: #fafafa;
    }

    .footer-text {
      font-size: 11px;
      line-height: 17px;
      color: #8e8e8e;
      margin: 0;
    }

    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 20px 0;
      }

      .container {
        border-left: 0;
        border-right: 0;
        border-radius: 0;
      }

      .content {
        padding: 35px 25px;
      }
    }
  </style>
</head>

<body>

  <div class="wrapper">

    <div class="container">

      <div class="content">

        <div class="brand">
          Instagram
        </div>

        <h1 class="title">
          Reset your password
        </h1>

        <p class="text">
          Sorry to hear you're having trouble logging into Instagram.
          We received a request to reset your password.
        </p>

        <p class="text">
          If this was you, you can reset your password using the button below.
        </p>

        <a
          href="${resetUrl}"
          class="button"
          target="_blank"
        >
          Reset Password
        </a>

        <div class="divider"></div>

        <p class="fallback">
          If the button doesn't work, copy and paste this link into your browser:
        </p>

        <p class="fallback">
          <a href="${resetUrl}" target="_blank">
            ${resetUrl}
          </a>
        </p>

        <div class="divider"></div>

        <p class="footer-text">
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </p>

      </div>

    </div>

    <div class="footer">
      <p class="footer-text">
        This email was sent as part of your account security.
      </p>
    </div>

  </div>

</body>
</html>
  `;

  await sendEmail(email, subject, text, html);
};