const cron = require('node-cron');
const ConfirmationService = require('../services/ConfirmationService');
const logger = require('../utils/logger');

class ConfirmationScheduler {
  constructor() {
    this.isRunning = false;
    this.scheduledTasks = new Map();
    this.intervalMinutes = parseInt(process.env.SCHEDULER_INTERVAL_MINUTES) || 5;
    this.timezone = process.env.CRON_TIMEZONE || 'America/Sao_Paulo';
  }

  /**
   * Iniciar o agendador
   */
  start() {
    if (this.isRunning) {
      logger.warn('Agendador já está em execução');
      return;
    }

    try {
      // Agendar verificação a cada X minutos
      const cronExpression = `*/${this.intervalMinutes} * * * *`;
      
      const task = cron.schedule(cronExpression, async () => {
        await this.runScheduledCheck();
      }, {
        scheduled: false,
        timezone: this.timezone
      });

      this.scheduledTasks.set('main', task);
      task.start();

      this.isRunning = true;
      logger.info(`✅ Agendador iniciado - verificando a cada ${this.intervalMinutes} minutos`);
    } catch (error) {
      logger.error('❌ Erro ao iniciar agendador:', error);
      throw error;
    }
  }

  /**
   * Parar o agendador
   */
  stop() {
    if (!this.isRunning) {
      logger.warn('Agendador não está em execução');
      return;
    }

    try {
      for (const [name, task] of this.scheduledTasks) {
        task.stop();
        task.destroy();
        logger.info(`Tarefa agendada '${name}' parada`);
      }

      this.scheduledTasks.clear();
      this.isRunning = false;
      logger.info('✅ Agendador parado');
    } catch (error) {
      logger.error('❌ Erro ao parar agendador:', error);
      throw error;
    }
  }

  /**
   * Executar verificação agendada
   */
  async runScheduledCheck() {
    try {
      logger.logScheduler('Executando verificação agendada');
      
      const startTime = Date.now();
      
      // Verificar se o WhatsApp está pronto antes de processar
      const whatsappConfig = require('../config/whatsapp');
      if (!whatsappConfig.isReady) {
        logger.warn('WhatsApp Web não está pronto, pulando verificação');
        return { processed: 0, sent: 0, errors: 0, skipped: true };
      }
      
      const result = await ConfirmationService.processPendingConfirmations();
      const duration = Date.now() - startTime;

      logger.logScheduler('Verificação concluída', {
        ...result,
        duration: `${duration}ms`
      });

      return result;
    } catch (error) {
      logger.error('Erro na verificação agendada:', error);
      
      // Não relançar o erro para evitar que o cron pare
      return { processed: 0, sent: 0, errors: 1, error: error.message };
    }
  }

  /**
   * Executar verificação manual
   */
  async runManualCheck() {
    try {
      logger.logScheduler('Executando verificação manual');
      return await this.runScheduledCheck();
    } catch (error) {
      logger.error('Erro na verificação manual:', error);
      throw error;
    }
  }

  /**
   * Agendar envio específico para um jogo
   */
  scheduleGameConfirmation(gameId, sendDateTime) {
    try {
      const taskName = `game_${gameId}`;
      
      // Remover tarefa existente se houver
      if (this.scheduledTasks.has(taskName)) {
        this.scheduledTasks.get(taskName).stop();
        this.scheduledTasks.get(taskName).destroy();
      }

      // Criar nova tarefa
      const task = cron.schedule(sendDateTime, async () => {
        try {
          logger.logScheduler(`Executando confirmação agendada para jogo ${gameId}`);
          await ConfirmationService.processGameConfirmations({ id: gameId });
        } catch (error) {
          logger.error(`Erro na confirmação agendada do jogo ${gameId}:`, error);
        } finally {
          // Remover tarefa após execução
          this.scheduledTasks.delete(taskName);
        }
      }, {
        scheduled: false,
        timezone: this.timezone
      });

      this.scheduledTasks.set(taskName, task);
      task.start();

      logger.info(`✅ Confirmação agendada para jogo ${gameId} em ${sendDateTime}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao agendar confirmação para jogo ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Cancelar agendamento de um jogo
   */
  cancelGameConfirmation(gameId) {
    try {
      const taskName = `game_${gameId}`;
      
      if (this.scheduledTasks.has(taskName)) {
        const task = this.scheduledTasks.get(taskName);
        task.stop();
        task.destroy();
        this.scheduledTasks.delete(taskName);
        
        logger.info(`✅ Agendamento cancelado para jogo ${gameId}`);
        return true;
      } else {
        logger.warn(`Nenhum agendamento encontrado para jogo ${gameId}`);
        return false;
      }
    } catch (error) {
      logger.error(`Erro ao cancelar agendamento do jogo ${gameId}:`, error);
      return false;
    }
  }

  /**
   * Obter status do agendador
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes,
      timezone: this.timezone,
      scheduledTasks: Array.from(this.scheduledTasks.keys()),
      taskCount: this.scheduledTasks.size
    };
  }

  /**
   * Obter estatísticas de execução
   */
  async getExecutionStats() {
    try {
      // Aqui você pode implementar lógica para buscar estatísticas
      // do banco de dados ou de logs
      return {
        lastExecution: new Date().toISOString(),
        totalExecutions: 0, // Implementar contador
        successRate: 100, // Implementar cálculo
        averageExecutionTime: 0 // Implementar cálculo
      };
    } catch (error) {
      logger.error('Erro ao obter estatísticas:', error);
      return null;
    }
  }

  /**
   * Configurar intervalo de verificação
   */
  setInterval(minutes) {
    if (minutes < 1 || minutes > 60) {
      throw new Error('Intervalo deve estar entre 1 e 60 minutos');
    }

    this.intervalMinutes = minutes;
    
    if (this.isRunning) {
      // Reiniciar com novo intervalo
      this.stop();
      this.start();
    }

    logger.info(`Intervalo de verificação alterado para ${minutes} minutos`);
  }

  /**
   * Verificar saúde do agendador
   */
  healthCheck() {
    try {
      const status = this.getStatus();
      
      return {
        healthy: this.isRunning,
        status: status,
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      };
    } catch (error) {
      logger.error('Erro no health check do agendador:', error);
      return {
        healthy: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new ConfirmationScheduler();


