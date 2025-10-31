/**
 * Script de diagnóstico completo para Railway
 */

const https = require('https');
const http = require('http');

// Possíveis URLs do Railway
const POSSIBLE_URLS = [
  'https://vaidarjogo-backend-production.up.railway.app',
  'https://vaidarjogo-backend-production.railway.app',
  'https://vaidarjogo-backend-production.railway.app:443',
  'https://vaidarjogo-backend-production.up.railway.app:443'
];

function testUrl(url) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔍 Testando URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Headers: ${JSON.stringify(res.headers, null, 2)}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response: ${data.substring(0, 200)}...`);
        resolve({
          url,
          status: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500)
        });
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Erro: ${error.message}`);
      resolve({
        url,
        error: error.message,
        code: error.code
      });
    });
    
    req.setTimeout(15000, () => {
      console.log(`   ⏰ Timeout`);
      req.destroy();
      resolve({
        url,
        error: 'Timeout'
      });
    });
  });
}

async function diagnoseRailway() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO RAILWAY');
  console.log('=====================================');
  
  for (const url of POSSIBLE_URLS) {
    const result = await testUrl(url);
    
    if (result.error) {
      console.log(`❌ ${url}: ${result.error}`);
    } else {
      console.log(`✅ ${url}: Status ${result.status}`);
    }
  }
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('1. Verifique se a URL do Railway está correta');
  console.log('2. Verifique os logs do Railway Dashboard');
  console.log('3. Confirme se o deploy foi bem-sucedido');
  console.log('4. Verifique se o serviço está ativo');
}

diagnoseRailway().catch(console.error);

