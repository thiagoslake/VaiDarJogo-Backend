require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');
const GameConfirmation = require('../src/models/GameConfirmation');

class DebugProcessSendConfig {
  constructor() {
    this.confirmationService = ConfirmationService;
    this.gameConfirmation = GameConfirmation;
  }

  async debugProcessSendConfig() {
    console.log('🔍 DEBUGANDO processSendConfig DETALHADAMENTE\n');

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

      // 3. Testar cada configuração de envio individualmente
      console.log('\n3️⃣ Testando cada configuração de envio...');
      const sendConfigs = game.confirmation_send_configs || [];
      
      for (let i = 0; i < sendConfigs.length; i++) {
        const sendConfig = sendConfigs[i];
        console.log(`\n   📋 Configuração ${i + 1}: ${sendConfig.player_type} (${sendConfig.hours_before_game}h antes)`);
        
        try {
          // Forçar shouldSendNow para retornar true
          const originalShouldSendNow = this.confirmationService.shouldSendNow.bind(this.confirmationService);
          this.confirmationService.shouldSendNow = () => {
            console.log('     ⚠️ Forçando envio (ignorando horário)');
            return true;
          };

          // Buscar jogadores para esta configuração
          console.log(`     🔍 Buscando jogadores do tipo ${sendConfig.player_type}...`);
          const players = await this.confirmationService.getPlayersForConfirmation(gameId, sendConfig.player_type);
          console.log(`     📊 Jogadores encontrados: ${players.length}`);
          
          if (players.length > 0) {
            players.forEach((player, index) => {
              console.log(`       ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
              console.log(`          Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
            });

            // Testar processSendConfig diretamente
            console.log(`     🔧 Testando processSendConfig...`);
            const result = await this.confirmationService.processSendConfig(
              { id: gameId }, 
              nextSession, 
              sendConfig
            );
            
            console.log(`     📊 Resultado:`);
            console.log(`        Processados: ${result.processed}`);
            console.log(`        Enviados: ${result.sent}`);
            console.log(`        Erros: ${result.errors}`);
          } else {
            console.log(`     ⚠️ Nenhum jogador encontrado para este tipo`);
          }

          // Restaurar método original
          this.confirmationService.shouldSendNow = originalShouldSendNow;

        } catch (error) {
          console.log(`     ❌ Erro ao processar configuração: ${error.message}`);
        }
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar
async function main() {
  const debug = new DebugProcessSendConfig();
  await debug.debugProcessSendConfig();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DebugProcessSendConfig;
