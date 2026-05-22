const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashedPassword },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.cookie('token', token, COOKIE_OPTIONS);

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ user: userWithoutPassword });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res) {
  res.clearCookie('token', { path: '/' });
  return res.json({ message: 'Logout realizado.' });
}

async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    return res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe };
