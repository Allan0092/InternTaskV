import { findAllUsers, findUserByEmail } from "@/model/User.js";
import { generateResponseBody } from "@/utils/index.js";
import bcrypt from "bcryptjs";
import "dotenv";
import jwt from "jsonwebtoken";
import { Context } from "koa";

const getUsers = async (ctx: Context) => {
  const users = await findAllUsers();
  ctx.body = generateResponseBody({ success: true, data: users });
};

const login = async (ctx: Context) => {
  try {
    const { email, password } = ctx.request.body as {
      email: string;
      password: string;
    };

    const user = await findUserByEmail(email);
    if (!user) throw new Error("Email not found.");

    const passwordMatch: boolean = await bcrypt.compare(
      password,
      user.password,
    );
    if (!passwordMatch) throw new Error("Password does not match.");

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
  } catch (e: Error | any) {
    ctx.response.status = 401;
    ctx.body = generateResponseBody({ message: e.message });
  }
};

const registerUser = async (ctx: Context) => {
  try {
  } catch (e: Error | any) {
    ctx.body = generateResponseBody({ message: e.message });
  }
};
export { getUsers, login };
