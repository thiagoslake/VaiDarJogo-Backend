require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');
const GameConfirmation = require('../src/models/GameConfirmation');

class ForcarEnvioConfirmacao {
  constructor() {
    this.confirmationService = ConfirmationService;
    this.gameConfirmation = GameConfirmation;
  }

  async forcarEnvio() {
    console.log('🔧 FORÇANDO ENVIO DE CONFIRMAÇÕES (IGNORANDO HORÁRIO)\n');

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

      // 3. Temporariamente modificar o método shouldSendNow para sempre retornar true
      console.log('\n3️⃣ Modificando lógica de horário para forçar envio...');
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

      if (result.processed > 0) {
        console.log('\n🎉 SUCESSO! O sistema está funcionando!');
        console.log('   O problema era apenas o horário de envio.');
        console.log('   As confirmações serão enviadas automaticamente nos horários configurados.');
      } else {
        console.log('\n⚠️ Ainda há problemas no sistema.');
        console.log('   Verifique os logs para mais detalhes.');
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar
async function main() {
  const forcar = new ForcarEnvioConfirmacao();
  await forcar.forcarEnvio();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ForcarEnvioConfirmacao;



