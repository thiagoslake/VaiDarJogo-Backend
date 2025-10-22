# 🔑 Como Obter Access Token do WhatsApp Business API

## 📋 Resumo Rápido

Para obter o access token do WhatsApp Business API, siga estes passos:

## 🚀 Passos Essenciais

### 1. **Acessar Facebook Developer Console**
- Vá para [developers.facebook.com](https://developers.facebook.com/)
- Faça login com sua conta do Facebook

### 2. **Criar um App**
- Clique em "Meus Apps" → "Criar App"
- Selecione "Business" como tipo
- Nome: `VaiDarJogo Backend`
- Email: seu email

### 3. **Adicionar WhatsApp**
- No painel do app, procure "WhatsApp"
- Clique em "Configurar"
- Aceite os termos de uso

### 4. **Configurar Número**
- Vá para "WhatsApp > Getting Started"
- Clique em "Add phone number"
- Digite seu número (Brasil)
- Escolha verificação por SMS
- Digite o código recebido

### 5. **Obter Access Token**
- Vá para "WhatsApp > API Setup"
- Na seção "Temporary access token"
- Clique em "Generate Token"
- **COPIE O TOKEN** (expira em 24h)

### 6. **Obter IDs Necessários**
- **Phone Number ID**: Na mesma página "API Setup"
- **Business Account ID**: Na mesma página "API Setup"

## 🔧 Configuração no Backend

### Opção 1: Script Automático
```bash
npm run whatsapp-setup
```

### Opção 2: Manual
Edite o arquivo `.env`:
```env
WHATSAPP_ACCESS_TOKEN=seu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=vaidarjogo_webhook_2025
```

## 🧪 Testar Configuração

### 1. Testar Conexão
```bash
curl http://localhost:3000/api/whatsapp/test-connection
```

### 2. Testar Envio
```bash
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste do VaiDarJogo"
  }'
```

## ⚠️ Importante

### Token Temporário (24h)
- **Gere novo token** diariamente
- **Atualize** a variável de ambiente
- **Reinicie** o backend

### Token Permanente
- Configure webhook primeiro
- Verifique seu app
- Solicite aprovação para produção

## 🔗 Links Úteis

- [Facebook Developer Console](https://developers.facebook.com/)
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Guia Completo](docs/WHATSAPP_ACCESS_TOKEN_GUIDE.md)

## 🆘 Problemas Comuns

### "Token Expirado"
- Gere novo token no Facebook Developer
- Atualize .env
- Reinicie backend

### "Webhook Não Verifica"
- Verifique se URL está acessível
- Verifique se token está correto
- Verifique se backend está rodando

### "Mensagens Não Enviam"
- Verifique se token está válido
- Verifique se Phone Number ID está correto
- Verifique formato do número de destino

## ✅ Checklist Final

- [ ] App criado no Facebook Developer
- [ ] WhatsApp Business API adicionado
- [ ] Número de telefone verificado
- [ ] Access token obtido e copiado
- [ ] Phone Number ID copiado
- [ ] Business Account ID copiado
- [ ] Variáveis configuradas no .env
- [ ] Backend testado e funcionando

**Após completar todos os itens, seu sistema estará pronto!** 🚀





