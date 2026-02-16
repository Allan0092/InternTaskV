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

const saveUser = async (userData: UserCreateInput) => {
  const user = await prisma.user.create({ data: userData });
  return user;
};

const removeUserbyId = async (id: number) => {
  const user = await prisma.user.delete({ where: { id: id } });
  return user;
};

// const updateUserbyEmail = async (email: string, data: {}) => {
//   const user = await findUserByEmail(email)
//   if (!user) throw new AppError("Email not found.")

//   const updatedUser =
// }

export { findAllUsers, findUserByEmail, removeUserbyId, saveUser };
