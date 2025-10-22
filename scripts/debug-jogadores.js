#!/usr/bin/env node

require('dotenv').config();
const database = require('../src/config/database');

class DebugJogadores {
  constructor() {
    this.db = database.getClient();
  }

  async debugJogadores() {
    try {
      console.log('🔍 DEBUG: Verificando jogadores do jogo\n');

      const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
      
      console.log(`🎮 Game ID: ${gameId}\n`);

      // Buscar jogadores do jogo
      console.log('1️⃣ Buscando jogadores do jogo...');
      const { data: players, error: playersError } = await this.db
        .from('game_players')
        .select(`
          *,
          users (
            id,
            name,
            phone,
            email
          )
        `)
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (playersError) {
        console.log('❌ Erro ao buscar jogadores:', playersError.message);
        return;
      }

      console.log(`📊 Total de jogadores ativos: ${players.length}\n`);

      if (players.length > 0) {
        console.log('👥 Jogadores ativos:');
        players.forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.users?.name || 'Nome não encontrado'}`);
          console.log(`      📱 Telefone: ${player.users?.phone || 'Não informado'}`);
          console.log(`      📧 Email: ${player.users?.email || 'Não informado'}`);
          console.log(`      🎯 Tipo: ${player.player_type || 'Não definido'}`);
          console.log(`      📅 Entrou em: ${new Date(player.joined_at).toLocaleDateString('pt-BR')}`);
          console.log('');
        });
      } else {
        console.log('⚠️ Nenhum jogador ativo encontrado!');
        console.log('   Isso explica por que não há confirmações para enviar.');
      }

      // Verificar se há jogadores mensalistas
      const monthlyPlayers = players.filter(p => p.player_type === 'monthly');
      console.log(`📊 Jogadores mensalistas: ${monthlyPlayers.length}`);

      // Verificar se há jogadores avulsos
      const casualPlayers = players.filter(p => p.player_type === 'casual');
      console.log(`📊 Jogadores avulsos: ${casualPlayers.length}`);

      // Verificar se há jogadores sem tipo definido
      const undefinedPlayers = players.filter(p => !p.player_type);
      console.log(`📊 Jogadores sem tipo: ${undefinedPlayers.length}`);

      if (undefinedPlayers.length > 0) {
        console.log('\n⚠️ Jogadores sem tipo definido:');
        undefinedPlayers.forEach((player, index) => {
          console.log(`   ${index + 1}. ${player.users?.name || 'Nome não encontrado'} (ID: ${player.id})`);
        });
      }

    } catch (error) {
      console.error('❌ Erro geral:', error.message);
    }
  }

  async executar() {
    console.log('🔍 DEBUG DE JOGADORES\n');
    console.log('====================\n');

    await this.debugJogadores();

    console.log('\n✅ Debug concluído!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const debug = new DebugJogadores();
  debug.executar().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro no debug:', error);
    process.exit(1);
  });
}

module.exports = DebugJogadores;
