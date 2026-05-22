const prisma = require('../config/database');

async function getAll(req, res, next) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { active: true } } } } },
    });

    const result = categories.map(({ _count, ...c }) => ({
      ...c,
      product_count: _count.products,
    }));

    res.json({ categories: result });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, slug, flag_emoji, sort_order = 0 } = req.body;
    const category = await prisma.category.create({
      data: { name, slug, flagEmoji: flag_emoji, sortOrder: sort_order },
    });
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, flag_emoji, sort_order } = req.body;
    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name, slug, flagEmoji: flag_emoji, sortOrder: sort_order },
    });
    res.json({ category });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await prisma.category.delete({ where: { id: parseInt(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getAll, create, update, remove };
