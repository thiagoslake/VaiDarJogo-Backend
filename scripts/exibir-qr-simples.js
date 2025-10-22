require('dotenv').config();
const qrcode = require('qrcode-terminal');

async function exibirQRSimples() {
  console.log('📱 EXIBINDO QR CODE PARA CONEXÃO WHATSAPP WEB\n');

  try {
    // 1. Obter QR Code via API
    console.log('1️⃣ Obtendo QR Code...');
    const response = await fetch('http://localhost:3000/api/whatsapp/qr');
    const data = await response.json();
    
    if (!data.success || !data.data.qrCode) {
      console.log('❌ Erro ao obter QR Code:', data.message || 'QR Code não disponível');
      return;
    }
    
    console.log('✅ QR Code obtido com sucesso!');

    // 2. Exibir QR Code
    console.log('\n2️⃣ QR CODE PARA CONEXÃO:');
    console.log('═'.repeat(60));
    qrcode.generate(data.data.qrCode, { small: true });
    console.log('═'.repeat(60));

    // 3. Instruções
    console.log('\n3️⃣ INSTRUÇÕES:');
    console.log('   📱 1. Abra o WhatsApp no seu telefone');
    console.log('   ⚙️  2. Vá para Configurações > Dispositivos conectados');
    console.log('   ➕ 3. Toque em "Conectar um dispositivo"');
    console.log('   📷 4. Escaneie o QR Code acima');
    console.log('   ⏳ 5. Aguarde a confirmação');

    // 4. Verificar status após 30 segundos
    console.log('\n4️⃣ Verificando conexão em 30 segundos...');
    setTimeout(async () => {
      try {
        const statusResponse = await fetch('http://localhost:3000/api/whatsapp/status');
        const statusData = await statusResponse.json();
        
        if (statusData.data.isReady && statusData.data.isAuthenticated) {
          console.log('\n🎉 SUCESSO! WhatsApp Web conectado!');
          console.log('   ✅ Sistema pronto para enviar mensagens');
          console.log('   📱 Você pode agora testar o envio de confirmações');
        } else {
          console.log('\n⚠️ WhatsApp Web ainda não conectado');
          console.log('   💡 Tente escanear o QR Code novamente');
        }
      } catch (error) {
        console.log('\n❌ Erro ao verificar status:', error.message);
      }
    }, 30000);

  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

// Executar
exibirQRSimples().catch(console.error);
