require('dotenv').config();
const WhatsAppService = require('../src/services/WhatsAppService');

class TestarMensagemConfirmacao {
  constructor() {
    this.whatsappService = WhatsAppService;
  }

  async testarMensagem() {
    console.log('📱 TESTANDO NOVA MENSAGEM DE CONFIRMAÇÃO\n');

    try {
      // Dados de teste
      const playerData = {
        name: 'João Silva',
        phone: '5511999999999'
      };

      const gameData = {
        name: 'Pelada do Sábado',
        location: 'Campo do Flamengo'
      };

      const sessionData = {
        session_date: '2025-10-26T20:00:00' // Sábado
      };

      const sendConfig = {
        player_type: 'monthly'
      };

      console.log('📋 Dados do teste:');
      console.log(`   Jogador: ${playerData.name}`);
      console.log(`   Tipo: ${sendConfig.player_type}`);
      console.log(`   Jogo: ${gameData.name}`);
      console.log(`   Data: ${sessionData.session_date}`);
      console.log(`   Local: ${gameData.location}`);

      // Gerar mensagem
      const message = this.whatsappService.buildConfirmationMessage(
        playerData,
        gameData,
        sessionData,
        sendConfig
      );

      console.log('\n📱 MENSAGEM GERADA:');
      console.log('═'.repeat(60));
      console.log(message);
      console.log('═'.repeat(60));

      // Testar com jogador avulso
      console.log('\n🎯 TESTANDO COM JOGADOR AVULSO:');
      const sendConfigAvulso = {
        player_type: 'casual'
      };

      const messageAvulso = this.whatsappService.buildConfirmationMessage(
        playerData,
        gameData,
        sessionData,
        sendConfigAvulso
      );

      console.log('═'.repeat(60));
      console.log(messageAvulso);
      console.log('═'.repeat(60));

      // Testar envio real (se número fornecido)
      const testPhone = process.argv[2];
      if (testPhone) {
        console.log(`\n📤 ENVIANDO MENSAGEM PARA ${testPhone}...`);
        
        const result = await this.whatsappService.sendConfirmationMessage(
          { ...playerData, phone: testPhone },
          gameData,
          sessionData,
          sendConfig
        );

        if (result.success) {
          console.log('✅ Mensagem enviada com sucesso!');
          console.log(`   Message ID: ${result.messageId}`);
          console.log(`   Status: ${result.status}`);
        } else {
          console.log('❌ Erro ao enviar mensagem:', result.error);
        }
      } else {
        console.log('\n💡 Para enviar a mensagem de teste, execute:');
        console.log('   node scripts/testar-mensagem-confirmacao.js 5511999999999');
      }

      // Mostrar exemplos de respostas
      console.log('\n💬 EXEMPLOS DE RESPOSTAS VÁLIDAS:');
      console.log('✅ Confirmação: "sim", "s", "estarei", "vou", "estarei lá"');
      console.log('❌ Recusa: "não", "nao", "n", "não vou", "não poderei"');
      console.log('❓ Talvez: "talvez", "não sei", "ainda não sei", "vou ver"');

    } catch (error) {
      console.log('❌ Erro ao testar mensagem:', error.message);
    }
  }

  async testarDiferentesCenarios() {
    console.log('\n🎭 TESTANDO DIFERENTES CENÁRIOS\n');

    const cenarios = [
      {
        nome: 'Mensalista - Sábado à noite',
        playerData: { name: 'Carlos Santos', phone: '5511999999999' },
        gameData: { name: 'Pelada Noturna', location: 'Campo Iluminado' },
        sessionData: { session_date: '2025-10-26T20:00:00' },
        sendConfig: { player_type: 'monthly' }
      },
      {
        nome: 'Avulso - Domingo de manhã',
        playerData: { name: 'Maria Silva', phone: '5511888888888' },
        gameData: { name: 'Futebol Matinal', location: 'Quadra do Bairro' },
        sessionData: { session_date: '2025-10-27T09:00:00' },
        sendConfig: { player_type: 'casual' }
      },
      {
        nome: 'Mensalista - Terça-feira',
        playerData: { name: 'Pedro Costa', phone: '5511777777777' },
        gameData: { name: 'Treino Semanal', location: 'Campo Central' },
        sessionData: { session_date: '2025-10-29T19:30:00' },
        sendConfig: { player_type: 'monthly' }
      }
    ];

    for (const cenario of cenarios) {
      console.log(`\n📋 ${cenario.nome}:`);
      console.log('─'.repeat(50));
      
      const message = this.whatsappService.buildConfirmationMessage(
        cenario.playerData,
        cenario.gameData,
        cenario.sessionData,
        cenario.sendConfig
      );
      
      console.log(message);
      console.log('─'.repeat(50));
    }
  }
}

// Executar
async function main() {
  const testar = new TestarMensagemConfirmacao();
  
  const args = process.argv.slice(2);
  
  if (args.includes('--cenarios')) {
    await testar.testarDiferentesCenarios();
  } else {
    await testar.testarMensagem();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = TestarMensagemConfirmacao;

