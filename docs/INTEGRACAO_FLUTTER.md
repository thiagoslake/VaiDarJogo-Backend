# Integração Backend com Flutter App

Este documento descreve como o backend se integra com o aplicativo Flutter para o sistema de confirmação de presença.

## 🔄 Fluxo de Integração

### 1. Configuração no Flutter
```
Flutter App → Supabase → Backend (via agendamento)
```

1. **Administrador configura confirmações** no Flutter
2. **Dados salvos** na tabela `game_confirmation_configs`
3. **Backend detecta** automaticamente via agendamento
4. **Envia confirmações** via WhatsApp

### 2. Processamento de Respostas
```
WhatsApp → Backend Webhook → Supabase → Flutter App
```

1. **Jogador responde** via WhatsApp
2. **Webhook recebe** resposta no backend
3. **Sistema processa** e salva na tabela `player_confirmations`
4. **Flutter App** exibe confirmações atualizadas

## 📊 Tabelas Utilizadas

### `game_confirmation_configs`
- **Criada pelo Flutter**: Configurações de confirmação por jogo
- **Lida pelo Backend**: Para determinar quando e como enviar

### `confirmation_send_configs`
- **Criada pelo Flutter**: Configurações específicas de envio
- **Lida pelo Backend**: Para personalizar mensagens

### `player_confirmations`
- **Criada pelo Backend**: Confirmações dos jogadores
- **Lida pelo Flutter**: Para exibir status de confirmação

### `confirmation_send_logs`
- **Criada pelo Backend**: Logs de envio
- **Lida pelo Flutter**: Para relatórios e debug

## 🔧 Configuração Necessária

### 1. Variáveis de Ambiente do Backend

```env
# Supabase (mesmo banco do Flutter)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_token
```

### 2. Webhook do WhatsApp

Configure o webhook do WhatsApp para apontar para:
```
https://your-backend-domain.com/api/whatsapp/webhook
```

### 3. Políticas RLS no Supabase

Certifique-se de que as políticas RLS permitem:
- **Backend ler** configurações de confirmação
- **Backend escrever** confirmações e logs
- **Flutter ler/escrever** todas as tabelas

## 📱 Endpoints para Integração Flutter

### Verificar Status do Backend
```http
GET /api/confirmation/health
```

### Enviar Confirmação Manual
```http
POST /api/confirmation/manual
Content-Type: application/json

{
  "gameId": "uuid-do-jogo",
  "playerId": "uuid-do-jogador", 
  "sessionDate": "2025-10-21"
}
```

### Obter Logs de Envio
```http
GET /api/confirmation/logs?gameId=uuid-do-jogo&startDate=2025-10-01&endDate=2025-10-31
```

### Controlar Agendador
```http
POST /api/confirmation/scheduler/control
Content-Type: application/json

{
  "action": "start" // ou "stop"
}
```

## 🔄 Sincronização de Dados

### Backend → Flutter
- **Confirmações**: Backend salva em `player_confirmations`
- **Logs**: Backend salva em `confirmation_send_logs`
- **Flutter**: Lê dados em tempo real via Supabase

### Flutter → Backend
- **Configurações**: Flutter salva em `game_confirmation_configs`
- **Backend**: Detecta mudanças via agendamento
- **Processamento**: Backend processa automaticamente

## 📋 Checklist de Integração

### ✅ Configuração Inicial
- [ ] Backend configurado com variáveis de ambiente
- [ ] Webhook do WhatsApp configurado
- [ ] Políticas RLS configuradas no Supabase
- [ ] Backend rodando e agendador ativo

### ✅ Teste de Integração
- [ ] Criar configuração de confirmação no Flutter
- [ ] Verificar se backend detecta a configuração
- [ ] Testar envio de confirmação manual
- [ ] Testar resposta via WhatsApp
- [ ] Verificar se confirmação aparece no Flutter

### ✅ Monitoramento
- [ ] Logs do backend funcionando
- [ ] Health check respondendo
- [ ] Agendador processando corretamente
- [ ] Webhook recebendo respostas

## 🐛 Troubleshooting

### Problema: Confirmações não sendo enviadas
**Verificar:**
1. Agendador está rodando? (`GET /api/confirmation/scheduler/status`)
2. Configuração existe no banco?
3. Horário de envio já passou?
4. Logs de erro no backend

### Problema: Respostas não sendo processadas
**Verificar:**
1. Webhook configurado corretamente?
2. Token de verificação correto?
3. Logs do webhook no backend
4. Políticas RLS permitem escrita?

### Problema: Flutter não vê confirmações
**Verificar:**
1. Backend salvou na tabela `player_confirmations`?
2. Políticas RLS permitem leitura?
3. Flutter está fazendo refresh dos dados?

## 📊 Monitoramento

### Logs Importantes
```bash
# Verificar se agendador está funcionando
grep "Scheduler" logs/combined.log

# Verificar envios de WhatsApp
grep "WhatsApp Message Sent" logs/combined.log

# Verificar erros
grep "ERROR" logs/error.log
```

### Métricas Úteis
- Número de confirmações enviadas por dia
- Taxa de resposta dos jogadores
- Tempo médio de processamento
- Erros de envio

## 🚀 Deploy em Produção

### 1. Configurar Domínio
- Backend deve ter domínio HTTPS
- Webhook do WhatsApp precisa de HTTPS

### 2. Configurar Monitoramento
- Logs centralizados
- Alertas para falhas
- Health checks automáticos

### 3. Backup e Recuperação
- Backup regular do banco
- Configuração de disaster recovery
- Teste de restauração

## 📞 Suporte

Para problemas de integração:
1. Verificar logs do backend
2. Testar endpoints manualmente
3. Verificar configurações do Supabase
4. Consultar documentação da API





