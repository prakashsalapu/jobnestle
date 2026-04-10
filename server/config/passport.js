const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleAuthCallback } = require('../src/controllers/authController');
const User = require('../src/models/User');

// ================= GOOGLE STRATEGY =================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await googleAuthCallback(profile);
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ================= SERIALIZE =================
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// ================= DESERIALIZE (FIXED) =================
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;