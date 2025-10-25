/**
 * Versão simplificada do servidor para debug no Railway
 * Este servidor não depende do Supabase para testar se o problema são as variáveis de ambiente
 */

const express = require('express');
const cors = require('cors');

class SimpleServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    // CORS básico
    this.app.use(cors());
    
    // Parser de JSON
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging básico
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  setupRoutes() {
    // Rota de health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        message: 'VaiDarJogo Backend está funcionando (versão simplificada)',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0-simple',
        environment: {
          NODE_ENV: process.env.NODE_ENV || 'development',
          PORT: process.env.PORT || 3000,
          SUPABASE_URL: process.env.SUPABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA',
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Configurada' : 'NÃO CONFIGURADA',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'NÃO CONFIGURADA'
        }
      });
    });

    // Rota raiz
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'VaiDarJogo Backend API (versão simplificada)',
        version: '1.0.0-simple',
        endpoints: {
          health: '/health',
          info: '/info'
        }
      });
    });

    // Rota de informações
    this.app.get('/info', (req, res) => {
      res.json({
        success: true,
        message: 'Informações do servidor',
        server: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          uptime: process.uptime(),
          memory: process.memoryUsage()
        },
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          PORT: process.env.PORT,
          SUPABASE_URL: process.env.SUPABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA',
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Configurada' : 'NÃO CONFIGURADA',
          SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'NÃO CONFIGURADA'
        }
      });
    });

    // Rota de teste de variáveis
    this.app.get('/test-env', (req, res) => {
      const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY', 
        'SUPABASE_SERVICE_ROLE_KEY'
      ];

      const results = requiredVars.map(varName => ({
        name: varName,
        configured: !!process.env[varName],
        value: process.env[varName] ? 'Configurada' : 'NÃO CONFIGURADA'
      }));

      const allConfigured = results.every(r => r.configured);

      res.json({
        success: allConfigured,
        message: allConfigured ? 'Todas as variáveis estão configuradas' : 'Algumas variáveis estão faltando',
        variables: results,
        recommendation: allConfigured 
          ? 'Pode usar o servidor completo' 
          : 'Configure as variáveis no Railway Dashboard'
      });
    });
  }

  start() {
    try {
      console.log('🚀 Iniciando servidor simplificado...');
      console.log(`📱 Porta: ${this.port}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      
      // Verificar variáveis de ambiente
      console.log('\n🔍 Verificando variáveis de ambiente:');
      console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}`);
      console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}`);
      console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}`);

      this.app.listen(this.port, () => {
        console.log(`✅ Servidor simplificado rodando na porta ${this.port}`);
        console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        console.log(`📊 Info: http://localhost:${this.port}/info`);
        console.log(`🧪 Test env: http://localhost:${this.port}/test-env`);
      });

    } catch (error) {
      console.error('❌ Erro ao iniciar servidor simplificado:', error);
      process.exit(1);
    }
  }
}

// Iniciar servidor se este arquivo for executado diretamente
if (require.main === module) {
  const server = new SimpleServer();
  server.start();
}

module.exports = SimpleServer;
