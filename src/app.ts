import "reflect-metadata";
import cors from "cors";
import express, { Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { openAPIRouter } from "./swagger/index.js";
import { Modules } from "./modules/index.js";
import { appEnv } from "./configs/index.js";
import { connectionDB } from "./configs/database.js";
import session from "express-session";
import passport from "passport";
const app: Express = express();

app.use(express.json());
app.use(cookieParser());

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable must be set");
}

app.use(
  session({
    secret: sessionSecret || "your_secret_key",
    resave: false,
    saveUninitialized: false,
  })
);
// Khởi tạo Passport
app.use(passport.initialize());
app.use(passport.session());

// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// Middlewares
app.use(cors({ origin: appEnv.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan("combined"));

app.use("/health-check", Modules.healthCheckRouter);
app.use("/auth", Modules.authRoute);

app.use(openAPIRouter);

const bootstrap = async () => {
  await connectionDB();
  app.listen(appEnv.PORT, () => {
    const { NODE_ENV, HOST, PORT } = appEnv;
    console.log(`Server (${NODE_ENV}) running on port http://${HOST}:${PORT}`);
  });
};
bootstrap().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
