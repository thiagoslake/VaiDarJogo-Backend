require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');
const GameConfirmation = require('../src/models/GameConfirmation');

class TestarEnvioMotor {
  constructor() {
    this.confirmationService = ConfirmationService;
    this.gameConfirmation = GameConfirmation;
  }

  async testarEnvioMotor() {
    console.log('🚀 TESTANDO ENVIO FORÇADO USANDO CONEXÃO DO MOTOR\n');

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

      // 3. Buscar todos os jogadores
      console.log('\n3️⃣ Buscando todos os jogadores...');
      const allPlayers = await this.gameConfirmation.getGamePlayersWithConfirmations(gameId);
      console.log(`📊 Total de jogadores encontrados: ${allPlayers.length}`);
      
      if (allPlayers.length === 0) {
        console.log('❌ Nenhum jogador encontrado');
        return;
      }

      // 4. Listar jogadores
      console.log('\n4️⃣ Listando jogadores:');
      allPlayers.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
        console.log(`      Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
        console.log(`      Tipo: ${player.player_type || 'NÃO DEFINIDO'}`);
      });

      // 5. Forçar envio ignorando horário
      console.log('\n5️⃣ Forçando envio (ignorando horário)...');
      
      // Temporariamente modificar o método shouldSendNow para sempre retornar true
      const originalShouldSendNow = this.confirmationService.shouldSendNow.bind(this.confirmationService);
      this.confirmationService.shouldSendNow = () => {
        console.log('   ⚠️ Forçando envio (ignorando horário)');
        return true;
      };

      // 6. Processar confirmações usando o motor
      console.log('\n6️⃣ Processando confirmações via motor...');
      const result = await this.confirmationService.processGameConfirmations(game);
      
      // 7. Restaurar método original
      this.confirmationService.shouldSendNow = originalShouldSendNow;
      console.log('\n✅ Método de horário restaurado');

      // 8. Resultado final
      console.log('\n📊 RESULTADO DO ENVIO VIA MOTOR:');
      console.log(`   📊 Processados: ${result.processed}`);
      console.log(`   📤 Enviados: ${result.sent}`);
      console.log(`   ❌ Erros: ${result.errors}`);

      if (result.processed > 0) {
        console.log('\n🎉 SUCESSO! O motor processou jogadores!');
        console.log('   ✅ Sistema de confirmações funcionando');
        
        if (result.sent > 0) {
          console.log('   ✅ Mensagens foram enviadas via WhatsApp');
          console.log('   📱 Verifique o WhatsApp para confirmar recebimento');
        } else {
          console.log('   ⚠️ Mensagens não foram enviadas');
          console.log('   💡 Possíveis causas:');
          console.log('      - WhatsApp Web não conectado');
          console.log('      - Telefones inválidos');
          console.log('      - Erro na conexão');
        }
        
        console.log('\n📅 PRÓXIMOS ENVIOS AUTOMÁTICOS:');
        console.log('   📅 Mensalistas: 24h, 12h e 9h antes da sessão');
        console.log('   🎯 Avulsos: 8h e 2h antes da sessão');
        console.log(`   📅 Próxima sessão: ${nextSession.session_date}`);
      } else {
        console.log('\n⚠️ PROBLEMA: Nenhum jogador foi processado');
        console.log('   Verifique os logs para mais detalhes');
      }

      // 9. Teste adicional - envio direto via API
      console.log('\n9️⃣ Testando envio via API do motor...');
      try {
        const response = await fetch(`http://localhost:3000/api/confirmation/process/${gameId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const apiResult = await response.json();
        console.log('📊 Resultado da API:', apiResult);
        
        if (apiResult.success && apiResult.data.processed > 0) {
          console.log('✅ API do motor também funcionou!');
        } else {
          console.log('⚠️ API do motor não processou jogadores');
        }
      } catch (error) {
        console.log('❌ Erro ao testar API:', error.message);
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar
async function main() {
  const testar = new TestarEnvioMotor();
  await testar.testarEnvioMotor();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestarEnvioMotor;




