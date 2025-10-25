require('dotenv').config();
const database = require('../src/config/database');

class VerificarConstraints {
  constructor() {
    this.supabase = database.getClient();
  }

  async verificarConstraints() {
    console.log('🔍 VERIFICANDO CONSTRAINTS E RELACIONAMENTOS\n');

    try {
      // 1. Verificar estrutura da tabela game_players
      console.log('1️⃣ Verificando estrutura da tabela game_players...');
      const { data: gamePlayers, error: gamePlayersError } = await this.supabase
        .from('game_players')
        .select('*')
        .limit(1);

      if (gamePlayersError) {
        console.log('❌ Erro ao acessar game_players:', gamePlayersError.message);
      } else {
        console.log('✅ Tabela game_players acessível');
        if (gamePlayers.length > 0) {
          console.log('   Colunas:', Object.keys(gamePlayers[0]));
        }
      }

      // 2. Verificar estrutura da tabela users
      console.log('\n2️⃣ Verificando estrutura da tabela users...');
      const { data: users, error: usersError } = await this.supabase
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        console.log('❌ Erro ao acessar users:', usersError.message);
      } else {
        console.log('✅ Tabela users acessível');
        if (users.length > 0) {
          console.log('   Colunas:', Object.keys(users[0]));
        }
      }

      // 3. Verificar se os usuários existem
      console.log('\n3️⃣ Verificando usuários específicos...');
      const userIds = [
        '0e24dfde-5a35-4f62-a732-81b3543f0673',
        '398cd460-85cc-49ef-a558-7d496d2e1dc8',
        '8e426b2b-59e6-4a91-b375-47360d276689'
      ];

      for (const userId of userIds) {
        const { data: user, error: userError } = await this.supabase
          .from('users')
          .select('id, name')
          .eq('id', userId)
          .single();

        if (userError) {
          console.log(`   ❌ Usuário ${userId}: ${userError.message}`);
        } else {
          console.log(`   ✅ Usuário ${userId}: ${user.name}`);
        }
      }

      // 4. Tentar inserir um jogador de teste
      console.log('\n4️⃣ Testando inserção de jogador...');
      const testPlayer = {
        game_id: 'ec0dbd33-11d3-4338-902c-26a4ea3275e4',
        player_id: '0e24dfde-5a35-4f62-a732-81b3543f0673', // Thiago Slake
        player_type: 'monthly',
        status: 'active',
        joined_at: new Date().toISOString()
      };

      const { data: insertedPlayer, error: insertError } = await this.supabase
        .from('game_players')
        .insert(testPlayer)
        .select();

      if (insertError) {
        console.log('❌ Erro ao inserir jogador de teste:', insertError.message);
        console.log('   Detalhes:', insertError);
      } else {
        console.log('✅ Jogador de teste inserido com sucesso:', insertedPlayer[0]);
        
        // Remover o jogador de teste
        const { error: deleteError } = await this.supabase
          .from('game_players')
          .delete()
          .eq('id', insertedPlayer[0].id);
        
        if (deleteError) {
          console.log('⚠️ Erro ao remover jogador de teste:', deleteError.message);
        } else {
          console.log('✅ Jogador de teste removido');
        }
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar verificação
async function main() {
  const verificar = new VerificarConstraints();
  await verificar.verificarConstraints();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VerificarConstraints;



