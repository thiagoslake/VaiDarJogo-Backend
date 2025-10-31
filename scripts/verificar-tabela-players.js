require('dotenv').config();
const database = require('../src/config/database');

class VerificarTabelaPlayers {
  constructor() {
    this.supabase = database.getClient();
  }

  async verificarTabelaPlayers() {
    console.log('🔍 VERIFICANDO TABELA PLAYERS\n');

    try {
      // 1. Verificar se a tabela players existe
      console.log('1️⃣ Verificando se a tabela players existe...');
      const { data: players, error: playersError } = await this.supabase
        .from('players')
        .select('*')
        .limit(5);

      if (playersError) {
        console.log('❌ Erro ao acessar tabela players:', playersError.message);
        console.log('   Isso significa que a tabela players não existe ou não é acessível');
      } else {
        console.log('✅ Tabela players existe e é acessível');
        console.log(`📊 Encontrados ${players.length} registros`);
        if (players.length > 0) {
          console.log('   Colunas:', Object.keys(players[0]));
          console.log('\n   Primeiros registros:');
          players.forEach((player, index) => {
            console.log(`   ${index + 1}. ID: ${player.id}, Nome: ${player.name || 'N/A'}`);
          });
        }
      }

      // 2. Verificar relacionamentos
      console.log('\n2️⃣ Verificando relacionamentos...');
      
      // Tentar buscar com relacionamento players
      const { data: gamePlayersWithPlayers, error: playersRelError } = await this.supabase
        .from('game_players')
        .select(`
          *,
          players (
            id,
            name,
            phone
          )
        `)
        .limit(1);

      if (playersRelError) {
        console.log('❌ Erro ao buscar relacionamento com players:', playersRelError.message);
      } else {
        console.log('✅ Relacionamento com players funciona');
        if (gamePlayersWithPlayers.length > 0) {
          console.log('   Exemplo:', gamePlayersWithPlayers[0]);
        }
      }

      // 3. Verificar se há dados na tabela players
      if (!playersError) {
        console.log('\n3️⃣ Verificando dados na tabela players...');
        const { data: allPlayers, error: allPlayersError } = await this.supabase
          .from('players')
          .select('*');

        if (allPlayersError) {
          console.log('❌ Erro ao buscar todos os players:', allPlayersError.message);
        } else {
          console.log(`📊 Total de players na tabela: ${allPlayers.length}`);
          if (allPlayers.length > 0) {
            console.log('\n   Todos os players:');
            allPlayers.forEach((player, index) => {
              console.log(`   ${index + 1}. ${player.name || 'Nome não informado'} (${player.id})`);
              console.log(`      Telefone: ${player.phone || 'Não informado'}`);
            });
          }
        }
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar verificação
async function main() {
  const verificar = new VerificarTabelaPlayers();
  await verificar.verificarTabelaPlayers();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VerificarTabelaPlayers;




