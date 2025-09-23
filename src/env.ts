import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  JWT_EXPIRES_IN: z.string().default("1d"),
})

export const env = envSchema.parse(process.env)
