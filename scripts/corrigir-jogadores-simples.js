require('dotenv').config();
const database = require('../src/config/database');

class CorrigirJogadoresSimples {
  constructor() {
    this.supabase = database.getClient();
  }

  async corrigirJogadores() {
    console.log('🔧 CORRIGINDO JOGADORES - ABORDAGEM SIMPLES\n');

    const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
    
    try {
      // 1. Remover jogadores problemáticos
      console.log('1️⃣ Removendo jogadores com IDs inválidos...');
      
      const { error: deleteError } = await this.supabase
        .from('game_players')
        .delete()
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (deleteError) {
        console.log('❌ Erro ao remover jogadores:', deleteError.message);
        return;
      }

      console.log('✅ Jogadores problemáticos removidos');

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

      // 3. Adicionar jogadores corretos
      console.log('\n3️⃣ Adicionando jogadores corretos...');
      
      const playersToAdd = availableUsers.map((user, index) => ({
        game_id: gameId,
        player_id: user.id,
        player_type: index === 0 ? 'monthly' : 'casual', // Primeiro como mensal, outros como avulsos
        status: 'active',
        joined_at: new Date().toISOString()
      }));

      const { data: newPlayers, error: insertError } = await this.supabase
        .from('game_players')
        .insert(playersToAdd)
        .select();

      if (insertError) {
        console.log('❌ Erro ao adicionar jogadores:', insertError.message);
        return;
      }

      console.log(`✅ ${newPlayers.length} jogadores adicionados com sucesso`);

      // 4. Verificar resultado
      console.log('\n4️⃣ Verificando resultado...');
      const { data: finalPlayers, error: finalError } = await this.supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (finalError) {
        console.log('❌ Erro ao verificar resultado:', finalError.message);
      } else {
        console.log(`✅ Jogadores finais (${finalPlayers.length}):`);
        for (const player of finalPlayers) {
          const user = availableUsers.find(u => u.id === player.player_id);
          console.log(`   - ${user?.name || 'Nome não encontrado'} (${player.player_type})`);
          console.log(`     Telefone: ${user?.phone || 'Não informado'}`);
        }
      }

      console.log('\n🎉 Correção concluída! Agora você pode testar o envio de confirmações.');

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar correção
async function main() {
  const corrigir = new CorrigirJogadoresSimples();
  await corrigir.corrigirJogadores();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CorrigirJogadoresSimples;




