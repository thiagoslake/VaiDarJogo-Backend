# Guia para Obter Access Token do WhatsApp Business API

Este guia explica passo a passo como obter o access token do WhatsApp Business API para o sistema VaiDarJogo.

## 📋 Pré-requisitos

- Conta no Facebook (pessoal ou empresarial)
- Número de telefone para WhatsApp Business
- Domínio com HTTPS para webhook
- Acesso ao Facebook Developer Console

## 🚀 Passo a Passo

### 1. Criar Conta no Facebook Developer

1. **Acesse** [Facebook Developers](https://developers.facebook.com/)
2. **Clique** em "Começar" ou "Get Started"
3. **Faça login** com sua conta do Facebook
4. **Aceite** os termos de uso

### 2. Criar um App

1. **Clique** em "Meus Apps" no menu superior
2. **Clique** em "Criar App"
3. **Selecione** "Business" como tipo de app
4. **Preencha** os dados:
   - Nome do app: `VaiDarJogo Backend`
   - Email de contato: seu email
   - Categoria: `Business`
5. **Clique** em "Criar App"

### 3. Adicionar Produto WhatsApp

1. **No painel** do seu app, procure por "WhatsApp"
2. **Clique** em "Configurar" no produto WhatsApp
3. **Aceite** os termos de uso do WhatsApp Business API

### 4. Configurar Número de Telefone

1. **Vá** para "WhatsApp > Getting Started"
2. **Clique** em "Add phone number"
3. **Selecione** seu país (Brasil)
4. **Digite** seu número de telefone
5. **Escolha** o método de verificação:
   - SMS (recomendado)
   - Chamada de voz
6. **Digite** o código de verificação recebido
7. **Defina** um nome para o perfil (ex: "VaiDarJogo")

### 5. Obter Access Token

1. **Vá** para "WhatsApp > API Setup"
2. **Encontre** a seção "Temporary access token"
3. **Clique** em "Generate Token"
4. **Copie** o token gerado (ele expira em 24 horas)

### 6. Obter Token Permanente

Para obter um token permanente, você precisa:

1. **Configurar** um webhook (ver seção abaixo)
2. **Verificar** seu app
3. **Solicitar** aprovação para produção

## 🔧 Configuração do Webhook

### 1. Configurar Webhook URL

1. **Vá** para "WhatsApp > Configuration"
2. **Na seção** "Webhook"
3. **Digite** sua URL: `https://your-domain.com/api/whatsapp/webhook`
4. **Digite** um token de verificação (ex: `vaidarjogo_webhook_2025`)
5. **Clique** em "Verify and Save"

### 2. Configurar Eventos

Marque os seguintes eventos:
- ✅ `messages` - Para receber mensagens
- ✅ `message_deliveries` - Para status de entrega
- ✅ `message_reads` - Para status de leitura

## 📱 Configuração no Backend

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env`:

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=vaidarjogo_webhook_2025
```

### 2. Onde Encontrar os IDs

#### **Phone Number ID**
1. **Vá** para "WhatsApp > API Setup"
2. **Encontre** a seção "Phone number ID"
3. **Copie** o ID (formato: `123456789012345`)

#### **Business Account ID**
1. **Vá** para "WhatsApp > API Setup"
2. **Encontre** a seção "Business account ID"
3. **Copie** o ID (formato: `123456789012345`)

## 🧪 Testando a Configuração

### 1. Testar Conexão

```bash
# Testar conexão com a API
curl -X GET "https://graph.facebook.com/v18.0/SEU_PHONE_NUMBER_ID" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### 2. Testar Envio de Mensagem

```bash
# Enviar mensagem de teste
curl -X POST "https://graph.facebook.com/v18.0/SEU_PHONE_NUMBER_ID/messages" \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messaging_product": "whatsapp",
    "to": "5511999999999",
    "type": "text",
    "text": {
      "body": "Teste do VaiDarJogo Backend"
    }
  }'
```

### 3. Testar Webhook

```bash
# Testar verificação do webhook
curl -X GET "https://your-domain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=vaidarjogo_webhook_2025&hub.challenge=test123"
```

## 🔒 Segurança e Boas Práticas

### 1. Proteger Access Token

- **Nunca** commite o token no código
- **Use** variáveis de ambiente
- **Rotacione** o token regularmente
- **Monitore** o uso do token

### 2. Configurar Rate Limiting

O WhatsApp Business API tem limites:
- **1.000 mensagens** por dia (gratuito)
- **80 mensagens** por segundo
- **Rate limiting** automático

### 3. Monitorar Uso

- **Acompanhe** métricas de uso
- **Configure** alertas para limites
- **Monitore** logs de erro

## 🚨 Troubleshooting

### Problema: Token Expirado

**Solução:**
1. **Gere** um novo token temporário
2. **Atualize** a variável de ambiente
3. **Reinicie** o backend

### Problema: Webhook Não Verifica

**Verificar:**
1. **URL** está acessível via HTTPS
2. **Token** de verificação está correto
3. **Backend** está rodando
4. **Firewall** permite conexões

### Problema: Mensagens Não Enviam

**Verificar:**
1. **Token** está válido
2. **Phone Number ID** está correto
3. **Número** de destino está no formato correto
4. **Limites** de rate não foram excedidos

## 📊 Monitoramento

### 1. Logs do Backend

```bash
# Verificar logs de WhatsApp
grep "WhatsApp" logs/combined.log

# Verificar erros
grep "ERROR" logs/error.log
```

### 2. Métricas da API

- **Mensagens enviadas** por dia
- **Taxa de entrega**
- **Erros de envio**
- **Uso do rate limit**

## 🔄 Renovação de Token

### Token Temporário (24h)
- **Gere** novo token diariamente
- **Atualize** variável de ambiente
- **Reinicie** aplicação

### Token Permanente
- **Configure** webhook
- **Verifique** app
- **Solicite** aprovação para produção
- **Configure** renovação automática

## 📞 Suporte

### Recursos Oficiais
- [Documentação WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Facebook Developer Console](https://developers.facebook.com/)
- [Suporte WhatsApp Business](https://business.whatsapp.com/support)

### Problemas Comuns
1. **Token expirado** - Gerar novo token
2. **Webhook não verifica** - Verificar URL e token
3. **Mensagens não enviam** - Verificar configurações
4. **Rate limit excedido** - Aguardar ou aumentar limite

## ✅ Checklist Final

- [ ] App criado no Facebook Developer
- [ ] WhatsApp Business API adicionado
- [ ] Número de telefone verificado
- [ ] Access token obtido
- [ ] Phone Number ID copiado
- [ ] Business Account ID copiado
- [ ] Webhook configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de conexão realizado
- [ ] Teste de envio realizado
- [ ] Webhook verificado

**Após completar todos os itens, seu sistema estará pronto para enviar confirmações via WhatsApp!** 🚀





