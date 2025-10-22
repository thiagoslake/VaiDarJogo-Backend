const WhatsAppService = require('../services/WhatsAppService');
const logger = require('../utils/logger');

class WhatsAppController {
  /**
   * Obter status da conexão WhatsApp Business API
   */
  async getStatus(req, res) {
    try {
      const status = await WhatsAppService.getStatus();
      
      if (status.success) {
        res.json({
          success: true,
          message: 'Status obtido com sucesso',
          data: status.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao obter status',
          error: status.error
        });
      }
    } catch (error) {
      logger.error('Erro no controller getStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Testar conexão com WhatsApp Business API
   */
  async testConnection(req, res) {
    try {
      const isConnected = await WhatsAppService.testConnection();
      
      if (isConnected) {
        res.json({
          success: true,
          message: 'WhatsApp Business API conectada e funcionando',
          data: { connected: true }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'WhatsApp Business API não está funcionando',
          data: { connected: false }
        });
      }
    } catch (error) {
      logger.error('Erro no controller testConnection:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Enviar mensagem de teste
   */
  async sendTestMessage(req, res) {
    try {
      const { phoneNumber, message } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Número de telefone é obrigatório'
        });
      }

      const result = await WhatsAppService.sendTestMessage(phoneNumber, message);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Mensagem de teste enviada com sucesso',
          data: {
            messageId: result.messageId,
            status: result.status
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao enviar mensagem de teste',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro no controller sendTestMessage:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Verificar status de uma mensagem
   */
  async getMessageStatus(req, res) {
    try {
      const { messageId } = req.params;
      
      if (!messageId) {
        return res.status(400).json({
          success: false,
          message: 'ID da mensagem é obrigatório'
        });
      }

      const result = await WhatsAppService.getMessageStatus(messageId);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Status da mensagem obtido com sucesso',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao obter status da mensagem',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro no controller getMessageStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter informações da conta
   */
  async getAccountInfo(req, res) {
    try {
      const result = await WhatsAppService.getAccountInfo();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Informações da conta obtidas com sucesso',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao obter informações da conta',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro no controller getAccountInfo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Webhook para receber mensagens
   */
  async webhook(req, res) {
    try {
      const { mode, token, challenge } = req.query;
      
      // Verificação do webhook
      if (mode && token) {
        const verificationResult = WhatsAppService.verifyWebhook(mode, token, challenge);
        
        if (verificationResult) {
          return res.status(200).send(verificationResult);
        } else {
          return res.status(403).json({
            success: false,
            message: 'Falha na verificação do webhook'
          });
        }
      }

      // Processar mensagem recebida
      const result = await WhatsAppService.processIncomingMessage(req.body);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Webhook processado com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao processar webhook',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro no controller webhook:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter status da conta
   */
  async getAccountStatus(req, res) {
    try {
      const result = await WhatsAppService.getAccountStatus();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Status da conta obtido com sucesso',
          data: result.data
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro ao obter status da conta',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro no controller getAccountStatus:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = new WhatsAppController();