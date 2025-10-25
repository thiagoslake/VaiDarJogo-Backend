# 🚨 CORREÇÃO URGENTE - Railway Deploy

## ❌ **Problema Atual:**
O servidor não está iniciando porque as variáveis de ambiente do Supabase não estão configuradas no Railway.

## 🔧 **Solução Imediata:**

### **1. Acesse o Railway:**
- Vá para: https://railway.app/dashboard
- Selecione seu projeto VaiDarJogo Backend

### **2. Configure as Variáveis:**
- Clique na aba **"Variables"**
- Adicione as seguintes variáveis:

#### **✅ SUPABASE_URL (OBRIGATÓRIO)**
```
https://ddlxamlaoumhbbrnmasj.supabase.co
```

#### **✅ SUPABASE_ANON_KEY (OBRIGATÓRIO)**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbHhhbWxhb3VtaGJicm5tYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDAwMzcsImV4cCI6MjA3MjUxNjAzN30.VrTmCTDl0zkzP1GQ8YHAqFLbtCUlaYIp7v_4rUHbSMo
```

#### **⚠️ SUPABASE_SERVICE_ROLE_KEY (OBRIGATÓRIO)**
```
[OBTER NO PAINEL DO SUPABASE]
```

### **3. Como Obter a SERVICE_ROLE_KEY:**
1. Acesse: https://supabase.com/dashboard/project/ddlxamlaoumhbbrnmasj
2. Vá em **Settings** → **API**
3. Copie a chave **"service_role secret"**
4. Cole no Railway como `SUPABASE_SERVICE_ROLE_KEY`

### **4. Variáveis Opcionais (Recomendadas):**
```
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
DEFAULT_TIMEZONE=America/Sao_Paulo
```

## 🚀 **Após Configurar:**
1. O Railway fará deploy automático
2. O healthcheck `/health` deve funcionar
3. O servidor deve iniciar corretamente

## 🔍 **Verificação:**
- Acesse: `https://seu-projeto.railway.app/health`
- Deve retornar: `{"success": true, "message": "VaiDarJogo Backend está funcionando"}`

## 📞 **Se Ainda Não Funcionar:**
1. Verifique se todas as variáveis estão corretas
2. Verifique se a SERVICE_ROLE_KEY está válida
3. Verifique os logs do Railway para mais detalhes

---
**⏰ Tempo estimado: 2-3 minutos para configurar**
