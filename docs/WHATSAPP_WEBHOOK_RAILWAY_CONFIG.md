# 🚀 Configuração de Webhook WhatsApp Business para Railway

## 📍 **URL do Seu Backend no Railway**
```
https://vaidarjogo-backend.railway.internal
```

## 🔧 **Configurações de Webhook no Facebook Developer Console**

### 1. **Acessar o Console**
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Vá para seu app do WhatsApp Business
3. Navegue para **WhatsApp > Configuration**

### 2. **Configurar Webhook URL**
```
Webhook URL: https://vaidarjogo-backend.railway.internal/api/whatsapp/webhook
```

### 3. **Configurar Verify Token**
```
Verify Token: vaidarjogo_webhook_2025
```
*Use este token exato ou configure o mesmo valor na variável de ambiente `WHATSAPP_WEBHOOK_VERIFY_TOKEN`*

### 4. **Configurar Webhook Fields**
Marque os seguintes campos:
- ✅ `messages` - Para receber mensagens dos usuários
- ✅ `message_deliveries` - Para status de entrega
- ✅ `message_reads` - Para status de leitura

## 🔐 **Variáveis de Ambiente no Railway**

Configure as seguintes variáveis no painel do Railway:

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id_aqui
WHATSAPP_WEBHOOK_VERIFY_TOKEN=vaidarjogo_webhook_2025
WHATSAPP_API_VERSION=v18.0

# Database (se usando Supabase)
DATABASE_URL=sua_url_do_supabase_aqui
SUPABASE_URL=sua_url_do_supabase_aqui
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico_do_supabase_aqui

# Server
PORT=3000
NODE_ENV=production
```

## 🧪 **Testando a Configuração**

### 1. **Teste de Verificação do Webhook**
```bash
curl -X GET "https://vaidarjogo-backend.railway.internal/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=vaidarjogo_webhook_2025&hub.challenge=test123"
```

**Resposta esperada:** `test123`

### 2. **Teste de Status da API**
```bash
curl -X GET "https://vaidarjogo-backend.railway.internal/api/whatsapp/status"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "isReady": true,
    "hasAccessToken": true,
    "hasPhoneNumberID": true,
    "hasBusinessAccountID": true,
    "hasWebhookToken": true
  }
}
```

### 3. **Teste de Conexão**
```bash
curl -X GET "https://vaidarjogo-backend.railway.internal/api/whatsapp/test-connection"
```

### 4. **Teste de Envio de Mensagem**
```bash
curl -X POST "https://vaidarjogo-backend.railway.internal/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste do VaiDarJogo Backend no Railway"
  }'
```

## 📡 **Endpoints Disponíveis**

### **Webhook Endpoints**
- `GET /api/whatsapp/webhook` - Verificação do webhook
- `POST /api/whatsapp/webhook` - Receber mensagens

### **Status Endpoints**
- `GET /api/whatsapp/status` - Status geral da API
- `GET /api/whatsapp/test-connection` - Teste de conexão
- `GET /api/whatsapp/account/info` - Informações da conta
- `GET /api/whatsapp/account/status` - Status da conta

### **Message Endpoints**
- `POST /api/whatsapp/test` - Enviar mensagem de teste
- `GET /api/whatsapp/message/:id/status` - Status de mensagem específica

### **Confirmation Endpoints**
- `POST /api/confirmation/process` - Processar confirmações
- `POST /api/confirmation/process/:gameId` - Processar confirmações de jogo específico
- `POST /api/confirmation/manual` - Envio manual de confirmação
- `POST /api/confirmation/response` - Processar resposta via webhook

## 🔄 **Fluxo de Funcionamento**

### 1. **Envio de Confirmação**
```
Flutter App → Railway Backend → WhatsApp API → Jogador
```

### 2. **Resposta do Jogador**
```
Jogador → WhatsApp → Railway Webhook → Backend → Database → Flutter
```

### 3. **Processamento de Resposta**
1. **WhatsApp envia** mensagem para o webhook
2. **Railway recebe** a requisição POST
3. **Backend processa** a mensagem
4. **Sistema identifica** jogador pelo telefone
5. **Interpreta** resposta (sim/não)
6. **Salva** confirmação no banco
7. **Flutter atualiza** interface

## 🚨 **Troubleshooting**

### **Problema: Webhook não é verificado**
**Verificar:**
1. URL está correta: `https://vaidarjogo-backend.railway.internal/api/whatsapp/webhook`
2. Token de verificação está correto: `vaidarjogo_webhook_2025`
3. Railway está rodando e acessível
4. Variável `WHATSAPP_WEBHOOK_VERIFY_TOKEN` está configurada

