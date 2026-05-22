const { verifyToken } = require('../utils/jwt');

function authMiddleware(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Não autenticado.' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.clearCookie('token');
    return res.status(401).json({ message: 'Sessão expirada. Faça login novamente.' });
  }
}

module.exports = authMiddleware;
