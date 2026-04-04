const nodemailer = require("nodemailer");

let transporter = null;
let emailConfigured = false;

// ================= INIT EMAIL SERVICE =================
const initializeEmailService = () => {
  console.log("📧 Initializing Email Service...");

  const { EMAIL_USER, EMAIL_PASS } = process.env;

  console.log("EMAIL:", EMAIL_USER || "(not set)");
  console.log(
    "PASS:",
    EMAIL_PASS ? `(set, ${EMAIL_PASS.length} chars)` : "(not set)"
  );

  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("⚠️ Email credentials missing → running in DEMO MODE");
    emailConfigured = false;
    return;
  }

  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    emailConfigured = true;
    console.log(`✅ Email service ready (${EMAIL_USER})`);
  } catch (err) {
    console.error("❌ Email initialization failed:", err.message);
    emailConfigured = false;
  }
};

// Initialize immediately
initializeEmailService();

// ================= SEND OTP EMAIL =================
const sendOtpEmail = async (email, otp) => {
  // Always log OTP (dev-friendly)
  console.log(`\n${"=".repeat(60)}`);
  console.log(`📧 OTP for: ${email}`);
  console.log(`🔐 Code: ${otp}`);
  console.log(`⏱️ Expires in: 5 minutes`);
  console.log(`${"=".repeat(60)}\n`);

  // Demo mode fallback
  if (!emailConfigured) {
    console.warn("⚠️ Email not configured → OTP shown in console only");
    return { ok: true, mode: "demo" };
  }

  const mailOptions = {
    from: `"JobNestle" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Your JobNestle OTP Code",
    text: `Your JobNestle OTP is ${otp}. It expires in 5 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #4f46e5;">JobNestle</h2>
        
        <p>Hello,</p>
        
        <p>Your One-Time Password (OTP) is:</p>
        
        <h1 style="letter-spacing: 6px; color: #111;">${otp}</h1>
        
        <p>This OTP is valid for <b>5 minutes</b>.</p>
        
        <p style="margin-top: 20px;">
          If you did not request this, please ignore this email.
        </p>
        
        <hr style="margin: 20px 0;" />
        
        <p style="font-size: 12px; color: #777;">
          This is an automated message from JobNestle. Do not reply.
        </p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return { ok: true, mode: "email", result };
  } catch (error) {
    console.error(`❌ Email failed → ${error.message}`);

    // Fallback (important for dev)
    console.log(`\n${"=".repeat(60)}`);
    console.log(`📧 FALLBACK MODE`);
    console.log(`🔐 OTP for ${email}: ${otp}`);
    console.log(`${"=".repeat(60)}\n`);

    return { ok: true, mode: "fallback" };
  }
};

module.exports = { sendOtpEmail };