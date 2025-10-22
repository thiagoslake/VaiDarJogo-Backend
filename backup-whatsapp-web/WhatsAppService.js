const whatsappConfig = require('../config/whatsapp');
const logger = require('../utils/logger');
const moment = require('moment-timezone');

class WhatsAppService {
  constructor() {
    this.config = whatsappConfig;
    this.maxRetries = parseInt(process.env.MAX_RETRY_ATTEMPTS) || 3;
    this.retryDelay = parseInt(process.env.RETRY_DELAY_MS) || 5000;
  }

  /**
   * Enviar mensagem de confirmação de presença
   */
  async sendConfirmationMessage(playerData, gameData, sessionData, sendConfig) {
    try {
      const message = this.buildConfirmationMessage(playerData, gameData, sessionData, sendConfig);
      
      const result = await this.sendMessage(playerData.phone, message);
      
      logger.logWhatsAppMessage({
        to: playerData.phone,
        message: message
      }, result);
      
      return result;
    } catch (error) {
      logger.error('Erro ao enviar mensagem de confirmação:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Enviar mensagem genérica
   */
  async sendMessage(phoneNumber, message, retryCount = 0) {
    try {
      const result = await this.config.sendMessage(phoneNumber, message);
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        logger.warn(`Tentativa ${retryCount + 1} falhou, tentando novamente em ${this.retryDelay}ms`);
        await this.delay(this.retryDelay);
        return this.sendMessage(phoneNumber, message, retryCount + 1);
      }
      
      throw error;
    }
  }

  /**
   * Verificar se deve tentar novamente
   */
  shouldRetry(error) {
    // Para WhatsApp Web, tentamos novamente em caso de erro de conexão
    return error.message.includes('não está pronto') || 
           error.message.includes('conexão') ||
           error.message.includes('timeout');
  }

  /**
   * Delay entre tentativas
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Construir mensagem de confirmação
   */
  buildConfirmationMessage(playerData, gameData, sessionData, sendConfig) {
    const timezone = process.env.DEFAULT_TIMEZONE || 'America/Sao_Paulo';
    const sessionDateTime = moment.tz(sessionData.session_date, timezone);
    const formattedDate = sessionDateTime.format('DD/MM/YYYY');
    const formattedTime = sessionDateTime.format('HH:mm');
    
    const playerType = sendConfig.player_type === 'monthly' ? 'Mensalista' : 'Avulso';
    
    let message = `🏈 *Confirmação de Presença - ${gameData.name}*\n\n`;
    message += `Olá *${playerData.name}*!\n\n`;
    message += `Você é um jogador *${playerType}* e está sendo convidado para confirmar sua presença no próximo jogo:\n\n`;
    message += `📅 *Data:* ${formattedDate}\n`;
    message += `⏰ *Horário:* ${formattedTime}\n`;
    message += `📍 *Local:* ${gameData.location || 'A definir'}\n\n`;
    
    if (sendConfig.player_type === 'monthly') {
      message += `Como mensalista, você tem prioridade na confirmação.\n\n`;
    } else {
      message += `Como jogador avulso, sua confirmação será processada após os mensalistas.\n\n`;
    }
    
    message += `Para confirmar sua presença, responda:\n`;
    message += `✅ *SIM* - Estarei presente\n`;
    message += `❌ *NÃO* - Não poderei comparecer\n\n`;
    message += `_Esta mensagem foi enviada automaticamente pelo sistema VaiDarJogo._`;

    return message;
  }

  /**
   * Formatar número de telefone para WhatsApp
   */
  formatPhoneNumber(phone) {
    return this.config.formatPhoneNumber(phone);
  }

  /**
   * Verificar status de uma mensagem
   */
  async getMessageStatus(messageId) {
    try {
      // Para WhatsApp Web, não temos status detalhado como na API oficial
      // Retornamos informações básicas
      return {
        success: true,
        data: {
          id: messageId,
          status: 'sent',
          timestamp: Date.now()
        }
      };
    } catch (error) {
      logger.error('Erro ao verificar status da mensagem:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter QR Code para autenticação
   */
  async getQRCode() {
    try {
      const qrCode = await this.config.getQRCode();
      return {
        success: true,
        qrCode: qrCode
      };
    } catch (error) {
      logger.error('Erro ao obter QR Code:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter status da conexão
   */
  async getStatus() {
    try {
      const status = await this.config.getStatus();
      return {
        success: true,
        data: status
      };
    } catch (error) {
      logger.error('Erro ao obter status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Inicializar WhatsApp Web
   */
  async initialize() {
    try {
      await this.config.initialize();
      return {
        success: true,
        message: 'WhatsApp Web inicializado'
      };
    } catch (error) {
      logger.error('Erro ao inicializar WhatsApp Web:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Desconectar WhatsApp Web
   */
  async disconnect() {
    try {
      await this.config.disconnect();
      return {
        success: true,
        message: 'WhatsApp Web desconectado'
      };
    } catch (error) {
      logger.error('Erro ao desconectar WhatsApp Web:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Testar conexão com WhatsApp Web
   */
  async testConnection() {
    return await this.config.testConnection();
  }

  /**
   * Processar mensagem recebida (chamado automaticamente pelo config)
   */
  async processIncomingMessage(messageData) {
    try {
      logger.info(`📨 Processando mensagem recebida: ${messageData.text}`);
      
      // Aqui você pode adicionar lógica adicional para processar mensagens
      // Por exemplo, salvar no banco de dados, enviar notificações, etc.
      
      return {
        success: true,
        message: 'Mensagem processada com sucesso'
      };
    } catch (error) {
      logger.error('Erro ao processar mensagem recebida:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WhatsAppService();