### **Problema: Mensagens não são processadas**
**Verificar:**
1. Webhook está configurado para `messages`
2. Logs do Railway mostram mensagens recebidas
3. Processamento de resposta está funcionando
4. Banco de dados está acessível

### **Problema: Respostas não são salvas**
**Verificar:**
1. Jogador existe no banco
2. Políticas RLS permitem escrita
3. Formato da mensagem está correto
4. Logs de erro no Railway

## 📊 **Monitoramento no Railway**

### **Logs Importantes**
```bash
# Verificar logs de webhook
grep "webhook" railway-logs

# Verificar mensagens recebidas
grep "WhatsApp Message" railway-logs

# Verificar erros
grep "ERROR" railway-logs
```

### **Métricas a Acompanhar**
- Taxa de entrega de mensagens
- Tempo de resposta do webhook
- Erros de processamento
- Uso de rate limiting

## 🔒 **Segurança**

### **Rate Limiting Configurado**
- **Webhook**: 100 requisições por minuto
- **Mensagens**: 10 mensagens por minuto
- **Confirmações**: 20 requisições por minuto

### **Validações Implementadas**
- Verificação de token do webhook
- Validação de formato de mensagem
- Sanitização de dados de entrada
- Logs de segurança

## 🎯 **Exemplo de Mensagem de Confirmação**

### **Mensagem Enviada**
```
🏈 Confirmação de Presença - Jogo de Futebol

Olá João Silva!

Você é um jogador Mensalista e está sendo convidado para confirmar sua presença no próximo jogo:

📅 Data: 21/10/2025
⏰ Horário: 20:00
📍 Local: Campo Central

Para confirmar sua presença, responda:
✅ SIM - Estarei presente
❌ NÃO - Não poderei comparecer
```

### **Resposta Processada**
```
Jogador responde: "sim"
Sistema salva: confirmation_status = "confirmed"
Flutter exibe: ✅ João Silva confirmado
```

## ✅ **Checklist de Configuração**

- [ ] App criado no Facebook Developer
- [ ] WhatsApp Business API adicionado
- [ ] Número de telefone verificado
- [ ] Access token obtido
- [ ] Phone Number ID copiado
- [ ] Business Account ID copiado
- [ ] Webhook URL configurado no Facebook
- [ ] Verify token configurado
- [ ] Webhook fields marcados (messages, deliveries, reads)
- [ ] Variáveis de ambiente configuradas no Railway
- [ ] Teste de verificação do webhook realizado
- [ ] Teste de status da API realizado
- [ ] Teste de envio de mensagem realizado
- [ ] Logs do Railway monitorados

## 🚀 **Próximos Passos**

1. **Configurar Templates**: Crie templates para mensagens automáticas
2. **Implementar Respostas**: Configure processamento de respostas
3. **Dashboard**: Crie interface para monitorar envios
4. **Analytics**: Implemente métricas de engajamento
5. **Backup**: Configure backup das configurações

---

**💡 Dica**: Use o endpoint `/api/whatsapp/status` para verificar se tudo está configurado corretamente antes de começar a enviar mensagens!



