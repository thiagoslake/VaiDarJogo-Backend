require('dotenv').config();
const database = require('../src/config/database');

class AdicionarJogadoresCorretos {
  constructor() {
    this.supabase = database.getClient();
  }

  async adicionarJogadoresCorretos() {
    console.log('🔧 ADICIONANDO JOGADORES CORRETOS AO JOGO\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Buscar players disponíveis
      console.log('1️⃣ Buscando players disponíveis...');
      const { data: players, error: playersError } = await this.supabase
        .from('players')
        .select('*')
        .eq('status', 'active');

      if (playersError) throw playersError;

      console.log(`📊 Encontrados ${players.length} players ativos:`);
      players.forEach((player, index) => {
        console.log(`   ${index + 1}. ${player.name} (${player.id})`);
        console.log(`      Telefone: ${player.phone_number || 'NÃO INFORMADO'}`);
        console.log(`      User ID: ${player.user_id || 'NÃO ASSOCIADO'}`);
      });

      if (players.length === 0) {
        console.log('❌ Nenhum player ativo encontrado!');
        return;
      }

      // 2. Adicionar jogadores ao jogo
      console.log('\n2️⃣ Adicionando jogadores ao jogo...');
      
      const gamePlayersToAdd = players.map((player, index) => ({
        game_id: gameId,
        player_id: player.id,
        player_type: index === 0 ? 'monthly' : 'casual', // Primeiro como mensal, outros como avulsos
        status: 'active',
        joined_at: new Date().toISOString()
      }));

      const { data: newGamePlayers, error: insertError } = await this.supabase
        .from('game_players')
        .insert(gamePlayersToAdd)
        .select();

      if (insertError) {
        console.log('❌ Erro ao adicionar jogadores:', insertError.message);
        return;
      }

      console.log(`✅ ${newGamePlayers.length} jogadores adicionados ao jogo com sucesso!`);

      // 3. Verificar resultado
      console.log('\n3️⃣ Verificando resultado...');
      const { data: finalGamePlayers, error: finalError } = await this.supabase
        .from('game_players')
        .select(`
          *,
          players!game_players_player_id_fkey (
            name,
            phone_number,
            user_id
          )
        `)
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (finalError) {
        console.log('❌ Erro ao verificar resultado:', finalError.message);
      } else {
        console.log(`✅ Jogadores finais no jogo (${finalGamePlayers.length}):`);
        finalGamePlayers.forEach((gamePlayer, index) => {
          const player = gamePlayer.players;
          console.log(`   ${index + 1}. ${player?.name || 'Nome não encontrado'}`);
          console.log(`      Tipo: ${gamePlayer.player_type}`);
          console.log(`      Telefone: ${player?.phone_number || 'NÃO INFORMADO'}`);
          console.log(`      User ID: ${player?.user_id || 'NÃO ASSOCIADO'}`);
        });
      }

      // 4. Verificar telefones para confirmações
      console.log('\n4️⃣ Verificando telefones para confirmações...');
      let playersComTelefone = 0;
      let playersSemTelefone = 0;

      for (const gamePlayer of finalGamePlayers) {
        const player = gamePlayer.players;
        let temTelefone = false;
        
        // Verificar telefone do player
        if (player?.phone_number) {
          temTelefone = true;
        }
        
        // Se não tem telefone no player, verificar no usuário associado
        if (!temTelefone && player?.user_id) {
          const { data: user, error: userError } = await this.supabase
            .from('users')
            .select('phone')
            .eq('id', player.user_id)
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
        console.log(`\n🎉 SUCESSO! Agora você tem ${playersComTelefone} jogadores que podem receber confirmações!`);
        console.log(`   Você pode testar o envio de confirmações novamente.`);
      } else {
        console.log(`\n⚠️ ATENÇÃO: Nenhum jogador tem telefone para receber confirmações!`);
        console.log(`   Solução: Adicionar telefones na tabela players ou associar a usuários com telefone.`);
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar
async function main() {
  const adicionar = new AdicionarJogadoresCorretos();
  await adicionar.adicionarJogadoresCorretos();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AdicionarJogadoresCorretos;




