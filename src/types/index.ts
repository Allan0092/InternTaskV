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

export { AppError, CustomContext, CustomImageFile, MulterFiles };
