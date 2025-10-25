# Guia de Deploy - VaiDarJogo Backend

Este guia explica como fazer o deploy do backend em diferentes ambientes.

## 🚀 Deploy Local (Desenvolvimento)

### 1. Configuração Inicial
```bash
# Clonar repositório
git clone <repository-url>
cd VaiDarJogo_Backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
npm run setup
# ou copiar manualmente: cp env.example .env
```

### 2. Executar
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

### 3. Testar
```bash
# Health check
curl http://localhost:3000/health

# Testar WhatsApp
curl http://localhost:3000/api/whatsapp/test-connection
```

## 🐳 Deploy com Docker

### 1. Build da Imagem
```bash
# Build
docker build -t vaidarjogo-backend .

# Verificar imagem
docker images vaidarjogo-backend
```

### 2. Executar Container
```bash
# Executar com variáveis de ambiente
docker run -d \
  --name vaidarjogo-backend \
  -p 3000:3000 \
  --env-file .env \
  vaidarjogo-backend

# Verificar logs
docker logs vaidarjogo-backend
```

### 3. Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

```bash
# Executar
docker-compose up -d

# Verificar status
docker-compose ps
```

## ☁️ Deploy no Heroku

### 1. Preparação
```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Criar app
heroku create vaidarjogo-backend
```

### 2. Configurar Variáveis
```bash
# Configurar variáveis de ambiente
heroku config:set NODE_ENV=production
heroku config:set PORT=3000
heroku config:set SUPABASE_URL=your_supabase_url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
heroku config:set WHATSAPP_ACCESS_TOKEN=your_whatsapp_token
heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
heroku config:set WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
heroku config:set WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
heroku config:set DEFAULT_TIMEZONE=America/Sao_Paulo
heroku config:set SCHEDULER_INTERVAL_MINUTES=5
```

### 3. Deploy
```bash
# Deploy
git push heroku main

# Verificar logs
heroku logs --tail

# Verificar status
heroku ps
```

### 4. Configurar Webhook
```bash
# Obter URL do app
heroku apps:info

# Configurar webhook no WhatsApp:
# https://your-app-name.herokuapp.com/api/whatsapp/webhook
```

## 🌐 Deploy no VPS/Cloud

### 1. Preparar Servidor
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2

# Instalar Nginx (opcional)
sudo apt install nginx -y
```

### 2. Configurar Aplicação
```bash
# Clonar repositório
git clone <repository-url>
cd VaiDarJogo_Backend

# Instalar dependências
npm install --production

# Configurar variáveis
cp env.example .env
nano .env
```

### 3. Configurar PM2
```bash
# Criar arquivo de configuração
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'vaidarjogo-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js

# Configurar para iniciar com o sistema
pm2 startup
pm2 save
```

### 4. Configurar Nginx (Opcional)
```bash
# Configurar site
sudo nano /etc/nginx/sites-available/vaidarjogo-backend

# Conteúdo:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Ativar site
sudo ln -s /etc/nginx/sites-available/vaidarjogo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Configurar SSL (Let's Encrypt)
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d your-domain.com

# Verificar renovação automática
sudo certbot renew --dry-run
```

## 🔧 Configurações de Produção

### 1. Variáveis de Ambiente
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
DEFAULT_TIMEZONE=America/Sao_Paulo
SCHEDULER_INTERVAL_MINUTES=5
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Configurações de Log
```bash
# Rotacionar logs
sudo nano /etc/logrotate.d/vaidarjogo-backend

# Conteúdo:
/path/to/VaiDarJogo_Backend/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 nodejs nodejs
    postrotate
        pm2 reload vaidarjogo-backend
    endscript
}
```

### 3. Monitoramento
```bash
# Instalar monitoring tools
sudo apt install htop iotop nethogs -y

# Configurar alertas (opcional)
# Usar ferramentas como Nagios, Zabbix, ou Prometheus
```

## 📊 Monitoramento e Logs

### 1. Logs do PM2
```bash
# Ver logs em tempo real
pm2 logs vaidarjogo-backend

# Ver logs específicos
pm2 logs vaidarjogo-backend --err
pm2 logs vaidarjogo-backend --out
```

### 2. Logs da Aplicação
```bash
# Ver logs combinados
tail -f logs/combined.log

# Filtrar erros
grep "ERROR" logs/combined.log

# Ver logs do agendador
grep "Scheduler" logs/combined.log
```

### 3. Métricas do Sistema
```bash
# Status da aplicação
pm2 status

# Uso de recursos
pm2 monit

# Informações detalhadas
pm2 show vaidarjogo-backend
```

## 🔄 Backup e Recuperação

### 1. Backup do Código
```bash
# Backup do repositório
tar -czf vaidarjogo-backend-$(date +%Y%m%d).tar.gz VaiDarJogo_Backend/

# Backup para nuvem
aws s3 cp vaidarjogo-backend-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

### 2. Backup do Banco
```bash
# Backup do Supabase (via API ou interface)
# Configurar backup automático no Supabase
```

### 3. Recuperação
```bash
# Restaurar código
tar -xzf vaidarjogo-backend-20251017.tar.gz

# Restaurar dependências
npm install --production

# Restaurar configurações
cp .env.backup .env

# Reiniciar aplicação
pm2 restart vaidarjogo-backend
```

## 🚨 Troubleshooting

### Problema: Aplicação não inicia
```bash
# Verificar logs
pm2 logs vaidarjogo-backend --err

# Verificar variáveis de ambiente
pm2 show vaidarjogo-backend

# Testar manualmente
node src/server.js
```

### Problema: Agendador não funciona
```bash
# Verificar logs do agendador
grep "Scheduler" logs/combined.log

# Testar endpoint
curl http://localhost:3000/api/confirmation/scheduler/status

# Reiniciar aplicação
pm2 restart vaidarjogo-backend
```

### Problema: Webhook não recebe mensagens
```bash
# Verificar logs do webhook
grep "webhook" logs/combined.log

# Testar endpoint
curl -X GET "http://localhost:3000/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=test&hub.challenge=test123"

# Verificar configuração do WhatsApp
curl http://localhost:3000/api/whatsapp/test-connection
```

## 📞 Suporte

Para problemas de deploy:
1. Verificar logs da aplicação
2. Verificar logs do sistema
3. Testar endpoints manualmente
4. Verificar configurações de rede
5. Consultar documentação específica da plataforma







