require('dotenv').config();
const database = require('../src/config/database');

class CorrigirJogadores {
  constructor() {
    this.supabase = database.getClient();
  }

  async corrigirJogadores() {
    console.log('🔧 CORRIGINDO JOGADORES DO JOGO\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Buscar jogadores problemáticos
      console.log('1️⃣ Buscando jogadores problemáticos...');
      const { data: problemPlayers, error: problemError } = await this.supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (problemError) throw problemError;

      console.log(`📊 Encontrados ${problemPlayers.length} jogadores no jogo`);

      // 2. Buscar usuários disponíveis
      console.log('\n2️⃣ Buscando usuários disponíveis...');
      const { data: availableUsers, error: usersError } = await this.supabase
        .from('users')
        .select('id, name, phone')
        .eq('is_active', true);

      if (usersError) throw usersError;

      console.log(`📊 Encontrados ${availableUsers.length} usuários ativos:`);
      availableUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.id})`);
        console.log(`      Telefone: ${user.phone}`);
      });

      // 3. Verificar quais jogadores precisam ser corrigidos
      console.log('\n3️⃣ Verificando jogadores que precisam ser corrigidos...');
      const playersToFix = [];
      
      for (const player of problemPlayers) {
        const userExists = availableUsers.find(u => u.id === player.player_id);
        if (!userExists) {
          playersToFix.push(player);
          console.log(`   ❌ Jogador ${player.player_id} não tem usuário correspondente`);
        } else {
          console.log(`   ✅ Jogador ${player.player_id} tem usuário correspondente: ${userExists.name}`);
        }
      }

      if (playersToFix.length === 0) {
        console.log('\n✅ Todos os jogadores estão corretos!');
        return;
      }

      // 4. Oferecer opções de correção
      console.log(`\n4️⃣ ${playersToFix.length} jogadores precisam ser corrigidos:`);
      console.log('\nOpções:');
      console.log('1. Atribuir usuários existentes aos jogadores');
      console.log('2. Remover jogadores problemáticos');
      console.log('3. Criar usuários para os jogadores');

      // Para este exemplo, vou atribuir os usuários existentes
      console.log('\n🔧 Atribuindo usuários existentes aos jogadores...');
      
      for (let i = 0; i < playersToFix.length && i < availableUsers.length; i++) {
        const player = playersToFix[i];
        const user = availableUsers[i];
        
        console.log(`   Atualizando jogador ${player.id} para usar usuário ${user.name} (${user.id})`);
        
        const { error: updateError } = await this.supabase
          .from('game_players')
          .update({ player_id: user.id })
          .eq('id', player.id);

        if (updateError) {
          console.log(`   ❌ Erro ao atualizar: ${updateError.message}`);
        } else {
          console.log(`   ✅ Atualizado com sucesso`);
        }
      }

      // 5. Verificar resultado
      console.log('\n5️⃣ Verificando resultado...');
      const { data: fixedPlayers, error: fixedError } = await this.supabase
        .from('game_players')
        .select(`
          *,
          users!game_players_player_id_fkey (
            name,
            phone
          )
        `)
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (fixedError) {
        console.log('❌ Erro ao verificar resultado:', fixedError.message);
      } else {
        console.log(`✅ Jogadores corrigidos (${fixedPlayers.length}):`);
        fixedPlayers.forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.users?.name || 'Nome não encontrado'}`);
          console.log(`      Telefone: ${player.users?.phone || 'Não informado'}`);
          console.log(`      Tipo: ${player.player_type}`);
        });
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar correção
async function main() {
  const corrigir = new CorrigirJogadores();
  await corrigir.corrigirJogadores();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CorrigirJogadores;




