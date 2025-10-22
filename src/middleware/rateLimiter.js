const rateLimit = require('express-rate-limit');

/**
 * Rate limiter padrão
 */
const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 100 requests por window
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Muitas requisições. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
    });
  }
});

/**
 * Rate limiter mais restritivo para webhooks
 */
const webhookRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // 10 requests por minuto
  message: {
    success: false,
    message: 'Muitas requisições de webhook. Tente novamente em alguns segundos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para envio de mensagens
 */
const messageRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 5, // 5 mensagens por minuto
  message: {
    success: false,
    message: 'Limite de envio de mensagens excedido. Tente novamente em alguns segundos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter para operações administrativas
 */
const adminRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // 20 requests por 5 minutos
  message: {
    success: false,
    message: 'Muitas operações administrativas. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  rateLimiter,
  webhookRateLimiter,
  messageRateLimiter,
  adminRateLimiter
};




