#!/usr/bin/env node

require('dotenv').config();
const database = require('../src/config/database');

class VerificadorSchema {
  constructor() {
    this.db = database.getClient();
  }

  async verificarTabelas() {
    try {
      console.log('🔍 Verificando estrutura das tabelas...\n');

      // Verificar tabela games
      console.log('📋 Tabela: games');
      const { data: games, error: gamesError } = await this.db
        .from('games')
        .select('*')
        .limit(1);

      if (gamesError) {
        console.log('❌ Erro ao acessar tabela games:', gamesError.message);
      } else {
        console.log('✅ Tabela games acessível');
        if (games.length > 0) {
          console.log('   Colunas disponíveis:', Object.keys(games[0]));
        }
      }

      // Verificar tabela game_sessions
      console.log('\n📋 Tabela: game_sessions');
      const { data: sessions, error: sessionsError } = await this.db
        .from('game_sessions')
        .select('*')
        .limit(1);

      if (sessionsError) {
        console.log('❌ Erro ao acessar tabela game_sessions:', sessionsError.message);
      } else {
        console.log('✅ Tabela game_sessions acessível');
        if (sessions.length > 0) {
          console.log('   Colunas disponíveis:', Object.keys(sessions[0]));
        }
      }

      // Verificar tabela game_confirmation_configs
      console.log('\n📋 Tabela: game_confirmation_configs');
      const { data: configs, error: configsError } = await this.db
        .from('game_confirmation_configs')
        .select('*')
        .limit(1);

      if (configsError) {
        console.log('❌ Erro ao acessar tabela game_confirmation_configs:', configsError.message);
      } else {
        console.log('✅ Tabela game_confirmation_configs acessível');
        if (configs.length > 0) {
          console.log('   Colunas disponíveis:', Object.keys(configs[0]));
        }
      }

      // Verificar tabela confirmation_send_configs
      console.log('\n📋 Tabela: confirmation_send_configs');
      const { data: sendConfigs, error: sendConfigsError } = await this.db
        .from('confirmation_send_configs')
        .select('*')
        .limit(1);

      if (sendConfigsError) {
        console.log('❌ Erro ao acessar tabela confirmation_send_configs:', sendConfigsError.message);
      } else {
        console.log('✅ Tabela confirmation_send_configs acessível');
        if (sendConfigs.length > 0) {
          console.log('   Colunas disponíveis:', Object.keys(sendConfigs[0]));
        }
      }

      // Verificar tabela game_players
      console.log('\n📋 Tabela: game_players');
      const { data: players, error: playersError } = await this.db
        .from('game_players')
        .select('*')
        .limit(1);

      if (playersError) {
        console.log('❌ Erro ao acessar tabela game_players:', playersError.message);
      } else {
        console.log('✅ Tabela game_players acessível');
        if (players.length > 0) {
          console.log('   Colunas disponíveis:', Object.keys(players[0]));
        }
      }

      // Verificar tabela users
      console.log('\n📋 Tabela: users');
      const { data: users, error: usersError } = await this.db
        .from('users')
        .select('*')
        .limit(1);

      if (usersError) {
        console.log('❌ Erro ao acessar tabela users:', usersError.message);
      } else {
        console.log('✅ Tabela users acessível');
        if (users.length > 0) {
          console.log('   Colunas disponíveis:', Object.keys(users[0]));
        }
      }

    } catch (error) {
      console.error('❌ Erro geral:', error.message);
    }
  }

  async executar() {
    console.log('🔍 VERIFICADOR DE SCHEMA DO BANCO\n');
    console.log('=================================\n');

    await this.verificarTabelas();

    console.log('\n✅ Verificação concluída!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const verificador = new VerificadorSchema();
  verificador.executar().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro na verificação:', error);
    process.exit(1);
  });
}

module.exports = VerificadorSchema;
