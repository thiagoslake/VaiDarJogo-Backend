require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');
const GameConfirmation = require('../src/models/GameConfirmation');

class DebugProcessoCompleto {
  constructor() {
    this.confirmationService = ConfirmationService;
    this.gameConfirmation = GameConfirmation;
  }

  async debugProcessoCompleto() {
    console.log('🔍 DEBUGANDO PROCESSO COMPLETO DE CONFIRMAÇÕES\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Verificar configuração do jogo
      console.log('1️⃣ Verificando configuração do jogo...');
      const game = await this.gameConfirmation.getGameConfirmationConfig(gameId);
      if (!game) {
        console.log('❌ Jogo sem configuração de confirmação');
        return;
      }
      console.log('✅ Configuração encontrada:', game.id);

      // 2. Verificar configurações de envio
      console.log('\n2️⃣ Verificando configurações de envio...');
      const sendConfigs = game.confirmation_send_configs || [];
      console.log(`📊 Configurações de envio: ${sendConfigs.length}`);
      
      sendConfigs.forEach((config, index) => {
        console.log(`   ${index + 1}. Tipo: ${config.player_type}`);
        console.log(`      Horas antes: ${config.hours_before_game}`);
        console.log(`      Ordem: ${config.confirmation_order}`);
        console.log(`      Ativa: ${config.is_active}`);
      });

      // 3. Verificar próxima sessão
      console.log('\n3️⃣ Verificando próxima sessão...');
      const nextSession = await this.gameConfirmation.getNextSession(gameId);
      if (!nextSession) {
        console.log('❌ Nenhuma próxima sessão encontrada');
        return;
      }
      console.log('✅ Próxima sessão encontrada:');
      console.log(`   Data: ${nextSession.session_date}`);
      console.log(`   Status: ${nextSession.status}`);

      // 4. Verificar se é hora de enviar para cada configuração
      console.log('\n4️⃣ Verificando horários de envio...');
      for (const sendConfig of sendConfigs) {
        console.log(`\n   Configuração ${sendConfig.player_type} (${sendConfig.hours_before_game}h antes):`);
        
        const shouldSend = this.confirmationService.shouldSendNow(
          nextSession.session_date, 
          sendConfig.hours_before_game
        );
        
        console.log(`   Deve enviar agora: ${shouldSend ? '✅ SIM' : '❌ NÃO'}`);
        
        if (shouldSend) {
          // 5. Buscar jogadores para esta configuração
          console.log(`   Buscando jogadores do tipo ${sendConfig.player_type}...`);
          const players = await this.confirmationService.getPlayersForConfirmation(gameId, sendConfig.player_type);
          console.log(`   Jogadores encontrados: ${players.length}`);
          
          if (players.length > 0) {
            players.forEach((player, index) => {
              console.log(`     ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
              console.log(`        Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
            });
          }
        }
      }

      // 6. Simular processamento manual
      console.log('\n5️⃣ Simulando processamento manual...');
      const result = await this.confirmationService.processGameConfirmations(game);
      console.log('📊 Resultado do processamento:');
      console.log(`   Processados: ${result.processed}`);
      console.log(`   Enviados: ${result.sent}`);
      console.log(`   Erros: ${result.errors}`);

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar debug
async function main() {
  const debug = new DebugProcessoCompleto();
  await debug.debugProcessoCompleto();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DebugProcessoCompleto;




