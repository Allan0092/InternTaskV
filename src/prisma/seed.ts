import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";
import {
  cartData,
  orderData,
  paymentData,
  productData,
  userData,
} from "./seed_data.js";

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

    await prisma.cartItem.upsert({
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

console.log(`-----------------------------------------------------`);

for (const p of paymentData) {
  const payment = await prisma.payment.upsert({
    where: { pidx: p.pidx },
    update: {},
    create: {
      pidx: p.pidx,
      date: p.date,
      geteway: p.geteway,
      status: p.status,
    },
  });

  console.log(`Upserted payment ${payment.id}`);
}

console.log(`-----------------------------------------------------`);

for (const o of orderData) {
  const user = await prisma.user.findUnique({ where: { email: o.email } });
  if (!user) continue;

  const total = o.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const order = await prisma.order.create({
    data: {
      user: { connect: { id: user.id } },
      orderDate: new Date(),
      total: total,
      status: o.status,
      ...(o.payment
        ? { payments: { connect: { pidx: o.payment.pidx } } }
        : {}),
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
