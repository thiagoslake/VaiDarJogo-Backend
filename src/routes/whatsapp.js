const express = require('express');
const router = express.Router();
const WhatsAppController = require('../controllers/WhatsAppController');
const rateLimit = require('express-rate-limit');

// Rate limiting para webhook
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // máximo 100 requests por minuto
  message: {
    success: false,
    message: 'Muitas requisições para o webhook'
  }
});

// Rate limiting para envio de mensagens
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 10, // máximo 10 mensagens por minuto
  message: {
    success: false,
    message: 'Limite de mensagens excedido'
  }
});

/**
 * @route GET /api/whatsapp/status
 * @desc Obter status da conexão WhatsApp Business API
 * @access Public
 */
router.get('/status', WhatsAppController.getStatus.bind(WhatsAppController));

/**
 * @route GET /api/whatsapp/test-connection
 * @desc Testar conexão com WhatsApp Business API
 * @access Public
 */
router.get('/test-connection', WhatsAppController.testConnection.bind(WhatsAppController));

/**
 * @route POST /api/whatsapp/test
 * @desc Enviar mensagem de teste
 * @access Public
 */
router.post('/test', messageLimiter, WhatsAppController.sendTestMessage.bind(WhatsAppController));

/**
 * @route GET /api/whatsapp/message/:id/status
 * @desc Obter status de uma mensagem específica
 * @access Public
 */
router.get('/message/:id/status', WhatsAppController.getMessageStatus.bind(WhatsAppController));

/**
 * @route GET /api/whatsapp/account/info
 * @desc Obter informações da conta WhatsApp Business
 * @access Public
 */
router.get('/account/info', WhatsAppController.getAccountInfo.bind(WhatsAppController));

/**
 * @route GET /api/whatsapp/account/status
 * @desc Obter status da conta WhatsApp Business
 * @access Public
 */
router.get('/account/status', WhatsAppController.getAccountStatus.bind(WhatsAppController));

/**
 * @route GET /api/whatsapp/webhook
 * @desc Webhook para verificação (GET)
 * @access Public
 */
router.get('/webhook', webhookLimiter, WhatsAppController.webhook.bind(WhatsAppController));

/**
 * @route POST /api/whatsapp/webhook
 * @desc Webhook para receber mensagens (POST)
 * @access Public
 */
router.post('/webhook', webhookLimiter, WhatsAppController.webhook.bind(WhatsAppController));

module.exports = router;