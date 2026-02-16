import { Category } from "@/generated/prisma/enums.js";
import * as yup from "yup";

const productSchema = yup.object().shape({
  name: yup.string().required("Product name is required.").min(3).max(30),
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

export { productSchema };
