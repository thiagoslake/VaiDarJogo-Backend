require('dotenv').config();
const database = require('../src/config/database');

class VerificarPlayerConfirmations {
  constructor() {
    this.supabase = database.getClient();
  }

  async verificarPlayerConfirmations() {
    console.log('🔍 VERIFICANDO TABELA player_confirmations\n');

    try {
      // 1. Verificar se a tabela existe
      console.log('1️⃣ Verificando se a tabela player_confirmations existe...');
      const { data: confirmations, error: confirmationsError } = await this.supabase
        .from('player_confirmations')
        .select('*')
        .limit(1);

      if (confirmationsError) {
        console.log('❌ Erro ao acessar tabela player_confirmations:', confirmationsError.message);
        return;
      }

      console.log('✅ Tabela player_confirmations existe e é acessível');
      if (confirmations.length > 0) {
        console.log('   Colunas disponíveis:', Object.keys(confirmations[0]));
      } else {
        console.log('   Tabela vazia - verificando schema...');
        
        // Tentar inserir um registro de teste para ver o schema
        const testData = {
          game_id: 'ec0dbd33-11d3-4338-902c-26a4ea3275e4',
          player_id: 'fbe3aedc-b1b6-4e21-a6ef-d9b8d9940f97',
          confirmation_type: 'pending',
          confirmed_at: new Date().toISOString(),
          confirmation_method: 'manual',
          notes: 'Teste'
        };

        const { data: inserted, error: insertError } = await this.supabase
          .from('player_confirmations')
          .insert(testData)
          .select();

        if (insertError) {
          console.log('❌ Erro ao inserir teste:', insertError.message);
          console.log('   Detalhes:', insertError);
        } else {
          console.log('✅ Schema da tabela:');
          console.log('   Colunas:', Object.keys(inserted[0]));
          
          // Remover o registro de teste
          const { error: deleteError } = await this.supabase
            .from('player_confirmations')
            .delete()
            .eq('id', inserted[0].id);
          
          if (deleteError) {
            console.log('⚠️ Erro ao remover teste:', deleteError.message);
          } else {
            console.log('✅ Registro de teste removido');
          }
        }
      }

      // 2. Verificar se há confirmações existentes
      console.log('\n2️⃣ Verificando confirmações existentes...');
      const { data: allConfirmations, error: allError } = await this.supabase
        .from('player_confirmations')
        .select('*');

      if (allError) {
        console.log('❌ Erro ao buscar confirmações:', allError.message);
      } else {
        console.log(`📊 Total de confirmações: ${allConfirmations.length}`);
        if (allConfirmations.length > 0) {
          console.log('\n   Confirmações existentes:');
          allConfirmations.forEach((conf, index) => {
            console.log(`   ${index + 1}. Jogador: ${conf.player_id}`);
            console.log(`      Jogo: ${conf.game_id}`);
            console.log(`      Tipo: ${conf.confirmation_type || 'N/A'}`);
            console.log(`      Data: ${conf.confirmed_at || 'N/A'}`);
          });
        }
      }

    } catch (error) {
      console.log('❌ Erro geral:', error.message);
    }
  }
}

// Executar
async function main() {
  const verificar = new VerificarPlayerConfirmations();
  await verificar.verificarPlayerConfirmations();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = VerificarPlayerConfirmations;

