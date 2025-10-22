const express = require('express');
const router = express.Router();
const ConfirmationController = require('../controllers/ConfirmationController');
const { validateRequest } = require('../middleware/validation');
const { rateLimiter } = require('../middleware/rateLimiter');

/**
 * @route POST /api/confirmation/process
 * @desc Processar confirmações pendentes
 * @access Public
 */
router.post('/process', rateLimiter, ConfirmationController.processConfirmations);

/**
 * @route POST /api/confirmation/process/:gameId
 * @desc Processar confirmações de um jogo específico
 * @access Public
 */
router.post('/process/:gameId', rateLimiter, ConfirmationController.processGameConfirmations);

/**
 * @route POST /api/confirmation/manual
 * @desc Enviar confirmação manual
 * @access Public
 */
router.post('/manual', 
  rateLimiter,
  validateRequest({
    body: {
      gameId: 'string|required',
      playerId: 'string|required',
      sessionDate: 'string|required'
    }
  }),
  ConfirmationController.sendManualConfirmation
);

/**
 * @route POST /api/confirmation/response
 * @desc Processar resposta de confirmação via webhook
 * @access Public
 */
router.post('/response', rateLimiter, ConfirmationController.processConfirmationResponse);

/**
 * @route GET /api/confirmation/scheduler/status
 * @desc Obter status do agendador
 * @access Public
 */
router.get('/scheduler/status', ConfirmationController.getSchedulerStatus);

/**
 * @route POST /api/confirmation/scheduler/control
 * @desc Controlar agendador (start/stop)
 * @access Public
 */
router.post('/scheduler/control',
  rateLimiter,
  validateRequest({
    body: {
      action: 'string|required|in:start,stop'
    }
  }),
  ConfirmationController.controlScheduler
);

/**
 * @route POST /api/confirmation/scheduler/interval
 * @desc Configurar intervalo do agendador
 * @access Public
 */
router.post('/scheduler/interval',
  rateLimiter,
  validateRequest({
    body: {
      minutes: 'number|required|min:1|max:60'
    }
  }),
  ConfirmationController.setSchedulerInterval
);

/**
 * @route GET /api/confirmation/logs
 * @desc Obter logs de envio
 * @access Public
 */
router.get('/logs', ConfirmationController.getSendLogs);

/**
 * @route GET /api/confirmation/health
 * @desc Health check
 * @access Public
 */
router.get('/health', ConfirmationController.healthCheck);

module.exports = router;





