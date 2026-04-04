const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { googleAuthCallback } = require('../src/controllers/authController');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL 
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await googleAuthCallback(profile);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const User = require('../src/models/User');
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

module.exports = passport;
