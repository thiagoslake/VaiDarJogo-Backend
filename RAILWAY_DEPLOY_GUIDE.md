# 🚀 Guia de Deploy no Railway - VaiDarJogo Backend

## ❌ Problemas Identificados e Soluções

### 1. **Configurações do Supabase não encontradas**
**Erro:** `Error: Configurações do Supabase não encontradas`

**Solução:** Configure as variáveis de ambiente no Railway

### 2. **Node.js 18 deprecated**
**Erro:** `Node.js 18 and below are deprecated`

**Solução:** ✅ Atualizado para Node.js 20+ no package.json

## 🔧 Configuração das Variáveis de Ambiente no Railway

### **Passo 1: Acessar as Configurações do Railway**
1. Acesse seu projeto no Railway
2. Vá para a aba **Variables**
3. Adicione as seguintes variáveis:

### **Passo 2: Variáveis Obrigatórias**

#### **Supabase (OBRIGATÓRIO)**
```
SUPABASE_URL=https://ddlxamlaoumhbbrnmasj.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbHhhbWxhb3VtaGJicm5tYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDAwMzcsImV4cCI6MjA3MjUxNjAzN30.VrTmCTDl0zkzP1GQ8YHAqFLbtCUlaYIp7v_4rUHbSMo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### **WhatsApp Business API (OBRIGATÓRIO)**
```
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token_here
WHATSAPP_API_VERSION=v18.0
```

#### **Configurações do Servidor**
```
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
DEFAULT_TIMEZONE=America/Sao_Paulo
CRON_TIMEZONE=America/Sao_Paulo
SCHEDULER_INTERVAL_MINUTES=5
```

#### **Configurações de Rate Limiting**
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### **Configurações de Retry**
```
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=5000
```

#### **Configurações de Monitoramento**
```
HEALTH_CHECK_INTERVAL_MS=30000
```

## 📋 Checklist de Deploy

- [x] ✅ Atualizar versão do Node.js para 20+
- [x] ✅ Configurar variáveis do Supabase (URL e Anon Key)
- [ ] ⚠️ Obter SUPABASE_SERVICE_ROLE_KEY do painel do Supabase
- [ ] ⚠️ Configurar variáveis do WhatsApp Business API
- [ ] ⚠️ Configurar variáveis do servidor
- [ ] ⚠️ Fazer novo deploy no Railway

## 🔍 Como Obter as Chaves do Supabase

### **✅ Configurações Já Identificadas:**
- **SUPABASE_URL**: `https://ddlxamlaoumhbbrnmasj.supabase.co`
- **SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbHhhbWxhb3VtaGJicm5tYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDAwMzcsImV4cCI6MjA3MjUxNjAzN30.VrTmCTDl0zkzP1GQ8YHAqFLbtCUlaYIp7v_4rUHbSMo`

### **⚠️ Ainda Precisa:**
- **SUPABASE_SERVICE_ROLE_KEY**: Acesse [supabase.com](https://supabase.com) → Projeto → Settings → API → **service_role secret**

## 📱 Como Obter as Chaves do WhatsApp Business API

1. Acesse [developers.facebook.com](https://developers.facebook.com)
2. Vá para seu app do WhatsApp Business
3. Clique em **WhatsApp** > **API Setup**
4. Copie:
   - **Access Token** → `WHATSAPP_ACCESS_TOKEN`
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - **Webhook Verify Token** → `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

## 🚨 Importante

- **NUNCA** commite as chaves reais no código
- Use sempre variáveis de ambiente
- O arquivo `.env` está no `.gitignore` por segurança
- Use o arquivo `railway.env` como referência

## 🔄 Após Configurar as Variáveis

1. Faça um novo deploy no Railway
2. Verifique os logs para confirmar que não há mais erros
3. Teste o endpoint `/health` para verificar se está funcionando

## 📞 Suporte

Se ainda houver problemas, verifique:
1. Se todas as variáveis estão configuradas corretamente
2. Se as chaves do Supabase e WhatsApp estão válidas
3. Se o banco de dados Supabase está acessível
4. Se o webhook do WhatsApp está configurado corretamente
