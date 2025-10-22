require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const logger = require('./utils/logger');
const database = require('./config/database');
const whatsappConfig = require('./config/whatsapp');
const ConfirmationScheduler = require('./schedulers/ConfirmationScheduler');

const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Importar rotas
const confirmationRoutes = require('./routes/confirmation');
const whatsappRoutes = require('./routes/whatsapp');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // Segurança
    this.app.use(helmet({
      contentSecurityPolicy: false, // Desabilitar para APIs
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    }));

    // Compressão
    this.app.use(compression());

    // Logging de requisições
    this.app.use(morgan('combined', {
      stream: {
        write: (message) => logger.info(message.trim())
      }
    }));

    // Parser de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Middleware de logging personalizado
    this.app.use((req, res, next) => {
      const start = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - start;
        logger.logRequest(req, res, duration);
      });
      
      next();
    });
  }

  setupRoutes() {
    // Rota de health check básico
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'VaiDarJogo Backend está funcionando',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Rotas da API
    this.app.use('/api/confirmation', confirmationRoutes);
    this.app.use('/api/whatsapp', whatsappRoutes);

    // Rota raiz
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'VaiDarJogo Backend API',
        version: process.env.npm_package_version || '1.0.0',
        endpoints: {
          health: '/health',
          confirmation: '/api/confirmation',
          whatsapp: '/api/whatsapp'
        }
      });
    });
  }

  setupErrorHandling() {
    // Middleware para rotas não encontradas
    this.app.use(notFoundHandler);

    // Middleware de tratamento de erros
    this.app.use(errorHandler);
  }

  async initialize() {
    try {
      // Testar conexões
      logger.info('🔍 Testando conexões...');
      
      const dbTest = await database.testConnection();
      if (!dbTest) {
        throw new Error('Falha na conexão com o banco de dados');
      }

      // Verificar configuração WhatsApp Business API
      logger.info('🚀 Verificando configuração WhatsApp Business API...');
      const whatsappStatus = whatsappConfig.getStatus();
      if (whatsappStatus.isReady) {
        logger.info('✅ WhatsApp Business API configurado');
      } else {
        logger.warn('⚠️ WhatsApp Business API não configurado - verifique as variáveis de ambiente');
      }

      logger.info('✅ Todas as conexões testadas com sucesso');
    } catch (error) {
      logger.error('❌ Erro na inicialização:', error);
      throw error;
    }
  }

  async start() {
    try {
      await this.initialize();

      // Iniciar agendador
      ConfirmationScheduler.start();
      logger.info('✅ Agendador de confirmações iniciado');

      // Iniciar servidor
      this.app.listen(this.port, () => {
        logger.info(`🚀 Servidor rodando na porta ${this.port}`);
        logger.info(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`⏰ Timezone: ${process.env.DEFAULT_TIMEZONE || 'America/Sao_Paulo'}`);
        logger.info(`🔄 Intervalo do agendador: ${process.env.SCHEDULER_INTERVAL_MINUTES || 5} minutos`);
      });

      // Graceful shutdown
      this.setupGracefulShutdown();
    } catch (error) {
      logger.error('❌ Erro ao iniciar servidor:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      logger.info(`📴 Recebido sinal ${signal}. Iniciando shutdown graceful...`);
      
      // Parar agendador
      ConfirmationScheduler.stop();
      logger.info('✅ Agendador parado');

      // Desconectar WhatsApp Web
      whatsappConfig.disconnect();
      logger.info('✅ WhatsApp Web desconectado');

      // Parar servidor
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    
    // Capturar erros não tratados
    process.on('uncaughtException', (error) => {
      logger.error('❌ Erro não capturado:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('❌ Promise rejeitada não tratada:', { reason, promise });
      process.exit(1);
    });
  }
}

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;
