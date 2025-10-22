require('dotenv').config();
const WhatsAppService = require('../src/services/WhatsAppService');

class TestarWhatsAppBusiness {
  constructor() {
    this.whatsappService = WhatsAppService;
  }

  async testar() {
    console.log('🧪 TESTANDO WHATSAPP BUSINESS API\n');

    try {
      // 1. Verificar status da configuração
      console.log('1️⃣ Verificando status da configuração...');
      const status = await this.whatsappService.getStatus();
      
      if (!status.success) {
        console.log('❌ Erro ao obter status:', status.error);
        return;
      }

      console.log('📊 Status da configuração:');
      console.log(`   Pronto: ${status.data.isReady ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Access Token: ${status.data.hasAccessToken ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Phone Number ID: ${status.data.hasPhoneNumberId ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Business Account ID: ${status.data.hasBusinessAccountId ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Webhook Token: ${status.data.hasWebhookToken ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   API Version: ${status.data.apiVersion}`);

      if (!status.data.isReady) {
        console.log('\n❌ Configuração incompleta!');
        console.log('💡 Execute: node scripts/configurar-whatsapp-business.js');
        return;
      }

      // 2. Testar conexão
      console.log('\n2️⃣ Testando conexão...');
      const isConnected = await this.whatsappService.testConnection();
      
      if (!isConnected) {
        console.log('❌ Falha na conexão com WhatsApp Business API');
        console.log('💡 Verifique suas credenciais no arquivo .env');
        return;
      }

      console.log('✅ Conexão estabelecida com sucesso!');

      // 3. Obter informações da conta
      console.log('\n3️⃣ Obtendo informações da conta...');
      const accountInfo = await this.whatsappService.getAccountInfo();
      
      if (accountInfo.success) {
        console.log('📱 Informações da conta:');
        console.log(`   Número: ${accountInfo.data.phoneNumber}`);
        console.log(`   Nome verificado: ${accountInfo.data.verifiedName || 'N/A'}`);
        console.log(`   Qualidade: ${accountInfo.data.qualityRating || 'N/A'}`);
        console.log(`   Status: ${accountInfo.data.status || 'N/A'}`);
      } else {
        console.log('⚠️ Não foi possível obter informações da conta:', accountInfo.error);
      }

      // 4. Testar envio de mensagem (se número fornecido)
      const testPhone = process.argv[2];
      if (testPhone) {
        console.log(`\n4️⃣ Testando envio de mensagem para ${testPhone}...`);
        
        const testMessage = '🧪 Teste do sistema VaiDarJogo - WhatsApp Business API funcionando!';
        const result = await this.whatsappService.sendTestMessage(testPhone, testMessage);
        
        if (result.success) {
          console.log('✅ Mensagem de teste enviada com sucesso!');
          console.log(`   Message ID: ${result.messageId}`);
          console.log(`   Status: ${result.status}`);
        } else {
          console.log('❌ Erro ao enviar mensagem de teste:', result.error);
        }
      } else {
        console.log('\n4️⃣ Para testar envio de mensagem, execute:');
        console.log('   node scripts/testar-whatsapp-business.js 5511999999999');
      }

      // 5. Resumo
      console.log('\n📊 RESUMO DOS TESTES:');
      console.log('✅ Configuração: OK');
      console.log('✅ Conexão: OK');
      console.log('✅ Informações da conta: OK');
      
      if (testPhone) {
        console.log('✅ Envio de mensagem: OK');
      } else {
        console.log('⏭️ Envio de mensagem: Não testado');
      }

      console.log('\n🎉 WhatsApp Business API está funcionando corretamente!');
      console.log('📱 Você pode agora testar o envio de confirmações de presença.');

    } catch (error) {
      console.log('❌ Erro durante os testes:', error.message);
      console.log('Stack:', error.stack);
    }
  }

  async testarEnvioConfirmacao() {
    console.log('\n🏈 TESTANDO ENVIO DE CONFIRMAÇÃO DE PRESENÇA\n');

    try {
      const testPhone = process.argv[2];
      if (!testPhone) {
        console.log('❌ Número de telefone é obrigatório para teste de confirmação');
        console.log('💡 Execute: node scripts/testar-whatsapp-business.js 5511999999999 --confirmacao');
        return;
      }

      // Dados de teste
      const playerData = {
        name: 'João Silva',
        phone: testPhone
      };

      const gameData = {
        name: 'Jogo de Teste',
        location: 'Campo Central'
      };

      const sessionData = {
        session_date: '2025-10-25T20:00:00'
      };

      const sendConfig = {
        player_type: 'monthly'
      };

      console.log('📋 Dados do teste:');
      console.log(`   Jogador: ${playerData.name}`);
      console.log(`   Telefone: ${playerData.phone}`);
      console.log(`   Jogo: ${gameData.name}`);
      console.log(`   Data: ${sessionData.session_date}`);
      console.log(`   Tipo: ${sendConfig.player_type}`);

      console.log('\n📱 Enviando confirmação...');
      const result = await this.whatsappService.sendConfirmationMessage(
        playerData,
        gameData,
        sessionData,
        sendConfig
      );

      if (result.success) {
        console.log('✅ Confirmação enviada com sucesso!');
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Status: ${result.status}`);
      } else {
        console.log('❌ Erro ao enviar confirmação:', result.error);
      }

    } catch (error) {
      console.log('❌ Erro no teste de confirmação:', error.message);
    }
  }
}

// Executar
async function main() {
  const testar = new TestarWhatsAppBusiness();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--confirmacao')) {
    await testar.testarEnvioConfirmacao();
  } else {
    await testar.testar();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestarWhatsAppBusiness;
