const database = require('../config/database');

class GameConfirmation {
  constructor() {
    this.db = database.getClient();
  }

  /**
   * Buscar configurações de confirmação de um jogo
   */
  async getGameConfirmationConfig(gameId) {
    try {
      const { data, error } = await this.db
        .from('game_confirmation_configs')
        .select(`
          *,
          confirmation_send_configs (*)
        `)
        .eq('game_id', gameId)
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Erro ao buscar configuração de confirmação: ${error.message}`);
    }
  }

  /**
   * Buscar jogadores de um jogo com suas confirmações
   */
  async getGamePlayersWithConfirmations(gameId) {
    try {
      const { data, error } = await this.db
        .from('game_players')
        .select(`
          *,
          players!game_players_player_id_fkey (
            id,
            name,
            phone_number,
            user_id
          )
        `)
        .eq('game_id', gameId)
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Erro ao buscar jogadores: ${error.message}`);
    }
  }

  /**
   * Buscar sessões futuras de um jogo
   */
  async getUpcomingSessions(gameId) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await this.db
        .from('game_sessions')
        .select('*')
        .eq('game_id', gameId)
        .gte('session_date', today)
        .order('session_date', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Erro ao buscar sessões: ${error.message}`);
    }
  }

  /**
   * Buscar próxima sessão de um jogo
   */
  async getNextSession(gameId) {
    try {
      const sessions = await this.getUpcomingSessions(gameId);
      return sessions.length > 0 ? sessions[0] : null;
    } catch (error) {
      throw new Error(`Erro ao buscar próxima sessão: ${error.message}`);
    }
  }

  /**
   * Verificar se um jogador já confirmou para uma sessão
   */
  async hasPlayerConfirmed(playerId, sessionDate) {
    try {
      // Como a tabela player_confirmations não tem session_date, vamos verificar apenas se há confirmação para o jogador
      // Por enquanto, vamos assumir que não há confirmação (retornar false) para permitir o envio
      // TODO: Implementar lógica correta quando o schema for definido
      return false;
    } catch (error) {
      throw new Error(`Erro ao verificar confirmação: ${error.message}`);
    }
  }

  /**
   * Criar confirmação de jogador
   */
  async createPlayerConfirmation(confirmationData) {
    try {
      const { data, error } = await this.db
        .from('player_confirmations')
        .insert(confirmationData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Erro ao criar confirmação: ${error.message}`);
    }
  }

  /**
   * Atualizar confirmação de jogador
   */
  async updatePlayerConfirmation(confirmationId, updateData) {
    try {
      const { data, error } = await this.db
        .from('player_confirmations')
        .update(updateData)
        .eq('id', confirmationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Erro ao atualizar confirmação: ${error.message}`);
    }
  }

  /**
   * Criar log de envio de confirmação
   */
  async createSendLog(logData) {
    try {
      const { data, error } = await this.db
        .from('confirmation_send_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      throw new Error(`Erro ao criar log de envio: ${error.message}`);
    }
  }

  /**
   * Buscar logs de envio por período
   */
  async getSendLogs(gameId, startDate, endDate) {
    try {
      let query = this.db
        .from('confirmation_send_logs')
        .select('*')
        .eq('game_id', gameId);

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Erro ao buscar logs: ${error.message}`);
    }
  }

  /**
   * Buscar jogos ativos com configurações de confirmação
   */
  async getActiveGamesWithConfirmationConfig() {
    try {
      const { data, error } = await this.db
        .from('games')
        .select(`
          *,
          game_confirmation_configs!inner (
            *,
            confirmation_send_configs (*)
          )
        `)
        .eq('status', 'active')
        .eq('game_confirmation_configs.is_active', true);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      throw new Error(`Erro ao buscar jogos ativos: ${error.message}`);
    }
  }
}

module.exports = new GameConfirmation();


