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

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
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