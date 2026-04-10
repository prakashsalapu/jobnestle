const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, otp) => {
  console.log(`📧 Sending OTP to ${email}`);
  console.log(`🔐 OTP: ${otp}`);

  try {
    const response = await resend.emails.send({
      from: "JobNestle <onboarding@resend.dev>", // default working sender
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>JobNestle OTP</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `,
    });

    console.log("✅ Email sent:", response.id);
    return { ok: true };
  } catch (error) {
    console.error("❌ Email failed:", error.message);

    // fallback
    console.log(`📧 FALLBACK OTP: ${otp}`);

    return { ok: true };
  }
};

module.exports = { sendOtpEmail };

