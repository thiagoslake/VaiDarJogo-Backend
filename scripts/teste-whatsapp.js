#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class TesteWhatsApp {
  constructor() {
    this.baseURL = 'http://localhost:3000';
  }

  async verificarBackend() {
    try {
      console.log('🔍 Verificando se o backend está rodando...\n');
      
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ Backend está rodando!');
        console.log(`   Status: ${response.data.message}`);
        console.log(`   Uptime: ${response.data.uptime}s\n`);
        return true;
      }
    } catch (error) {
      console.log('❌ Backend não está rodando!');
      console.log('   Inicie o backend com: npm run dev\n');
      return false;
    }
  }

  async verificarWhatsApp() {
    try {
      console.log('📱 Verificando WhatsApp Web...\n');
      
      const response = await axios.get(`${this.baseURL}/api/whatsapp/status`, { timeout: 5000 });
      
      if (response.data.success) {
        const status = response.data.data;
        
        console.log('📊 Status do WhatsApp Web:');
        console.log(`   ✅ Conectado: ${status.isReady ? 'Sim' : 'Não'}`);
        console.log(`   🔐 Autenticado: ${status.isAuthenticated ? 'Sim' : 'Não'}`);
        console.log(`   📱 Tem QR Code: ${status.hasQRCode ? 'Sim' : 'Não'}\n`);
        
        if (!status.isReady) {
          console.log('⚠️ WhatsApp Web não está pronto!');
          console.log('   Acesse: http://localhost:3000/api/whatsapp/qr para escanear o QR Code\n');
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.log('❌ Erro ao verificar WhatsApp Web:', error.message);
      return false;
    }
  }

  async testarEnvio() {
    try {
      console.log('🧪 TESTE DE ENVIO VIA WHATSAPP\n');
      console.log('==============================\n');

      const phone = await question('Digite o número para teste (formato: 5511999999999): ');
      const message = await question('Digite a mensagem de teste: ');
      
      if (!phone || !message) {
        console.log('❌ Número e mensagem são obrigatórios!');
        return false;
      }

      console.log(`\n📤 Enviando mensagem para ${phone}...`);
      console.log(`📝 Mensagem: "${message}"\n`);

      const startTime = Date.now();
      
      const response = await axios.post(`${this.baseURL}/api/whatsapp/test`, {
        phone: phone,
        message: message
      }, { timeout: 30000 });
      
      const duration = Date.now() - startTime;

      if (response.data.success) {
        console.log('✅ Mensagem enviada com sucesso!');
        console.log(`   📱 Message ID: ${response.data.data.messageId}`);
        console.log(`   ⏱️ Tempo de envio: ${duration}ms`);
        console.log(`   📊 Status: ${response.data.data.status}\n`);
        
        console.log('💡 Dica: Verifique se a mensagem chegou no WhatsApp!');
        return true;
      } else {
        console.log('❌ Erro no envio:', response.data.message);
        if (response.data.error) {
          console.log(`   Detalhes: ${response.data.error}`);
        }
        return false;
      }
    } catch (error) {
      console.log('❌ Erro ao enviar mensagem:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return false;
    }
  }

  async testarConfirmacaoJogo() {
    try {
      console.log('🎮 TESTE DE CONFIRMAÇÃO DE JOGO\n');
      console.log('===============================\n');

      const gameId = 'ec0dbd33-11d3-4338-902c-26a4ea3275e4';
      
      console.log(`📤 Enviando confirmações para o jogo ${gameId}...\n`);

      const startTime = Date.now();
      
      const response = await axios.post(`${this.baseURL}/api/confirmation/process/${gameId}`, {}, { 
        timeout: 30000 
      });
      
      const duration = Date.now() - startTime;

      if (response.data.success) {
        const data = response.data.data;
        console.log('✅ Processamento executado com sucesso!');
        console.log(`   📊 Processados: ${data.processed}`);
        console.log(`   📤 Enviados: ${data.sent}`);
        console.log(`   ❌ Erros: ${data.errors}`);
        console.log(`   ⏱️ Tempo total: ${duration}ms\n`);
        
        if (data.skipped) {
          console.log('   ⏭️ Verificação pulada (WhatsApp não pronto)');
        }
        
        return true;
      } else {
        console.log('❌ Erro no processamento:', response.data.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Erro ao processar confirmações:', error.message);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Resposta: ${JSON.stringify(error.response.data, null, 2)}`);
      }
      return false;
    }
  }

  async executar() {
    console.log('🎯 TESTE DO WHATSAPP WEB\n');
    console.log('========================\n');

    try {
      // Verificar se backend está rodando
      const backendOk = await this.verificarBackend();
      if (!backendOk) {
        rl.close();
        return;
      }

      // Verificar WhatsApp
      const whatsappOk = await this.verificarWhatsApp();
      if (!whatsappOk) {
        console.log('⚠️ WhatsApp não está pronto, mas você pode continuar com os testes...\n');
      }

      // Menu de opções
      console.log('📋 OPÇÕES DE TESTE:\n');
      console.log('1. Testar envio de mensagem simples');
      console.log('2. Testar confirmação de jogo (automático)');
      console.log('3. Sair\n');

      const opcao = await question('Escolha uma opção (1-3): ');

      switch (opcao) {
        case '1':
          await this.testarEnvio();
          break;

        case '2':
          await this.testarConfirmacaoJogo();
          break;

        case '3':
          console.log('👋 Saindo...');
          break;

        default:
          console.log('❌ Opção inválida!');
      }

    } catch (error) {
      console.error('❌ Erro durante execução:', error.message);
    } finally {
      rl.close();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const teste = new TesteWhatsApp();
  teste.executar();
}

module.exports = TesteWhatsApp;
