# 🧪 Instruções de Teste - Railway Debug

## ✅ **O que foi feito:**
- Modifiquei o Dockerfile para usar o servidor simplificado
- O Railway está fazendo deploy agora com `npm run start:simple`

## 🔍 **O que esperar:**

### **Se o servidor simplificado funcionar:**
- ✅ O healthcheck `/health` deve passar
- ✅ O servidor deve iniciar sem erros
- ✅ Você pode acessar: `https://seu-projeto.railway.app/health`
- ✅ Você pode acessar: `https://seu-projeto.railway.app/test-env`

### **Se o servidor simplificado NÃO funcionar:**
- ❌ Problema mais profundo (configuração do Railway, etc.)
- ❌ Verificar logs detalhados do Railway

## 📊 **Endpoints para testar:**

### **1. Health Check:**
```
GET https://seu-projeto.railway.app/health
```
**Resposta esperada:**
```json
{
  "success": true,
  "message": "VaiDarJogo Backend está funcionando (versão simplificada)",
  "timestamp": "2025-10-25T16:00:00.000Z",
  "uptime": 123.456,
  "version": "1.0.0-simple",
  "environment": {
    "NODE_ENV": "production",
    "PORT": "3000",
    "SUPABASE_URL": "NÃO CONFIGURADA",
    "SUPABASE_ANON_KEY": "NÃO CONFIGURADA", 
    "SUPABASE_SERVICE_ROLE_KEY": "NÃO CONFIGURADA"
  }
}
```

### **2. Test Environment Variables:**
```
GET https://seu-projeto.railway.app/test-env
```
**Resposta esperada:**
```json
{
  "success": false,
  "message": "Algumas variáveis estão faltando",
  "variables": [
    {
      "name": "SUPABASE_URL",
      "configured": false,
      "value": "NÃO CONFIGURADA"
    },
    {
      "name": "SUPABASE_ANON_KEY", 
      "configured": false,
      "value": "NÃO CONFIGURADA"
    },
    {
      "name": "SUPABASE_SERVICE_ROLE_KEY",
      "configured": false,
      "value": "NÃO CONFIGURADA"
    }
  ],
  "recommendation": "Configure as variáveis no Railway Dashboard"
}
```

## 🚀 **Próximos Passos:**

### **Se o servidor simplificado funcionar:**

1. **Configure as variáveis no Railway:**
   - Acesse: https://railway.app/dashboard
   - Selecione seu projeto
   - Vá para a aba **Variables**
   - Adicione:
     ```
     SUPABASE_URL=https://ddlxamlaoumhbbrnmasj.supabase.co
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbHhhbWxhb3VtaGJicm5tYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDAwMzcsImV4cCI6MjA3MjUxNjAzN30.VrTmCTDl0zkzP1GQ8YHAqFLbtCUlaYIp7v_4rUHbSMo
     SUPABASE_SERVICE_ROLE_KEY=[OBTER NO SUPABASE]
     ```

2. **Obter SERVICE_ROLE_KEY:**
   - https://supabase.com/dashboard/project/ddlxamlaoumhbbrnmasj
   - Settings → API → "service_role secret"

3. **Voltar para o servidor completo:**
   ```bash
   # Modificar Dockerfile de volta
   sed -i 's/start:simple/start/' Dockerfile
   git add Dockerfile
   git commit -m "Switch back to full server after fixing environment variables"
   git push origin master
   ```

### **Se o servidor simplificado NÃO funcionar:**

1. **Verificar logs do Railway** para mais detalhes
2. **Verificar configuração do Railway** (porta, domínio, etc.)
3. **Contatar suporte do Railway** se necessário

## ⏰ **Tempo estimado:**
- **Deploy**: 2-3 minutos
- **Teste**: 1-2 minutos  
- **Configuração**: 2-3 minutos
- **Total**: 5-8 minutos

---
**🎯 O servidor simplificado deve funcionar e mostrar exatamente o que está faltando!**

