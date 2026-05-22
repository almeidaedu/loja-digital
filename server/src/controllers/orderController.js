const prisma = require('../config/database');

const VALID_STATUSES = ['pending', 'waiting_payment', 'approved', 'in_process', 'rejected', 'cancelled', 'shipped', 'delivered'];

async function createOrder(req, res, next) {
  try {
    const { shipping_address } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user.id, product: { active: true } },
      include: { product: { select: { id: true, name: true, imageUrl: true, price: true, stock: true } } },
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Carrinho vazio.' });
    }

    for (const ci of cartItems) {
      if (ci.product.stock < ci.quantity) {
        return res.status(400).json({ message: `Estoque insuficiente para "${ci.product.name}".` });
      }
    }

    const total = cartItems.reduce((sum, ci) => sum + Number(ci.product.price) * ci.quantity, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount: total,
          shippingAddress: shipping_address,
          items: {
            create: cartItems.map((ci) => ({
              productId: ci.product.id,
              productName: ci.product.name,
              productImage: ci.product.imageUrl,
              unitPrice: ci.product.price,
              quantity: ci.quantity,
              size: ci.size,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId: req.user.id } });

      return newOrder;
    });

    res.status(201).json({ order });
  } catch (err) {
    next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          select: { id: true, productName: true, productImage: true, unitPrice: true, quantity: true, size: true },
        },
      },
    });
    res.json({ orders });
  } catch (err) {
    next(err);
  }
}

async function getOneOrder(req, res, next) {
  try {
    const where = req.user.role === 'admin'
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user.id };

    const order = await prisma.order.findFirst({
      where,
      include: {
        items: {
          select: { id: true, productName: true, productImage: true, unitPrice: true, quantity: true, size: true },
        },
      },
    });

    if (!order) return res.status(404).json({ message: 'Pedido não encontrado.' });
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

async function adminGetAll(req, res, next) {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = status ? { status } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        include: {
          user: { select: { name: true, email: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    const result = orders.map(({ user, ...o }) => ({
      ...o,
      customer_name: user.name,
      customer_email: user.email,
    }));

    res.json({ orders: result, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status inválido.' });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, getMyOrders, getOneOrder, adminGetAll, updateStatus };
