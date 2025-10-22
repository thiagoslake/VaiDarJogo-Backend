const GameConfirmation = require('../models/GameConfirmation');
const WhatsAppService = require('./WhatsAppService');
const logger = require('../utils/logger');
const moment = require('moment-timezone');

class ConfirmationService {
  constructor() {
    this.gameConfirmation = GameConfirmation;
    this.whatsappService = WhatsAppService;
    this.timezone = process.env.DEFAULT_TIMEZONE || 'America/Sao_Paulo';
  }

  /**
   * Processar confirmações pendentes para todos os jogos ativos
   */
  async processPendingConfirmations() {
    try {
      logger.logScheduler('Iniciando processamento de confirmações pendentes');
      
      const activeGames = await this.gameConfirmation.getActiveGamesWithConfirmationConfig();
      
      if (activeGames.length === 0) {
        logger.logScheduler('Nenhum jogo ativo com configuração de confirmação encontrado');
        return { processed: 0, sent: 0, errors: 0 };
      }

      let totalProcessed = 0;
      let totalSent = 0;
      let totalErrors = 0;

      for (const game of activeGames) {
        try {
          const result = await this.processGameConfirmations(game);
          totalProcessed += result.processed;
          totalSent += result.sent;
          totalErrors += result.errors;
        } catch (error) {
          logger.error(`Erro ao processar jogo ${game.id}:`, error);
          totalErrors++;
        }
      }

      logger.logScheduler('Processamento concluído', {
        games: activeGames.length,
        processed: totalProcessed,
        sent: totalSent,
        errors: totalErrors
      });

      return {
        processed: totalProcessed,
        sent: totalSent,
        errors: totalErrors
      };
    } catch (error) {
      logger.error('Erro no processamento de confirmações:', error);
      throw error;
    }
  }

