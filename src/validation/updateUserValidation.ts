import { Role } from "@/generated/prisma/enums.js";
import * as yup from "yup";

const updateUserSchema = yup
  .object()
  .shape({
    name: yup
      .string()
      .min(3, "Name must be atleast 3 characters")
      .max(30, "Name must not be more than 30 characeters"),

    email: yup
      .string()
      .email("Please enter a valid email address")
      .trim()
      .required("Email is required"),

    id: yup.mixed().oneOf([undefined], "Cannot update id"),
    role: yup.mixed().oneOf([undefined], "Cannot update role"),
    createdAt: yup.mixed().oneOf([undefined], "Cannot update createdAt"),
    updatedAt: yup.mixed().oneOf([undefined], "Cannot update updatedAt"),
    password: yup
      .mixed()
      .oneOf([undefined], "Use separate endpoint to change password"),
  })
  .noUnknown(true)
  .strict(true);

const adminUpdateUserSchema = yup
  .object()
  .shape({
    id: yup.number().min(1, "id must not be lower than 1"),
    name: yup
      .string()
      .min(3, "Name must be atleast 3 characters")
      .max(30, "Name must not be more than 30 characeters"),

    email: yup
      .string()
      .email("Please enter a valid email address")
      .trim()
      .required("Email is required"),

    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password is too long")
      .matches(/[a-z]/, "Must contain at least one lowercase letter")
      .matches(/[A-Z]/, "Must contain at least one uppercase letter")
      .matches(/[0-9]/, "Must contain at least one number")
      .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character"),

    role: yup
      .string()
      .oneOf([Role.ADMIN, Role.SELLER, Role.USER], "Invalid role."),
  })
  .strip();

export { adminUpdateUserSchema, updateUserSchema };
