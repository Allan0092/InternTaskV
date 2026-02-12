import bcrypt from "bcryptjs";
import { Prisma, Role } from "../generated/prisma/client.js";
import { prisma } from "./prisma.js";

const userData: Prisma.UserCreateInput[] = [
  {
    email: "admin@email.com",
    name: "Admin User",
    password: "Admin@123",
    role: Role.ADMIN,
  },
  {
    email: "user1@email.com",
    name: "User One",
    password: "User1@123",
    role: Role.SELLER,
  },
  {
    email: "user2@email.com",
    name: "User Two",
    password: "User2@123",
    role: Role.SELLER,
  },
  {
    email: "user3@email.com",
    name: "User Three",
    password: "User3@123",
    role: Role.SELLER,
  },
  {
    email: "user4@email.com",
    name: "User Four",
    password: "User4@123",
    role: Role.SELLER,
  },
  {
    email: "user5@email.com",
    name: "User Five",
    password: "User5@123",
    role: Role.SELLER,
  },
  {
    email: "user6@email.com",
    name: "User Six",
    password: "User6@123",
    role: Role.SELLER,
  },
  {
    email: "user7@email.com",
    name: "User Seven",
    password: "User7@123",
    role: Role.SELLER,
  },
  {
    email: "user8@email.com",
    name: "User Eight",
    password: "User8@123",
    role: Role.USER,
  },
  {
    email: "user9@email.com",
    name: "User Nine",
    password: "User9@123",
  },
  {
    email: "user10@email.com",
    name: "User Ten",
    password: "User10@123",
  },
  {
    email: "user11@email.com",
    name: "User Eleven",
    password: "User11@123",
  },
];

const productData: Prisma.ProductCreateInput[] = [
  {
    name: "Wireless Headphones",
    price: 7999,
    description: "High-quality wireless headphones with noise cancellation",
    category: "ELECTRONICS",
    user: { connect: { email: "user1@email.com" } },
  },
  {
    name: "Smart Watch",
    price: 15999,
    description: "Fitness tracker with heart rate monitor and GPS",
    category: "ELECTRONICS",
    user: { connect: { email: "user2@email.com" } },
  },
  {
    name: "Cotton T-Shirt",
    price: 1299,
    description: "Comfortable 100% cotton t-shirt in multiple colors",
    category: "FASHION",
    user: { connect: { email: "user3@email.com" } },
  },
  {
    name: "Running Shoes",
    price: 8999,
    description: "Lightweight running shoes with superior cushioning",
    category: "FASHION",
    user: { connect: { email: "user4@email.com" } },
  },
  {
    name: "Coffee Maker",
    price: 5499,
    description: "Programmable coffee maker with thermal carafe",
    category: "HOME",
    user: { connect: { email: "user5@email.com" } },
  },
  {
    name: "LED Desk Lamp",
    price: 2999,
    description: "Adjustable LED desk lamp with touch control",
    category: "HOME",
    user: { connect: { email: "user6@email.com" } },
  },
  {
    name: "Building Blocks Set",
    price: 4599,
    description: "500-piece building blocks set for creative play",
    category: "TOYS",
    user: { connect: { email: "user7@email.com" } },
  },
  {
    name: "Remote Control Car",
    price: 3499,
    description: "Fast RC car with rechargeable battery",
    category: "TOYS",
    user: { connect: { email: "user1@email.com" } },
  },
  {
    name: "Programming Guide",
    price: 3999,
    description: "Comprehensive guide to modern web development",
    category: "BOOKS",
    user: { connect: { email: "user2@email.com" } },
  },
  {
    name: "Cookbook Collection",
    price: 2499,
    description: "100 easy recipes for everyday cooking",
    category: "BOOKS",
    user: { connect: { email: "user3@email.com" } },
  },
  {
    name: "Organic Honey",
    price: 899,
    description: "Pure organic honey from local farms",
    category: "FOOD",
    user: { connect: { email: "user4@email.com" } },
  },
  {
    name: "Green Tea Pack",
    price: 699,
    description: "Premium green tea leaves, 100g pack",
    category: "FOOD",
    user: { connect: { email: "user5@email.com" } },
  },
];

for (const user of userData) {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  await prisma.user.upsert({
    where: { email: user.email },
    update: { role: user.role },
    create: {
      email: user.email,
      name: user.name,
      password: hashedPassword,
      role: user.role,
    },
  });
  console.log(`Upserted user ${user.name}`);
}

var id = 1;
for (const product of productData) {
  await prisma.product.upsert({
    where: { id: id },
    update: {},
    create: {
      name: product.name,
      category: product.category,
      description: product.description,
      price: product.price,
      user: product.user,
    },
  });
  id += 1;
  console.log(`Upserted product ${product.name}`);
}
console.log(`Database seeding complete!`);
