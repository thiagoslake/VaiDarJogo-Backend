# 🔧 Guia de Debug - Railway Deploy

## 🚨 **Problema Atual:**
O servidor não está iniciando no Railway, mesmo com o build funcionando.

## 🧪 **Teste com Servidor Simplificado:**

### **Opção 1: Usar Servidor Simplificado (Recomendado)**

1. **Renomeie o Dockerfile atual:**
   ```bash
   mv Dockerfile Dockerfile.original
   mv Dockerfile.simple Dockerfile
   ```

2. **Faça commit e push:**
   ```bash
   git add .
   git commit -m "Switch to simple server for debugging"
   git push origin master
   ```

3. **O servidor simplificado:**
   - ✅ Não depende do Supabase
   - ✅ Inicia sempre
   - ✅ Mostra status das variáveis de ambiente
   - ✅ Endpoints de debug: `/health`, `/info`, `/test-env`

### **Opção 2: Configurar Variáveis no Railway**

Se preferir usar o servidor completo:

1. **Acesse Railway Dashboard:**
   - https://railway.app/dashboard
   - Selecione seu projeto

2. **Configure as Variáveis (aba Variables):**
   ```
   SUPABASE_URL=https://ddlxamlaoumhbbrnmasj.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbHhhbWxhb3VtaGJicm5tYXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5NDAwMzcsImV4cCI6MjA3MjUxNjAzN30.VrTmCTDl0zkzP1GQ8YHAqFLbtCUlaYIp7v_4rUHbSMo
   SUPABASE_SERVICE_ROLE_KEY=[OBTER NO SUPABASE]
   ```

3. **Obter SERVICE_ROLE_KEY:**
   - https://supabase.com/dashboard/project/ddlxamlaoumhbbrnmasj
   - Settings → API → "service_role secret"

## 🔍 **Endpoints de Debug:**

### **Servidor Simplificado:**
- `GET /health` - Status básico
- `GET /info` - Informações do servidor
- `GET /test-env` - Status das variáveis de ambiente

### **Servidor Completo:**
- `GET /health` - Status completo
- `GET /` - Informações da API

## 📊 **Interpretação dos Resultados:**

### **Se o servidor simplificado funcionar:**
- ✅ O problema são as variáveis de ambiente
- ✅ Configure as variáveis no Railway
- ✅ Volte para o servidor completo

### **Se o servidor simplificado não funcionar:**
- ❌ Problema mais profundo
- ❌ Verificar logs do Railway
- ❌ Verificar configuração do Railway

## 🚀 **Comandos Rápidos:**

```bash
# Testar servidor simplificado localmente
npm run start:simple

# Verificar variáveis de ambiente
npm run test-railway-env

# Voltar para servidor original
mv Dockerfile Dockerfile.simple
mv Dockerfile.original Dockerfile
```

## 📞 **Próximos Passos:**

1. **Teste com servidor simplificado primeiro**
2. **Verifique se as variáveis estão configuradas**
3. **Configure as variáveis se necessário**
4. **Volte para o servidor completo**

---
**⏰ Tempo estimado: 5-10 minutos para debug completo**
