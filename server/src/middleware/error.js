export function errorHandler(err, req, res, _next) {
  console.error('🔥 SERVER ERROR:', err.stack || err);
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
}
