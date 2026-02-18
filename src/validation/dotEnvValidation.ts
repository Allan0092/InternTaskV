import "dotenv/config";
import * as yup from "yup";

const envSchema = yup.object({
  SERVER_PORT: yup
    .number()
    .positive("PORT must be a positive number")
    .integer("PORT must be an integer")
    .required("PORT is required")
    .default(3000),

  DATABASE_URL: yup.string().required("DATABASE_URL is required"),

  SECRET_KEY: yup.string().min(32).required("SECRET_KEY is required"),
});

export const env = envSchema.validateSync(process.env, {
  abortEarly: false,
  stripUnknown: true,
  strict: false,
});

export const config = {
  server_port: env.SERVER_PORT,
  databaseUrl: env.DATABASE_URL,
  secretKey: env.SECRET_KEY,
} as const;
