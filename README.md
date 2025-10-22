# 🏈 VaiDarJogo Backend

Backend API para o sistema VaiDarJogo - plataforma de gerenciamento de jogos e confirmações de presença.

## 🚀 Funcionalidades

- **Gerenciamento de Jogos**: Criação, edição e controle de jogos
- **Sistema de Confirmações**: Envio automático de confirmações via WhatsApp Business API
- **Agendamento**: Sistema de agendamento automático de confirmações
- **API RESTful**: Endpoints para integração com aplicativo Flutter
- **Integração WhatsApp**: Envio de mensagens via WhatsApp Business API
- **Banco de Dados**: Integração com Supabase (PostgreSQL)

## 🛠️ Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Supabase** - Banco de dados PostgreSQL
- **WhatsApp Business API** - Integração de mensagens
- **Moment.js** - Manipulação de datas
- **Winston** - Sistema de logs
- **Nodemon** - Desenvolvimento

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- Conta no Supabase
- WhatsApp Business API configurado

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/VaiDarJogo_Backend.git
cd VaiDarJogo_Backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas credenciais:
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role

# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=seu_access_token
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_webhook_verify_token
WHATSAPP_API_VERSION=v18.0

# Configurações de Timezone
DEFAULT_TIMEZONE=America/Sao_Paulo
```

4. **Execute o projeto**
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📚 Documentação

### **Configuração WhatsApp Business API**
- [Guia Completo](docs/GUIA_CONFIGURACAO_WHATSAPP_BUSINESS.md)
- [Resumo Prático](RESUMO_CONFIGURACAO_WHATSAPP.md)
- [Exemplos de Mensagens](docs/EXEMPLOS_MENSAGENS_CONFIRMACAO.md)

### **Scripts de Ajuda**
```bash
# Configuração interativa do WhatsApp
node scripts/configurar-whatsapp-business.js

# Guia detalhado de configuração
node scripts/guia-configuracao-detalhado.js

# Teste da integração WhatsApp
node scripts/testar-whatsapp-business.js

# Teste de mensagens de confirmação
node scripts/testar-mensagem-confirmacao.js
```

## 🔌 Endpoints da API

### **WhatsApp**
- `GET /api/whatsapp/status` - Status da configuração
- `GET /api/whatsapp/test-connection` - Teste de conexão
- `POST /api/whatsapp/test` - Envio de mensagem de teste
- `GET /api/whatsapp/webhook` - Verificação do webhook
- `POST /api/whatsapp/webhook` - Recebimento de mensagens

### **Confirmações**
- `POST /api/confirmations/send` - Envio manual de confirmações
- `GET /api/confirmations/status` - Status das confirmações

## 🏗️ Estrutura do Projeto

```
VaiDarJogo_Backend/
├── src/
│   ├── config/          # Configurações
│   ├── controllers/     # Controladores da API
│   ├── models/          # Modelos de dados
│   ├── routes/          # Rotas da API
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Utilitários
│   └── server.js        # Servidor principal
├── scripts/             # Scripts de ajuda
├── docs/                # Documentação
├── logs/                # Logs da aplicação
└── package.json         # Dependências
```

## 🧪 Testes

```bash
# Testar conexão com banco
node scripts/testar-conexao-banco.js

# Testar WhatsApp Business API
node scripts/testar-whatsapp-business.js

# Testar mensagens de confirmação
node scripts/testar-mensagem-confirmacao.js
```

## 📊 Monitoramento

O sistema inclui:
- **Logs estruturados** com Winston
- **Health checks** automáticos
- **Monitoramento de agendador**
- **Métricas de envio de mensagens**

## 🔒 Segurança

- Variáveis de ambiente para credenciais
- Validação de webhooks
- Rate limiting
- Logs de auditoria

## 🚀 Deploy

### **Variáveis de Ambiente para Produção**
```env
NODE_ENV=production
PORT=3000
# ... outras configurações
```

### **Comandos de Deploy**
```bash
# Build
npm run build

# Start
npm start
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- **Email**: suporte@vaidarjogo.com
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/VaiDarJogo_Backend/issues)

## 🎯 Roadmap

- [ ] Implementar templates de mensagens personalizáveis
- [ ] Dashboard de métricas
- [ ] Sistema de notificações push
- [ ] Integração com outros provedores de SMS
- [ ] API de relatórios avançados

---

**Desenvolvido com ❤️ para a comunidade VaiDarJogo**