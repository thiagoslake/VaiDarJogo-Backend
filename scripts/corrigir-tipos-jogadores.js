require('dotenv').config();
const database = require('../src/config/database');

class CorrigirTiposJogadores {
  constructor() {
    this.supabase = database.getClient();
  }

  async corrigirTiposJogadores() {
    console.log('🔧 CORRIGINDO TIPOS DE JOGADORES\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Verificar jogadores atuais
      console.log('1️⃣ Verificando jogadores atuais...');
      const { data: gamePlayers, error: gamePlayersError } = await this.supabase
        .from('game_players')
        .select(`
          *,
          players!game_players_player_id_fkey (
            name,
            phone_number
          )
        `)
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (gamePlayersError) throw gamePlayersError;

      console.log(`📊 Jogadores atuais (${gamePlayers.length}):`);
      gamePlayers.forEach((gamePlayer, index) => {
        const player = gamePlayer.players;
        console.log(`   ${index + 1}. ${player?.name || 'Nome não encontrado'}`);
        console.log(`      Tipo atual: ${gamePlayer.player_type}`);
        console.log(`      Telefone: ${player?.phone_number || 'NÃO INFORMADO'}`);
      });

      // 2. Corrigir tipos baseado na informação do usuário
      console.log('\n2️⃣ Corrigindo tipos de jogadores...');
      console.log('   Marcos Santos: monthly → casual');
      console.log('   Thiago Slake: casual → monthly');
      console.log('   Joao Silva: casual → monthly');

      const correcoes = [
        { name: 'Marcos Santos', currentType: 'monthly', newType: 'casual' },
        { name: 'Thiago Slake', currentType: 'casual', newType: 'monthly' },
        { name: 'Joao Silva', currentType: 'casual', newType: 'monthly' }
      ];

      for (const correcao of correcoes) {
        const gamePlayer = gamePlayers.find(gp => gp.players?.name === correcao.name);
        if (gamePlayer) {
          console.log(`\n   🔧 Corrigindo ${correcao.name}: ${correcao.currentType} → ${correcao.newType}`);
          
          const { error: updateError } = await this.supabase
            .from('game_players')
            .update({ player_type: correcao.newType })
            .eq('id', gamePlayer.id);

          if (updateError) {
            console.log(`   ❌ Erro ao corrigir: ${updateError.message}`);
          } else {
            console.log(`   ✅ Corrigido com sucesso`);
          }
        } else {
          console.log(`   ⚠️ Jogador ${correcao.name} não encontrado`);
        }
      }

      // 3. Verificar resultado
      console.log('\n3️⃣ Verificando resultado...');
      const { data: gamePlayersCorrigidos, error: gamePlayersCorrigidosError } = await this.supabase
        .from('game_players')
        .select(`
          *,
          players!game_players_player_id_fkey (
            name,
            phone_number
          )
        `)
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (gamePlayersCorrigidosError) throw gamePlayersCorrigidosError;

      console.log(`📊 Jogadores após correção (${gamePlayersCorrigidos.length}):`);
      gamePlayersCorrigidos.forEach((gamePlayer, index) => {
        const player = gamePlayer.players;
        console.log(`   ${index + 1}. ${player?.name || 'Nome não encontrado'}`);
        console.log(`      Tipo: ${gamePlayer.player_type}`);
        console.log(`      Telefone: ${player?.phone_number || 'NÃO INFORMADO'}`);
      });

      // 4. Contar por tipo
      const monthlyPlayers = gamePlayersCorrigidos.filter(gp => gp.player_type === 'monthly');
      const casualPlayers = gamePlayersCorrigidos.filter(gp => gp.player_type === 'casual');

      console.log('\n📊 Resumo por tipo:');
      console.log(`   📅 Mensalistas: ${monthlyPlayers.length}`);
      monthlyPlayers.forEach(gp => {
        console.log(`      - ${gp.players?.name}`);
      });
      
      console.log(`   🎯 Avulsos: ${casualPlayers.length}`);
      casualPlayers.forEach(gp => {
        console.log(`      - ${gp.players?.name}`);
      });

      console.log('\n🎉 Correção concluída! Agora os tipos estão corretos.');

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar
async function main() {
  const corrigir = new CorrigirTiposJogadores();
  await corrigir.corrigirTiposJogadores();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CorrigirTiposJogadores;
