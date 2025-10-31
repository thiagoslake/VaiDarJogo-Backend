# 📱 Guia Completo: Configuração WhatsApp Business API

## 🎯 **Visão Geral**

Este guia te ajudará a configurar o WhatsApp Business API para o VaiDarJogo, permitindo o envio automático de confirmações de presença para os jogadores.

## 📋 **Pré-requisitos**

- Conta no Facebook Business Manager
- Número de telefone comercial (não pode ser pessoal)
- Domínio com HTTPS (para webhooks)
- Acesso ao servidor onde está rodando o VaiDarJogo

## 🚀 **Passo a Passo**

### **1. Criar Conta no Facebook Business Manager**

1. Acesse: https://business.facebook.com/
2. Clique em "Criar Conta"
3. Preencha os dados da sua empresa/organização
4. Verifique seu email

### **2. Configurar WhatsApp Business Account**

1. No Business Manager, vá em **"Configurações"** → **"Contas"**
2. Clique em **"Adicionar"** → **"WhatsApp Business Account"**
3. Preencha as informações:
   - Nome da conta
   - Categoria do negócio
   - Descrição dos serviços

### **3. Adicionar Número de Telefone**

1. Na sua WhatsApp Business Account, clique em **"Adicionar número de telefone"**
2. Insira seu número comercial
3. Escolha o método de verificação (SMS ou chamada)
4. Digite o código de verificação

### **4. Configurar Aplicativo do Facebook**

1. Acesse: https://developers.facebook.com/
2. Clique em **"Meus Apps"** → **"Criar App"**
3. Escolha **"Business"** como tipo de app
4. Preencha:
   - Nome do app: "VaiDarJogo WhatsApp"
   - Email de contato
   - Categoria: "Business"

### **5. Adicionar Produto WhatsApp**

1. No seu app, clique em **"Adicionar Produto"**
2. Encontre **"WhatsApp"** e clique em **"Configurar"**
3. Selecione sua WhatsApp Business Account
4. Adicione o número de telefone

### **6. Obter Credenciais**

#### **Access Token**
1. No painel do WhatsApp, vá em **"API Setup"**
2. Em **"Temporary access token"**, clique em **"Generate Token"**
3. Copie o token (válido por 24 horas)
4. Para token permanente, configure um app de produção

#### **Phone Number ID**
1. Na seção **"API Setup"**, copie o **"Phone number ID"**
2. Este ID identifica seu número de telefone

#### **Business Account ID**
1. Na URL do painel, copie o ID após `/business/`
2. Exemplo: `https://business.facebook.com/123456789` → ID: `123456789`

#### **Webhook Verify Token**
1. Crie um token personalizado (ex: `vaidarjogo_webhook_2024`)
2. Anote este token para usar no webhook

### **7. Configurar Webhook**

#### **URL do Webhook**
```
https://seu-dominio.com/api/whatsapp/webhook
```

#### **Campos de Webhook**
- ✅ `messages`
- ✅ `message_deliveries`
- ✅ `message_reads`

#### **Verificação do Webhook**
1. No painel do WhatsApp, vá em **"Configuration"**
2. Em **"Webhook"**, clique em **"Configure"**
3. Preencha:
   - **Callback URL**: `https://seu-dominio.com/api/whatsapp/webhook`
   - **Verify Token**: O token que você criou
4. Clique em **"Verify and Save"**

### **8. Configurar Variáveis de Ambiente**

Crie/edite o arquivo `.env` no seu projeto:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id_aqui
WHATSAPP_WEBHOOK_VERIFY_TOKEN=vaidarjogo_webhook_2024
WHATSAPP_API_VERSION=v18.0
```

### **9. Testar a Configuração**

Execute o script de teste:

```bash
node scripts/testar-whatsapp-business.js
```

## 🔧 **Scripts de Ajuda**

### **Configuração Interativa**
```bash
node scripts/configurar-whatsapp-business.js
```

### **Teste de Conexão**
```bash
node scripts/testar-whatsapp-business.js
```

### **Teste de Envio**
```bash
node scripts/testar-whatsapp-business.js --enviar 5511999999999
```

## 📊 **Verificação de Status**

### **Endpoint de Status**
```
GET https://seu-dominio.com/api/whatsapp/status
```

### **Resposta Esperada**
```json
{
  "success": true,
  "data": {
    "isReady": true,
    "hasAccessToken": true,
    "hasPhoneNumberID": true,
    "hasBusinessAccountID": true
  }
}
```

## 🚨 **Problemas Comuns**

### **1. Token Expirado**
- **Problema**: Token temporário expira em 24h
- **Solução**: Configure token permanente ou renove o temporário

### **2. Webhook Não Verificado**
- **Problema**: Erro 403 na verificação
- **Solução**: Verifique se o token está correto e o servidor está acessível

### **3. Número Não Verificado**
- **Problema**: Erro ao enviar mensagens
- **Solução**: Verifique se o número está ativo e verificado

### **4. Rate Limit**
- **Problema**: Muitas mensagens em pouco tempo
- **Solução**: Implemente delay entre envios

## 💰 **Custos**

### **Mensagens de Template (Gratuitas)**
- Primeiras 1.000 mensagens/mês são gratuitas
- Ideal para confirmações automáticas

### **Mensagens Conversacionais**
- R$ 0,05 por mensagem (Brasil)
- Para respostas dos usuários

## 🔒 **Segurança**

### **Boas Práticas**
1. **Nunca** compartilhe seu Access Token
2. Use HTTPS para webhooks
3. Valide todas as mensagens recebidas
4. Implemente rate limiting
5. Monitore logs de acesso

### **Rotação de Tokens**
- Configure tokens permanentes
- Implemente renovação automática
- Monitore expiração

## 📈 **Monitoramento**

### **Logs Importantes**
- Envios de mensagens
- Respostas recebidas
- Erros de API
- Status de webhooks

### **Métricas**
- Taxa de entrega
- Tempo de resposta
- Erros por tipo
- Uso de tokens

## 🆘 **Suporte**

### **Documentação Oficial**
- https://developers.facebook.com/docs/whatsapp
- https://business.facebook.com/help

### **Comunidade**
- Stack Overflow: tag `whatsapp-business-api`
- GitHub: issues do projeto

## ✅ **Checklist Final**

- [ ] Conta Business Manager criada
- [ ] WhatsApp Business Account configurada
- [ ] Número de telefone verificado
- [ ] App do Facebook criado
- [ ] Produto WhatsApp adicionado
- [ ] Credenciais obtidas
- [ ] Webhook configurado e verificado
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de conexão realizado
- [ ] Teste de envio realizado
- [ ] Monitoramento configurado

## 🎉 **Próximos Passos**

1. **Configurar Templates**: Crie templates para mensagens automáticas
2. **Implementar Respostas**: Configure processamento de respostas
3. **Dashboard**: Crie interface para monitorar envios
4. **Analytics**: Implemente métricas de engajamento
5. **Backup**: Configure backup das configurações

---

**💡 Dica**: Comece com o token temporário para testes e configure o permanente apenas quando estiver tudo funcionando!




