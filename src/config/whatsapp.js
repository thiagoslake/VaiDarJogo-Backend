const axios = require('axios');
const logger = require('../utils/logger');

class WhatsAppBusinessConfig {
  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    this.webhookVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
    this.apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}`;
    this.isReady = false;
    this.init();
  }

  init() {
    try {
      // Validar configurações obrigatórias
      if (!this.accessToken) {
        throw new Error('WHATSAPP_ACCESS_TOKEN é obrigatório');
      }
      if (!this.phoneNumberId) {
        throw new Error('WHATSAPP_PHONE_NUMBER_ID é obrigatório');
      }
      if (!this.businessAccountId) {
        throw new Error('WHATSAPP_BUSINESS_ACCOUNT_ID é obrigatório');
      }

      this.isReady = true;
      logger.info('✅ Configuração WhatsApp Business API carregada');
    } catch (error) {
      logger.error('❌ Erro ao configurar WhatsApp Business API:', error);
      this.isReady = false;
    }
  }

  /**
   * Enviar mensagem via WhatsApp Business API
   */
  async sendMessage(phoneNumber, message) {
    try {
      if (!this.isReady) {
        throw new Error('WhatsApp Business API não está configurado');
      }

      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;

      const payload = {
        messaging_product: 'whatsapp',
        to: formattedNumber,
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const messageId = response.data.messages[0].id;
      
      logger.info(`✅ Mensagem enviada via WhatsApp Business API: ${messageId}`);
      
      return {
        success: true,
        messageId: messageId,
        status: 'sent'
      };
    } catch (error) {
      logger.error('❌ Erro ao enviar mensagem via WhatsApp Business API:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Formatar número de telefone para WhatsApp
   */
  formatPhoneNumber(phone) {
    // Remove todos os caracteres não numéricos
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Se começar com 0, remove
    if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.substring(1);
    }
    
    // Se não começar com 55 (Brasil), adiciona
    if (!cleanPhone.startsWith('55')) {
      cleanPhone = '55' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Verificar status da mensagem
   */
  async getMessageStatus(messageId) {
    try {
      const url = `${this.baseUrl}/${messageId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        success: true,
        data: {
          id: messageId,
          status: response.data.status,
          timestamp: response.data.timestamp
        }
      };
    } catch (error) {
      logger.error('❌ Erro ao verificar status da mensagem:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Verificar status da conta
   */
  async getAccountStatus() {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}`;
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      return {
        success: true,
        data: {
          id: response.data.id,
          display_phone_number: response.data.display_phone_number,
          quality_rating: response.data.quality_rating,
          verified_name: response.data.verified_name,
          status: response.data.status
        }
      };
    } catch (error) {
      logger.error('❌ Erro ao verificar status da conta:', error);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  /**
   * Testar conexão com a API
   */
  async testConnection() {
    try {
      const status = await this.getAccountStatus();
      
      if (status.success) {
        logger.info('✅ WhatsApp Business API conectada e funcionando');
        return true;
      } else {
        logger.warn('⚠️ WhatsApp Business API não está funcionando');
        return false;
      }
    } catch (error) {
      logger.error('❌ Erro ao testar conexão WhatsApp Business API:', error);
      return false;
    }
  }

  /**
   * Verificar webhook
   */
  verifyWebhook(mode, token, challenge) {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      logger.info('✅ Webhook verificado com sucesso');
      return challenge;
    } else {
      logger.warn('⚠️ Falha na verificação do webhook');
      return null;
    }
  }

  /**
   * Processar mensagem recebida via webhook
   */
  async processIncomingMessage(webhookData) {
    try {
      const entry = webhookData.entry[0];
      const changes = entry.changes[0];
      const value = changes.value;

      if (value.messages) {
        for (const message of value.messages) {
          const phoneNumber = message.from;
          const messageText = message.text?.body || '';
          const messageId = message.id;

          logger.info(`📨 Mensagem recebida de ${phoneNumber}: ${messageText}`);

          // Processar resposta de confirmação
          if (this.isConfirmationResponse(messageText)) {
            const ConfirmationService = require('../services/ConfirmationService');
            await ConfirmationService.processConfirmationResponse({
              from: phoneNumber,
              text: messageText,
              messageId: messageId,
              timestamp: Date.now()
            });
          }
        }
      }

      return { success: true };
    } catch (error) {
      logger.error('❌ Erro ao processar mensagem recebida:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar se é uma resposta de confirmação
   */
  isConfirmationResponse(text) {
    const confirmedKeywords = ['sim', 's', 'yes', 'y', 'confirmo', 'estarei', 'vou', 'estarei lá', 'estarei la'];
    const declinedKeywords = ['não', 'nao', 'n', 'no', 'não poderei', 'nao poderei', 'não vou', 'nao vou', 'não poderei ir', 'nao poderei ir'];
    const maybeKeywords = ['talvez', 'maybe', 'não sei', 'nao sei', 'ainda não sei', 'ainda nao sei', 'pode ser', 'vou ver', 'depends'];
    
    const lowerText = text.toLowerCase().trim();
    
    // Verificar confirmação
    for (const keyword of confirmedKeywords) {
      if (lowerText.includes(keyword)) {
        return true;
      }
    }
    
    // Verificar recusa
    for (const keyword of declinedKeywords) {
      if (lowerText.includes(keyword)) {
        return true;
      }
    }
    
    // Verificar talvez
    for (const keyword of maybeKeywords) {
      if (lowerText.includes(keyword)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Obter status da configuração
   */
  getStatus() {
    return {
      isReady: this.isReady,
      hasAccessToken: !!this.accessToken,
      hasPhoneNumberId: !!this.phoneNumberId,
      hasBusinessAccountId: !!this.businessAccountId,
      hasWebhookToken: !!this.webhookVerifyToken,
      apiVersion: this.apiVersion
    };
  }
}

module.exports = new WhatsAppBusinessConfig();