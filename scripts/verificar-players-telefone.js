require('dotenv').config();
const database = require('../src/config/database');

class VerificarPlayersTelefone {
  constructor() {
    this.supabase = database.getClient();
  }

  async verificarPlayersTelefone() {
    console.log('🔍 VERIFICANDO PLAYERS E TELEFONES\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Buscar jogadores do jogo
      console.log('1️⃣ Buscando jogadores do jogo...');
      const { data: gamePlayers, error: gamePlayersError } = await this.supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (gamePlayersError) throw gamePlayersError;

      console.log(`📊 Encontrados ${gamePlayers.length} jogadores no jogo`);

      // 2. Buscar dados dos players
      console.log('\n2️⃣ Buscando dados dos players...');
      for (let i = 0; i < gamePlayers.length; i++) {
        const gamePlayer = gamePlayers[i];
        console.log(`\n   Jogador ${i + 1}:`);
        console.log(`   Game Player ID: ${gamePlayer.id}`);
        console.log(`   Player ID: ${gamePlayer.player_id}`);
        console.log(`   Tipo: ${gamePlayer.player_type}`);

        // Buscar dados do player
        const { data: player, error: playerError } = await this.supabase
          .from('players')
          .select('*')
          .eq('id', gamePlayer.player_id)
          .single();

        if (playerError) {
          console.log(`   ❌ Erro ao buscar player: ${playerError.message}`);
        } else {
          console.log(`   ✅ Player encontrado: ${player.name}`);
          console.log(`   📱 Telefone: ${player.phone_number || 'NÃO INFORMADO'}`);
          console.log(`   📧 User ID: ${player.user_id || 'NÃO ASSOCIADO'}`);
          console.log(`   📊 Status: ${player.status}`);
          
          // Se tem user_id, buscar dados do usuário
          if (player.user_id) {
            const { data: user, error: userError } = await this.supabase
              .from('users')
              .select('name, phone, email')
              .eq('id', player.user_id)
              .single();

            if (userError) {
              console.log(`   ⚠️ User ID existe mas usuário não encontrado: ${userError.message}`);
            } else {
              console.log(`   👤 Usuário associado: ${user.name}`);
              console.log(`   📱 Telefone do usuário: ${user.phone || 'NÃO INFORMADO'}`);
            }
          }
        }
      }

      // 3. Verificar se há telefones para envio
      console.log('\n3️⃣ Verificando telefones disponíveis para envio...');
      let playersComTelefone = 0;
      let playersSemTelefone = 0;

      for (const gamePlayer of gamePlayers) {
        const { data: player, error: playerError } = await this.supabase
          .from('players')
          .select('phone_number, user_id')
          .eq('id', gamePlayer.player_id)
          .single();

        if (!playerError && player) {
          let temTelefone = false;
          
          // Verificar telefone do player
          if (player.phone_number) {
            temTelefone = true;
          }
          
          // Se não tem telefone no player, verificar no usuário associado
          if (!temTelefone && player.user_id) {
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
      }

      console.log(`📊 Resumo:`);
      console.log(`   ✅ Players com telefone: ${playersComTelefone}`);
      console.log(`   ❌ Players sem telefone: ${playersSemTelefone}`);

      if (playersSemTelefone > 0) {
        console.log(`\n⚠️ ATENÇÃO: ${playersSemTelefone} players não têm telefone para receber confirmações!`);
        console.log(`   Solução: Adicionar telefones na tabela players ou associar a usuários com telefone.`);
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar verificação
async function main() {
  const verificar = new VerificarPlayersTelefone();
  await verificar.verificarPlayersTelefone();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VerificarPlayersTelefone;
