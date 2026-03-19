import bcrypt from "bcryptjs";
import { OrderStatus, Prisma, Role } from "../generated/prisma/client.js";
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

console.log("");

const productData: Prisma.ProductCreateInput[] = [
  {
    name: "Wireless Headphones",
    price: 7999,
    description: "High-quality wireless headphones with noise cancellation",
    category: "ELECTRONICS",
    quantity: 5,
    user: { connect: { email: "user1@email.com" } },
  },
  {
    name: "Smart Watch",
    price: 15999,
    description: "Fitness tracker with heart rate monitor and GPS",
    category: "ELECTRONICS",
    quantity: 50,
    user: { connect: { email: "user2@email.com" } },
  },
  {
    name: "Cotton T-Shirt",
    price: 1299,
    description: "Comfortable 100% cotton t-shirt in multiple colors",
    category: "FASHION",
    quantity: 3,
    user: { connect: { email: "user3@email.com" } },
  },
  {
    name: "Running Shoes",
    price: 8999,
    description: "Lightweight running shoes with superior cushioning",
    category: "FASHION",
    quantity: 6,
    user: { connect: { email: "user4@email.com" } },
  },
  {
    name: "Coffee Maker",
    price: 5499,
    description: "Programmable coffee maker with thermal carafe",
    category: "HOME",
    quantity: 24,
    user: { connect: { email: "user5@email.com" } },
  },
  {
    name: "LED Desk Lamp",
    price: 2999,
    description: "Adjustable LED desk lamp with touch control",
    category: "HOME",
    quantity: 1,
    user: { connect: { email: "user6@email.com" } },
  },
  {
    name: "Building Blocks Set",
    price: 4599,
    description: "500-piece building blocks set for creative play",
    category: "TOYS",
    quantity: 7,
    user: { connect: { email: "user7@email.com" } },
  },
  {
    name: "Remote Control Car",
    price: 3499,
    description: "Fast RC car with rechargeable battery",
    category: "TOYS",
    quantity: 13,
    user: { connect: { email: "user1@email.com" } },
  },
  {
    name: "Programming Guide",
    price: 3999,
    description: "Comprehensive guide to modern web development",
    category: "BOOKS",
    quantity: 67,
    user: { connect: { email: "user2@email.com" } },
  },
  {
    name: "Cookbook Collection",
    price: 2499,
    description: "100 easy recipes for everyday cooking",
    category: "BOOKS",
    quantity: 8,
    user: { connect: { email: "user3@email.com" } },
  },
  {
    name: "Organic Honey",
    price: 899,
    description: "Pure organic honey from local farms",
    category: "FOOD",
    quantity: 9,
    user: { connect: { email: "user4@email.com" } },
  },
  {
    name: "Green Tea Pack",
    price: 699,
    description: "Premium green tea leaves, 100g pack",
    category: "FOOD",
    quantity: 14,
    user: { connect: { email: "user5@email.com" } },
  },
];

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
      quantity: product.quantity,
    },
  });
  id += 1;
  console.log(`Upserted product ${product.name}`);
}

console.log("");
// cart seed
const cartData: {
  email: string;
  products: { email: string; quantity: number }[];
}[] = [
  {
    email: userData[1].email,
    products: [
      { email: userData[7].email, quantity: 2 }, // product created by user1
      { email: userData[3].email, quantity: 2 },
      { email: userData[5].email, quantity: 5 },
      { email: userData[2].email, quantity: 3 },
    ],
  },
  {
    email: userData[2].email,
    products: [
      { email: userData[1].email, quantity: 2 }, // product created by user1
      { email: userData[3].email, quantity: 2 },
      { email: userData[5].email, quantity: 5 },
      { email: userData[2].email, quantity: 3 },
    ],
  },
  {
    email: userData[3].email,
    products: [
      { email: userData[7].email, quantity: 2 }, // product created by user1
      { email: userData[1].email, quantity: 2 },
      { email: userData[5].email, quantity: 5 },
      { email: userData[2].email, quantity: 3 },
    ],
  },
  {
    email: userData[8].email,
    products: [
      { email: userData[1].email, quantity: 2 }, // product created by user1
      { email: userData[2].email, quantity: 1 },
    ],
  },
  {
    email: userData[9].email,
    products: [{ email: userData[3].email, quantity: 5 }],
  },
];