  /**
   * Processar confirmações para um jogo específico
   */
  async processGameConfirmations(game) {
    try {
      // Se game é uma configuração direta (vem do controller)
      let config;
      if (game.game_confirmation_configs) {
        config = game.game_confirmation_configs[0];
      } else {
        // Se game é a configuração em si (vem do modelo)
        config = game;
      }
      
      if (!config) {
        logger.warn(`Jogo ${game.id || game.game_id} sem configuração de confirmação`);
        return { processed: 0, sent: 0, errors: 0 };
      }

      const gameId = game.id || game.game_id;
      const nextSession = await this.gameConfirmation.getNextSession(config.game_id);
      if (!nextSession) {
        logger.warn(`Jogo ${gameId} sem próxima sessão`);
        return { processed: 0, sent: 0, errors: 0 };
      }

      const sendConfigs = config.confirmation_send_configs || [];
      let totalProcessed = 0;
      let totalSent = 0;
      let totalErrors = 0;

      for (const sendConfig of sendConfigs) {
        try {
          const result = await this.processSendConfig({ id: gameId }, nextSession, sendConfig);
          totalProcessed += result.processed;
          totalSent += result.sent;
          totalErrors += result.errors;
        } catch (error) {
          logger.error(`Erro ao processar configuração ${sendConfig.id}:`, error);
          totalErrors++;
        }
      }

      return { processed: totalProcessed, sent: totalSent, errors: totalErrors };
    } catch (error) {
      logger.error(`Erro ao processar jogo ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Processar uma configuração de envio específica
   */
  async processSendConfig(game, session, sendConfig) {
    try {
      // Verificar se é hora de enviar
      if (!this.shouldSendNow(session.session_date, sendConfig.hours_before_game)) {
        return { processed: 0, sent: 0, errors: 0 };
      }

      // Buscar jogadores do tipo especificado
      const players = await this.getPlayersForConfirmation(game.id, sendConfig.player_type);
      
      let processed = 0;
      let sent = 0;
      let errors = 0;

      for (const player of players) {
        try {
          processed++;
          
          // Verificar se já confirmou
          const hasConfirmed = await this.gameConfirmation.hasPlayerConfirmed(
            player.id, 
            session.session_date
          );

          if (hasConfirmed) {
            logger.info(`Jogador ${player.players?.name || 'Nome não encontrado'} já confirmou para ${session.session_date}`);
            continue;
          }

          // Verificar se já foi enviado
          const alreadySent = await this.checkIfAlreadySent(player.id, session.session_date, sendConfig.id);
          if (alreadySent) {
            logger.info(`Confirmação já enviada para ${player.players?.name || 'Nome não encontrado'}`);
            continue;
          }

          // Enviar mensagem
          const result = await this.whatsappService.sendConfirmationMessage(
            player.players,
            game,
            session,
            sendConfig
          );

          if (result.success) {
            sent++;
            
            // Criar log de envio
            await this.gameConfirmation.createSendLog({
              game_id: game.id,
              player_id: player.id,
              session_date: session.session_date,
              send_config_id: sendConfig.id,
              message_id: result.messageId,
              status: 'sent',
              sent_at: new Date().toISOString()
            });

            logger.info(`Confirmação enviada para ${player.users.name} (${player.users.phone})`);
          } else {
            errors++;
            logger.error(`Falha ao enviar para ${player.users.name}:`, result.error);
          }
        } catch (error) {
          errors++;
          logger.error(`Erro ao processar jogador ${player.id}:`, error);
        }
      }

      return { processed, sent, errors };
    } catch (error) {
      logger.error(`Erro ao processar configuração ${sendConfig.id}:`, error);
      throw error;
    }
  }

  /**
   * Verificar se é hora de enviar a confirmação
   */
  shouldSendNow(sessionDate, hoursBefore) {
    try {
      const now = moment.tz(this.timezone);
      const sessionDateTime = moment.tz(sessionDate, this.timezone);
      const sendDateTime = sessionDateTime.subtract(hoursBefore, 'hours');
      
      // Verificar se já passou da hora de enviar e ainda não passou da sessão
      return now.isAfter(sendDateTime) && now.isBefore(sessionDateTime);
    } catch (error) {
      logger.error('Erro ao verificar horário de envio:', error);
      return false;
    }
  }

  /**
   * Buscar jogadores para confirmação
   */
  async getPlayersForConfirmation(gameId, playerType) {
    try {
      const allPlayers = await this.gameConfirmation.getGamePlayersWithConfirmations(gameId);
      
      return allPlayers.filter(player => {
        if (playerType === 'monthly') {
          return player.player_type === 'monthly';
        } else if (playerType === 'casual') {
          return player.player_type === 'casual';
        }
        return true;
      });
    } catch (error) {
      logger.error('Erro ao buscar jogadores:', error);
      return [];
    }
  }

  /**
   * Verificar se já foi enviado
   */
  async checkIfAlreadySent(playerId, sessionDate, sendConfigId) {
    try {
      // Por enquanto, vamos assumir que não foi enviado (retornar false) para permitir o envio
      // TODO: Implementar lógica correta quando o schema for definido
      return false;
    } catch (error) {
      logger.error('Erro ao verificar envio anterior:', error);
      return false;
    }
  }

  /**
   * Enviar confirmação manual para um jogador específico
   */
  async sendManualConfirmation(gameId, playerId, sessionDate) {
    try {
      const game = await this.gameConfirmation.getGameConfirmationConfig(gameId);
      if (!game) {
        throw new Error('Jogo não encontrado ou sem configuração');
      }

      const players = await this.gameConfirmation.getGamePlayersWithConfirmations(gameId);
      const player = players.find(p => p.id === playerId);
      
      if (!player) {
        throw new Error('Jogador não encontrado');
      }

      const session = { session_date: sessionDate };
      const sendConfig = game.confirmation_send_configs[0] || { player_type: 'casual' };

      const result = await this.whatsappService.sendConfirmationMessage(
        player.users,
        { name: 'Jogo Manual' }, // Dados básicos do jogo
        session,
        sendConfig
      );

      if (result.success) {
        // Criar log de envio
        await this.gameConfirmation.createSendLog({
          game_id: gameId,
          player_id: playerId,
          session_date: sessionDate,
          send_config_id: sendConfig.id,
          message_id: result.messageId,
          status: 'sent',
          sent_at: new Date().toISOString(),
          is_manual: true
        });
      }

      return result;
    } catch (error) {
      logger.error('Erro ao enviar confirmação manual:', error);
      throw error;
    }
  }

  /**
   * Processar resposta de confirmação do jogador
   */
  async processConfirmationResponse(messageData) {
    try {
      const { from, text } = messageData;
      const phone = this.whatsappService.formatPhoneNumber(from);
      
      // Buscar jogador pelo telefone
      const player = await this.findPlayerByPhone(phone);
      if (!player) {
        logger.warn(`Jogador não encontrado para telefone: ${phone}`);
        return { success: false, message: 'Jogador não encontrado' };
      }

      // Determinar status da confirmação
      const confirmationStatus = this.parseConfirmationResponse(text);
      if (!confirmationStatus) {
        return { success: false, message: 'Resposta não reconhecida' };
      }

      // Buscar próxima sessão do jogo
      const nextSession = await this.gameConfirmation.getNextSession(player.game_id);
      if (!nextSession) {
        return { success: false, message: 'Nenhuma sessão futura encontrada' };
      }

      // Criar ou atualizar confirmação
      const confirmationData = {
        player_id: player.id,
        session_date: nextSession.session_date,
        confirmation_status: confirmationStatus,
        confirmed_at: new Date().toISOString(),
        response_source: 'whatsapp'
      };

      await this.gameConfirmation.createPlayerConfirmation(confirmationData);

      logger.info(`Confirmação processada: ${player.name} - ${confirmationStatus}`);

      return {
        success: true,
        message: `Confirmação ${confirmationStatus === 'confirmed' ? 'aceita' : 'recusada'} com sucesso!`,
        player: player.name,
        status: confirmationStatus
      };
    } catch (error) {
      logger.error('Erro ao processar resposta de confirmação:', error);
      throw error;
    }
  }

  /**
   * Buscar jogador pelo telefone
   */
  async findPlayerByPhone(phone) {
    try {
      // Primeiro buscar o usuário pelo telefone
      const { data: user, error: userError } = await this.gameConfirmation.db
        .from('users')
        .select('id, name, phone')
        .eq('phone', phone)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      if (!user) {
        return null;
      }

      // Depois buscar o jogador ativo associado ao usuário
      const { data: player, error: playerError } = await this.gameConfirmation.db
        .from('game_players')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (playerError && playerError.code !== 'PGRST116') {
        throw playerError;
      }

      if (!player) {
        return null;
      }

      // Retornar dados combinados
      return {
        ...player,
        users: user
      };
    } catch (error) {
      logger.error('Erro ao buscar jogador por telefone:', error);
      return null;
    }
  }

  /**
   * Interpretar resposta de confirmação
   */
  parseConfirmationResponse(text) {
    const normalizedText = text.toLowerCase().trim();
    
    const confirmedKeywords = ['sim', 's', 'yes', 'y', 'confirmo', 'estarei', 'vou'];
    const declinedKeywords = ['não', 'nao', 'n', 'no', 'não poderei', 'nao poderei', 'não vou', 'nao vou'];
    
    for (const keyword of confirmedKeywords) {
      if (normalizedText.includes(keyword)) {
        return 'confirmed';
      }
    }
    
    for (const keyword of declinedKeywords) {
      if (normalizedText.includes(keyword)) {
        return 'declined';
      }
    }
    
    return null;
  }
}

module.exports = new ConfirmationService();


