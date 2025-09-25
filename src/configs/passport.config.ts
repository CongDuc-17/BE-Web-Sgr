import { Strategy as GoogleAuth } from "passport-google-oauth20";
import dotenv from "dotenv";
import passport from "passport";
import { prisma } from "./client.js";
dotenv.config();

passport.use(
  new GoogleAuth(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:3000/auth/google/login",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.users.findUnique({
          where: { email: profile.emails?.[0].value },
        });
        if (!user) {
          user = await prisma.users.create({
            data: {
              provider: "google",
              providerId: profile.id,
              email: String(profile.emails?.[0].value!),
              name: String(profile.displayName),
            },
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.users.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err as Error, null);
  }
});

export default passport;
