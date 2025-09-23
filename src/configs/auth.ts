import { env } from "../env"

export const authConfig = {
  jwt: {
    // Use environment variables when available; fall back to current defaults
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
}
