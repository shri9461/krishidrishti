import nodemailer from 'nodemailer';

export const sendOTPEmail = async (email, otp) => {
  const isEmailConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

  if (!isEmailConfigured) {
    console.log('====================================');
    console.log(`[SMTP DEV MODE] Send email to: ${email}`);
    console.log(`[SMTP DEV MODE] OTP Code: ${otp}`);
    console.log('====================================');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"KrishiDrishti Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'KrishiDrishti - Password Reset OTP',
      html: `
        <div style="font-family: 'Poppins', Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4CAF50;">KrishiDrishti – Intelligent Farming Assistant</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the following One-Time Password (OTP) to reset it. This OTP is valid for 10 minutes.</p>
          <div style="background-color: #F8FAFC; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50; letter-spacing: 4px; border: 1px solid #E2E8F0;">
            ${otp}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #64748B;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email via SMTP:', error.message);
    throw new Error('Could not send reset OTP email. Please try again later.');
  }
};
