#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('🚀 Configuração do VaiDarJogo Backend\n');

  try {
    // Verificar se .env já existe
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('Arquivo .env já existe. Deseja sobrescrever? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Configuração cancelada');
        process.exit(0);
      }
    }

    console.log('📝 Configurando variáveis de ambiente...\n');

    // Coletar configurações
    const config = {};

    // Servidor
    config.PORT = await question('Porta do servidor (3000): ') || '3000';
    config.NODE_ENV = await question('Ambiente (development): ') || 'development';

    // Supabase
    console.log('\n🔗 Configuração do Supabase:');
    config.SUPABASE_URL = await question('URL do Supabase: ');
    config.SUPABASE_ANON_KEY = await question('Chave Anônima do Supabase: ');
    config.SUPABASE_SERVICE_ROLE_KEY = await question('Chave de Service Role do Supabase: ');

    // WhatsApp
    console.log('\n📱 Configuração do WhatsApp Business API:');
    config.WHATSAPP_ACCESS_TOKEN = await question('Access Token do WhatsApp: ');
    config.WHATSAPP_PHONE_NUMBER_ID = await question('Phone Number ID do WhatsApp: ');
    config.WHATSAPP_BUSINESS_ACCOUNT_ID = await question('Business Account ID do WhatsApp: ');
    config.WHATSAPP_WEBHOOK_VERIFY_TOKEN = await question('Webhook Verify Token: ');

    // Configurações opcionais
    console.log('\n⚙️ Configurações opcionais:');
    config.LOG_LEVEL = await question('Nível de log (info): ') || 'info';
    config.DEFAULT_TIMEZONE = await question('Timezone (America/Sao_Paulo): ') || 'America/Sao_Paulo';
    config.SCHEDULER_INTERVAL_MINUTES = await question('Intervalo do agendador em minutos (5): ') || '5';
    config.MAX_RETRY_ATTEMPTS = await question('Tentativas de retry (3): ') || '3';
    config.RETRY_DELAY_MS = await question('Delay entre tentativas em ms (5000): ') || '5000';

    // Gerar arquivo .env
    const envContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Arquivo .env criado com sucesso!');

    // Criar diretório de logs
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
      console.log('✅ Diretório de logs criado');
    }

    // Testar configurações
    console.log('\n🔍 Testando configurações...');
    
    // Verificar se as dependências estão instaladas
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');
    
    if (!fs.existsSync(nodeModulesPath)) {
      console.log('⚠️ Dependências não instaladas. Execute: npm install');
    } else {
      console.log('✅ Dependências encontradas');
    }

    console.log('\n🎉 Configuração concluída!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: npm install (se ainda não executou)');
    console.log('2. Configure o webhook do WhatsApp');
    console.log('3. Execute: npm run dev');
    console.log('4. Teste a conexão: GET /api/confirmation/health');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setup();
}

module.exports = setup;





