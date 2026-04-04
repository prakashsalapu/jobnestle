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
    console.warn("⚠️ Email credentials missing → DEMO MODE");
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
      connectionTimeout: 5000, // ⏱️ prevent hanging
      greetingTimeout: 5000,
      socketTimeout: 5000,
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
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📧 OTP for: ${email}`);
  console.log(`🔐 Code: ${otp}`);
  console.log(`${"=".repeat(50)}\n`);

  // Demo mode
  if (!emailConfigured) {
    console.warn("⚠️ Email not configured → console OTP only");
    return { ok: true, mode: "demo" };
  }

  const mailOptions = {
    from: `"JobNestle" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 Your JobNestle OTP Code",
    text: `Your OTP is ${otp}`,
  };

  try {
    // ✅ Add timeout protection
    const result = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Email timeout")), 5000)
      ),
    ]);

    console.log(`✅ Email sent to ${email}`);
    return { ok: true, mode: "email", result };
  } catch (error) {
    console.error(`❌ Email failed: ${error.message}`);

    // ✅ fallback (VERY IMPORTANT)
    console.log(`\n${"=".repeat(50)}`);
    console.log(`📧 FALLBACK OTP for ${email}: ${otp}`);
    console.log(`${"=".repeat(50)}\n`);

    return { ok: true, mode: "fallback" };
  }
};

module.exports = { sendOtpEmail };

