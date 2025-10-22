require('dotenv').config();
const database = require('../src/config/database');

class DiagnosticoConfirmacao {
  constructor() {
    this.supabase = database.getClient();
  }

  async diagnosticarJogo(gameId) {
    console.log(`🔍 Diagnosticando jogo: ${gameId}\n`);
    
    try {
      // 1. Verificar se o jogo existe e está ativo
      await this.verificarJogo(gameId);
      
      // 2. Verificar configuração de confirmação
      await this.verificarConfiguracaoConfirmacao(gameId);
      
      // 3. Verificar configurações de envio
      await this.verificarConfiguracoesEnvio(gameId);
      
      // 4. Verificar próxima sessão
      await this.verificarProximaSessao(gameId);
      
      // 5. Verificar jogadores
      await this.verificarJogadores(gameId);
      
      // 6. Verificar logs de envio
      await this.verificarLogsEnvio(gameId);
      
    } catch (error) {
      console.error('❌ Erro no diagnóstico:', error.message);
    }
  }

  async verificarJogo(gameId) {
    console.log('1️⃣ Verificando jogo...');
    console.log('========================\n');
    
    try {
      const { data: game, error } = await this.supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Jogo não encontrado');
          return;
        }
        throw error;
      }

      console.log(`✅ Jogo encontrado: ${game.name}`);
      console.log(`   Status: ${game.status}`);
      console.log(`   Criado em: ${game.created_at}`);
      console.log(`   Atualizado em: ${game.updated_at}\n`);
      
    } catch (error) {
      console.log('❌ Erro ao verificar jogo:', error.message);
    }
  }

  async verificarConfiguracaoConfirmacao(gameId) {
    console.log('2️⃣ Verificando configuração de confirmação...');
    console.log('=============================================\n');
    
    try {
      const { data: config, error } = await this.supabase
        .from('game_confirmation_configs')
        .select('*')
        .eq('game_id', gameId)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('❌ Nenhuma configuração de confirmação ativa encontrada');
          console.log('   Solução: Criar configuração de confirmação para este jogo\n');
          return null;
        }
        throw error;
      }

      console.log(`✅ Configuração de confirmação encontrada`);
      console.log(`   ID: ${config.id}`);
      console.log(`   Ativa: ${config.is_active}`);
      console.log(`   Criada em: ${config.created_at}\n`);
      
      return config;
    } catch (error) {
      console.log('❌ Erro ao verificar configuração:', error.message);
      return null;
    }
  }

  async verificarConfiguracoesEnvio(gameId) {
    console.log('3️⃣ Verificando configurações de envio...');
    console.log('========================================\n');
    
    try {
      const { data: sendConfigs, error } = await this.supabase
        .from('confirmation_send_configs')
        .select(`
          *,
          game_confirmation_configs!inner (
            game_id
          )
        `)
        .eq('game_confirmation_configs.game_id', gameId)
        .eq('is_active', true);

      if (error) throw error;

      if (!sendConfigs || sendConfigs.length === 0) {
        console.log('❌ Nenhuma configuração de envio ativa encontrada');
        console.log('   Solução: Criar configurações de envio (monthly/casual) para este jogo\n');
        return [];
      }

      console.log(`✅ Encontradas ${sendConfigs.length} configurações de envio:`);
      sendConfigs.forEach((config, index) => {
        console.log(`   ${index + 1}. Tipo: ${config.player_type}`);
        console.log(`      Horas antes: ${config.hours_before_game}`);
        console.log(`      Ordem: ${config.confirmation_order}`);
        console.log(`      Ativa: ${config.is_active}`);
      });
      console.log('');
      
      return sendConfigs;
    } catch (error) {
      console.log('❌ Erro ao verificar configurações de envio:', error.message);
      return [];
    }
  }

  async verificarProximaSessao(gameId) {
    console.log('4️⃣ Verificando próxima sessão...');
    console.log('================================\n');
    
    try {
      const now = new Date().toISOString();
      
      const { data: sessions, error } = await this.supabase
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId)
        .gte('session_date', now)
        .order('session_date', { ascending: true })
        .limit(1);

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        console.log('❌ Nenhuma sessão futura encontrada');
        console.log('   Solução: Criar uma sessão futura para este jogo\n');
        return null;
      }

      const nextSession = sessions[0];
      console.log(`✅ Próxima sessão encontrada:`);
      console.log(`   Data: ${nextSession.session_date}`);
      console.log(`   Local: ${nextSession.location || 'Não informado'}`);
      console.log(`   Status: ${nextSession.status}\n`);
      
      return nextSession;
    } catch (error) {
      console.log('❌ Erro ao verificar próxima sessão:', error.message);
      return null;
    }
  }

  async verificarJogadores(gameId) {
    console.log('5️⃣ Verificando jogadores...');
    console.log('===========================\n');
    
    try {
      // Buscar jogadores do jogo
      const { data: gamePlayers, error: gamePlayersError } = await this.supabase
        .from('game_players')
        .select('*')
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (gamePlayersError) throw gamePlayersError;

      if (!gamePlayers || gamePlayers.length === 0) {
        console.log('❌ Nenhum jogador ativo encontrado');
        console.log('   Solução: Adicionar jogadores ao jogo\n');
        return [];
      }

      console.log(`✅ Encontrados ${gamePlayers.length} jogadores ativos:`);
      
      // Buscar informações dos usuários
      for (let i = 0; i < gamePlayers.length; i++) {
        const player = gamePlayers[i];
        const { data: user, error: userError } = await this.supabase
          .from('users')
          .select('name, phone')
          .eq('id', player.player_id)
          .single();

        if (userError) {
          console.log(`   ${i + 1}. Jogador ID: ${player.player_id} (erro ao buscar dados do usuário)`);
        } else {
          console.log(`   ${i + 1}. ${user.name}`);
          console.log(`      Tipo: ${player.player_type}`);
          console.log(`      Telefone: ${user.phone || 'Não informado'}`);
          console.log(`      Status: ${player.status}`);
        }
      }
      console.log('');
      
      return gamePlayers;
    } catch (error) {
      console.log('❌ Erro ao verificar jogadores:', error.message);
      return [];
    }
  }

  async verificarLogsEnvio(gameId) {
    console.log('6️⃣ Verificando logs de envio...');
    console.log('===============================\n');
    
    try {
      const { data: logs, error } = await this.supabase
        .from('confirmation_send_logs')
        .select(`
          *,
          players (
            name
          )
        `)
        .eq('game_id', gameId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (!logs || logs.length === 0) {
        console.log('ℹ️ Nenhum log de envio encontrado');
        console.log('   Isso é normal se nunca foi tentado enviar confirmações\n');
        return [];
      }

      console.log(`ℹ️ Últimos ${logs.length} logs de envio:`);
      logs.forEach((log, index) => {
        console.log(`   ${index + 1}. Jogador: ${log.players?.name || 'N/A'}`);
        console.log(`      Status: ${log.status}`);
        console.log(`      Data: ${log.created_at}`);
        if (log.error_message) {
          console.log(`      Erro: ${log.error_message}`);
        }
      });
      console.log('');
      
      return logs;
    } catch (error) {
      console.log('❌ Erro ao verificar logs:', error.message);
      return [];
    }
  }

  async criarConfiguracaoBasica(gameId) {
    console.log('🔧 Criando configuração básica...');
    console.log('=================================\n');
    
    try {
      // Criar configuração de confirmação
      const { data: config, error: configError } = await this.supabase
        .from('game_confirmation_configs')
        .insert({
          game_id: gameId,
          is_active: true
        })
        .select()
        .single();

      if (configError) throw configError;

      console.log(`✅ Configuração de confirmação criada: ${config.id}`);

      // Criar configurações de envio básicas
      const sendConfigs = [
        {
          game_confirmation_config_id: config.id,
          player_type: 'monthly',
          confirmation_order: 1,
          hours_before_game: 24,
          is_active: true
        },
        {
          game_confirmation_config_id: config.id,
          player_type: 'casual',
          confirmation_order: 2,
          hours_before_game: 12,
          is_active: true
        }
      ];

      const { data: createdConfigs, error: sendConfigError } = await this.supabase
        .from('confirmation_send_configs')
        .insert(sendConfigs)
        .select();

      if (sendConfigError) throw sendConfigError;

      console.log(`✅ ${createdConfigs.length} configurações de envio criadas`);
      console.log('   - Mensal: 24h antes');
      console.log('   - Casual: 12h antes\n');
      
    } catch (error) {
      console.log('❌ Erro ao criar configuração:', error.message);
    }
  }
}

// Executar diagnóstico
async function main() {
  const gameId = process.argv[2];
  
  if (!gameId) {
    console.log('❌ Uso: node diagnostico-confirmacao.js <game_id>');
    console.log('   Exemplo: node diagnostico-confirmacao.js ec0dbd33-11d3-4338-902c-26a4ea3275e4');
    process.exit(1);
  }

  const diagnostico = new DiagnosticoConfirmacao();
  await diagnostico.diagnosticarJogo(gameId);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = DiagnosticoConfirmacao;
