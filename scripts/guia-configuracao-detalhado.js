require('dotenv').config();

class GuiaConfiguracaoDetalhado {
  constructor() {
    this.passos = [
      {
        titulo: "1. Criar Conta no Facebook Business Manager",
        descricao: "Primeiro passo para acessar o WhatsApp Business API",
        url: "https://business.facebook.com/",
        acoes: [
          "Acesse o link acima",
          "Clique em 'Criar Conta'",
          "Preencha os dados da sua empresa",
          "Verifique seu email"
        ]
      },
      {
        titulo: "2. Configurar WhatsApp Business Account",
        descricao: "Criar a conta específica para WhatsApp Business",
        url: "https://business.facebook.com/settings/accounts",
        acoes: [
          "No Business Manager, vá em 'Configurações' → 'Contas'",
          "Clique em 'Adicionar' → 'WhatsApp Business Account'",
          "Preencha: Nome da conta, Categoria, Descrição",
          "Salve as configurações"
        ]
      },
      {
        titulo: "3. Adicionar Número de Telefone",
        descricao: "Verificar seu número comercial no WhatsApp Business",
        url: null,
        acoes: [
          "Na sua WhatsApp Business Account, clique em 'Adicionar número'",
          "Insira seu número comercial (não pode ser pessoal)",
          "Escolha verificação por SMS ou chamada",
          "Digite o código de verificação recebido"
        ]
      },
      {
        titulo: "4. Criar App no Facebook Developer",
        descricao: "Criar aplicação para acessar a API",
        url: "https://developers.facebook.com/",
        acoes: [
          "Acesse o link acima",
          "Clique em 'Meus Apps' → 'Criar App'",
          "Escolha 'Business' como tipo",
          "Preencha: Nome (VaiDarJogo WhatsApp), Email, Categoria"
        ]
      },
      {
        titulo: "5. Adicionar Produto WhatsApp",
        descricao: "Configurar o produto WhatsApp no seu app",
        url: null,
        acoes: [
          "No seu app, clique em 'Adicionar Produto'",
          "Encontre 'WhatsApp' e clique em 'Configurar'",
          "Selecione sua WhatsApp Business Account",
          "Adicione o número de telefone verificado"
        ]
      },
      {
        titulo: "6. Obter Credenciais",
        descricao: "Coletar as informações necessárias para configuração",
        url: null,
        acoes: [
          "No painel do WhatsApp, vá em 'API Setup'",
          "Copie o 'Temporary access token' (válido 24h)",
          "Copie o 'Phone number ID'",
          "Na URL, copie o 'Business Account ID' (após /business/)",
          "Crie um 'Webhook Verify Token' personalizado"
        ]
      },
      {
        titulo: "7. Configurar Webhook",
        descricao: "Configurar o webhook para receber mensagens",
        url: null,
        acoes: [
          "No painel, vá em 'Configuration' → 'Webhook'",
          "Clique em 'Configure'",
          "Callback URL: https://seu-dominio.com/api/whatsapp/webhook",
          "Verify Token: use o token que você criou",
          "Selecione campos: messages, message_deliveries, message_reads",
          "Clique em 'Verify and Save'"
        ]
      },
      {
        titulo: "8. Configurar Variáveis de Ambiente",
        descricao: "Adicionar as credenciais ao arquivo .env",
        url: null,
        acoes: [
          "Edite o arquivo .env no projeto",
          "Adicione as variáveis com suas credenciais",
          "Salve o arquivo",
          "Reinicie o servidor"
        ]
      }
    ];
  }

  async executar() {
    console.log('🚀 GUIA DETALHADO - CONFIGURAÇÃO WHATSAPP BUSINESS API\n');
    console.log('═'.repeat(80));
    
    // Verificar configurações atuais
    this.verificarConfiguracoesAtuais();
    
    console.log('\n📋 PASSO A PASSO DETALHADO:\n');
    
    for (let i = 0; i < this.passos.length; i++) {
      const passo = this.passos[i];
      console.log(`\n${passo.titulo}`);
      console.log('─'.repeat(60));
      console.log(`📝 ${passo.descricao}\n`);
      
      if (passo.url) {
        console.log(`🔗 Link: ${passo.url}\n`);
      }
      
      console.log('📌 Ações necessárias:');
      passo.acoes.forEach((acao, index) => {
        console.log(`   ${index + 1}. ${acao}`);
      });
      
      if (i < this.passos.length - 1) {
        console.log('\n⏳ Pressione Enter para continuar para o próximo passo...');
        // Em um ambiente real, você usaria readline para pausar
        console.log('   (Execute este script novamente para continuar)');
      }
    }
    
    this.mostrarConfiguracaoFinal();
    this.mostrarComandosTeste();
  }

  verificarConfiguracoesAtuais() {
    console.log('🔍 VERIFICANDO CONFIGURAÇÕES ATUAIS:\n');
    
    const configs = [
      { nome: 'WHATSAPP_ACCESS_TOKEN', valor: process.env.WHATSAPP_ACCESS_TOKEN },
      { nome: 'WHATSAPP_PHONE_NUMBER_ID', valor: process.env.WHATSAPP_PHONE_NUMBER_ID },
      { nome: 'WHATSAPP_BUSINESS_ACCOUNT_ID', valor: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID },
      { nome: 'WHATSAPP_WEBHOOK_VERIFY_TOKEN', valor: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN }
    ];
    
    configs.forEach(config => {
      const status = config.valor ? '✅ Configurado' : '❌ Não configurado';
      console.log(`${status} ${config.nome}`);
    });
  }

  mostrarConfiguracaoFinal() {
    console.log('\n\n🔧 CONFIGURAÇÃO FINAL DO ARQUIVO .env:\n');
    console.log('═'.repeat(60));
    console.log('# WhatsApp Business API Configuration');
    console.log('WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui');
    console.log('WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui');
    console.log('WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id_aqui');
    console.log('WHATSAPP_WEBHOOK_VERIFY_TOKEN=vaidarjogo_webhook_2024');
    console.log('WHATSAPP_API_VERSION=v18.0');
    console.log('═'.repeat(60));
  }

  mostrarComandosTeste() {
    console.log('\n\n🧪 COMANDOS PARA TESTAR:\n');
    console.log('1. Verificar status:');
    console.log('   curl http://localhost:3000/api/whatsapp/status\n');
    
    console.log('2. Testar conexão:');
    console.log('   node scripts/testar-whatsapp-business.js\n');
    
    console.log('3. Enviar mensagem de teste:');
    console.log('   node scripts/testar-whatsapp-business.js --enviar 5511999999999\n');
    
    console.log('4. Testar mensagem de confirmação:');
    console.log('   node scripts/testar-mensagem-confirmacao.js 5511999999999\n');
  }

  mostrarTroubleshooting() {
    console.log('\n\n🚨 PROBLEMAS COMUNS E SOLUÇÕES:\n');
    
    const problemas = [
      {
        problema: "Token expirado",
        solucao: "Renove o token temporário ou configure token permanente"
      },
      {
        problema: "Webhook não verificado",
        solucao: "Verifique se o servidor está acessível e o token está correto"
      },
      {
        problema: "Número não verificado",
        solucao: "Verifique se o número está ativo e foi verificado corretamente"
      },
      {
        problema: "Rate limit excedido",
        solucao: "Implemente delay entre envios ou aguarde o reset"
      }
    ];
    
    problemas.forEach((item, index) => {
      console.log(`${index + 1}. ${item.problema}`);
      console.log(`   Solução: ${item.solucao}\n`);
    });
  }
}

// Executar
async function main() {
  const guia = new GuiaConfiguracaoDetalhado();
  await guia.executar();
  guia.mostrarTroubleshooting();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = GuiaConfiguracaoDetalhado;

