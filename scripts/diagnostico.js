#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class DiagnosticoMotor {
  constructor() {
    this.baseURL = 'http://localhost:3000';
    this.problemas = [];
    this.solucoes = [];
  }

  async executarDiagnostico() {
    console.log('🔍 DIAGNÓSTICO DO MOTOR DE CONFIRMAÇÕES\n');
    console.log('=====================================\n');

    try {
      // 1. Verificar se backend está rodando
      await this.verificarBackend();

      // 2. Verificar WhatsApp Web
      await this.verificarWhatsApp();

      // 3. Verificar agendador
      await this.verificarAgendador();

      // 4. Verificar configurações
      await this.verificarConfiguracoes();

      // 5. Exibir resumo
      this.exibirResumo();

    } catch (error) {
      console.error('❌ Erro durante diagnóstico:', error.message);
    } finally {
      rl.close();
    }
  }

  async verificarBackend() {
    console.log('1️⃣ Verificando Backend...');
    
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 5000 });
      
      if (response.status === 200) {
        console.log('✅ Backend está rodando');
        console.log(`   Status: ${response.data.message}`);
        console.log(`   Uptime: ${response.data.uptime}s\n`);
      }
    } catch (error) {
      console.log('❌ Backend não está rodando');
      this.problemas.push('Backend não está ativo na porta 3000');
      this.solucoes.push('Execute: npm run dev');
      console.log('   Solução: Iniciar o backend\n');
    }
  }

  async verificarWhatsApp() {
    console.log('2️⃣ Verificando WhatsApp Web...');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/whatsapp/status`, { timeout: 5000 });
      
      if (response.data.success) {
        const status = response.data.data;
        
        if (status.isReady) {
          console.log('✅ WhatsApp Web está conectado e pronto');
          console.log(`   Autenticado: ${status.isAuthenticated}`);
          console.log(`   Tem QR Code: ${status.hasQRCode}\n`);
        } else {
          console.log('⚠️ WhatsApp Web não está pronto');
          this.problemas.push('WhatsApp Web não está conectado');
          this.solucoes.push('Escanear QR Code com WhatsApp');
          console.log('   Solução: Escanear QR Code\n');
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar WhatsApp Web');
      this.problemas.push('Erro na conexão com WhatsApp Web');
      this.solucoes.push('Verificar configuração do WhatsApp Web');
      console.log('   Solução: Verificar configuração\n');
    }
  }

  async verificarAgendador() {
    console.log('3️⃣ Verificando Agendador...');
    
    try {
      const response = await axios.get(`${this.baseURL}/api/confirmation/scheduler/status`, { timeout: 5000 });
      
      if (response.data.success) {
        const status = response.data.data.status;
        
        if (status.isRunning) {
          console.log('✅ Agendador está ativo');
          console.log(`   Intervalo: ${status.intervalMinutes} minutos`);
          console.log(`   Timezone: ${status.timezone}`);
          console.log(`   Tarefas agendadas: ${status.taskCount}\n`);
        } else {
          console.log('❌ Agendador não está rodando');
          this.problemas.push('Agendador não está ativo');
          this.solucoes.push('Iniciar agendador via API');
          console.log('   Solução: Iniciar agendador\n');
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar agendador');
      this.problemas.push('Erro na verificação do agendador');
      this.solucoes.push('Verificar configuração do agendador');
      console.log('   Solução: Verificar configuração\n');
    }
  }

  async verificarConfiguracoes() {
    console.log('4️⃣ Verificando Configurações...');
    
    try {
      // Verificar se há jogos ativos com configuração
      const response = await axios.get(`${this.baseURL}/api/confirmation/health`, { timeout: 5000 });
      
      if (response.data.success) {
        console.log('✅ Configurações acessíveis');
        console.log('   Sistema de confirmação funcionando\n');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar configurações');
      this.problemas.push('Erro na verificação de configurações');
      this.solucoes.push('Verificar conexão com banco de dados');
      console.log('   Solução: Verificar banco de dados\n');
    }
  }

  exibirResumo() {
    console.log('📊 RESUMO DO DIAGNÓSTICO');
    console.log('========================\n');

    if (this.problemas.length === 0) {
      console.log('✅ Todos os sistemas estão funcionando corretamente!');
      console.log('\n🔧 Próximos passos:');
      console.log('1. Verificar se há jogos com configuração de confirmação');
      console.log('2. Verificar se os horários de envio foram atingidos');
      console.log('3. Verificar logs para mensagens enviadas');
      console.log('4. Testar envio manual se necessário');
    } else {
      console.log('❌ Problemas encontrados:');
      this.problemas.forEach((problema, index) => {
        console.log(`${index + 1}. ${problema}`);
      });

      console.log('\n🔧 Soluções:');
      this.solucoes.forEach((solucao, index) => {
        console.log(`${index + 1}. ${solucao}`);
      });
    }

    console.log('\n🧪 Testes Recomendados:');
    console.log('1. Testar envio manual: curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID');
    console.log('2. Testar WhatsApp: curl -X POST http://localhost:3000/api/whatsapp/test -d \'{"phone":"5511999999999","message":"Teste"}\'');
    console.log('3. Verificar logs: tail -f logs/combined.log');
  }

  async testarEnvioManual() {
    console.log('\n🧪 TESTE DE ENVIO MANUAL');
    console.log('========================\n');

    try {
      const gameId = await question('Digite o ID do jogo para teste: ');
      
      if (gameId) {
        console.log(`\nEnviando confirmações para o jogo ${gameId}...`);
        
        const response = await axios.post(`${this.baseURL}/api/confirmation/process/${gameId}`, {}, { timeout: 30000 });
        
        if (response.data.success) {
          console.log('✅ Envio manual executado com sucesso!');
          console.log(`   Processados: ${response.data.data.processed}`);
          console.log(`   Enviados: ${response.data.data.sent}`);
          console.log(`   Erros: ${response.data.data.errors}`);
        } else {
          console.log('❌ Erro no envio manual:', response.data.message);
        }
      }
    } catch (error) {
      console.log('❌ Erro no teste de envio:', error.message);
    }
  }

  async testarWhatsApp() {
    console.log('\n🧪 TESTE DO WHATSAPP');
    console.log('===================\n');

    try {
      const phone = await question('Digite o número para teste (formato: 5511999999999): ');
      const message = await question('Digite a mensagem de teste: ');
      
      if (phone && message) {
        console.log(`\nEnviando mensagem para ${phone}...`);
        
        const response = await axios.post(`${this.baseURL}/api/whatsapp/test`, {
          phone: phone,
          message: message
        }, { timeout: 30000 });
        
        if (response.data.success) {
          console.log('✅ Mensagem enviada com sucesso!');
          console.log(`   Message ID: ${response.data.data.messageId}`);
        } else {
          console.log('❌ Erro no envio:', response.data.message);
        }
      }
    } catch (error) {
      console.log('❌ Erro no teste do WhatsApp:', error.message);
    }
  }
}

// Executar diagnóstico se chamado diretamente
if (require.main === module) {
  const diagnostico = new DiagnosticoMotor();
  
  diagnostico.executarDiagnostico().then(async () => {
    const executarTestes = await question('\nDeseja executar testes manuais? (y/N): ');
    
    if (executarTestes.toLowerCase() === 'y') {
      const tipoTeste = await question('Tipo de teste (1=Envio Manual, 2=WhatsApp, 3=Ambos): ');
      
      if (tipoTeste === '1' || tipoTeste === '3') {
        await diagnostico.testarEnvioManual();
      }
      
      if (tipoTeste === '2' || tipoTeste === '3') {
        await diagnostico.testarWhatsApp();
      }
    }
    
    console.log('\n🎉 Diagnóstico concluído!');
    process.exit(0);
  });
}

module.exports = DiagnosticoMotor;







