# 🚀 Quick Start - VaiDarJogo Backend

Guia rápido para configurar e executar o backend do VaiDarJogo.

## ⚡ Configuração Rápida

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
```bash
# Configuração completa
npm run setup

# OU apenas WhatsApp
npm run whatsapp-setup
```

### 3. Executar
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📱 Configuração do WhatsApp Web

### 1. Executar Backend
```bash
npm run dev
```

### 2. Escanear QR Code
1. **Aguarde** o QR Code aparecer no terminal
2. **Abra** o WhatsApp no seu telefone
3. **Vá** para Configurações > Dispositivos conectados
4. **Toque** em "Conectar um dispositivo"
5. **Escaneie** o QR Code

### 3. Verificar Conexão
```bash
curl http://localhost:3000/api/whatsapp/status
```

### Sem Variáveis Necessárias
WhatsApp Web não precisa de configurações adicionais!

## 🧪 Testar Configuração

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Testar WhatsApp
```bash
curl http://localhost:3000/api/whatsapp/test-connection
```

### 3. Testar QR Code
```bash
curl http://localhost:3000/api/whatsapp/qr
```

## 🔗 URLs Importantes

- **Health Check**: `GET /health`
- **WhatsApp Status**: `GET /api/whatsapp/status`
- **WhatsApp QR Code**: `GET /api/whatsapp/qr`
- **Processar Confirmações**: `POST /api/confirmation/process`
- **Status do Agendador**: `GET /api/confirmation/scheduler/status`

## 📚 Documentação Completa

- [Guia Completo](README.md)
- [Configuração WhatsApp Web](docs/WHATSAPP_WEB_SETUP.md)
- [Integração Flutter](docs/INTEGRACAO_FLUTTER.md)
- [Deploy](docs/DEPLOY_GUIDE.md)

## 🆘 Problemas Comuns

### QR Code Não Aparece
```bash
# Verificar se backend está rodando
# Verificar logs de erro
# Reiniciar aplicação
```

### WhatsApp Web Desconecta
- Verificar se QR Code foi escaneado
- Verificar se WhatsApp Web funciona no navegador
- Reautenticar via QR Code

### Mensagens Não Enviam
- Verificar se WhatsApp Web está conectado
- Verificar se número de destino está correto
- Verificar logs de erro

## ✅ Checklist Rápido

- [ ] Dependências instaladas
- [ ] Variáveis de ambiente configuradas
- [ ] Backend rodando
- [ ] QR Code escaneado
- [ ] WhatsApp Web conectado
- [ ] Testes realizados

**Pronto! Seu backend está funcionando!** 🎉
