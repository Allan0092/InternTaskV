import { Category } from "@/generated/prisma/enums.js";
import * as yup from "yup";

const addProductSchema = yup.object().shape({
  name: yup
    .string()
    .required("Product name is required.")
    .min(3, "Product name should be greater than 3 characters")
    .max(30, "Product name should be less than 30 characters"),
  price: yup.number().required("Product price is required.").positive(),
  description: yup
    .string()
    .required("Product description is required.")
    .min(10)
    .max(300),
  category: yup
    .string()
    .oneOf(
      Object.values(Category),
      `Provided Category must be one of ${Object.values(Category)}`,
    )
    .required("Product category is required"),
});

const updateProductSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, "Product name should be greater than 3 characters")
    .max(30, "Product name should be less than 30 characters"),
  price: yup.number().positive(),
  description: yup.string().min(10).max(300),
  category: yup
    .string()
    .oneOf(
      Object.values(Category),
      `Provided Category must be one of ${Object.values(Category)}`,
    ),
});

export { addProductSchema, updateProductSchema };
