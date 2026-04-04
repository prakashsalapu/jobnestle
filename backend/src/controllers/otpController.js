const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/emailService');

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Pure function - returns object instead of sending response
const sendOtp = async (email) => {
  try {
    console.log(`📍 OTP Send: Generating OTP for ${email}`);
    
    const existingOtp = await Otp.findOne({ email: email.toLowerCase() });
    
    if (existingOtp && existingOtp.lastSentAt) {
      const timeSinceLastSend = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      const cooldownMs = 60000; // 60 seconds
      
      if (timeSinceLastSend < cooldownMs) {
        const waitSeconds = Math.ceil((cooldownMs - timeSinceLastSend) / 1000);
        console.log(`⚠️ OTP Cooldown: Please wait ${waitSeconds} seconds`);
        return {
          success: false,
          message: `Please wait ${waitSeconds} seconds before requesting a new OTP`
        };
      }
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const now = new Date();

    const otpRecord = await Otp.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, expiresAt, attempts: 0, lastSentAt: now },
      { upsert: true, new: true }
    );

    console.log(`✅ OTP generated and stored: ${otpRecord._id}`);

    try {
      await sendOtpEmail(email, otp);
      console.log(`✅ OTP email sent to ${email}`);
    } catch (emailError) {
      console.error(`⚠️ Email service error: ${emailError.message}`);
      console.log(`📧 DEMO MODE - OTP for ${email}: ${otp}`);
    }

    return {
      success: true,
      message: 'OTP sent successfully'
    };
  } catch (err) {
    console.error('❌ OTP send error:', err.message);
    return {
      success: false,
      message: 'Failed to send OTP'
    };
  }
};

// Pure function - returns object instead of sending response
const verifyOtp = async (email, otp) => {
  try {
    console.log(`📍 OTP Verify: Verifying OTP for ${email}`);
    
    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      console.warn('❌ OTP Verify: OTP not found');
      return {
        success: false,
        message: 'OTP not found or expired'
      };
    }

    if (new Date() > otpRecord.expiresAt) {
      console.warn('❌ OTP Verify: OTP expired');
      await Otp.deleteOne({ email: email.toLowerCase() });
      return {
        success: false,
        message: 'OTP has expired. Please request a new one'
      };
    }

    if (otpRecord.attempts >= 5) {
      console.warn('❌ OTP Verify: Maximum attempts exceeded');
      await Otp.deleteOne({ email: email.toLowerCase() });
      return {
        success: false,
        message: 'Maximum OTP attempts exceeded. Request a new OTP'
      };
    }

    if (otpRecord.otp !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      console.warn(`❌ OTP Verify: OTP mismatch. Attempt ${otpRecord.attempts}/5`);
      return {
        success: false,
        message: `Invalid OTP. ${5 - otpRecord.attempts} attempts remaining`
      };
    }

    console.log('✅ OTP Verify: OTP verified successfully');
    await Otp.deleteOne({ email: email.toLowerCase() });

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (err) {
    console.error('❌ OTP verify error:', err.message);
    return {
      success: false,
      message: 'Server error'
    };
  }
};

module.exports = {
  generateOtp,
  sendOtp,
  verifyOtp,
};
