require('dotenv').config();
const database = require('../src/config/database');

class DebugUsers {
  constructor() {
    this.supabase = database.getClient();
  }

  async debugUsers() {
    console.log('🔍 DEBUG: Verificando usuários dos jogadores\n');

    const playerIds = [
      'fbe3aedc-b1b6-4e21-a6ef-d9b8d9940f97',
      'bd2dfc2d-ddc2-4e1e-b0bf-d435b2b6eef0'
    ];

    for (const playerId of playerIds) {
      console.log(`👤 Verificando jogador ID: ${playerId}`);
      
      try {
        const { data: user, error } = await this.supabase
          .from('users')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            console.log('   ❌ Usuário não encontrado');
          } else {
            console.log('   ❌ Erro:', error.message);
          }
        } else {
          console.log('   ✅ Usuário encontrado:');
          console.log(`      Nome: ${user.name}`);
          console.log(`      Email: ${user.email}`);
          console.log(`      Telefone: ${user.phone || 'Não informado'}`);
          console.log(`      Ativo: ${user.is_active}`);
        }
      } catch (error) {
        console.log('   ❌ Erro geral:', error.message);
      }
      console.log('');
    }

    // Verificar todos os usuários ativos
    console.log('📋 Todos os usuários ativos:');
    try {
      const { data: allUsers, error } = await this.supabase
        .from('users')
        .select('id, name, phone, is_active')
        .eq('is_active', true);

      if (error) {
        console.log('❌ Erro ao buscar usuários:', error.message);
      } else {
        console.log(`✅ Encontrados ${allUsers.length} usuários ativos:`);
        allUsers.forEach((user, index) => {
          console.log(`   ${index + 1}. ${user.name} (${user.id})`);
          console.log(`      Telefone: ${user.phone || 'Não informado'}`);
        });
      }
    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar debug
async function main() {
  const debug = new DebugUsers();
  await debug.debugUsers();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DebugUsers;

