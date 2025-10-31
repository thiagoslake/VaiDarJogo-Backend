require('dotenv').config();
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

function exibirQRDireto() {
  console.log('📱 QR CODE PARA CONEXÃO WHATSAPP WEB\n');

  try {
    // 1. Ler QR Code do arquivo
    const qrPath = path.join(process.cwd(), 'logs', 'whatsapp-qr.txt');
    
    if (!fs.existsSync(qrPath)) {
      console.log('❌ Arquivo QR não encontrado');
      console.log('💡 Solução: Inicialize o WhatsApp Web primeiro');
      return;
    }

    const qrData = fs.readFileSync(qrPath, 'utf8').trim();
    console.log('✅ QR Code carregado do arquivo!');

    // 2. Exibir QR Code
    console.log('\n📱 QR CODE PARA CONEXÃO:');
    console.log('═'.repeat(60));
    qrcode.generate(qrData, { small: true });
    console.log('═'.repeat(60));

    // 3. Instruções
    console.log('\n📋 INSTRUÇÕES:');
    console.log('   📱 1. Abra o WhatsApp no seu telefone');
    console.log('   ⚙️  2. Vá para Configurações > Dispositivos conectados');
    console.log('   ➕ 3. Toque em "Conectar um dispositivo"');
    console.log('   📷 4. Escaneie o QR Code acima');
    console.log('   ⏳ 5. Aguarde a confirmação');

    console.log('\n⏳ Aguarde alguns segundos após escanear...');
    console.log('   O sistema verificará automaticamente a conexão');

  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

// Executar
exibirQRDireto();




