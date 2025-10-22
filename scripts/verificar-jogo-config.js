#!/usr/bin/env node

require('dotenv').config();
const database = require('../src/config/database');

class VerificadorJogoConfig {
  constructor() {
    this.db = database.getClient();
  }

  async verificarJogoSemConfig() {
    try {
      console.log('🔍 Verificando jogos sem configuração de confirmação...\n');

      // Buscar todos os jogos ativos
      const { data: todosJogos, error: jogosError } = await this.db
        .from('games')
        .select(`
          id,
          organization_name,
          status,
          created_at
        `)
        .eq('status', 'active');

      if (jogosError) {
        throw jogosError;
      }

      // Buscar jogos com configuração
      const { data: jogosComConfig, error: configError } = await this.db
        .from('game_confirmation_configs')
        .select('game_id')
        .eq('is_active', true);

      if (configError) {
        throw configError;
      }

      const jogosComConfigIds = jogosComConfig.map(config => config.game_id);
      const jogosSemConfig = todosJogos.filter(jogo => !jogosComConfigIds.includes(jogo.id));

      if (jogosSemConfig.length === 0) {
        console.log('✅ Todos os jogos ativos possuem configuração de confirmação!');
        return;
      }

      console.log(`❌ Encontrados ${jogosSemConfig.length} jogos sem configuração:\n`);

      jogosSemConfig.forEach((jogo, index) => {
        console.log(`${index + 1}. ${jogo.organization_name} (ID: ${jogo.id})`);
        console.log(`   Status: ${jogo.status}`);
        console.log(`   Criado em: ${new Date(jogo.created_at).toLocaleString('pt-BR')}\n`);
      });

      // Verificar se o jogo específico mencionado nos logs existe
      const jogoEspecifico = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
      const jogoEncontrado = jogosSemConfig.find(j => j.id === jogoEspecifico);
      
      if (jogoEncontrado) {
        console.log(`🎯 JOGO ESPECÍFICO ENCONTRADO:`);
        console.log(`   Nome: ${jogoEncontrado.organization_name}`);
        console.log(`   ID: ${jogoEncontrado.id}`);
        console.log(`   Status: ${jogoEncontrado.status}\n`);
        
        await this.criarConfiguracaoBasica(jogoEncontrado);
      }

    } catch (error) {
      console.error('❌ Erro ao verificar jogos:', error.message);
    }
  }

  async criarConfiguracaoBasica(jogo) {
    try {
      console.log(`🔧 Criando configuração básica para o jogo "${jogo.name}"...`);

      // Criar configuração principal
      const { data: config, error: configError } = await this.db
        .from('game_confirmation_configs')
        .insert({
          game_id: jogo.id,
          is_active: true,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (configError) {
        throw configError;
      }

      console.log(`✅ Configuração principal criada (ID: ${config.id})`);

      // Criar configurações de envio padrão
      const configsEnvio = [
        {
          game_confirmation_config_id: config.id,
          player_type: 'monthly',
          confirmation_order: 1,
          hours_before_game: 24, // 24 horas antes
          is_active: true,
          created_at: new Date().toISOString()
        },
        {
          game_confirmation_config_id: config.id,
          player_type: 'casual',
          confirmation_order: 2,
          hours_before_game: 12, // 12 horas antes
          is_active: true,
          created_at: new Date().toISOString()
        }
      ];

      const { data: configsEnvioData, error: configsEnvioError } = await this.db
        .from('confirmation_send_configs')
        .insert(configsEnvio)
        .select();

      if (configsEnvioError) {
        throw configsEnvioError;
      }

      console.log(`✅ Configurações de envio criadas:`);
      configsEnvioData.forEach((config, index) => {
        console.log(`   ${index + 1}. ${config.player_type} - ${config.hours_before_game}h antes`);
      });

      console.log(`\n🎉 Configuração básica criada com sucesso para "${jogo.organization_name}"!`);
      console.log(`   O motor agora pode processar confirmações para este jogo.`);

    } catch (error) {
      console.error('❌ Erro ao criar configuração:', error.message);
    }
  }

  async verificarSessoesFuturas() {
    try {
      console.log('\n📅 Verificando sessões futuras...\n');

      const { data: sessoes, error } = await this.db
        .from('game_sessions')
        .select(`
          id,
          game_id,
          session_date,
          start_time
        `)
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true })
        .limit(10);

      if (error) {
        throw error;
      }

      if (sessoes.length === 0) {
        console.log('⚠️ Nenhuma sessão futura encontrada!');
        console.log('   Crie sessões para que o motor possa enviar confirmações.');
        return;
      }

      console.log(`📋 Próximas ${sessoes.length} sessões:`);
      sessoes.forEach((sessao, index) => {
        const data = new Date(sessao.session_date).toLocaleDateString('pt-BR');
        const hora = sessao.start_time || 'Não definida';
        console.log(`   ${index + 1}. Jogo ID: ${sessao.game_id} - ${data} às ${hora}`);
      });

    } catch (error) {
      console.error('❌ Erro ao verificar sessões:', error.message);
    }
  }

  async executarVerificacao() {
    console.log('🔍 VERIFICADOR DE CONFIGURAÇÃO DE JOGOS\n');
    console.log('=====================================\n');

    await this.verificarJogoSemConfig();
    await this.verificarSessoesFuturas();

    console.log('\n✅ Verificação concluída!');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const verificador = new VerificadorJogoConfig();
  verificador.executarVerificacao().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Erro na verificação:', error);
    process.exit(1);
  });
}

module.exports = VerificadorJogoConfig;
