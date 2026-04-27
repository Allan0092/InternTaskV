export type Role = "USER" | "SELLER" | "ADMIN";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  deletedAt: string | null;
};

export const roleBadgeColors: Record<Role, string> = {
  USER: "bg-blue-100 text-blue-700",
  SELLER: "bg-green-100 text-green-700",
  ADMIN: "bg-red-100 text-red-700",
};
