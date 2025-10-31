require('dotenv').config();
const { execSync } = require('child_process');

class ConfigurarRepositorioRemoto {
  constructor() {
    this.repoName = 'VaiDarJogo_Backend';
  }

  async executar() {
    console.log('🔧 CONFIGURANDO REPOSITÓRIO REMOTO\n');
    console.log('═'.repeat(60));
    
    try {
      // Verificar se já existe remote
      console.log('1️⃣ Verificando configuração atual...');
      try {
        const remotes = execSync('git remote -v', { encoding: 'utf8' });
        console.log('📋 Remotes atuais:');
        console.log(remotes);
      } catch (error) {
        console.log('ℹ️ Nenhum remote configurado ainda.');
      }
      
      console.log('\n2️⃣ Para configurar o repositório remoto, execute:\n');
      
      console.log('📝 COMANDOS PARA EXECUTAR:');
      console.log('═'.repeat(40));
      console.log('# Substitua SEU-USUARIO pelo seu nome de usuário do GitHub');
      console.log('git remote add origin https://github.com/SEU-USUARIO/VaiDarJogo_Backend.git');
      console.log('git branch -M main');
      console.log('git push -u origin main');
      console.log('═'.repeat(40));
      
      console.log('\n3️⃣ Verificar configuração:');
      console.log('git remote -v');
      console.log('git status');
      
      console.log('\n4️⃣ Se precisar alterar a URL do remote:');
      console.log('git remote set-url origin https://github.com/SEU-USUARIO/VaiDarJogo_Backend.git');
      
      this.mostrarTroubleshooting();
      
    } catch (error) {
      console.error('❌ Erro:', error.message);
    }
  }

  mostrarTroubleshooting() {
    console.log('\n🚨 TROUBLESHOOTING:\n');
    
    console.log('❌ Erro: "remote origin already exists"');
    console.log('   Solução: git remote remove origin');
    console.log('   Depois: git remote add origin https://github.com/SEU-USUARIO/VaiDarJogo_Backend.git\n');
    
    console.log('❌ Erro: "Authentication failed"');
    console.log('   Solução: Configure seu token de acesso pessoal');
    console.log('   Ou use: git remote set-url origin https://SEU-TOKEN@github.com/SEU-USUARIO/VaiDarJogo_Backend.git\n');
    
    console.log('❌ Erro: "Repository not found"');
    console.log('   Solução: Verifique se o repositório foi criado no GitHub');
    console.log('   Verifique se o nome do usuário está correto\n');
    
    console.log('❌ Erro: "Permission denied"');
    console.log('   Solução: Verifique suas permissões no repositório');
    console.log('   Certifique-se de que você é o proprietário ou tem acesso de escrita\n');
  }

  mostrarStatusAtual() {
    console.log('\n📊 STATUS ATUAL DO REPOSITÓRIO:\n');
    
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      const lastCommit = execSync('git log -1 --oneline', { encoding: 'utf8' }).trim();
      
      console.log(`🌿 Branch atual: ${branch}`);
      console.log(`📝 Último commit: ${lastCommit}`);
      
      if (status.trim()) {
        console.log('📋 Arquivos modificados:');
        console.log(status);
      } else {
        console.log('✅ Working directory limpo');
      }
      
    } catch (error) {
      console.log('❌ Erro ao verificar status:', error.message);
    }
  }
}

// Executar
async function main() {
  const configurador = new ConfigurarRepositorioRemoto();
  await configurador.executar();
  configurador.mostrarStatusAtual();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ConfigurarRepositorioRemoto;




