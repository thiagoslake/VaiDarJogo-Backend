#!/usr/bin/env node

/**
 * Script para testar se as variáveis de ambiente estão configuradas corretamente
 * para o deploy no Railway
 */

require('dotenv').config();

console.log('🔍 Testando variáveis de ambiente para Railway...\n');

// Lista de variáveis obrigatórias
const REQUIRED_VARS = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
];

let hasErrors = false;

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
const optionalVars = ['PORT', 'NODE_ENV', 'LOG_LEVEL', 'DEFAULT_TIMEZONE'];
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: Usando valor padrão`);
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

// Testar conexão com Supabase se as variáveis estão configuradas
if (!hasErrors) {
  console.log('\n🔗 Testando conexão com Supabase...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Teste simples de conexão
    supabase.from('users').select('count').limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.log(`❌ Erro na conexão: ${error.message}`);
        } else {
          console.log('✅ Conexão com Supabase bem-sucedida!');
        }
      })
      .catch(err => {
        console.log(`❌ Erro na conexão: ${err.message}`);
      });
  } catch (error) {
    console.log(`❌ Erro ao testar Supabase: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ ERRO: Configure as variáveis obrigatórias no Railway!');
  console.log('\n📝 Ações necessárias:');
  console.log('1. Acesse o Railway Dashboard');
  console.log('2. Vá para a aba Variables');
  console.log('3. Configure SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY');
  console.log('4. Consulte RAILWAY_QUICK_FIX.md para instruções detalhadas');
  process.exit(1);
} else {
  console.log('✅ SUCESSO: Todas as variáveis obrigatórias estão configuradas!');
  console.log('\n🚀 Pronto para deploy no Railway!');
}

console.log('\n📚 Documentação:');
console.log('- Correção rápida: RAILWAY_QUICK_FIX.md');
console.log('- Guia completo: RAILWAY_DEPLOY_GUIDE.md');
console.log('- Variáveis prontas: RAILWAY_VARIABLES_READY.md');

