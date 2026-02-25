import { Role } from "@/generated/prisma/enums.js";
import { findAllUsers, findUserByEmail, saveUser } from "@/model/User.js";
import { AppError } from "@/types/index.js";
import { generateResponseBody } from "@/utils/index.js";
import bcrypt from "bcryptjs";
import "dotenv";
import jwt from "jsonwebtoken";
import { Context } from "koa";

const getUsers = async (ctx: Context) => {
  try {
    const page = Number(ctx.query.page ?? 1);
    const limit = Number(ctx.query.limit ?? 10);

    const users = await findAllUsers(page, limit);
    ctx.body = generateResponseBody({ success: true, data: users });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 500;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Could not fetch users.",
    });
    throw e;
  }
};

const login = async (ctx: Context) => {
  try {
    const { email, password } = ctx.request.body as {
      email: string;
      password: string;
    };

    const user = await findUserByEmail(email);
    if (!user) throw new AppError("Invalid Credentials", 401);

    const passwordMatch: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!passwordMatch) throw new AppError("Invalid Credentials", 401);

    const SECRET_KEY: string = process.env.SECRET_KEY ?? "my-secret-key";
    const token = jwt.sign(
      { name: user.name, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "8h" },
    );

    ctx.body = generateResponseBody({
      success: true,
      message: "Login successful",
      data: { token: token },
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Could not login",
    });
    throw e;
  }
};

const registerUser = async (ctx: Context) => {
  try {
    const { name, email, password, role } = ctx.request.body as {
      name: string;
      email: string;
      password: string;
      role: Role;
    };

    const existingUser = await findUserByEmail(email);
    if (existingUser) throw new AppError("Email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await saveUser({
      name: name,
      email: email,
      password: hashedPassword,
      role: role,
    });

    if (!user) throw new Error();

    ctx.response.status = 201;
    ctx.body = generateResponseBody({
      success: true,
      message: "User registered successfully.",
    });
  } catch (e: AppError | Error | any) {
    ctx.response.status = e.status ?? 400;
    ctx.body = generateResponseBody({
      message: e instanceof AppError ? e.message : "Could not register user",
    });
    throw e;
  }
};
export { getUsers, login, registerUser };
