import * as yup from "yup";

const priceRangeSchema = yup.object().shape({
  min: yup.number().min(0).max(999999).required("min is required field"),
  max: yup.number().min(1).max(999999).required(),
});

export { priceRangeSchema };
