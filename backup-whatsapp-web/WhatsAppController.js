const WhatsAppService = require('../services/WhatsAppService');
const logger = require('../utils/logger');

class WhatsAppController {
  /**
   * Obter QR Code para autenticação
   */
  async getQRCode(req, res) {
    try {
      const result = await WhatsAppService.getQRCode();
      
      if (result.success) {
        res.json({
          success: true,
          message: 'QR Code obtido com sucesso',
          data: {
            qrCode: result.qrCode,
            hasQRCode: !!result.qrCode
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao obter QR Code',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao obter QR Code:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter status da conexão WhatsApp Web
   */
  async getStatus(req, res) {
    try {
      const result = await WhatsAppService.getStatus();
      
      if (result.success) {
        res.json({
          success: true,
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao obter status',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao obter status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Inicializar WhatsApp Web
   */
  async initialize(req, res) {
    try {
      const result = await WhatsAppService.initialize();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao inicializar WhatsApp Web',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao inicializar WhatsApp Web:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Desconectar WhatsApp Web
   */
  async disconnect(req, res) {
    try {
      const result = await WhatsAppService.disconnect();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao desconectar WhatsApp Web',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao desconectar WhatsApp Web:', error);
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
      const { phone, message } = req.body;
      
      if (!phone || !message) {
        return res.status(400).json({
          success: false,
          message: 'Telefone e mensagem são obrigatórios'
        });
      }

      const result = await WhatsAppService.sendMessage(phone, message);
      
      if (result.success) {
        res.json({
          success: true,
          message: 'Mensagem de teste enviada com sucesso',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao enviar mensagem de teste',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao enviar mensagem de teste:', error);
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
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Erro ao verificar status da mensagem',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Erro ao verificar status da mensagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Testar conexão com WhatsApp Web
   */
  async testConnection(req, res) {
    try {
      const result = await WhatsAppService.testConnection();
      
      if (result) {
        res.json({
          success: true,
          message: 'Conexão com WhatsApp Web testada com sucesso'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Falha na conexão com WhatsApp Web'
        });
      }
    } catch (error) {
      logger.error('Erro ao testar conexão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }

  /**
   * Obter informações da sessão WhatsApp Web
   */
  async getSessionInfo(req, res) {
    try {
      const statusResult = await WhatsAppService.getStatus();
      const qrResult = await WhatsAppService.getQRCode();
      
      res.json({
        success: true,
        data: {
          status: statusResult.success ? statusResult.data : null,
          qrCode: qrResult.success ? qrResult.qrCode : null,
          hasQRCode: qrResult.success && !!qrResult.qrCode
        }
      });
    } catch (error) {
      logger.error('Erro ao obter informações da sessão:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message
      });
    }
  }
}

module.exports = new WhatsAppController();
