require('dotenv').config();

console.log('🔍 Verificando variáveis de ambiente...\n');

console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida');
console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida');

if (process.env.SUPABASE_URL) {
  console.log('\nURL (primeiros 20 caracteres):', process.env.SUPABASE_URL.substring(0, 20) + '...');
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.log('Service Key (primeiros 20 caracteres):', process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20) + '...');
}

