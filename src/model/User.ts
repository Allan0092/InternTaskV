import { User } from "@/generated/prisma/client.js";
import { UserCreateInput } from "@/generated/prisma/models.js";
import { prisma } from "@/prisma/prisma.js";

const findAllUsers = async (): Promise<User[]> => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" } });
  return users;
};

const findUserByEmail = async (email: string): Promise<User | null> => {
  const user = await prisma.user.findFirst({ where: { email: email } });
  return user;
};

const saveUser = async (user: UserCreateInput) => {
  await prisma.user.create({ data: user });
};

export { findAllUsers, findUserByEmail, saveUser };
