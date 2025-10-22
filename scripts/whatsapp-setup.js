#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class WhatsAppSetup {
  constructor() {
    this.baseURL = 'https://graph.facebook.com/v18.0';
  }

  async setup() {
    console.log('🚀 Configuração do WhatsApp Business API\n');

    try {
      // Coletar informações
      const config = await this.collectConfig();
      
      // Testar configurações
      await this.testConfiguration(config);
      
      // Salvar configurações
      await this.saveConfiguration(config);
      
      console.log('\n✅ Configuração concluída com sucesso!');
      
    } catch (error) {
      console.error('\n❌ Erro durante a configuração:', error.message);
    } finally {
      rl.close();
    }
  }

  async collectConfig() {
    console.log('📝 Coletando informações de configuração...\n');

    const config = {};

    // Access Token
    config.accessToken = await question('Access Token do WhatsApp: ');
    if (!config.accessToken) {
      throw new Error('Access Token é obrigatório');
    }

    // Phone Number ID
    config.phoneNumberId = await question('Phone Number ID: ');
    if (!config.phoneNumberId) {
      throw new Error('Phone Number ID é obrigatório');
    }

    // Business Account ID
    config.businessAccountId = await question('Business Account ID: ');
    if (!config.businessAccountId) {
      throw new Error('Business Account ID é obrigatório');
    }

    // Webhook Verify Token
    config.webhookVerifyToken = await question('Webhook Verify Token (ou pressione Enter para gerar): ') || this.generateWebhookToken();

    return config;
  }

  generateWebhookToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `vaidarjogo_webhook_${timestamp}_${random}`;
  }

  async testConfiguration(config) {
    console.log('\n🔍 Testando configurações...\n');

    try {
      // Testar Phone Number Info
      console.log('1. Testando informações do número de telefone...');
      const phoneInfo = await this.getPhoneNumberInfo(config);
      console.log('✅ Informações do número obtidas com sucesso');
      console.log(`   Número: ${phoneInfo.display_phone_number}`);
      console.log(`   Status: ${phoneInfo.status}`);

      // Testar envio de mensagem
      console.log('\n2. Testando envio de mensagem...');
      const testPhone = await question('Digite um número para teste (formato: 5511999999999): ');
      if (testPhone) {
        const messageResult = await this.sendTestMessage(config, testPhone);
        console.log('✅ Mensagem de teste enviada com sucesso');
        console.log(`   Message ID: ${messageResult.messages[0].id}`);
      } else {
        console.log('⏭️ Teste de envio pulado');
      }

    } catch (error) {
      console.error('❌ Erro no teste:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPhoneNumberInfo(config) {
    const response = await axios.get(
      `${this.baseURL}/${config.phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`
        }
      }
    );

    return response.data;
  }

  async sendTestMessage(config, phoneNumber) {
    const messageData = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: '🚀 Teste do VaiDarJogo Backend - Sistema de Confirmação de Presença via WhatsApp!'
      }
    };

    const response = await axios.post(
      `${this.baseURL}/${config.phoneNumberId}/messages`,
      messageData,
      {
        headers: {
          'Authorization': `Bearer ${config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  async saveConfiguration(config) {
    console.log('\n💾 Salvando configurações...');

    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    // Ler arquivo .env existente se houver
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Atualizar ou adicionar configurações do WhatsApp
    const whatsappConfigs = [
      `WHATSAPP_ACCESS_TOKEN=${config.accessToken}`,
      `WHATSAPP_PHONE_NUMBER_ID=${config.phoneNumberId}`,
      `WHATSAPP_BUSINESS_ACCOUNT_ID=${config.businessAccountId}`,
      `WHATSAPP_WEBHOOK_VERIFY_TOKEN=${config.webhookVerifyToken}`
    ];

    // Remover configurações antigas do WhatsApp
    const lines = envContent.split('\n');
    const filteredLines = lines.filter(line => {
      return !line.startsWith('WHATSAPP_ACCESS_TOKEN=') &&
             !line.startsWith('WHATSAPP_PHONE_NUMBER_ID=') &&
             !line.startsWith('WHATSAPP_BUSINESS_ACCOUNT_ID=') &&
             !line.startsWith('WHATSAPP_WEBHOOK_VERIFY_TOKEN=');
    });

    // Adicionar novas configurações
    const newContent = [...filteredLines, ...whatsappConfigs].join('\n');
    
    fs.writeFileSync(envPath, newContent);
    console.log('✅ Configurações salvas no arquivo .env');
  }

  async testWebhook() {
    console.log('\n🔗 Testando webhook...');
    
    const webhookUrl = await question('URL do webhook (ex: https://your-domain.com/api/whatsapp/webhook): ');
    if (!webhookUrl) {
      console.log('⏭️ Teste de webhook pulado');
      return;
    }

    try {
      const verifyToken = await question('Token de verificação do webhook: ');
      const challenge = 'test123';

      const testUrl = `${webhookUrl}?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challenge}`;
      
      const response = await axios.get(testUrl);
      
      if (response.data === challenge) {
        console.log('✅ Webhook verificado com sucesso');
      } else {
        console.log('❌ Webhook não retornou o challenge esperado');
      }
    } catch (error) {
      console.error('❌ Erro ao testar webhook:', error.message);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const setup = new WhatsAppSetup();
  setup.setup();
}

module.exports = WhatsAppSetup;





