# Configuração WhatsApp Web - VaiDarJogo Backend

Este documento explica como configurar e usar o WhatsApp Web no sistema VaiDarJogo.

## 🚀 Vantagens do WhatsApp Web

- ✅ **Sem necessidade de tokens** oficiais do WhatsApp Business API
- ✅ **Configuração simples** via QR Code
- ✅ **Sem limites** de mensagens (apenas limitações do WhatsApp)
- ✅ **Funcionalidade completa** de envio e recebimento
- ✅ **Gratuito** para uso

## 📋 Pré-requisitos

- Node.js 18+
- Número de telefone com WhatsApp
- Acesso ao WhatsApp Web no navegador
- Dependências instaladas (`npm install`)

## 🔧 Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp env.example .env

# Editar apenas as configurações do Supabase
# WhatsApp Web não precisa de configurações adicionais
```

### 3. Executar o Backend

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📱 Autenticação via QR Code

### 1. Inicializar WhatsApp Web

Quando o backend iniciar, ele automaticamente:
- Inicializará o WhatsApp Web
- Gerará um QR Code
- Exibirá o QR Code no terminal
- Salvará o QR Code em `logs/whatsapp-qr.txt`

### 2. Escanear QR Code

1. **Abra** o WhatsApp no seu telefone
2. **Vá** para Configurações > Dispositivos conectados
3. **Toque** em "Conectar um dispositivo"
4. **Escaneie** o QR Code exibido no terminal ou arquivo

### 3. Verificar Conexão

```bash
# Verificar status
curl http://localhost:3000/api/whatsapp/status

# Obter QR Code via API
curl http://localhost:3000/api/whatsapp/qr
```

## 🔄 Fluxo de Funcionamento

### 1. Inicialização
```
Backend inicia → WhatsApp Web inicializa → QR Code gerado → Aguarda escaneamento
```

### 2. Autenticação
```
QR Code escaneado → WhatsApp Web conecta → Sistema pronto para envio
```

### 3. Envio de Mensagens
```
Sistema detecta confirmação pendente → Envia mensagem via WhatsApp Web → Registra log
```

### 4. Recebimento de Respostas
```
Jogador responde → WhatsApp Web recebe → Sistema processa → Salva confirmação
```

## 📡 Endpoints da API

### **Status e Autenticação**
- `GET /api/whatsapp/status` - Status da conexão
- `GET /api/whatsapp/qr` - Obter QR Code
- `GET /api/whatsapp/session` - Informações completas da sessão
- `POST /api/whatsapp/initialize` - Inicializar WhatsApp Web
- `POST /api/whatsapp/disconnect` - Desconectar WhatsApp Web

### **Envio e Teste**
- `POST /api/whatsapp/test` - Enviar mensagem de teste
- `GET /api/whatsapp/test-connection` - Testar conexão
- `GET /api/whatsapp/message/:id/status` - Status de mensagem

## 🧪 Testando a Configuração

### 1. Verificar Status

```bash
curl http://localhost:3000/api/whatsapp/status
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "isReady": true,
    "hasQRCode": false,
    "isAuthenticated": true
  }
}
```

### 2. Enviar Mensagem de Teste

```bash
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste do VaiDarJogo Backend - WhatsApp Web"
  }'
```

### 3. Verificar Logs

```bash
# Ver logs em tempo real
tail -f logs/combined.log

# Filtrar logs do WhatsApp
grep "WhatsApp" logs/combined.log
```

## 🔍 Monitoramento

### 1. Logs Importantes

```bash
# WhatsApp Web conectado
grep "WhatsApp Web conectado" logs/combined.log

# QR Code gerado
grep "QR Code gerado" logs/combined.log

# Mensagens enviadas
grep "Mensagem enviada" logs/combined.log

# Mensagens recebidas
grep "Mensagem recebida" logs/combined.log
```

### 2. Status da Conexão

```bash
# Verificar se está pronto
curl http://localhost:3000/api/whatsapp/status | jq '.data.isReady'

# Verificar se tem QR Code (não autenticado)
curl http://localhost:3000/api/whatsapp/status | jq '.data.hasQRCode'
```

## 🐛 Troubleshooting

### Problema: QR Code não aparece

**Verificar:**
1. Backend está rodando?
2. Logs mostram erro de inicialização?
3. Dependências instaladas corretamente?

**Solução:**
```bash
# Reiniciar backend
npm run dev

