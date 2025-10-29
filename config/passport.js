import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

// ---------------- GOOGLE STRATEGY ----------------
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("✅ Google profile:", profile.emails[0].value);

        // 🔹 Find existing user
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // 🔹 Check if same email exists (maybe local signup)
          user = await User.findOne({ email: profile.emails[0].value });

          if (!user) {
            // 🧩 Create new user if not exists
            user = await User.create({
              name: profile.displayName,
              email: profile.emails[0].value,
              googleId: profile.id,
              authProvider: "google",
              profilePic: profile.photos?.[0]?.value || "",
            });
          } else {
            // 🧩 Update existing user to link Google
            user.googleId = profile.id;
            user.authProvider = "google";
            await user.save();
          }
        }

        done(null, user);
      } catch (err) {
        console.error("❌ Google Auth Error:", err);
        done(err, null);
      }
    }
  )
);

// ---------------- SESSION HANDLING ----------------
passport.serializeUser((user, done) => {
  // ✅ Store only user id in session
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
