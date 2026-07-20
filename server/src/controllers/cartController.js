const prisma = require('../config/database');

async function getCart(req, res, next) {
  try {
    const items = await prisma.cartItem.findMany({
      where: { userId: req.user.id, product: { active: true } },
      orderBy: { createdAt: 'asc' },
      include: {
        product: {
          select: { id: true, name: true, slug: true, price: true, originalPrice: true, imageUrl: true, stock: true, badge: true },
        },
      },
    });

    const result = items.map(({ product, ...ci }) => ({
      id: ci.id,
      quantity: ci.quantity,
      size: ci.size,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
      stock: product.stock,
      badge: product.badge,
    }));

    res.json({ items: result });
  } catch (err) {
    next(err);
  }
}

async function addItem(req, res, next) {
  try {
    const { productId, quantity = 1, size } = req.body;
    const normalizedSize = size || 'M';

    const product = await prisma.product.findFirst({
      where: { id: productId, active: true },
      select: { stock: true },
    });
    if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Estoque insuficiente.' });

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId_size: { userId: req.user.id, productId, size: normalizedSize } },
    });

    const item = existing
      ? await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + quantity },
        })
      : await prisma.cartItem.create({
          data: { userId: req.user.id, productId, quantity, size: normalizedSize },
        });

    res.status(201).json({ item });
  } catch (err) {
    next(err);
  }
}

async function updateItem(req, res, next) {
  try {
    const { quantity } = req.body;
    if (quantity < 1) return res.status(400).json({ message: 'Quantidade mínima é 1.' });

    const item = await prisma.cartItem.updateMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
      data: { quantity },
    });

    if (item.count === 0) return res.status(404).json({ message: 'Item não encontrado.' });
    res.json({ item });
  } catch (err) {
    next(err);
  }
}

async function removeItem(req, res, next) {
  try {
    await prisma.cartItem.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.user.id },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function clearCart(req, res, next) {
  try {
    await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
