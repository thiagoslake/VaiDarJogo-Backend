require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');
const GameConfirmation = require('../src/models/GameConfirmation');

class TestarEnvioForcado {
  constructor() {
    this.confirmationService = ConfirmationService;
    this.gameConfirmation = GameConfirmation;
  }

  async testarEnvioForcado() {
    console.log('🔧 TESTANDO ENVIO FORÇADO (IGNORANDO HORÁRIO)\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Buscar configuração do jogo
      console.log('1️⃣ Buscando configuração do jogo...');
      const game = await this.gameConfirmation.getGameConfirmationConfig(gameId);
      if (!game) {
        console.log('❌ Jogo sem configuração de confirmação');
        return;
      }
      console.log('✅ Configuração encontrada');

      // 2. Buscar próxima sessão
      console.log('\n2️⃣ Buscando próxima sessão...');
      const nextSession = await this.gameConfirmation.getNextSession(gameId);
      if (!nextSession) {
        console.log('❌ Nenhuma próxima sessão encontrada');
        return;
      }
      console.log(`✅ Próxima sessão: ${nextSession.session_date}`);

      // 3. Forçar envio ignorando horário
      console.log('\n3️⃣ Forçando envio (ignorando horário)...');
      
      // Temporariamente modificar o método shouldSendNow para sempre retornar true
      const originalShouldSendNow = this.confirmationService.shouldSendNow.bind(this.confirmationService);
      this.confirmationService.shouldSendNow = () => {
        console.log('   ⚠️ Forçando envio (ignorando horário)');
        return true;
      };

      // 4. Processar confirmações
      console.log('\n4️⃣ Processando confirmações...');
      const result = await this.confirmationService.processGameConfirmations(game);
      
      console.log('\n📊 RESULTADO DO ENVIO FORÇADO:');
      console.log(`   📊 Processados: ${result.processed}`);
      console.log(`   📤 Enviados: ${result.sent}`);
      console.log(`   ❌ Erros: ${result.errors}`);

      // 5. Restaurar método original
      this.confirmationService.shouldSendNow = originalShouldSendNow;
      console.log('\n✅ Método de horário restaurado');

      // 6. Análise do resultado
      if (result.processed > 0) {
        console.log('\n🎉 SUCESSO! O sistema está funcionando!');
        console.log('   ✅ Jogadores foram processados');
        console.log('   ✅ Sistema de confirmações operacional');
        
        if (result.sent > 0) {
          console.log('   ✅ Mensagens foram enviadas via WhatsApp');
        } else {
          console.log('   ⚠️ Mensagens não foram enviadas (WhatsApp não configurado)');
          console.log('   💡 Para enviar mensagens reais:');
          console.log('      1. Acesse: http://localhost:3000/api/whatsapp/qr');
          console.log('      2. Escaneie o QR code com seu WhatsApp');
          console.log('      3. Execute este teste novamente');
        }
        
        console.log('\n📅 PRÓXIMOS ENVIOS AUTOMÁTICOS:');
        console.log('   📅 Mensalistas: 24h, 12h e 9h antes da sessão');
        console.log('   🎯 Avulsos: 8h e 2h antes da sessão');
        console.log(`   📅 Próxima sessão: ${nextSession.session_date}`);
      } else {
        console.log('\n⚠️ PROBLEMA: Nenhum jogador foi processado');
        console.log('   Verifique os logs para mais detalhes');
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar
async function main() {
  const testar = new TestarEnvioForcado();
  await testar.testarEnvioForcado();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestarEnvioForcado;

