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
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(
            new Error("Google profile did not supply an email"),
            undefined
          );
        }
        let user = await prisma.users.findUnique({
          where: { email },
        });
        if (!user) {
          user = await prisma.users.create({
            data: {
              provider: "google",
              providerId: profile.id,
              email,
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