# Verificar logs
tail -f logs/combined.log
```

### Problema: QR Code expira

**Verificar:**
1. QR Code foi escaneado em tempo hábil?
2. WhatsApp Web está funcionando no navegador?

**Solução:**
```bash
# Obter novo QR Code
curl http://localhost:3000/api/whatsapp/qr

# Ou reiniciar backend
npm run dev
```

### Problema: Mensagens não enviam

**Verificar:**
1. WhatsApp Web está conectado?
2. Número de destino está correto?
3. Logs mostram erro de envio?

**Solução:**
```bash
# Verificar status
curl http://localhost:3000/api/whatsapp/status

# Testar envio
curl -X POST "http://localhost:3000/api/whatsapp/test" \
  -H "Content-Type: application/json" \
  -d '{"phone": "5511999999999", "message": "Teste"}'
```

### Problema: Respostas não são processadas

**Verificar:**
1. Mensagens estão sendo recebidas?
2. Logs mostram processamento?
3. Banco de dados está acessível?

**Solução:**
```bash
# Verificar logs de mensagens recebidas
grep "Mensagem recebida" logs/combined.log

# Verificar logs de processamento
grep "Processando mensagem" logs/combined.log
```

## 🔒 Segurança

### 1. Sessão Persistente

- A sessão do WhatsApp Web é salva localmente
- Não é necessário escanear QR Code a cada reinicialização
- Sessão é mantida até desconexão manual

### 2. Limitações do WhatsApp

- **Rate limiting**: WhatsApp pode limitar envios em massa
- **Detecção de spam**: Evitar envios muito frequentes
- **Números bloqueados**: Respeitar números que bloquearam o sistema

### 3. Boas Práticas

- **Intervalos entre envios**: Aguardar alguns segundos entre mensagens
- **Mensagens personalizadas**: Evitar mensagens idênticas
- **Monitoramento**: Acompanhar logs e status

## 📊 Comparação: WhatsApp Web vs Business API

| Aspecto | WhatsApp Web | Business API |
|---------|--------------|--------------|
| **Configuração** | Simples (QR Code) | Complexa (tokens) |
| **Custo** | Gratuito | Pago |
| **Limites** | Limitações do WhatsApp | Limites da API |
| **Estabilidade** | Depende do WhatsApp Web | Mais estável |
| **Funcionalidades** | Básicas | Avançadas |
| **Suporte** | Comunidade | Oficial |

## 🚀 Deploy em Produção

### 1. Considerações

- **WhatsApp Web pode desconectar** em servidores sem interface gráfica
- **Sessão pode expirar** após longos períodos de inatividade
- **Monitoramento é essencial** para detectar desconexões

### 2. Configurações Recomendadas

```bash
# Configurar Puppeteer para servidor
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 3. Monitoramento

```bash
# Script de monitoramento
#!/bin/bash
while true; do
  STATUS=$(curl -s http://localhost:3000/api/whatsapp/status | jq '.data.isReady')
  if [ "$STATUS" != "true" ]; then
    echo "WhatsApp Web desconectado - reiniciando..."
    # Reiniciar serviço
  fi
  sleep 60
done
```

## 📞 Suporte

### Recursos Úteis

- [whatsapp-web.js Documentation](https://wwebjs.dev/)
- [Puppeteer Documentation](https://pptr.dev/)
- [Logs do Sistema](logs/combined.log)

### Problemas Comuns

1. **QR Code não aparece** → Verificar inicialização
2. **Mensagens não enviam** → Verificar conexão
3. **Respostas não processam** → Verificar logs
4. **Sessão expira** → Reautenticar via QR Code

## ✅ Checklist de Configuração

- [ ] Dependências instaladas
- [ ] Backend rodando
- [ ] QR Code gerado
- [ ] QR Code escaneado
- [ ] WhatsApp Web conectado
- [ ] Teste de envio realizado
- [ ] Teste de recebimento realizado
- [ ] Logs funcionando
- [ ] Monitoramento configurado

**Após completar todos os itens, seu sistema WhatsApp Web estará funcionando!** 🎉





