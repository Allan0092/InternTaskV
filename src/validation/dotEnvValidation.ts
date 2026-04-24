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

  FRONTEND_URL: yup.string().required("FRONTEND_URL is required."),

  EMAIL_HOST: yup.string().required(""),
  EMAIL_PORT: yup.string().required(""),
  EMAIL_USERNAME: yup.string().required(""),
  EMAIL_PASSWORD: yup.string().required(""),

  KHALTI_API: yup.string().required(""),
  KHALTI_KEY: yup.string().required(""),

  KHALTI_VERIFY_API: yup.string().required(""),
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
  frontend_url: env.FRONTEND_URL,

  email_host: env.EMAIL_HOST,
  email_port: env.EMAIL_PORT,
  email_username: env.EMAIL_USERNAME,
  email_password: env.EMAIL_PASSWORD,

  khalti_api: env.KHALTI_API,
  khalti_key: env.KHALTI_KEY,
  khalti_verify_api: env.KHALTI_VERIFY_API,
} as const;
