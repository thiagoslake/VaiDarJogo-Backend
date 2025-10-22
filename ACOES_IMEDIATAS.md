# 🚨 Ações Imediatas - Motor não envia mensagens

## 🔍 **Problema Identificado**

O motor de confirmações não está enviando mensagens automaticamente após quase 1 dia de execução.

## ⚡ **Ações Imediatas**

### **1. Verificar se Backend está rodando**
```bash
# Verificar processo
netstat -ano | findstr :3000

# Se não estiver rodando, iniciar:
cd VaiDarJogo_Backend
npm run dev
```

### **2. Executar Diagnóstico Automatizado**
```bash
npm run diagnostico
```

### **3. Verificar Configurações no Banco**
```bash
npm run verificar-config
```

### **4. Verificar Status dos Sistemas**
```bash
# Health check
curl http://localhost:3000/health

# Status WhatsApp
curl http://localhost:3000/api/whatsapp/status

# Status agendador
curl http://localhost:3000/api/confirmation/scheduler/status
```

## 🔧 **Soluções por Problema**

### **Se Backend não estiver rodando:**
```bash
cd VaiDarJogo_Backend
npm install
npm run dev
```

### **Se WhatsApp Web não estiver conectado:**
1. Aguarde QR Code aparecer no terminal
2. Abra WhatsApp no telefone
3. Vá para Configurações > Dispositivos conectados
4. Toque em "Conectar um dispositivo"
5. Escaneie o QR Code

### **Se Agendador não estiver ativo:**
```bash
curl -X POST http://localhost:3000/api/confirmation/scheduler/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

### **Se não houver configurações:**
1. Abrir Flutter app
2. Ir para o jogo
3. Configurar confirmações de presença
4. Salvar configurações

### **Se horários não foram atingidos:**
```bash
# Testar envio manual (substituir GAME_ID)
curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID
```

## 🧪 **Testes Rápidos**

### **Teste 1: Envio Manual**
```bash
# Substituir GAME_ID pelo ID real do jogo
curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID
```

### **Teste 2: WhatsApp**
```bash
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste do motor"
  }'
```

### **Teste 3: Verificar Logs**
```bash
tail -f logs/combined.log
```

## 📊 **Checklist de Verificação**

- [ ] Backend está rodando na porta 3000
- [ ] WhatsApp Web está conectado
- [ ] Agendador está ativo
- [ ] Jogo tem configuração de confirmação
- [ ] Configurações de envio estão ativas
- [ ] Horários de envio foram atingidos
- [ ] Próximas sessões existem
- [ ] Conexão com Supabase funciona
- [ ] Logs não mostram erros
- [ ] Teste manual funciona

## 🚨 **Se nada funcionar:**

### **Reiniciar tudo:**
```bash
# Parar backend (Ctrl+C)
# Limpar sessão WhatsApp
rm -rf .wwebjs_auth

# Reiniciar
npm run dev
```

### **Executar diagnóstico completo:**
```bash
npm run diagnostico
```

## 📞 **Informações para Suporte**

Se precisar de ajuda, forneça:

1. **Resultado do diagnóstico:**
```bash
npm run diagnostico
```

2. **Configurações do banco:**
```bash
npm run verificar-config
```

3. **Logs de erro:**
```bash
tail -f logs/combined.log
```

4. **Status dos sistemas:**
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/whatsapp/status
curl http://localhost:3000/api/confirmation/scheduler/status
```

## 🎯 **Próximos Passos**

1. **Execute as ações imediatas** acima
2. **Identifique o problema** específico
3. **Aplique a solução** correspondente
4. **Teste o funcionamento** do motor
5. **Monitore os logs** para confirmar envios
6. **Configure alertas** para futuros problemas

**Comece executando: `npm run diagnostico`** 🔍




