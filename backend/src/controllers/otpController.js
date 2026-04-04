const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/emailService');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// ================= SEND OTP =================
const sendOtp = async (email) => {
  try {
    console.log(`📍 OTP Send: Generating OTP for ${email}`);

    const normalizedEmail = email.toLowerCase();

    const existingOtp = await Otp.findOne({ email: normalizedEmail });

    // ⏱️ Cooldown check
    if (existingOtp && existingOtp.lastSentAt) {
      const timeSinceLastSend =
        Date.now() - new Date(existingOtp.lastSentAt).getTime();

      const cooldownMs = 60000;

      if (timeSinceLastSend < cooldownMs) {
        const waitSeconds = Math.ceil(
          (cooldownMs - timeSinceLastSend) / 1000
        );

        return {
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP`,
        };
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const now = new Date();

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      { otp, expiresAt, attempts: 0, lastSentAt: now },
      { upsert: true, new: true }
    );

    console.log(`✅ OTP generated for ${email}`);

    // ✅ NON-BLOCKING EMAIL (SAFE)
    setImmediate(async () => {
      try {
        await sendOtpEmail(email, otp);
        console.log(`📧 OTP email sent to ${email}`);
      } catch (err) {
        console.error(`❌ Email failed: ${err.message}`);
        console.log(`📧 DEMO OTP for ${email}: ${otp}`);
      }
    });

    // ✅ RETURN IMMEDIATELY (NO WAIT)
    return {
      success: true,
      message: 'OTP sent successfully',
    };
  } catch (err) {
    console.error('❌ OTP send error:', err.message);
    return {
      success: false,
      message: 'Failed to send OTP',
    };
  }
};

// ================= VERIFY OTP =================
const verifyOtp = async (email, otp) => {
  try {
    console.log(`📍 OTP Verify: ${email}`);

    const normalizedEmail = email.toLowerCase();

    const otpRecord = await Otp.findOne({ email: normalizedEmail });

    if (!otpRecord) {
      return { success: false, message: 'OTP not found or expired' };
    }

    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: normalizedEmail });
      return {
        success: false,
        message: 'OTP has expired. Please request a new one',
      };
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ email: normalizedEmail });
      return {
        success: false,
        message: 'Maximum OTP attempts exceeded. Request a new OTP',
      };
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return {
        success: false,
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining`,
      };
    }

    await Otp.deleteOne({ email: normalizedEmail });

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (err) {
    console.error('❌ OTP verify error:', err.message);
    return { success: false, message: 'Server error' };
  }
};

module.exports = {
  generateOtp,
  sendOtp,
  verifyOtp,
};

