require('dotenv').config();

class CriarRepositorioGitHub {
  constructor() {
    this.repoName = 'VaiDarJogo_Backend';
    this.description = 'Backend API para o sistema VaiDarJogo - plataforma de gerenciamento de jogos e confirmações de presença via WhatsApp Business API';
  }

  async executar() {
    console.log('🚀 CRIANDO REPOSITÓRIO NO GITHUB\n');
    console.log('═'.repeat(60));
    
    console.log('📋 INFORMAÇÕES DO REPOSITÓRIO:');
    console.log(`   Nome: ${this.repoName}`);
    console.log(`   Descrição: ${this.description}`);
    console.log(`   Visibilidade: Público`);
    console.log(`   Linguagem: JavaScript/Node.js`);
    
    console.log('\n🔗 PASSOS PARA CRIAR O REPOSITÓRIO:\n');
    
    console.log('1️⃣ Acesse o GitHub:');
    console.log('   https://github.com/new\n');
    
    console.log('2️⃣ Preencha os dados:');
    console.log(`   Repository name: ${this.repoName}`);
    console.log(`   Description: ${this.description}`);
    console.log('   ✅ Public (recomendado)');
    console.log('   ❌ Add a README file (já temos um)');
    console.log('   ❌ Add .gitignore (já temos um)');
    console.log('   ❌ Choose a license (opcional)\n');
    
    console.log('3️⃣ Clique em "Create repository"\n');
    
    console.log('4️⃣ Após criar, execute os comandos:\n');
    console.log('   git remote add origin https://github.com/SEU-USUARIO/VaiDarJogo_Backend.git');
    console.log('   git branch -M main');
    console.log('   git push -u origin main\n');
    
    console.log('5️⃣ Para deletar o repositório anterior "VaiDarJogo-Motor":\n');
    console.log('   - Acesse: https://github.com/SEU-USUARIO/VaiDarJogo-Motor');
    console.log('   - Vá em Settings (configurações)');
    console.log('   - Role até o final da página');
    console.log('   - Clique em "Delete this repository"');
    console.log('   - Digite o nome do repositório para confirmar\n');
    
    this.mostrarComandosCompletos();
    this.mostrarEstruturaProjeto();
  }

  mostrarComandosCompletos() {
    console.log('📝 COMANDOS COMPLETOS PARA EXECUTAR:\n');
    console.log('═'.repeat(60));
    console.log('# 1. Adicionar remote origin');
    console.log('git remote add origin https://github.com/SEU-USUARIO/VaiDarJogo_Backend.git\n');
    
    console.log('# 2. Renomear branch para main');
    console.log('git branch -M main\n');
    
    console.log('# 3. Fazer push inicial');
    console.log('git push -u origin main\n');
    
    console.log('# 4. Verificar status');
    console.log('git remote -v\n');
    
    console.log('═'.repeat(60));
  }

  mostrarEstruturaProjeto() {
    console.log('\n📁 ESTRUTURA DO PROJETO CRIADO:\n');
    console.log('VaiDarJogo_Backend/');
    console.log('├── 📄 README.md                    # Documentação principal');
    console.log('├── 📄 .gitignore                   # Arquivos ignorados pelo Git');
    console.log('├── 📄 package.json                 # Dependências do projeto');
    console.log('├── 📄 env.example                  # Exemplo de variáveis de ambiente');
    console.log('├── 📁 src/                         # Código fonte');
    console.log('│   ├── 📁 config/                  # Configurações');
    console.log('│   ├── 📁 controllers/             # Controladores da API');
    console.log('│   ├── 📁 models/                  # Modelos de dados');
    console.log('│   ├── 📁 routes/                  # Rotas da API');
    console.log('│   ├── 📁 services/                # Lógica de negócio');
    console.log('│   ├── 📁 utils/                   # Utilitários');
    console.log('│   └── 📄 server.js                # Servidor principal');
    console.log('├── 📁 scripts/                     # Scripts de ajuda');
    console.log('├── 📁 docs/                        # Documentação');
    console.log('└── 📁 backup-whatsapp-web/         # Backup da configuração anterior');
  }

  mostrarProximosPassos() {
    console.log('\n🎯 PRÓXIMOS PASSOS:\n');
    console.log('1. ✅ Criar repositório no GitHub');
    console.log('2. ✅ Fazer push do código');
    console.log('3. ✅ Deletar repositório anterior');
    console.log('4. 🔄 Configurar WhatsApp Business API');
    console.log('5. 🔄 Testar integração');
    console.log('6. 🔄 Configurar CI/CD (opcional)');
    console.log('7. 🔄 Configurar deploy (opcional)');
  }
}

// Executar
async function main() {
  const criador = new CriarRepositorioGitHub();
  await criador.executar();
  criador.mostrarProximosPassos();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CriarRepositorioGitHub;

