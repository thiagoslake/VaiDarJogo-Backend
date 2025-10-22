require('dotenv').config();
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

class ConectarWhatsApp {
  constructor() {
    this.qrPath = path.join(process.cwd(), 'logs', 'whatsapp-qr.txt');
  }

  async conectarWhatsApp() {
    console.log('📱 CONECTANDO WHATSAPP WEB\n');

    try {
      // 1. Verificar se arquivo QR existe
      console.log('1️⃣ Verificando QR Code...');
      if (!fs.existsSync(this.qrPath)) {
        console.log('❌ Arquivo QR não encontrado');
        console.log('💡 Solução: Inicialize o WhatsApp Web primeiro');
        return;
      }

      // 2. Ler QR Code
      const qrData = fs.readFileSync(this.qrPath, 'utf8').trim();
      console.log('✅ QR Code encontrado!');

      // 3. Exibir QR Code no terminal
      console.log('\n2️⃣ Exibindo QR Code no terminal:');
      console.log('═'.repeat(50));
      qrcode.generate(qrData, { small: true });
      console.log('═'.repeat(50));

      // 4. Instruções
      console.log('\n3️⃣ INSTRUÇÕES PARA CONECTAR:');
      console.log('   📱 1. Abra o WhatsApp no seu telefone');
      console.log('   ⚙️  2. Vá para Configurações > Dispositivos conectados');
      console.log('   ➕ 3. Toque em "Conectar um dispositivo"');
      console.log('   📷 4. Escaneie o QR Code acima');
      console.log('   ⏳ 5. Aguarde a confirmação');

      // 5. Monitorar status
      console.log('\n4️⃣ Monitorando status da conexão...');
      console.log('   Aguardando conexão... (Pressione Ctrl+C para cancelar)');

      // 6. Verificar status periodicamente
      let tentativas = 0;
      const maxTentativas = 60; // 5 minutos
      
      const verificarStatus = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/whatsapp/status');
          const status = await response.json();
          
          tentativas++;
          
          if (status.data.isReady && status.data.isAuthenticated) {
            console.log('\n🎉 SUCESSO! WhatsApp Web conectado!');
            console.log('   ✅ Sistema pronto para enviar mensagens');
            console.log('   📱 Você pode agora testar o envio de confirmações');
            return true;
          } else if (status.data.isReady && !status.data.isAuthenticated) {
            console.log(`   ⏳ Aguardando autenticação... (${tentativas}/${maxTentativas})`);
          } else {
            console.log(`   ⏳ Aguardando inicialização... (${tentativas}/${maxTentativas})`);
          }
          
          if (tentativas >= maxTentativas) {
            console.log('\n⏰ Tempo esgotado!');
            console.log('   💡 Tente novamente ou verifique se o QR Code ainda é válido');
            return false;
          }
          
          // Verificar novamente em 5 segundos
          setTimeout(verificarStatus, 5000);
          
        } catch (error) {
          console.log(`   ❌ Erro ao verificar status: ${error.message}`);
          setTimeout(verificarStatus, 5000);
        }
      };

      // Iniciar verificação
      await verificarStatus();

    } catch (error) {
      console.log('❌ Erro ao conectar WhatsApp:', error.message);
    }
  }

  async verificarStatus() {
    try {
      const response = await fetch('http://localhost:3000/api/whatsapp/status');
      const status = await response.json();
      
      console.log('📊 STATUS DO WHATSAPP WEB:');
      console.log(`   Pronto: ${status.data.isReady ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Autenticado: ${status.data.isAuthenticated ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   Tem QR Code: ${status.data.hasQRCode ? '✅ SIM' : '❌ NÃO'}`);
      
      if (status.data.isReady && status.data.isAuthenticated) {
        console.log('\n🎉 WhatsApp Web está conectado e pronto!');
        return true;
      } else {
        console.log('\n⚠️ WhatsApp Web não está conectado');
        return false;
      }
    } catch (error) {
      console.log('❌ Erro ao verificar status:', error.message);
      return false;
    }
  }
}

// Executar
async function main() {
  const conectar = new ConectarWhatsApp();
  
  // Verificar argumentos da linha de comando
  const args = process.argv.slice(2);
  
  if (args.includes('--status')) {
    await conectar.verificarStatus();
  } else {
    await conectar.conectarWhatsApp();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ConectarWhatsApp;
