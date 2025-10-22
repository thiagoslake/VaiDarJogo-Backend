#!/usr/bin/env node

require('dotenv').config();
const database = require('../src/config/database');

class DebugSessoes {
  constructor() {
    this.db = database.getClient();
  }

  async debugSessoes() {
    try {
      console.log('🔍 DEBUG: Verificando sessões do jogo\n');

      const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
      const today = new Date().toISOString().split('T')[0];
      
      console.log(`📅 Data de hoje: ${today}`);
      console.log(`🎮 Game ID: ${gameId}\n`);

      // Buscar todas as sessões do jogo
      console.log('1️⃣ Buscando TODAS as sessões do jogo...');
      const { data: allSessions, error: allError } = await this.db
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId)
        .order('session_date', { ascending: true });

      if (allError) {
        console.log('❌ Erro ao buscar todas as sessões:', allError.message);
        return;
      }

      console.log(`📊 Total de sessões encontradas: ${allSessions.length}\n`);

      if (allSessions.length > 0) {
        console.log('📋 Todas as sessões:');
        allSessions.forEach((session, index) => {
          const isFuture = session.session_date >= today;
          const status = isFuture ? '🟢 FUTURA' : '🔴 PASSADA';
          console.log(`   ${index + 1}. ${session.session_date} às ${session.start_time} - ${status}`);
        });
        console.log('');
      }

      // Buscar sessões futuras (como o método faz)
      console.log('2️⃣ Buscando sessões FUTURAS (>= hoje)...');
      const { data: futureSessions, error: futureError } = await this.db
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId)
        .gte('session_date', today)
        .order('session_date', { ascending: true });

      if (futureError) {
        console.log('❌ Erro ao buscar sessões futuras:', futureError.message);
        return;
      }

      console.log(`📊 Sessões futuras encontradas: ${futureSessions.length}\n`);

      if (futureSessions.length > 0) {
        console.log('📋 Sessões futuras:');
        futureSessions.forEach((session, index) => {
          console.log(`   ${index + 1}. ${session.session_date} às ${session.start_time}`);
        });
        console.log('');

        const nextSession = futureSessions[0];
        console.log('🎯 Próxima sessão:');
        console.log(`   📅 Data: ${nextSession.session_date}`);
        console.log(`   ⏰ Horário: ${nextSession.start_time}`);
        console.log(`   🆔 ID: ${nextSession.id}`);
      } else {
        console.log('⚠️ Nenhuma sessão futura encontrada!');
        console.log('   Isso pode indicar um problema na comparação de datas.');
      }

      // Verificar configuração do jogo
      console.log('\n3️⃣ Verificando configuração do jogo...');
      const { data: config, error: configError } = await this.db
        .from('game_confirmation_configs')
        .select(`
          *,
          confirmation_send_configs (*)
        `)
        .eq('game_id', gameId)
        .eq('is_active', true)
        .single();

      if (configError && configError.code !== 'PGRST116') {
        console.log('❌ Erro ao buscar configuração:', configError.message);
        return;
      }

      if (config) {
        console.log('✅ Configuração encontrada:');
        console.log(`   🆔 ID: ${config.id}`);
        console.log(`   🎮 Game ID: ${config.game_id}`);
        console.log(`   ✅ Ativa: ${config.is_active}`);
        console.log(`   📤 Configurações de envio: ${config.confirmation_send_configs?.length || 0}`);
        
        if (config.confirmation_send_configs && config.confirmation_send_configs.length > 0) {
          console.log('\n📋 Configurações de envio:');
          config.confirmation_send_configs.forEach((sendConfig, index) => {
            console.log(`   ${index + 1}. ${sendConfig.player_type} - ${sendConfig.hours_before_game}h antes`);
          });
        }
      } else {
        console.log('❌ Nenhuma configuração ativa encontrada!');
      }

    } catch (error) {
      console.error('❌ Erro geral:', error.message);
    }
  }

  async executar() {
    console.log('🔍 DEBUG DE SESSÕES\n');
    console.log('==================\n');

    await this.debugSessoes();

    console.log('\n✅ Debug concluído!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const debug = new DebugSessoes();
  debug.executar().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro no debug:', error);
    process.exit(1);
  });
}

module.exports = DebugSessoes;
