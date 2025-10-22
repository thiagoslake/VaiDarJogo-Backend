require('dotenv').config();
const WhatsAppService = require('../src/services/WhatsAppService');

class TestarEnvioDireto {
  constructor() {
    this.whatsappService = WhatsAppService;
  }

  async testarEnvioDireto() {
    console.log('🔧 TESTANDO ENVIO DIRETO VIA WHATSAPP WEB\n');

    try {
      // 1. Verificar status do WhatsApp
      console.log('1️⃣ Verificando status do WhatsApp Web...');
      const status = await this.whatsappService.getStatus();
      console.log('📊 Status:', status);

      if (!status.success) {
        console.log('❌ Erro ao obter status:', status.error);
        return;
      }

      if (!status.data.isReady) {
        console.log('❌ WhatsApp Web não está pronto');
        console.log('💡 Solução: Acesse http://localhost:3000/api/whatsapp/qr e escaneie o QR code');
        return;
      }

      console.log('✅ WhatsApp Web está pronto!');

      // 2. Testar envio de mensagem simples
      console.log('\n2️⃣ Testando envio de mensagem simples...');
      const testMessage = '🏈 Teste do sistema VaiDarJogo - Mensagem de confirmação automática';
      const testPhone = '13981645787'; // Thiago Slake

      console.log(`📱 Enviando para: ${testPhone}`);
      console.log(`💬 Mensagem: ${testMessage}`);

      const result = await this.whatsappService.sendMessage(testPhone, testMessage);
      
      console.log('\n📊 RESULTADO DO ENVIO:');
      console.log(`   Sucesso: ${result.success ? '✅ SIM' : '❌ NÃO'}`);
      
      if (result.success) {
        console.log(`   Message ID: ${result.messageId}`);
        console.log(`   Status: ${result.status}`);
        console.log('\n🎉 SUCESSO! Mensagem enviada com sucesso!');
        console.log('   O WhatsApp Web está funcionando corretamente.');
      } else {
        console.log(`   Erro: ${result.error}`);
        console.log('\n⚠️ PROBLEMA: Erro ao enviar mensagem');
      }

      // 3. Testar envio de confirmação completa
      console.log('\n3️⃣ Testando envio de confirmação completa...');
      const playerData = {
        name: 'Thiago Slake',
        phone: '13981645787'
      };

      const gameData = {
        name: 'Jogo Principal',
        location: 'Campo Central'
      };

      const sessionData = {
        session_date: '2025-10-27T10:30:00'
      };

      const sendConfig = {
        player_type: 'monthly'
      };

      console.log('📋 Dados da confirmação:');
      console.log(`   Jogador: ${playerData.name}`);
      console.log(`   Telefone: ${playerData.phone}`);
      console.log(`   Jogo: ${gameData.name}`);
      console.log(`   Data: ${sessionData.session_date}`);
      console.log(`   Tipo: ${sendConfig.player_type}`);

      const confirmationResult = await this.whatsappService.sendConfirmationMessage(
        playerData,
        gameData,
        sessionData,
        sendConfig
      );

      console.log('\n📊 RESULTADO DA CONFIRMAÇÃO:');
      console.log(`   Sucesso: ${confirmationResult.success ? '✅ SIM' : '❌ NÃO'}`);
      
      if (confirmationResult.success) {
        console.log(`   Message ID: ${confirmationResult.messageId}`);
        console.log(`   Status: ${confirmationResult.status}`);
        console.log('\n🎉 SUCESSO! Confirmação enviada com sucesso!');
        console.log('   O sistema de confirmações está funcionando!');
      } else {
        console.log(`   Erro: ${confirmationResult.error}`);
        console.log('\n⚠️ PROBLEMA: Erro ao enviar confirmação');
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar
async function main() {
  const testar = new TestarEnvioDireto();
  await testar.testarEnvioDireto();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestarEnvioDireto;
