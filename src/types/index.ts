import { Product, User } from "@/generated/prisma/client.js";
import { File } from "@koa/multer";

class AppError extends Error {
  constructor(
    message: string,
    public status: number = 400,
    public data: Object = {},
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.data = {};
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

interface MulterFiles {
  [fieldname: string]: File[];
}

interface CustomContext {
  files?: MulterFiles;
  file?: File;
}

interface CustomImageFile extends File {
  photo: File[];
}

type ResponseBody = {
  success: Boolean;
  message: string;
  data?: User[] | User | Product[] | Product | null | "" | {} | any;
};

export { AppError, CustomContext, CustomImageFile, MulterFiles, ResponseBody };
