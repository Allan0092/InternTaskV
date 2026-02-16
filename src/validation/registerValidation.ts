import * as yup from "yup";

const registerSchema = yup.object().shape({
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required")
    .trim(),

  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character")
    .required("Password is required"),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default registerSchema;
