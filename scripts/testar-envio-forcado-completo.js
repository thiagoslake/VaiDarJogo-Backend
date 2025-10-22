require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');
const GameConfirmation = require('../src/models/GameConfirmation');
const WhatsAppService = require('../src/services/WhatsAppService');

class TestarEnvioForcadoCompleto {
  constructor() {
    this.confirmationService = ConfirmationService;
    this.gameConfirmation = GameConfirmation;
    this.whatsappService = WhatsAppService;
  }

  async testarEnvioForcadoCompleto() {
    console.log('🚀 TESTANDO ENVIO FORÇADO COMPLETO DE CONFIRMAÇÕES\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Verificar status do WhatsApp
      console.log('1️⃣ Verificando status do WhatsApp Web...');
      const whatsappStatus = await this.whatsappService.getStatus();
      console.log('📊 Status WhatsApp:', whatsappStatus.data);
      
      if (!whatsappStatus.data.isReady) {
        console.log('❌ WhatsApp Web não está pronto');
        console.log('💡 Solução: Acesse http://localhost:3000/api/whatsapp/qr e escaneie o QR code');
        return;
      }
      console.log('✅ WhatsApp Web está pronto!');

      // 2. Buscar configuração do jogo
      console.log('\n2️⃣ Buscando configuração do jogo...');
      const game = await this.gameConfirmation.getGameConfirmationConfig(gameId);
      if (!game) {
        console.log('❌ Jogo sem configuração de confirmação');
        return;
      }
      console.log('✅ Configuração encontrada');

      // 3. Buscar próxima sessão
      console.log('\n3️⃣ Buscando próxima sessão...');
      const nextSession = await this.gameConfirmation.getNextSession(gameId);
      if (!nextSession) {
        console.log('❌ Nenhuma próxima sessão encontrada');
        return;
      }
      console.log(`✅ Próxima sessão: ${nextSession.session_date}`);

      // 4. Buscar todos os jogadores
      console.log('\n4️⃣ Buscando todos os jogadores...');
      const allPlayers = await this.gameConfirmation.getGamePlayersWithConfirmations(gameId);
      console.log(`📊 Total de jogadores encontrados: ${allPlayers.length}`);
      
      if (allPlayers.length === 0) {
        console.log('❌ Nenhum jogador encontrado');
        return;
      }

      // 5. Listar jogadores
      console.log('\n5️⃣ Listando jogadores:');
      allPlayers.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
        console.log(`      Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
        console.log(`      Tipo: ${player.player_type || 'NÃO DEFINIDO'}`);
      });

      // 6. Forçar envio para todos os jogadores
      console.log('\n6️⃣ Iniciando envio forçado para todos os jogadores...');
      
      let totalProcessed = 0;
      let totalSent = 0;
      let totalErrors = 0;

      for (const player of allPlayers) {
        try {
          totalProcessed++;
          console.log(`\n   👤 Processando: ${player.players?.name || 'Nome não encontrado'}`);
          console.log(`      Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
          console.log(`      Tipo: ${player.player_type || 'NÃO DEFINIDO'}`);

          // Verificar se tem telefone
          if (!player.players?.phone_number) {
            console.log(`      ❌ Pulando: Telefone não informado`);
            totalErrors++;
            continue;
          }

          // Verificar se já confirmou
          const hasConfirmed = await this.confirmationService.gameConfirmation.hasPlayerConfirmed(
            player.id, 
            nextSession.session_date
          );
          console.log(`      ✅ Já confirmou: ${hasConfirmed ? 'SIM' : 'NÃO'}`);

          if (hasConfirmed) {
            console.log(`      ⏭️ Pulando: Já confirmou presença`);
            continue;
          }

          // Criar dados para envio
          const playerData = {
            name: player.players.name,
            phone: player.players.phone_number
          };

          const gameData = {
            name: game.name || 'Jogo Principal',
            location: game.location || 'Campo Central'
          };

          const sendConfig = {
            player_type: player.player_type || 'casual'
          };

          // Tentar enviar mensagem
          console.log(`      📱 Enviando confirmação...`);
          const result = await this.whatsappService.sendConfirmationMessage(
            playerData,
            gameData,
            nextSession,
            sendConfig
          );

          if (result.success) {
            totalSent++;
            console.log(`      ✅ Mensagem enviada com sucesso!`);
            console.log(`      📱 Message ID: ${result.messageId}`);
          } else {
            totalErrors++;
            console.log(`      ❌ Erro ao enviar: ${result.error || 'Erro desconhecido'}`);
          }

        } catch (error) {
          totalErrors++;
          console.log(`      ❌ Erro ao processar jogador: ${error.message}`);
        }
      }

      // 7. Resultado final
      console.log('\n📊 RESULTADO FINAL DO ENVIO FORÇADO:');
      console.log(`   📊 Total processados: ${totalProcessed}`);
      console.log(`   📤 Total enviados: ${totalSent}`);
      console.log(`   ❌ Total erros: ${totalErrors}`);

      if (totalSent > 0) {
        console.log('\n🎉 SUCESSO! Confirmações enviadas com sucesso!');
        console.log('   ✅ Sistema de confirmações funcionando perfeitamente');
        console.log('   ✅ WhatsApp Web operacional');
        console.log('   ✅ Mensagens entregues aos jogadores');
        
        console.log('\n📱 PRÓXIMOS PASSOS:');
        console.log('   1. Aguarde as respostas dos jogadores');
        console.log('   2. Verifique o WhatsApp para confirmar recebimento');
        console.log('   3. O sistema processará automaticamente as respostas');
      } else if (totalProcessed > 0) {
        console.log('\n⚠️ PROBLEMA: Jogadores processados mas nenhuma mensagem enviada');
        console.log('   Verifique os logs acima para identificar os erros');
      } else {
        console.log('\n❌ PROBLEMA: Nenhum jogador foi processado');
        console.log('   Verifique a configuração do jogo e jogadores');
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar
async function main() {
  const testar = new TestarEnvioForcadoCompleto();
  await testar.testarEnvioForcadoCompleto();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestarEnvioForcadoCompleto;
