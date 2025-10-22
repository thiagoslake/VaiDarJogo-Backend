#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

class EnvioManual {
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
        
        if (status.isReady) {
          console.log('✅ WhatsApp Web está conectado e pronto!');
          console.log(`   Autenticado: ${status.isAuthenticated}\n`);
          return true;
        } else {
          console.log('⚠️ WhatsApp Web não está pronto');
          console.log('   Acesse: http://localhost:3000/api/whatsapp/qr para escanear o QR Code\n');
          return false;
        }
      }
    } catch (error) {
      console.log('❌ Erro ao verificar WhatsApp Web:', error.message);
      return false;
    }
  }

  async listarJogos() {
    try {
      console.log('📋 Buscando jogos disponíveis...\n');
      
      // Como não temos endpoint específico, vamos usar o health check
      // e assumir que temos o jogo que vimos nos logs
      const jogos = [
        {
          id: 'ec0dbd33-11d3-4338-902c-26a4ea3275e4',
          name: 'Jogo Principal',
          description: 'Jogo com configuração de confirmação ativa'
        }
      ];

      console.log('🎮 Jogos disponíveis:');
      jogos.forEach((jogo, index) => {
        console.log(`   ${index + 1}. ${jogo.name} (ID: ${jogo.id})`);
        console.log(`      ${jogo.description}\n`);
      });

      return jogos;
    } catch (error) {
      console.log('❌ Erro ao listar jogos:', error.message);
      return [];
    }
  }

  async enviarConfirmacaoJogo(gameId) {
    try {
      console.log(`🚀 Enviando confirmações para o jogo ${gameId}...\n`);
      
      const response = await axios.post(`${this.baseURL}/api/confirmation/process/${gameId}`, {}, { 
        timeout: 30000 
      });
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('✅ Envio executado com sucesso!');
        console.log(`   📊 Processados: ${data.processed}`);
        console.log(`   📤 Enviados: ${data.sent}`);
        console.log(`   ❌ Erros: ${data.errors}`);
        
        if (data.skipped) {
          console.log('   ⏭️ Verificação pulada (WhatsApp não pronto)');
        }
        
        return true;
      } else {
        console.log('❌ Erro no envio:', response.data.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Erro ao enviar confirmação:', error.message);
      if (error.response) {
        console.log('   Detalhes:', error.response.data);
      }
      return false;
    }
  }

  async enviarConfirmacaoManual() {
    try {
      console.log('📱 Enviando confirmação manual...\n');
      
      const gameId = await question('Digite o ID do jogo: ');
      const playerId = await question('Digite o ID do jogador: ');
      const sessionDate = await question('Digite a data da sessão (YYYY-MM-DD): ');
      
      if (!gameId || !playerId || !sessionDate) {
        console.log('❌ Todos os campos são obrigatórios!');
        return false;
      }

      const response = await axios.post(`${this.baseURL}/api/confirmation/manual`, {
        gameId: gameId,
        playerId: playerId,
        sessionDate: sessionDate
      }, { timeout: 30000 });
      
      if (response.data.success) {
        console.log('✅ Confirmação manual enviada com sucesso!');
        console.log(`   Message ID: ${response.data.data.messageId}`);
        return true;
      } else {
        console.log('❌ Erro no envio manual:', response.data.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Erro ao enviar confirmação manual:', error.message);
      return false;
    }
  }

  async testarWhatsApp() {
    try {
      console.log('🧪 Testando envio via WhatsApp...\n');
      
      const phone = await question('Digite o número para teste (formato: 5511999999999): ');
      const message = await question('Digite a mensagem de teste: ');
      
      if (!phone || !message) {
        console.log('❌ Número e mensagem são obrigatórios!');
        return false;
      }

      const response = await axios.post(`${this.baseURL}/api/whatsapp/test`, {
        phone: phone,
        message: message
      }, { timeout: 30000 });
      
      if (response.data.success) {
        console.log('✅ Mensagem de teste enviada com sucesso!');
        console.log(`   Message ID: ${response.data.data.messageId}`);
        return true;
      } else {
        console.log('❌ Erro no teste:', response.data.message);
        return false;
      }
    } catch (error) {
      console.log('❌ Erro no teste do WhatsApp:', error.message);
      return false;
    }
  }

  async executar() {
    console.log('🎯 ENVIO MANUAL DE CONFIRMAÇÕES\n');
    console.log('================================\n');

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
        console.log('⚠️ Continuando mesmo com WhatsApp não pronto...\n');
      }

      // Listar jogos
      const jogos = await this.listarJogos();

      // Menu de opções
      console.log('📋 OPÇÕES DE ENVIO:\n');
      console.log('1. Enviar confirmações para um jogo (automático)');
      console.log('2. Enviar confirmação manual para jogador específico');
      console.log('3. Testar envio via WhatsApp');
      console.log('4. Sair\n');

      const opcao = await question('Escolha uma opção (1-4): ');

      switch (opcao) {
        case '1':
          if (jogos.length > 0) {
            const jogoIndex = await question(`Escolha o jogo (1-${jogos.length}): `);
            const jogoEscolhido = jogos[parseInt(jogoIndex) - 1];
            
            if (jogoEscolhido) {
              await this.enviarConfirmacaoJogo(jogoEscolhido.id);
            } else {
              console.log('❌ Jogo inválido!');
            }
          } else {
            console.log('❌ Nenhum jogo disponível!');
          }
          break;

        case '2':
          await this.enviarConfirmacaoManual();
          break;

        case '3':
          await this.testarWhatsApp();
          break;

        case '4':
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
  const envio = new EnvioManual();
  envio.executar();
}

module.exports = EnvioManual;
