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
    // Para WhatsApp Business API, tentamos novamente em caso de erro de rate limit ou temporário
    return error.message.includes('rate limit') || 
           error.message.includes('temporary') ||
           error.message.includes('timeout') ||
           error.message.includes('network');
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
    const dayOfWeek = sessionDateTime.locale('pt-br').format('dddd');
    
    const playerType = sendConfig.player_type === 'monthly' ? 'Mensalista' : 'Avulso';
    const playerTypeEmoji = sendConfig.player_type === 'monthly' ? '⭐' : '🎯';
    
    // Mensagem mais amigável e profissional
    let message = `🏈 *VaiDarJogo - Confirmação de Presença*\n\n`;
    message += `Olá *${playerData.name}*! 👋\n\n`;
    message += `${playerTypeEmoji} Você é um jogador *${playerType}* e está convidado para o próximo jogo:\n\n`;
    
    message += `📅 *${dayOfWeek}, ${formattedDate}*\n`;
    message += `⏰ *${formattedTime}h*\n`;
    message += `📍 *${gameData.location || 'Local a confirmar'}*\n\n`;
    
    // Mensagem personalizada baseada no tipo de jogador
    if (sendConfig.player_type === 'monthly') {
      message += `⭐ *Mensalista* - Sua vaga está garantida! Confirme sua presença para organizarmos melhor o jogo.\n\n`;
    } else {
      message += `🎯 *Jogador Avulso* - Confirme sua presença para verificarmos a disponibilidade de vagas.\n\n`;
    }
    
    message += `🤔 *Você vai jogar?*\n\n`;
    message += `✅ *SIM* - Estarei lá!\n`;
    message += `❌ *NÃO* - Não poderei ir\n`;
    message += `❓ *TALVEZ* - Ainda não sei\n\n`;
    
    message += `💬 *Responda com uma das opções acima*\n\n`;
    message += `⚡ *Resposta rápida:* Apenas digite "sim", "não" ou "talvez"\n\n`;
    message += `_🤖 Mensagem automática do VaiDarJogo_`;

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
      return await this.config.getMessageStatus(messageId);
    } catch (error) {
      logger.error('Erro ao verificar status da mensagem:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter status da conta
   */
  async getAccountStatus() {
    try {
      return await this.config.getAccountStatus();
    } catch (error) {
      logger.error('Erro ao obter status da conta:', error);
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
      const status = this.config.getStatus();
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
   * Testar conexão com WhatsApp Business API
   */
  async testConnection() {
    return await this.config.testConnection();
  }

  /**
   * Verificar webhook
   */
  verifyWebhook(mode, token, challenge) {
    return this.config.verifyWebhook(mode, token, challenge);
  }

  /**
   * Processar mensagem recebida via webhook
   */
  async processIncomingMessage(webhookData) {
    try {
      logger.info(`📨 Processando mensagem recebida via webhook`);
      
      const result = await this.config.processIncomingMessage(webhookData);
      
      return result;
    } catch (error) {
      logger.error('Erro ao processar mensagem recebida:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar mensagem de teste
   */
  async sendTestMessage(phoneNumber, message = 'Teste do sistema VaiDarJogo - Mensagem de confirmação automática') {
    try {
      const result = await this.sendMessage(phoneNumber, message);
      
      if (result.success) {
        logger.info(`✅ Mensagem de teste enviada com sucesso para ${phoneNumber}`);
      } else {
        logger.error(`❌ Erro ao enviar mensagem de teste para ${phoneNumber}: ${result.error}`);
      }
      
      return result;
    } catch (error) {
      logger.error('Erro ao enviar mensagem de teste:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Obter informações da conta
   */
  async getAccountInfo() {
    try {
      const status = await this.getAccountStatus();
      
      if (status.success) {
        return {
          success: true,
          data: {
            phoneNumber: status.data.display_phone_number,
            verifiedName: status.data.verified_name,
            qualityRating: status.data.quality_rating,
            status: status.data.status
          }
        };
      } else {
        return status;
      }
    } catch (error) {
      logger.error('Erro ao obter informações da conta:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new WhatsAppService();