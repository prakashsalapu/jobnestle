const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (err) {
      console.error('Google Auth callback error:', err.message);
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    if (!user) {
      return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
    }

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        return res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
      }

      try {
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });

        const emailEnc = encodeURIComponent(user.email);
        res.redirect(`${frontendUrl}/auth/google/callback?token=${token}&email=${emailEnc}`);
      } catch (e) {
        console.error('Google Auth JWT error:', e.message);
        res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
    });
  })(req, res, next);
});

module.exports = router;
