# 🚨 Solução de Problemas - Motor de Confirmações

## 🔍 **Problema: Motor não envia mensagens automaticamente**

### **Diagnóstico Rápido**

Execute o diagnóstico automatizado:
```bash
npm run diagnostico
```

### **Verificações Manuais**

#### **1. Backend está rodando?**
```bash
# Verificar processo
netstat -ano | findstr :3000

# Testar health check
curl http://localhost:3000/health
```

**Se não estiver rodando:**
```bash
cd VaiDarJogo_Backend
npm run dev
```

#### **2. WhatsApp Web está conectado?**
```bash
# Verificar status
curl http://localhost:3000/api/whatsapp/status
```

**Se não estiver conectado:**
1. Aguarde o QR Code aparecer no terminal
2. Abra o WhatsApp no seu telefone
3. Vá para Configurações > Dispositivos conectados
4. Toque em "Conectar um dispositivo"
5. Escaneie o QR Code

#### **3. Agendador está ativo?**
```bash
# Verificar status
curl http://localhost:3000/api/confirmation/scheduler/status
```

**Se não estiver ativo:**
```bash
# Iniciar agendador
curl -X POST http://localhost:3000/api/confirmation/scheduler/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

## 🔧 **Soluções por Problema**

### **Problema 1: Backend não inicia**

#### **Causas Possíveis:**
- Dependências não instaladas
- Porta 3000 ocupada
- Erro de configuração
- Problema com variáveis de ambiente

#### **Soluções:**
```bash
# 1. Instalar dependências
npm install

# 2. Verificar porta
netstat -ano | findstr :3000

# 3. Verificar configuração
npm run setup

# 4. Verificar logs
npm run dev
```

### **Problema 2: WhatsApp Web não conecta**

#### **Causas Possíveis:**
- QR Code expirou
- WhatsApp Web bloqueado
- Problema de rede
- Sessão corrompida

#### **Soluções:**
```bash
# 1. Obter novo QR Code
curl http://localhost:3000/api/whatsapp/qr

# 2. Reiniciar WhatsApp Web
curl -X POST http://localhost:3000/api/whatsapp/disconnect
curl -X POST http://localhost:3000/api/whatsapp/initialize

# 3. Limpar sessão (se necessário)
rm -rf .wwebjs_auth
npm run dev
```

### **Problema 3: Agendador não funciona**

#### **Causas Possíveis:**
- Agendador não iniciado
- Configuração incorreta
- Problema de timezone
- Erro no código

#### **Soluções:**
```bash
# 1. Verificar status
curl http://localhost:3000/api/confirmation/scheduler/status

# 2. Iniciar agendador
curl -X POST http://localhost:3000/api/confirmation/scheduler/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# 3. Configurar intervalo
curl -X POST http://localhost:3000/api/confirmation/scheduler/interval \
  -H "Content-Type: application/json" \
  -d '{"minutes": 5}'
```

### **Problema 4: Configurações não encontradas**

#### **Causas Possíveis:**
- Jogo não tem configuração de confirmação
- Configurações inativas
- Problema no banco de dados
- Erro de conexão

#### **Soluções:**
1. **Verificar no Flutter:**
   - Ir para o jogo
   - Configurar confirmações de presença
   - Salvar configurações

2. **Verificar no banco:**
```sql
-- Verificar jogos com configuração
SELECT 
    g.id,
    g.name,
    g.status,
    gcc.id as config_id,
    gcc.is_active
FROM games g
LEFT JOIN game_confirmation_configs gcc ON g.id = gcc.game_id
WHERE g.status = 'active';
```

### **Problema 5: Horários não atingidos**

#### **Causas Possíveis:**
- Horários configurados incorretamente
- Timezone incorreto
- Sessões passadas
- Cálculo de horário errado

#### **Soluções:**
1. **Verificar configurações:**
   - Horários de envio para mensalistas
   - Horários de envio para avulsos
   - Data/hora das sessões

2. **Verificar timezone:**
```bash
# Verificar timezone configurado
echo $DEFAULT_TIMEZONE
```

3. **Testar envio manual:**
```bash
# Substituir GAME_ID pelo ID real
curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID
```

### **Problema 6: Mensagens não enviam**

#### **Causas Possíveis:**
- WhatsApp Web desconectado
- Números de telefone incorretos
- Rate limiting do WhatsApp
- Erro na API

#### **Soluções:**
```bash
# 1. Testar envio de mensagem
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste do motor"
  }'

# 2. Verificar logs
tail -f logs/combined.log

# 3. Verificar status do WhatsApp
curl http://localhost:3000/api/whatsapp/status
```

## 🧪 **Testes de Funcionamento**

### **Teste 1: Backend Completo**
```bash
# 1. Iniciar backend
npm run dev

# 2. Verificar health
curl http://localhost:3000/health

# 3. Verificar WhatsApp
curl http://localhost:3000/api/whatsapp/status

# 4. Verificar agendador
curl http://localhost:3000/api/confirmation/scheduler/status
```

### **Teste 2: Envio Manual**
```bash
# Substituir GAME_ID pelo ID real do jogo
curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID
```

### **Teste 3: WhatsApp**
```bash
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste do VaiDarJogo Backend"
  }'
```

## 📊 **Monitoramento**

### **Logs Importantes**
```bash
# Ver logs em tempo real
tail -f logs/combined.log

# Filtrar logs do agendador
grep "Scheduler" logs/combined.log

# Filtrar logs do WhatsApp
grep "WhatsApp" logs/combined.log

# Filtrar erros
grep "ERROR" logs/error.log
```

### **Verificações Periódicas**
```bash
# Status geral
curl http://localhost:3000/health

# Status do WhatsApp
curl http://localhost:3000/api/whatsapp/status

# Status do agendador
curl http://localhost:3000/api/confirmation/scheduler/status
```

## 🚨 **Ações de Emergência**

### **Se nada funcionar:**

1. **Reiniciar tudo:**
```bash
# Parar backend (Ctrl+C)
# Limpar sessão WhatsApp
rm -rf .wwebjs_auth

# Reiniciar
npm run dev
```

2. **Verificar configurações:**
```bash
# Verificar variáveis de ambiente
cat .env

# Verificar dependências
npm list
```

3. **Executar diagnóstico completo:**
```bash
npm run diagnostico
```

## 📞 **Suporte**

### **Informações para Suporte:**
- Logs de erro
- Status dos sistemas
- Configurações do jogo
- Horários configurados
- Resultado dos testes

### **Comandos Úteis:**
```bash
# Diagnóstico completo
npm run diagnostico

# Verificar status
curl http://localhost:3000/health

# Ver logs
tail -f logs/combined.log

# Testar envio
curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID
```

**Execute o diagnóstico automatizado primeiro: `npm run diagnostico`** 🔍





