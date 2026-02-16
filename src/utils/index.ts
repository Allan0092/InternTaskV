import { Product, User } from "@/generated/prisma/browser.js";

interface ResponseBody {
  success: Boolean;
  message: string;
  data?: User[] | User | Product[] | Product | null | "";
  error?: String;
}
const generateResponseBody = ({
  success = false,
  message = "An error occured",
  data = {},
  error = "",
} = {}) => {
  return success
    ? { success: success, message: message, data: data }
    : { success: success, message: message, data: data, error: error };
};

export { generateResponseBody };
