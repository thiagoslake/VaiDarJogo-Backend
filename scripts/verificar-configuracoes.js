#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

class VerificadorConfiguracoes {
  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async verificarConfiguracoes() {
    console.log('🔍 VERIFICANDO CONFIGURAÇÕES NO BANCO DE DADOS\n');
    console.log('==============================================\n');

    try {
      // 1. Verificar jogos ativos
      await this.verificarJogosAtivos();

      // 2. Verificar configurações de confirmação
      await this.verificarConfiguracoesConfirmacao();

      // 3. Verificar próximas sessões
      await this.verificarProximasSessoes();

      // 4. Verificar logs de envio
      await this.verificarLogsEnvio();

      // 5. Verificar jogadores
      await this.verificarJogadores();

    } catch (error) {
      console.error('❌ Erro durante verificação:', error.message);
    }
  }

  async verificarJogosAtivos() {
    console.log('1️⃣ Jogos Ativos:');
    console.log('================\n');

    try {
      const { data: jogos, error } = await this.supabase
        .from('games')
        .select('id, name, status, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (jogos && jogos.length > 0) {
        console.log(`✅ Encontrados ${jogos.length} jogos ativos:`);
        jogos.forEach((jogo, index) => {
          console.log(`   ${index + 1}. ${jogo.name} (ID: ${jogo.id})`);
        });
      } else {
        console.log('❌ Nenhum jogo ativo encontrado');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar jogos:', error.message);
    }

    console.log('');
  }

  async verificarConfiguracoesConfirmacao() {
    console.log('2️⃣ Configurações de Confirmação:');
    console.log('================================\n');

    try {
      const { data: configs, error } = await this.supabase
        .from('game_confirmation_configs')
        .select(`
          *,
          games!inner (
            id,
            name,
            status
          ),
          confirmation_send_configs (*)
        `)
        .eq('is_active', true)
        .eq('games.status', 'active');

      if (error) throw error;

      if (configs && configs.length > 0) {
        console.log(`✅ Encontradas ${configs.length} configurações ativas:`);
        
        configs.forEach((config, index) => {
          console.log(`\n   ${index + 1}. Jogo: ${config.games.name}`);
          console.log(`      ID: ${config.id}`);
          console.log(`      Configurações de envio: ${config.confirmation_send_configs.length}`);
          
          config.confirmation_send_configs.forEach((sendConfig, sIndex) => {
            console.log(`         ${sIndex + 1}. ${sendConfig.player_type}: ${sendConfig.hours_before}h antes`);
          });
        });
      } else {
        console.log('❌ Nenhuma configuração de confirmação encontrada');
        console.log('   Solução: Configurar confirmações no Flutter para jogos ativos');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar configurações:', error.message);
    }

    console.log('');
  }

  async verificarProximasSessoes() {
    console.log('3️⃣ Próximas Sessões:');
    console.log('===================\n');

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: sessoes, error } = await this.supabase
        .from('game_sessions')
        .select(`
          *,
          games!inner (
            id,
            name,
            status
          )
        `)
        .eq('games.status', 'active')
        .gte('session_date', today)
        .order('session_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (sessoes && sessoes.length > 0) {
        console.log(`✅ Encontradas ${sessoes.length} próximas sessões:`);
        
        sessoes.forEach((sessao, index) => {
          const dataSessao = new Date(sessao.session_date);
          const agora = new Date();
          const diferenca = dataSessao.getTime() - agora.getTime();
          const dias = Math.ceil(diferenca / (1000 * 60 * 60 * 24));
          
          console.log(`   ${index + 1}. ${sessao.games.name}`);
          console.log(`      Data: ${sessao.session_date} ${sessao.session_time}`);
          console.log(`      Dias restantes: ${dias}`);
        });
      } else {
        console.log('❌ Nenhuma sessão futura encontrada');
        console.log('   Solução: Verificar se há sessões cadastradas para os jogos');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar sessões:', error.message);
    }

    console.log('');
  }

  async verificarLogsEnvio() {
    console.log('4️⃣ Logs de Envio (Últimos 10):');
    console.log('===============================\n');

    try {
      const { data: logs, error } = await this.supabase
        .from('confirmation_send_logs')
        .select(`
          *,
          games!inner (
            name
          ),
          users!inner (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (logs && logs.length > 0) {
        console.log(`✅ Encontrados ${logs.length} logs de envio:`);
        
        logs.forEach((log, index) => {
          const dataEnvio = new Date(log.created_at);
          console.log(`   ${index + 1}. ${log.games.name} - ${log.users.name}`);
          console.log(`      Data: ${dataEnvio.toLocaleString()}`);
          console.log(`      Status: ${log.status}`);
          console.log(`      Sessão: ${log.session_date}`);
        });
      } else {
        console.log('❌ Nenhum log de envio encontrado');
        console.log('   Isso indica que nenhuma mensagem foi enviada ainda');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar logs:', error.message);
    }

    console.log('');
  }

  async verificarJogadores() {
    console.log('5️⃣ Jogadores dos Jogos Ativos:');
    console.log('==============================\n');

    try {
      const { data: jogadores, error } = await this.supabase
        .from('game_players')
        .select(`
          *,
          games!inner (
            id,
            name,
            status
          ),
          users!inner (
            id,
            name,
            phone
          )
        `)
        .eq('games.status', 'active')
        .eq('status', 'active');

      if (error) throw error;

      if (jogadores && jogadores.length > 0) {
        // Agrupar por jogo
        const jogadoresPorJogo = {};
        jogadores.forEach(jogador => {
          const jogoNome = jogador.games.name;
          if (!jogadoresPorJogo[jogoNome]) {
            jogadoresPorJogo[jogoNome] = [];
          }
          jogadoresPorJogo[jogoNome].push(jogador);
        });

        console.log(`✅ Encontrados ${jogadores.length} jogadores ativos:`);
        
        Object.keys(jogadoresPorJogo).forEach((jogoNome, index) => {
          const jogadoresJogo = jogadoresPorJogo[jogoNome];
          console.log(`\n   ${index + 1}. ${jogoNome} (${jogadoresJogo.length} jogadores):`);
          
          jogadoresJogo.forEach((jogador, jIndex) => {
            console.log(`      ${jIndex + 1}. ${jogador.users.name} (${jogador.player_type})`);
            console.log(`         Telefone: ${jogador.users.phone || 'Não informado'}`);
          });
        });
      } else {
        console.log('❌ Nenhum jogador ativo encontrado');
        console.log('   Solução: Verificar se há jogadores cadastrados nos jogos');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar jogadores:', error.message);
    }

    console.log('');
  }

  async verificarHorariosEnvio() {
    console.log('6️⃣ Análise de Horários de Envio:');
    console.log('================================\n');

    try {
      const { data: configs, error } = await this.supabase
        .from('game_confirmation_configs')
        .select(`
          *,
          games!inner (
            id,
            name,
            status
          ),
          confirmation_send_configs (*)
        `)
        .eq('is_active', true)
        .eq('games.status', 'active');

      if (error) throw error;

      if (configs && configs.length > 0) {
        console.log('✅ Análise de horários de envio:');
        
        for (const config of configs) {
          console.log(`\n   Jogo: ${config.games.name}`);
          
          // Buscar próxima sessão
          const { data: proximaSessao, error: sessaoError } = await this.supabase
            .from('game_sessions')
            .select('session_date, session_time')
            .eq('game_id', config.games.id)
            .gte('session_date', new Date().toISOString().split('T')[0])
            .order('session_date', { ascending: true })
            .limit(1);

          if (sessaoError) {
            console.log('      ❌ Erro ao buscar próxima sessão');
            continue;
          }

          if (proximaSessao && proximaSessao.length > 0) {
            const sessao = proximaSessao[0];
            const dataSessao = new Date(`${sessao.session_date}T${sessao.session_time}`);
            const agora = new Date();
            
            console.log(`      Próxima sessão: ${sessao.session_date} ${sessao.session_time}`);
            
            config.confirmation_send_configs.forEach((sendConfig, index) => {
              const dataEnvio = new Date(dataSessao.getTime() - (sendConfig.hours_before * 60 * 60 * 1000));
              const jaPassou = dataEnvio < agora;
              
              console.log(`      ${index + 1}. ${sendConfig.player_type}: ${sendConfig.hours_before}h antes`);
              console.log(`         Data de envio: ${dataEnvio.toLocaleString()}`);
              console.log(`         Status: ${jaPassou ? '✅ Já passou' : '⏳ Ainda não'}`);
            });
          } else {
            console.log('      ❌ Nenhuma sessão futura encontrada');
          }
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar horários:', error.message);
    }

    console.log('');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const verificador = new VerificadorConfiguracoes();
  verificador.verificarConfiguracoes().then(() => {
    console.log('🎉 Verificação concluída!');
    process.exit(0);
  });
}

module.exports = VerificadorConfiguracoes;




