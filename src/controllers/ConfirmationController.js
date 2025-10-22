const ConfirmationService = require('../services/ConfirmationService');
const ConfirmationScheduler = require('../schedulers/ConfirmationScheduler');
const GameConfirmation = require('../models/GameConfirmation');
const logger = require('../utils/logger');

class ConfirmationController {
  /**
   * Processar confirmações pendentes
   */
  async processConfirmations(req, res) {
    try {
      logger.info('Processamento manual de confirmações solicitado');
      
      const result = await ConfirmationService.processPendingConfirmations();
      
      res.json({
        success: true,
        message: 'Confirmações processadas com sucesso',
        data: result
      });
    } catch (error) {
      logger.error('Erro ao processar confirmações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Processar confirmações de um jogo específico
   */
  async processGameConfirmations(req, res) {
    try {
      const { gameId } = req.params;
      
      if (!gameId) {
        return res.status(400).json({
          success: false,
          message: 'ID do jogo é obrigatório'
        });
      }

      logger.info(`Processamento de confirmações solicitado para jogo ${gameId}`);
      
      const game = await GameConfirmation.getGameConfirmationConfig(gameId);
      if (!game) {
        return res.status(404).json({
          success: false,
          message: 'Jogo não encontrado ou sem configuração de confirmação'
        });
      }

      const result = await ConfirmationService.processGameConfirmations(game);
      
      res.json({
        success: true,
        message: 'Confirmações do jogo processadas com sucesso',
        data: result
      });
    } catch (error) {
      logger.error('Erro ao processar confirmações do jogo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Enviar confirmação manual
   */
  async sendManualConfirmation(req, res) {
    try {
      const { gameId, playerId, sessionDate } = req.body;
      
      if (!gameId || !playerId || !sessionDate) {
        return res.status(400).json({
          success: false,
          message: 'gameId, playerId e sessionDate são obrigatórios'
        });
      }

      logger.info(`Envio manual solicitado - Jogo: ${gameId}, Jogador: ${playerId}`);
      
      const result = await ConfirmationService.sendManualConfirmation(
        gameId, 
        playerId, 
        sessionDate
      );
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Confirmação enviada com sucesso',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Falha ao enviar confirmação',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao enviar confirmação manual:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Processar resposta de confirmação via webhook
   */
  async processConfirmationResponse(req, res) {
    try {
      const messageData = req.body;
      
      logger.info('Resposta de confirmação recebida via webhook');
      
      const result = await ConfirmationService.processConfirmationResponse(messageData);
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: {
            player: result.player,
            status: result.status
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      logger.error('Erro ao processar resposta de confirmação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter status do agendador
   */
  async getSchedulerStatus(req, res) {
    try {
      const status = ConfirmationScheduler.getStatus();
      const stats = await ConfirmationScheduler.getExecutionStats();
      
      res.json({
        success: true,
        data: {
          status,
          stats
        }
      });
    } catch (error) {
      logger.error('Erro ao obter status do agendador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Iniciar/parar agendador
   */
  async controlScheduler(req, res) {
    try {
      const { action } = req.body;
      
      if (!action || !['start', 'stop'].includes(action)) {
        return res.status(400).json({
          success: false,
          message: 'Ação deve ser "start" ou "stop"'
        });
      }

      if (action === 'start') {
        ConfirmationScheduler.start();
        res.json({
          success: true,
          message: 'Agendador iniciado com sucesso'
        });
      } else {
        ConfirmationScheduler.stop();
        res.json({
          success: true,
          message: 'Agendador parado com sucesso'
        });
      }
    } catch (error) {
      logger.error('Erro ao controlar agendador:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Configurar intervalo do agendador
   */
  async setSchedulerInterval(req, res) {
    try {
      const { minutes } = req.body;
      
      if (!minutes || minutes < 1 || minutes > 60) {
        return res.status(400).json({
          success: false,
          message: 'Intervalo deve estar entre 1 e 60 minutos'
        });
      }

      ConfirmationScheduler.setInterval(minutes);
      
      res.json({
        success: true,
        message: `Intervalo alterado para ${minutes} minutos`
      });
    } catch (error) {
      logger.error('Erro ao configurar intervalo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter logs de envio
   */
  async getSendLogs(req, res) {
    try {
      const { gameId, startDate, endDate, limit = 100 } = req.query;
      
      const logs = await GameConfirmation.getSendLogs(gameId, startDate, endDate);
      
      // Aplicar limite
      const limitedLogs = logs.slice(0, parseInt(limit));
      
      res.json({
        success: true,
        data: {
          logs: limitedLogs,
          total: logs.length,
          returned: limitedLogs.length
        }
      });
    } catch (error) {
      logger.error('Erro ao obter logs:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Health check
   */
  async healthCheck(req, res) {
    try {
      const schedulerHealth = ConfirmationScheduler.healthCheck();
      
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          scheduler: schedulerHealth,
          uptime: process.uptime()
        }
      });
    } catch (error) {
      logger.error('Erro no health check:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = new ConfirmationController();




