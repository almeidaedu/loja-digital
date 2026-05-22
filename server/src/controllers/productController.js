const prisma = require('../config/database');

function buildSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

const productWithCategory = {
  include: { category: { select: { name: true, slug: true } } },
};

function formatProduct(p) {
  const { category, ...rest } = p;
  return {
    ...rest,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
  };
}

async function getFeatured(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true, active: true },
      orderBy: { reviewCount: 'desc' },
      take: 8,
      ...productWithCategory,
    });
    res.json({ products: products.map(formatProduct) });
  } catch (err) {
    next(err);
  }
}

async function getAll(req, res, next) {
  try {
    const { category, q, page = 1, limit = 12 } = req.query;

    const where = { active: true };
    if (category) where.category = { slug: category };
    if (q) where.name = { contains: q, mode: 'insensitive' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        ...productWithCategory,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products: products.map(formatProduct),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, active: true },
      ...productWithCategory,
    });
    if (!product) return res.status(404).json({ message: 'Produto não encontrado.' });
    res.json({ product: formatProduct(product) });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { category_id, name, description, price, original_price, stock, image_url, badge, featured } = req.body;
    const product = await prisma.product.create({
      data: {
        categoryId: category_id,
        name,
        slug: buildSlug(name),
        description,
        price,
        originalPrice: original_price ?? null,
        stock,
        imageUrl: image_url ?? null,
        badge: badge ?? null,
        featured: featured ?? false,
      },
    });
    res.status(201).json({ product });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { category_id, name, description, price, original_price, stock, image_url, badge, featured, active } = req.body;
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        categoryId: category_id,
        name,
        slug: buildSlug(name),
        description,
        price,
        originalPrice: original_price ?? null,
        stock,
        imageUrl: image_url ?? null,
        badge: badge ?? null,
        featured,
        active,
      },
    });
    res.json({ product });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { active: false },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getFeatured, getAll, getOne, create, update, remove };
