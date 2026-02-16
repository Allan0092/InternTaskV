import * as yup from "yup";

import registerSchema from "./registerValidation.js";

const loginSchema = yup.object().shape({
  email: registerSchema.fields.email,
  password: registerSchema.fields.password,
});

export default loginSchema;
