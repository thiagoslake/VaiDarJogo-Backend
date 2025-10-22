const express = require('express');
const router = express.Router();
const Joi = require('joi');
const WhatsAppController = require('../controllers/WhatsAppController');
const { validateRequest } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route GET /api/whatsapp/qr
 * @desc Obter QR Code para autenticação
 * @access Public
 */
router.get('/qr', WhatsAppController.getQRCode);

/**
 * @route GET /api/whatsapp/status
 * @desc Obter status da conexão WhatsApp Web
 * @access Public
 */
router.get('/status', WhatsAppController.getStatus);

/**
 * @route GET /api/whatsapp/session
 * @desc Obter informações completas da sessão
 * @access Public
 */
router.get('/session', WhatsAppController.getSessionInfo);

/**
 * @route POST /api/whatsapp/initialize
 * @desc Inicializar WhatsApp Web
 * @access Public
 */
router.post('/initialize', rateLimiter, WhatsAppController.initialize);

/**
 * @route POST /api/whatsapp/disconnect
 * @desc Desconectar WhatsApp Web
 * @access Public
 */
router.post('/disconnect', rateLimiter, WhatsAppController.disconnect);

/**
 * @route POST /api/whatsapp/test
 * @desc Enviar mensagem de teste
 * @access Public
 */
router.post('/test',
  rateLimiter,
  validateRequest({
    body: {
      phone: Joi.string().required(),
      message: Joi.string().required()
    }
  }),
  WhatsAppController.sendTestMessage
);

/**
 * @route GET /api/whatsapp/message/:messageId/status
 * @desc Verificar status de uma mensagem
 * @access Public
 */
router.get('/message/:messageId/status', WhatsAppController.getMessageStatus);

/**
 * @route GET /api/whatsapp/test-connection
 * @desc Testar conexão com WhatsApp Web
 * @access Public
 */
router.get('/test-connection', WhatsAppController.testConnection);

module.exports = router;
