#!/usr/bin/env node

require('dotenv').config();
const { spawn } = require('child_process');
const path = require('path');

class IniciadorBackend {
  constructor() {
    this.backendProcess = null;
    this.isRunning = false;
  }

  async verificarConfiguracoes() {
    console.log('🔍 Verificando configurações...\n');

    // Verificar se arquivo .env existe
    const fs = require('fs');
    const envPath = path.join(process.cwd(), '.env');
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ Arquivo .env não encontrado!');
      console.log('   Copie o arquivo env.example para .env e configure as variáveis.');
      return false;
    }

    // Verificar variáveis essenciais
    const requiredVars = [
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DEFAULT_TIMEZONE'
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Variáveis de ambiente obrigatórias não configuradas:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      return false;
    }

    console.log('✅ Configurações básicas OK');
    return true;
  }

  async verificarDependencias() {
    console.log('📦 Verificando dependências...\n');

    try {
      const { execSync } = require('child_process');
      
      // Verificar se node_modules existe
      const fs = require('fs');
      const nodeModulesPath = path.join(process.cwd(), 'node_modules');
      
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('❌ Dependências não instaladas!');
        console.log('   Execute: npm install');
        return false;
      }

      console.log('✅ Dependências instaladas');
      return true;
    } catch (error) {
      console.log('❌ Erro ao verificar dependências:', error.message);
      return false;
    }
  }

  async verificarPorta() {
    console.log('🔌 Verificando porta 3000...\n');

    try {
      const net = require('net');
      
      return new Promise((resolve) => {
        const server = net.createServer();
        
        server.listen(3000, () => {
          server.close(() => {
            console.log('✅ Porta 3000 disponível');
            resolve(true);
          });
        });
        
        server.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log('❌ Porta 3000 já está em uso!');
            console.log('   Pare o processo que está usando a porta ou mude a porta no .env');
            resolve(false);
          } else {
            console.log('❌ Erro ao verificar porta:', err.message);
            resolve(false);
          }
        });
      });
    } catch (error) {
      console.log('❌ Erro ao verificar porta:', error.message);
      return false;
    }
  }

  iniciarBackend() {
    console.log('🚀 Iniciando backend...\n');

    const backendPath = path.join(process.cwd(), 'src', 'server.js');
    
    this.backendProcess = spawn('node', [backendPath], {
      stdio: 'inherit',
      env: process.env
    });

    this.backendProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar backend:', error.message);
      this.isRunning = false;
    });

    this.backendProcess.on('exit', (code) => {
      console.log(`\n📴 Backend finalizado com código: ${code}`);
      this.isRunning = false;
    });

    this.isRunning = true;
    
    // Aguardar um pouco para verificar se iniciou corretamente
    setTimeout(() => {
      if (this.isRunning) {
        console.log('✅ Backend iniciado com sucesso!');
        console.log('📱 Acesse: http://localhost:3000');
        console.log('📊 Health check: http://localhost:3000/health');
        console.log('📱 WhatsApp QR: http://localhost:3000/api/whatsapp/qr');
        console.log('\n⏹️  Para parar o backend, pressione Ctrl+C');
      }
    }, 3000);
  }

  async executar() {
    console.log('🎯 INICIADOR DO BACKEND VaiDarJogo\n');
    console.log('==================================\n');

    try {
      // Verificações pré-inicialização
      const configOk = await this.verificarConfiguracoes();
      if (!configOk) {
        process.exit(1);
      }

      const depsOk = await this.verificarDependencias();
      if (!depsOk) {
        process.exit(1);
      }

      const portaOk = await this.verificarPorta();
      if (!portaOk) {
        process.exit(1);
      }

      console.log('\n✅ Todas as verificações passaram!\n');

      // Iniciar backend
      this.iniciarBackend();

      // Configurar handlers para shutdown graceful
      process.on('SIGINT', () => {
        console.log('\n📴 Parando backend...');
        if (this.backendProcess) {
          this.backendProcess.kill('SIGINT');
        }
        process.exit(0);
      });

      process.on('SIGTERM', () => {
        console.log('\n📴 Parando backend...');
        if (this.backendProcess) {
          this.backendProcess.kill('SIGTERM');
        }
        process.exit(0);
      });

    } catch (error) {
      console.error('❌ Erro durante inicialização:', error.message);
      process.exit(1);
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const iniciador = new IniciadorBackend();
  iniciador.executar();
}

module.exports = IniciadorBackend;
