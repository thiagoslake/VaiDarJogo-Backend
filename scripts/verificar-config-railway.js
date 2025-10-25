#!/usr/bin/env node

/**
 * Script para verificar se todas as variáveis de ambiente necessárias estão configuradas
 * para o deploy no Railway
 */

require('dotenv').config();
const logger = require('../src/utils/logger');

// Lista de variáveis obrigatórias
const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_BUSINESS_ACCOUNT_ID',
  'WHATSAPP_WEBHOOK_VERIFY_TOKEN'
];

// Lista de variáveis opcionais com valores padrão
const OPTIONAL_VARS = [
  'PORT',
  'NODE_ENV',
  'LOG_LEVEL',
  'DEFAULT_TIMEZONE',
  'CRON_TIMEZONE',
  'SCHEDULER_INTERVAL_MINUTES',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'MAX_RETRY_ATTEMPTS',
  'RETRY_DELAY_MS',
  'HEALTH_CHECK_INTERVAL_MS'
];

function checkEnvironmentVariables() {
  console.log('🔍 Verificando configurações para Railway...\n');
  
  let hasErrors = false;
  let hasWarnings = false;
  
  // Verificar variáveis obrigatórias
  console.log('📋 Variáveis Obrigatórias:');
  REQUIRED_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value || value === 'your_' + varName.toLowerCase() + '_here') {
      console.log(`❌ ${varName}: NÃO CONFIGURADA`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: Configurada`);
    }
  });
  
  console.log('\n📋 Variáveis Opcionais:');
  OPTIONAL_VARS.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      console.log(`⚠️  ${varName}: Usando valor padrão`);
      hasWarnings = true;
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  });
  
  // Verificar Node.js version
  console.log('\n📋 Versão do Node.js:');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 20) {
    console.log(`✅ Node.js ${nodeVersion}: Compatível`);
  } else {
    console.log(`❌ Node.js ${nodeVersion}: Versão desatualizada (mínimo: 20.x)`);
    hasErrors = true;
  }
  
  // Verificar se está em produção
  console.log('\n📋 Ambiente:');
  const nodeEnv = process.env.NODE_ENV;
  if (nodeEnv === 'production') {
    console.log('✅ NODE_ENV: production');
  } else {
    console.log(`⚠️  NODE_ENV: ${nodeEnv || 'development'} (recomendado: production)`);
    hasWarnings = true;
  }
  
  // Resultado final
  console.log('\n' + '='.repeat(50));
  if (hasErrors) {
    console.log('❌ ERRO: Configuração incompleta!');
    console.log('\n📝 Ações necessárias:');
    console.log('1. Configure todas as variáveis obrigatórias no Railway');
    console.log('2. Verifique o arquivo RAILWAY_DEPLOY_GUIDE.md');
    console.log('3. Faça um novo deploy após configurar');
    process.exit(1);
  } else if (hasWarnings) {
    console.log('⚠️  AVISO: Configuração com warnings');
    console.log('\n📝 Recomendações:');
    console.log('1. Configure as variáveis opcionais para melhor performance');
    console.log('2. Defina NODE_ENV=production');
    console.log('3. Faça um novo deploy');
  } else {
    console.log('✅ SUCESSO: Configuração completa!');
    console.log('\n🚀 Pronto para deploy no Railway!');
  }
  
  console.log('\n📚 Documentação:');
  console.log('- Guia completo: RAILWAY_DEPLOY_GUIDE.md');
  console.log('- Exemplo de variáveis: railway.env');
}

// Executar verificação
if (require.main === module) {
  checkEnvironmentVariables();
}

module.exports = { checkEnvironmentVariables, REQUIRED_VARS, OPTIONAL_VARS };
