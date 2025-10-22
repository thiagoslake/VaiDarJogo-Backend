# Configuração do Webhook WhatsApp Business API

Este documento explica como configurar o webhook do WhatsApp Business API para receber respostas de confirmação.

## 🔧 Configuração no Facebook Developer Console

### 1. Acessar o Console
1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Vá para seu app do WhatsApp Business
3. Navegue para **WhatsApp > Configuration**

### 2. Configurar Webhook
1. **Webhook URL**: `https://your-domain.com/api/whatsapp/webhook`
2. **Verify Token**: Use o mesmo valor de `WHATSAPP_WEBHOOK_VERIFY_TOKEN` do seu `.env`
3. **Webhook Fields**: Marque `messages`

### 3. Configurar Eventos
Marque os seguintes eventos:
- ✅ `messages` - Para receber mensagens
- ✅ `message_deliveries` - Para status de entrega
- ✅ `message_reads` - Para status de leitura

## 📡 Endpoints do Webhook

### Verificação (GET)
```
GET /api/whatsapp/webhook
```

**Parâmetros:**
- `hub.mode=subscribe`
- `hub.verify_token=seu_token`
- `hub.challenge=challenge_string`

**Resposta:** Retorna o `challenge` se o token estiver correto.

### Processamento (POST)
```
POST /api/whatsapp/webhook
```

**Body:** JSON com dados da mensagem do WhatsApp

## 🔍 Testando o Webhook

### 1. Teste de Verificação
```bash
curl -X GET "https://your-domain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=seu_token&hub.challenge=test123"
```

**Resposta esperada:** `test123`

### 2. Teste de Mensagem
```bash
curl -X POST "https://your-domain.com/api/whatsapp/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "id": "123456789",
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "metadata": {
            "display_phone_number": "15551234567",
            "phone_number_id": "123456789"
          },
          "messages": [{
            "from": "5511999999999",
            "id": "wamid.123456789",
            "timestamp": "1234567890",
            "text": {
              "body": "sim"
            },
            "type": "text"
          }]
        },
        "field": "messages"
      }]
    }]
  }'
```

## 🔒 Segurança

### 1. Verificação de Token
O webhook verifica o token em todas as requisições GET:
```javascript
if (mode === 'subscribe' && WhatsAppService.verifyWebhookToken(token)) {
  // Token válido
}
```

### 2. Rate Limiting
O webhook tem rate limiting configurado:
- 10 requisições por minuto
- Bloqueio automático em caso de excesso

### 3. Logs de Segurança
Todas as tentativas de acesso são logadas:
```javascript
logger.info('Webhook do WhatsApp verificado com sucesso');
logger.warn('Falha na verificação do webhook do WhatsApp');
```

## 📊 Monitoramento

### 1. Logs do Webhook
```bash
# Verificar logs de verificação
grep "webhook" logs/combined.log

# Verificar mensagens recebidas
grep "WhatsApp Message" logs/combined.log
```

### 2. Status de Mensagens
O sistema processa automaticamente:
- Mensagens de texto
- Status de entrega
- Status de leitura

### 3. Respostas de Confirmação
Mensagens são interpretadas como:
- **Confirmação**: "sim", "s", "yes", "confirmo", "estarei"
- **Recusa**: "não", "nao", "n", "no", "não poderei"

## 🐛 Troubleshooting

### Problema: Webhook não é verificado
**Verificar:**
1. URL está correta e acessível?
2. Token de verificação está correto?
3. Servidor está rodando?
4. HTTPS está configurado?

### Problema: Mensagens não são processadas
**Verificar:**
1. Webhook está configurado para `messages`?
2. Logs mostram mensagens recebidas?
3. Processamento de resposta está funcionando?
4. Banco de dados está acessível?

### Problema: Respostas não são salvas
**Verificar:**
1. Jogador existe no banco?
2. Políticas RLS permitem escrita?
3. Formato da mensagem está correto?
4. Logs de erro no backend?

## 🔄 Fluxo Completo

### 1. Envio de Confirmação
```
Backend → WhatsApp API → Jogador
```

### 2. Resposta do Jogador
```
Jogador → WhatsApp → Webhook → Backend → Banco → Flutter
```

### 3. Processamento
1. **Webhook recebe** mensagem
2. **Sistema identifica** jogador pelo telefone
3. **Interpreta** resposta (sim/não)
4. **Salva** confirmação no banco
5. **Flutter atualiza** interface

## 📱 Exemplo de Uso

### Mensagem Enviada
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

### Resposta Processada
```
Jogador responde: "sim"
Sistema salva: confirmation_status = "confirmed"
Flutter exibe: ✅ João Silva confirmado
```

## 🚀 Deploy em Produção

### 1. Configurar HTTPS
- Webhook precisa de HTTPS
- Certificado SSL válido
- Redirecionamento HTTP → HTTPS

### 2. Configurar Domínio
- Domínio estável
- DNS configurado
- Firewall liberado para WhatsApp

### 3. Monitoramento
- Logs centralizados
- Alertas para falhas
- Backup de configurações

## 📞 Suporte

Para problemas com webhook:
1. Verificar logs do servidor
2. Testar endpoints manualmente
3. Verificar configuração no Facebook Developer
4. Consultar documentação da API do WhatsApp




