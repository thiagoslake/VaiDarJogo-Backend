/**
 * Servidor MÍNIMO para debug no Railway
 * Sem dependências externas - apenas Node.js nativo
 */

const http = require('http');
const url = require('url');

const port = process.env.PORT || 3000;

// Função para criar resposta JSON
function createResponse(data, statusCode = 200) {
  return JSON.stringify(data, null, 2);
}

// Função para log
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  log(`${method} ${path}`);

  // Headers CORS básicos
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Tratar OPTIONS (CORS preflight)
  if (method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Rotas
  if (path === '/health' && method === 'GET') {
    const response = {
      success: true,
      message: 'VaiDarJogo Backend MÍNIMO funcionando',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0-minimal',
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: process.env.PORT || 3000,
        SUPABASE_URL: process.env.SUPABASE_URL ? 'Configurada' : 'NÃO CONFIGURADA',
        SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'Configurada' : 'NÃO CONFIGURADA',
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'NÃO CONFIGURADA'
      }
    };
    
    res.writeHead(200);
    res.end(createResponse(response));
    return;
  }

  if (path === '/' && method === 'GET') {
    const response = {
      success: true,
      message: 'VaiDarJogo Backend API (versão MÍNIMA)',
      version: '1.0.0-minimal',
      endpoints: {
        health: '/health',
        info: '/info',
        testEnv: '/test-env'
      }
    };
    
    res.writeHead(200);
    res.end(createResponse(response));
    return;
  }

  if (path === '/info' && method === 'GET') {
    const response = {
      success: true,
      message: 'Informações do servidor MÍNIMO',
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
    };
    
    res.writeHead(200);
    res.end(createResponse(response));
    return;
  }

  if (path === '/test-env' && method === 'GET') {
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

    const response = {
      success: allConfigured,
      message: allConfigured ? 'Todas as variáveis estão configuradas' : 'Algumas variáveis estão faltando',
      variables: results,
      recommendation: allConfigured 
        ? 'Pode usar o servidor completo' 
        : 'Configure as variáveis no Railway Dashboard'
    };
    
    res.writeHead(200);
    res.end(createResponse(response));
    return;
  }

  // Rota não encontrada
  const response = {
    success: false,
    message: 'Rota não encontrada',
    availableRoutes: ['/', '/health', '/info', '/test-env']
  };
  
  res.writeHead(404);
  res.end(createResponse(response));
});

// Iniciar servidor
try {
  log('🚀 Iniciando servidor MÍNIMO...');
  log(`📱 Porta: ${port}`);
  log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  
  // Verificar variáveis de ambiente
  log('\n🔍 Verificando variáveis de ambiente:');
  log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}`);
  log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}`);
  log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ NÃO CONFIGURADA'}`);

  server.listen(port, () => {
    log(`✅ Servidor MÍNIMO rodando na porta ${port}`);
    log(`🔗 Health check: http://localhost:${port}/health`);
    log(`📊 Info: http://localhost:${port}/info`);
    log(`🧪 Test env: http://localhost:${port}/test-env`);
  });

  // Tratar erros
  server.on('error', (error) => {
    log(`❌ Erro no servidor: ${error.message}`);
    process.exit(1);
  });

} catch (error) {
  log(`❌ Erro ao iniciar servidor MÍNIMO: ${error.message}`);
  process.exit(1);
}

module.exports = server;
