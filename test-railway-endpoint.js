/**
 * Script para testar o endpoint do Railway
 */

const https = require('https');
const http = require('http');

// Substitua pela URL do seu projeto no Railway
const RAILWAY_URL = 'https://vaidarjogo-backend-production.up.railway.app';

function testEndpoint(url, path) {
  return new Promise((resolve, reject) => {
    const fullUrl = `${url}${path}`;
    console.log(`\n🔍 Testando: ${fullUrl}`);
    
    const client = fullUrl.startsWith('https') ? https : http;
    
    const req = client.get(fullUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            success: res.statusCode === 200,
            data: jsonData,
            headers: res.headers
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            success: false,
            data: data,
            error: 'Invalid JSON response',
            headers: res.headers
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message,
        code: error.code
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        success: false,
        error: 'Timeout after 10 seconds'
      });
    });
  });
}

async function testRailwayEndpoints() {
  console.log('🚀 Testando endpoints do Railway...');
  console.log(`📍 URL Base: ${RAILWAY_URL}`);
  
  const endpoints = [
    '/health',
    '/',
    '/info',
    '/test-env'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(RAILWAY_URL, endpoint);
      
      if (result.success) {
        console.log(`✅ ${endpoint}: OK (${result.status})`);
        console.log(`   Resposta: ${JSON.stringify(result.data, null, 2)}`);
      } else {
        console.log(`❌ ${endpoint}: ERRO (${result.status})`);
        console.log(`   Resposta: ${result.data}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: FALHA`);
      console.log(`   Erro: ${error.error || error.message}`);
      if (error.code) {
        console.log(`   Código: ${error.code}`);
      }
    }
  }
  
  console.log('\n🏁 Teste concluído!');
}

// Executar teste
testRailwayEndpoints().catch(console.error);

