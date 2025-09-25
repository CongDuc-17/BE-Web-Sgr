import {
  healthCheckRegistry,
  healthCheckRouter,
} from "./healthCheck/healthCheck.router.js";

import authRoute, { authRegistry } from "./auth/auth.route.js";

export const Registries = [healthCheckRegistry, authRegistry];

export const Modules = {
  healthCheckRouter,
  authRoute,
};