for (const c of cartData) {
  const user = await prisma.user.findUnique({ where: { email: c.email } });
  if (!user) continue;

  const cart = await prisma.cart.upsert({
    where: { userId: user.id },
    update: {},
    create: { user: { connect: { id: user.id } } },
  });

  for (const p of c.products) {
    const product = await prisma.product.findFirst({
      where: { user: { email: p.email } },
    });
    if (!product) continue;

    await prisma.cartProduct.upsert({
      where: {
        cartId_productId: { cartId: cart.id, productId: product.id },
      },
      update: { quantity: p.quantity },
      create: {
        cart: { connect: { id: cart.id } },
        product: { connect: { id: product.id } },
        quantity: p.quantity,
      },
    });
  }
  console.log(`Seeded cart for ${c.email}`);
}

console.log(``);

//  orders / orderItems seed
const orderData: {
  email: string;
  items: { productName: string; quantity: number; price: number }[];
  status: OrderStatus;
}[] = [
  {
    email: userData[8].email,
    items: [
      {
        productName: productData[0].name,
        quantity: 1,
        price: productData[0].price,
      },
      {
        productName: productData[1].name,
        quantity: 1,
        price: productData[1].price,
      },
      {
        productName: productData[11].name,
        quantity: 2,
        price: productData[11].price,
      },
    ],
    status: OrderStatus.SHIPPING,
  },
  {
    email: userData[8].email,
    items: [
      {
        productName: productData[0].name,
        quantity: 1,
        price: productData[0].price,
      },
      {
        productName: productData[1].name,
        quantity: 1,
        price: productData[1].price,
      },
      {
        productName: productData[11].name,
        quantity: 2,
        price: productData[11].price,
      },
    ],
    status: OrderStatus.DECLINED,
  },
  {
    email: userData[2].email,
    items: [
      {
        productName: productData[3].name,
        quantity: 1,
        price: productData[3].price,
      },
      {
        productName: productData[10].name,
        quantity: 2,
        price: productData[10].price,
      },
    ],
    status: OrderStatus.CANCELLED,
  },
  {
    email: userData[9].email,
    items: [{ productName: "Cotton T-Shirt", quantity: 3, price: 1299 }],
    status: OrderStatus.PROCESSING,
  },
  {
    email: "user1@email.com",
    items: [
      { productName: "Wireless Headphones", quantity: 1, price: 7999 },
      { productName: "Green Tea Pack", quantity: 2, price: 699 },
    ],
    status: OrderStatus.PENDING,
  },
  {
    email: userData[7].email,
    items: [
      {
        productName: productData[3].name,
        quantity: 1,
        price: productData[3].price,
      },
      {
        productName: productData[9].name,
        quantity: 2,
        price: productData[9].price,
      },
      {
        productName: productData[4].name,
        quantity: 2,
        price: productData[4].price,
      },
    ],
    status: OrderStatus.SHIPPING,
  },
];

for (const o of orderData) {
  const user = await prisma.user.findUnique({ where: { email: o.email } });
  if (!user) continue;

  const total = o.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await prisma.order.create({
    data: {
      user: { connect: { id: user.id } },
      orderDate: new Date(),
      Total: total,
    },
  });

  for (const it of o.items) {
    const product = await prisma.product.findFirst({
      where: { name: it.productName },
    });
    if (!product) continue;

    await prisma.orderItem.create({
      data: {
        order: { connect: { id: order.id } },
        product: { connect: { id: product.id } },
        quantity: it.quantity,
        price: it.price,
      },
    });
  }
  console.log(`Created order ${order.id} for ${o.email}`);
}

console.log(``);
console.log(`Database seeding complete!`);
