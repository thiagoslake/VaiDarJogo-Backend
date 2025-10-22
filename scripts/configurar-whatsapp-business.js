require('dotenv').config();
const fs = require('fs');
const path = require('path');

class ConfigurarWhatsAppBusiness {
  constructor() {
    this.envPath = path.join(process.cwd(), '.env');
    this.envExamplePath = path.join(process.cwd(), 'env.example');
  }

  async configurar() {
    console.log('🔧 CONFIGURAÇÃO WHATSAPP BUSINESS API\n');

    try {
      // 1. Verificar se arquivo .env existe
      if (!fs.existsSync(this.envPath)) {
        console.log('📝 Criando arquivo .env...');
        this.criarArquivoEnv();
      }

      // 2. Verificar configurações atuais
      console.log('🔍 Verificando configurações atuais...');
      this.verificarConfiguracoes();

      // 3. Instruções para configuração
      console.log('\n📋 INSTRUÇÕES PARA CONFIGURAÇÃO:');
      console.log('1. Acesse o Facebook Developer Console: https://developers.facebook.com/');
      console.log('2. Crie uma aplicação ou use uma existente');
      console.log('3. Adicione o produto "WhatsApp Business API"');
      console.log('4. Configure um número de telefone para WhatsApp Business');
      console.log('5. Obtenha as seguintes informações:');
      console.log('   - Access Token');
      console.log('   - Phone Number ID');
      console.log('   - Business Account ID');
      console.log('   - Webhook Verify Token (crie um token seguro)');

      console.log('\n🔑 CONFIGURAÇÕES NECESSÁRIAS:');
      console.log('WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui');
      console.log('WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui');
      console.log('WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id_aqui');
      console.log('WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_webhook_verify_token_aqui');

      console.log('\n📱 CONFIGURAÇÃO DO WEBHOOK:');
      console.log('URL: https://seu-dominio.com/api/whatsapp/webhook');
      console.log('Campos: messages');
      console.log('Token de verificação: use o mesmo valor de WHATSAPP_WEBHOOK_VERIFY_TOKEN');

      console.log('\n✅ APÓS CONFIGURAR:');
      console.log('1. Edite o arquivo .env com suas credenciais');
      console.log('2. Execute: npm run dev');
      console.log('3. Teste a conexão: curl http://localhost:3000/api/whatsapp/status');

    } catch (error) {
      console.log('❌ Erro na configuração:', error.message);
    }
  }

  criarArquivoEnv() {
    try {
      const envContent = fs.readFileSync(this.envExamplePath, 'utf8');
      fs.writeFileSync(this.envPath, envContent);
      console.log('✅ Arquivo .env criado com sucesso!');
    } catch (error) {
      console.log('❌ Erro ao criar arquivo .env:', error.message);
    }
  }

  verificarConfiguracoes() {
    const configs = [
      'WHATSAPP_ACCESS_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID',
      'WHATSAPP_WEBHOOK_VERIFY_TOKEN'
    ];

    configs.forEach(config => {
      const value = process.env[config];
      if (value && value !== `your_${config.toLowerCase()}_here`) {
        console.log(`✅ ${config}: Configurado`);
      } else {
        console.log(`❌ ${config}: Não configurado`);
      }
    });
  }

  async testarConfiguracao() {
    console.log('\n🧪 TESTANDO CONFIGURAÇÃO...');

    try {
      const WhatsAppService = require('../src/services/WhatsAppService');
      
      // Testar status
      const status = await WhatsAppService.getStatus();
      if (status.success) {
        console.log('✅ Configuração válida!');
        console.log('📊 Status:', status.data);
      } else {
        console.log('❌ Configuração inválida:', status.error);
      }

      // Testar conexão
      const isConnected = await WhatsAppService.testConnection();
      if (isConnected) {
        console.log('✅ Conexão com WhatsApp Business API estabelecida!');
      } else {
        console.log('❌ Falha na conexão com WhatsApp Business API');
      }

    } catch (error) {
      console.log('❌ Erro ao testar configuração:', error.message);
    }
  }
}

// Executar
async function main() {
  const configurar = new ConfigurarWhatsAppBusiness();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--test')) {
    await configurar.testarConfiguracao();
  } else {
    await configurar.configurar();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ConfigurarWhatsAppBusiness;
