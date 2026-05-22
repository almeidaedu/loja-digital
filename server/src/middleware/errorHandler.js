function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;

  console.error(`[error] ${req.method} ${req.path} →`, err);

  // Nunca expõe mensagens técnicas de SDKs externos para o cliente
  const isClientError = status >= 400 && status < 500;
  const message = isClientError
    ? (err.message || 'Requisição inválida.')
    : 'Erro interno do servidor.';

  res.status(status).json({ message });
}

module.exports = errorHandler;
