# 🔍 Diagnóstico do Motor de Confirmações

## 🚨 **Problema Identificado**

O motor de confirmações não está enviando mensagens automaticamente após quase 1 dia de execução.

## 🔍 **Possíveis Causas**

### **1. Backend Não Está Rodando**
- ❌ **Status**: Backend não está ativo na porta 3000
- 🔧 **Solução**: Iniciar o backend

### **2. WhatsApp Web Não Conectado**
- ❌ **Possível**: QR Code não foi escaneado
- 🔧 **Solução**: Verificar conexão do WhatsApp Web

### **3. Agendador Não Iniciado**
- ❌ **Possível**: Sistema de agendamento não está ativo
- 🔧 **Solução**: Verificar status do agendador

### **4. Configurações de Confirmação**
- ❌ **Possível**: Jogo não tem configuração de confirmação
- 🔧 **Solução**: Verificar configurações no banco

### **5. Horários de Envio**
- ❌ **Possível**: Horários configurados não foram atingidos
- 🔧 **Solução**: Verificar cálculos de horário

### **6. Problemas de Conexão**
- ❌ **Possível**: Erro na conexão com Supabase
- 🔧 **Solução**: Verificar configurações do banco

## 🛠️ **Passos para Diagnóstico**

### **1. Verificar se Backend Está Rodando**
```bash
# Verificar processo
netstat -ano | findstr :3000

# Testar health check
curl http://localhost:3000/health
```

### **2. Verificar Status do WhatsApp Web**
```bash
# Status da conexão
curl http://localhost:3000/api/whatsapp/status

# Verificar se tem QR Code
curl http://localhost:3000/api/whatsapp/qr
```

### **3. Verificar Status do Agendador**
```bash
# Status do agendador
curl http://localhost:3000/api/confirmation/scheduler/status
```

### **4. Verificar Configurações do Jogo**
```sql
-- Verificar se o jogo tem configuração de confirmação
SELECT 
    g.id,
    g.name,
    g.status,
    gcc.id as config_id,
    gcc.is_active
FROM games g
LEFT JOIN game_confirmation_configs gcc ON g.id = gcc.game_id
WHERE g.status = 'active'
ORDER BY g.created_at DESC;
```

### **5. Verificar Configurações de Envio**
```sql
-- Verificar configurações de envio
SELECT 
    gcc.game_id,
    g.name as game_name,
    csc.player_type,
    csc.hours_before,
    csc.is_active
FROM game_confirmation_configs gcc
JOIN games g ON gcc.game_id = g.id
JOIN confirmation_send_configs csc ON gcc.id = csc.game_confirmation_config_id
WHERE g.status = 'active' 
AND gcc.is_active = true
AND csc.is_active = true;
```

### **6. Verificar Próximas Sessões**
```sql
-- Verificar próximas sessões
SELECT 
    g.id as game_id,
    g.name as game_name,
    gs.session_date,
    gs.session_time,
    NOW() as current_time,
    (gs.session_date + gs.session_time) as session_datetime
FROM games g
JOIN game_sessions gs ON g.id = gs.game_id
WHERE g.status = 'active'
AND gs.session_date >= CURRENT_DATE
ORDER BY gs.session_date, gs.session_time;
```

### **7. Verificar Logs de Envio**
```sql
-- Verificar logs de envio
SELECT 
    csl.*,
    g.name as game_name,
    u.name as player_name
FROM confirmation_send_logs csl
JOIN games g ON csl.game_id = g.id
JOIN users u ON csl.player_id = u.id
ORDER BY csl.created_at DESC
LIMIT 10;
```

## 🔧 **Soluções por Problema**

### **Problema 1: Backend Não Está Rodando**
```bash
# Iniciar backend
cd VaiDarJogo_Backend
npm run dev

# Verificar se iniciou
curl http://localhost:3000/health
```

### **Problema 2: WhatsApp Web Não Conectado**
```bash
# Verificar status
curl http://localhost:3000/api/whatsapp/status

# Se não estiver conectado, escanear QR Code
curl http://localhost:3000/api/whatsapp/qr
```

### **Problema 3: Agendador Não Iniciado**
```bash
# Verificar status
curl http://localhost:3000/api/confirmation/scheduler/status

# Iniciar agendador
curl -X POST http://localhost:3000/api/confirmation/scheduler/control \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

### **Problema 4: Configurações Faltando**
- Verificar se o jogo tem configuração de confirmação
- Verificar se as configurações estão ativas
- Verificar se os horários estão corretos

### **Problema 5: Horários Não Atingidos**
- Verificar se os horários de envio já passaram
- Verificar se as sessões são futuras
- Verificar timezone configurado

### **Problema 6: Erro de Conexão**
- Verificar variáveis de ambiente do Supabase
- Verificar se o banco está acessível
- Verificar logs de erro

## 🧪 **Teste Manual**

### **1. Testar Envio Manual**
```bash
# Enviar confirmação manual para um jogo
curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID \
  -H "Content-Type: application/json"
```

### **2. Testar Envio de Mensagem**
```bash
# Testar envio de mensagem
curl -X POST http://localhost:3000/api/whatsapp/test \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "5511999999999",
    "message": "Teste do motor de confirmações"
  }'
```

### **3. Verificar Logs em Tempo Real**
```bash
# Ver logs em tempo real
tail -f logs/combined.log

# Filtrar logs do agendador
grep "Scheduler" logs/combined.log

# Filtrar logs do WhatsApp
grep "WhatsApp" logs/combined.log
```

## 📊 **Checklist de Diagnóstico**

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

## 🚨 **Ações Imediatas**

### **1. Iniciar Backend**
```bash
cd VaiDarJogo_Backend
npm run dev
```

### **2. Verificar Conexão WhatsApp**
```bash
curl http://localhost:3000/api/whatsapp/status
```

### **3. Verificar Agendador**
```bash
curl http://localhost:3000/api/confirmation/scheduler/status
```

### **4. Testar Envio Manual**
```bash
# Substituir GAME_ID pelo ID real do jogo
curl -X POST http://localhost:3000/api/confirmation/process/GAME_ID
```

## 📞 **Próximos Passos**

1. **Executar diagnóstico** completo
2. **Identificar problema** específico
3. **Aplicar solução** correspondente
4. **Testar funcionamento** do motor
5. **Monitorar logs** para confirmar envios
6. **Configurar alertas** para futuros problemas

**Execute os passos de diagnóstico para identificar a causa exata do problema!** 🔍








