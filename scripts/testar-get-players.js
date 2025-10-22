require('dotenv').config();
const ConfirmationService = require('../src/services/ConfirmationService');

class TestarGetPlayers {
  constructor() {
    this.confirmationService = ConfirmationService;
  }

  async testarGetPlayers() {
    console.log('🔍 TESTANDO getPlayersForConfirmation\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // Testar busca de jogadores mensalistas
      console.log('1️⃣ Testando busca de jogadores mensalistas...');
      const monthlyPlayers = await this.confirmationService.getPlayersForConfirmation(gameId, 'monthly');
      console.log(`📊 Jogadores mensalistas encontrados: ${monthlyPlayers.length}`);
      
      if (monthlyPlayers.length > 0) {
        monthlyPlayers.forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
          console.log(`      Tipo: ${player.player_type}`);
          console.log(`      Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
          console.log(`      User ID: ${player.players?.user_id || 'NÃO ASSOCIADO'}`);
        });
      }

      // Testar busca de jogadores avulsos
      console.log('\n2️⃣ Testando busca de jogadores avulsos...');
      const casualPlayers = await this.confirmationService.getPlayersForConfirmation(gameId, 'casual');
      console.log(`📊 Jogadores avulsos encontrados: ${casualPlayers.length}`);
      
      if (casualPlayers.length > 0) {
        casualPlayers.forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
          console.log(`      Tipo: ${player.player_type}`);
          console.log(`      Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
          console.log(`      User ID: ${player.players?.user_id || 'NÃO ASSOCIADO'}`);
        });
      }

      // Testar busca de todos os jogadores
      console.log('\n3️⃣ Testando busca de todos os jogadores...');
      const allPlayers = await this.confirmationService.getPlayersForConfirmation(gameId, 'all');
      console.log(`📊 Total de jogadores encontrados: ${allPlayers.length}`);
      
      if (allPlayers.length > 0) {
        allPlayers.forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.players?.name || 'Nome não encontrado'}`);
          console.log(`      Tipo: ${player.player_type}`);
          console.log(`      Telefone: ${player.players?.phone_number || 'NÃO INFORMADO'}`);
          console.log(`      User ID: ${player.players?.user_id || 'NÃO ASSOCIADO'}`);
        });
      }

      // Verificar se há telefones para envio
      console.log('\n4️⃣ Verificando telefones para envio...');
      let playersComTelefone = 0;
      let playersSemTelefone = 0;

      for (const player of allPlayers) {
        let temTelefone = false;
        
        // Verificar telefone do player
        if (player.players?.phone_number) {
          temTelefone = true;
        }
        
        // Se não tem telefone no player, verificar no usuário associado
        if (!temTelefone && player.players?.user_id) {
          const database = require('../src/config/database');
          const supabase = database.getClient();
          
          const { data: user, error: userError } = await supabase
            .from('users')
            .select('phone')
            .eq('id', player.players.user_id)
            .single();

          if (!userError && user && user.phone) {
            temTelefone = true;
          }
        }

        if (temTelefone) {
          playersComTelefone++;
        } else {
          playersSemTelefone++;
        }
      }

      console.log(`📊 Resumo para confirmações:`);
      console.log(`   ✅ Players com telefone: ${playersComTelefone}`);
      console.log(`   ❌ Players sem telefone: ${playersSemTelefone}`);

      if (playersComTelefone > 0) {
        console.log(`\n🎉 SUCESSO! O sistema pode processar ${playersComTelefone} jogadores!`);
      } else {
        console.log(`\n⚠️ PROBLEMA: Nenhum jogador tem telefone para receber confirmações!`);
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
      console.log('Stack:', error.stack);
    }
  }
}

// Executar teste
async function main() {
  const testar = new TestarGetPlayers();
  await testar.testarGetPlayers();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestarGetPlayers;

