// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const session = require("express-session");
const passport = require("passport");

// ================= INIT =================
dotenv.config();
require('./config/passport');
const app = express();

// ================= ENV CHECK =================
const { MONGO_URI, JWT_SECRET } = process.env;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not defined");
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET not defined");
  process.exit(1);
}

// ================= MIDDLEWARE =================
app.use(express.json());

// Session (required for Passport)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ================= CORS CONFIG =================
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true);

    // Allow Vercel + localhost
    if (
      origin.includes("vercel.app") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Apply CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// ================= ROUTES =================
const authRoutes = require("./src/routes/authRoutes");
const oauthRoutes = require("./src/routes/oauthRoutes");
const userRoutes = require("./src/routes/userRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const applicationRoutes = require("./src/routes/applicationRoutes");

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Backend is running");
});

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/auth", oauthRoutes);

// Other API routes
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ================= DB CONNECTION =================
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });