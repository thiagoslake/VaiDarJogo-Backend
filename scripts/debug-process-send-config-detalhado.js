require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');
const GameConfirmation = require('../src/models/GameConfirmation');

class DebugProcessSendConfigDetalhado {
  constructor() {
    this.confirmationService = ConfirmationService;
    this.gameConfirmation = GameConfirmation;
  }

  async debugProcessSendConfigDetalhado() {
    console.log('🔍 DEBUG DETALHADO DO PROCESSSENDCONFIG\n');

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

      // 3. Verificar configurações de envio
      console.log('\n3️⃣ Verificando configurações de envio...');
      const sendConfigs = game.confirmation_send_configs || [];
      console.log(`📊 Total de configurações: ${sendConfigs.length}`);

      // 4. Forçar shouldSendNow para retornar true
      console.log('\n4️⃣ Modificando lógica de horário...');
      const originalShouldSendNow = this.confirmationService.shouldSendNow.bind(this.confirmationService);
      this.confirmationService.shouldSendNow = () => {
        console.log('   ⚠️ Forçando envio (ignorando horário)');
        return true;
      };

      // 5. Testar cada configuração individualmente
      console.log('\n5️⃣ Testando cada configuração...');
      let totalProcessed = 0;
      let totalSent = 0;
      let totalErrors = 0;

      for (let i = 0; i < sendConfigs.length; i++) {
        const sendConfig = sendConfigs[i];
        console.log(`\n   📋 Configuração ${i + 1}: ${sendConfig.player_type} (${sendConfig.hours_before_game}h antes)`);
        
        try {
          // Verificar se deve enviar
          const shouldSend = this.confirmationService.shouldSendNow(nextSession.session_date, sendConfig.hours_before_game);
          console.log(`   ⏰ Deve enviar: ${shouldSend ? '✅ SIM' : '❌ NÃO'}`);
          
          if (!shouldSend) {
            console.log('   ⏭️ Pulando (não é hora de enviar)');
            continue;
          }

          // Buscar jogadores
          console.log(`   🔍 Buscando jogadores do tipo ${sendConfig.player_type}...`);
          const players = await this.confirmationService.getPlayersForConfirmation(gameId, sendConfig.player_type);
          console.log(`   📊 Jogadores encontrados: ${players.length}`);
          
          if (players.length === 0) {
            console.log('   ⏭️ Pulando (nenhum jogador encontrado)');
            continue;
          }

          // Listar jogadores
          players.forEach((player, index) => {
            console.log(`     ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
            console.log(`        Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
            console.log(`        ID: ${player.id}`);
          });

          // Processar cada jogador
          console.log(`   🔧 Processando ${players.length} jogadores...`);
          let processed = 0;
          let sent = 0;
          let errors = 0;

          for (const player of players) {
            try {
              processed++;
              console.log(`     👤 Processando: ${player.players?.name || 'Nome não encontrado'}`);
              console.log(`        ID: ${player.id}`);
              
              // Verificar se já confirmou
              console.log(`        🔍 Verificando se já confirmou...`);
              const hasConfirmed = await this.confirmationService.gameConfirmation.hasPlayerConfirmed(
                player.id, 
                nextSession.session_date
              );
              console.log(`        ✅ Já confirmou: ${hasConfirmed ? 'SIM' : 'NÃO'}`);

              if (hasConfirmed) {
                console.log(`        ⏭️ Pulando (já confirmou)`);
                continue;
              }

              // Verificar se já foi enviado
              console.log(`        🔍 Verificando se já foi enviado...`);
              const alreadySent = await this.confirmationService.checkIfAlreadySent(
                player.id, 
                nextSession.session_date, 
                sendConfig.id
              );
              console.log(`        📤 Já foi enviado: ${alreadySent ? 'SIM' : 'NÃO'}`);

              if (alreadySent) {
                console.log(`        ⏭️ Pulando (já foi enviado)`);
                continue;
              }

              // Verificar se tem telefone
              if (!player.players?.phone_number) {
                console.log(`        ❌ Pulando: Telefone não informado`);
                errors++;
                continue;
              }

              // Tentar enviar mensagem
              console.log(`        📱 Tentando enviar mensagem...`);
              const result = await this.confirmationService.whatsappService.sendConfirmationMessage(
                player.players,
                { id: gameId },
                nextSession,
                sendConfig
              );

              if (result.success) {
                sent++;
                console.log(`        ✅ Mensagem enviada com sucesso`);
              } else {
                errors++;
                console.log(`        ❌ Erro ao enviar: ${result.error || 'Erro desconhecido'}`);
              }

            } catch (error) {
              errors++;
              console.log(`        ❌ Erro ao processar jogador: ${error.message}`);
            }
          }

          console.log(`   📊 Resultado da configuração:`);
          console.log(`      Processados: ${processed}`);
          console.log(`      Enviados: ${sent}`);
          console.log(`      Erros: ${errors}`);

          totalProcessed += processed;
          totalSent += sent;
          totalErrors += errors;

        } catch (error) {
          console.log(`   ❌ Erro ao processar configuração: ${error.message}`);
          totalErrors++;
        }
      }

      // 6. Restaurar método original
      this.confirmationService.shouldSendNow = originalShouldSendNow;
      console.log('\n✅ Método de horário restaurado');

      // 7. Resultado final
      console.log('\n📊 RESULTADO FINAL:');
      console.log(`   📊 Total processados: ${totalProcessed}`);
      console.log(`   📤 Total enviados: ${totalSent}`);
      console.log(`   ❌ Total erros: ${totalErrors}`);

      if (totalProcessed > 0) {
        console.log('\n🎉 SUCESSO! O sistema está funcionando!');
      } else {
        console.log('\n⚠️ PROBLEMA: Nenhum jogador foi processado');
        console.log('   Possíveis causas:');
        console.log('   1. shouldSendNow retornando false');
        console.log('   2. getPlayersForConfirmation retornando array vazio');
        console.log('   3. hasPlayerConfirmed retornando true para todos');
        console.log('   4. checkIfAlreadySent retornando true para todos');
        console.log('   5. Erro no sendConfirmationMessage');
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar
async function main() {
  const debug = new DebugProcessSendConfigDetalhado();
  await debug.debugProcessSendConfigDetalhado();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DebugProcessSendConfigDetalhado;

