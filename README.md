# DuoFuturo BI - Business Intelligence Platform

**Transformando dados em futuro**

Uma aplicação completa de Business Intelligence com sistema de autenticação, gestão de usuários e integração com Tableau Cloud.

## 🏢 Empresa

**DuoFuturo** - Plataforma de Business Intelligence
- **Missão:** Fornecer soluções avançadas de Business Intelligence
- **Visão:** Ser referência em análise de dados e dashboards interativos  
- **Valores:** Inovação, Precisão, Transparência, Resultados
- **Contato:** futuroncontato@gmail.com
- **Localização:** São Paulo, SP - Brasil

## 🚀 Características

### Core Features
- ✅ Landing page institucional com identidade visual DuoFuturo
- ✅ Sistema de autenticação JWT com Redis para sessões
- ✅ Integração completa com Tableau Cloud usando Connected App
- ✅ Gestão de usuários com roles (viewer/creator)
- ✅ Dashboard responsivo com toggle desktop/mobile
- ✅ API REST completa com validação e segurança
- ✅ Interface administrativa para gestão de usuários e dashboards
- ✅ Sistema de reset de senha com validação por email/data

### Design Elements
- 🎨 Paleta de cores DuoFuturo (#1a1a1a, #2c3e50, #34495e, #f4f4f4, #00c3ff)
- 📱 Design moderno e profissional com Material Design
- 📱 Interface responsiva otimizada para desktop e mobile
- ✨ Animações suaves e micro-interações
- 🔒 Headers específicos para embedding Tableau
- ⏳ Loading states e error handling elegantes
- 🧭 Sistema de navegação intuitivo com sidebar retrátil

## 🏗️ Arquitetura

### Stack Tecnológica
- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Express.js + Node.js 20
- **Database:** PostgreSQL 16 + Redis 7
- **Authentication:** JWT + Sessions
- **BI Integration:** Tableau Cloud Connected App
- **Server:** Nginx + PM2
- **OS:** Ubuntu 24.04 LTS

### Infraestrutura (VPS Contabo)
- **IP:** 161.97.127.54
- **RAM:** 8GB (otimizado)
- **Storage:** 150GB SSD
- **CPU:** 4 cores
- **Uptime:** 99.9%+ estável

## 🔧 Configuração

### Variáveis de Ambiente
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=duofuturo_bi
DB_USER=duofuturo_user
DB_PASSWORD=DuoFuturo2025!@#

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=DuoFuturo2025JWT!@#SecretKey
JWT_REFRESH_SECRET=DuoFuturo2025RefreshJWT!@#SecretKey

# Tableau
TABLEAU_EMBEDDED_ID=3a8d113d-e4dc-44eb-a3b9-e4d79ee60d8e
TABLEAU_EMBEDDED_KEY_ID=0c11222f-9cec-4b3c-a366-b9e896299272
TABLEAU_EMBEDDED_SECRET=4mtYgy+k+qonbIHB1XnCTYrMqumoivCy95+ezVx2joo=
TABLEAU_USER_EMAIL=futuroncontato@gmail.com
TABLEAU_DOMAIN=prod-useast-a.online.tableau.com
TABLEAU_SITE_ID=futurondataview

# Application
NODE_ENV=production
PORT=5000
FRONTEND_URL=http://161.97.127.54:5000
```

### Instalação Rápida
```bash
# 1. Clone e instale dependências
git clone <repository>
cd duofuturo-bi
npm install

# 2. Configure ambiente
cp .env.example .env
# Edite .env com suas configurações

# 3. Initialize database
npm run server:dev # Executa initDb automaticamente

# 4. Build aplicação
npm run build

# 5. Start com PM2
pm2 start ecosystem.config.js
pm2 save
```

## 📊 Dashboards Tableau

### Dashboards Disponíveis
1. **Petróleo e Gás - Balanço**
   - Categoria: Mercado Financeiro
   - URL: https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_Balano/Balao

2. **Reclame Aqui - Análise**
   - Categoria: Brand Analysis  
   - URL: https://prod-useast-a.online.tableau.com/t/futurondataview/views/Petrobras_ReclameAqui/ReclameAqui-Pessoal

### Integração Tableau
- ✅ Connected App configurado
- ✅ JWT token generation automático
- ✅ Embedding seguro com CSP headers
- ✅ Toggle desktop/mobile views
- ✅ Fullscreen support
- ✅ Loading states

## 👥 Sistema de Usuários

### Roles
- **viewer:** Acesso apenas aos dashboards atribuídos
- **creator:** Acesso completo + gestão de usuários e dashboards

### Credenciais Padrão
```
Email: admin@duofuturo.com
Senha: DuoFuturo123!
Role: creator
```

### Funcionalidades
- ✅ Autenticação JWT segura
- ✅ Gestão de senhas com bcrypt (12 rounds)
- ✅ Controle de acesso por dashboard
- ✅ Reset de senha via email/data nascimento
- ✅ Sessões Redis com expiração
- ✅ Rate limiting e security headers

## 🔒 Segurança

### Medidas Implementadas
- JWT com refresh tokens
- Redis session management
- bcrypt password hashing (12 rounds)
- Rate limiting por IP
- CORS configurado
- Helmet security headers
- Input validation com Joi
- SQL injection prevention
- XSS protection

### Headers CSP para Tableau
```
Content-Security-Policy: frame-ancestors 'self' https://prod-useast-a.online.tableau.com
X-Frame-Options: SAMEORIGIN
```

## 🚀 Deploy

### URLs da Aplicação
- **Landing Page:** http://161.97.127.54:5000
- **Health Check:** http://161.97.127.54:5000/health  
- **Dashboard App:** http://161.97.127.54:5000/dashboard
- **API:** http://161.97.127.54:5000/api/

### Comandos de Produção
```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs duofuturo-bi --lines 20

# Restart aplicação
pm2 restart duofuturo-bi

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx

# Monitor recursos
htop
```

### Monitoramento
- PM2 process management
- Nginx access/error logs
- Application structured logging
- Health check endpoint
- Resource monitoring

## 📁 Estrutura do Projeto

```
duofuturo-bi/
├── server/              # Backend Express.js
│   ├── config/         # Database, Redis, Tableau config
│   ├── controllers/    # Auth, Dashboard, User controllers
│   ├── middleware/     # Auth, validation middleware
│   ├── routes/         # API routes
│   ├── scripts/        # Database initialization
│   └── index.js        # Server entry point
├── src/                # Frontend React
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts (Auth)
│   ├── pages/          # Page components
│   ├── services/       # API client
│   └── App.tsx         # Main App component
├── dist/               # Built frontend (generated)
├── ecosystem.config.js # PM2 configuration
├── nginx.conf          # Nginx configuration
└── package.json        # Dependencies and scripts
```

## 🔧 Development

### Scripts Disponíveis
```bash
npm run dev          # Frontend development server
npm run build        # Build production frontend
npm run server       # Start backend server
npm run server:dev   # Start backend with auto-reload
npm run lint         # Run ESLint
```

### API Endpoints
```
Auth:
POST /api/auth/login
POST /api/auth/register  
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/reset-password

Users:
GET  /api/users/profile
GET  /api/users/         (creator only)
GET  /api/users/:id      (creator only)
PUT  /api/users/:id      (creator only)
DELETE /api/users/:id    (creator only)
POST /api/users/:id/change-password

Dashboards:
GET  /api/dashboards/
GET  /api/dashboards/:id
GET  /api/dashboards/tableau/token
POST /api/dashboards/    (creator only)
PUT  /api/dashboards/:id (creator only)
DELETE /api/dashboards/:id (creator only)
POST /api/dashboards/assign   (creator only)
POST /api/dashboards/unassign (creator only)
```

## 📞 Suporte

### Contatos
- **GitHub:** https://github.com/diogobho/
- **Email Técnico:** diogo_bho@hotmail.com
- **Email Empresa:** futuroncontato@gmail.com

### Status do Sistema
- ✅ **Infraestrutura:** Pronta e estável
- ✅ **Database:** PostgreSQL + Redis operacionais
- ✅ **Tableau:** Connected App validado
- ✅ **Deploy:** Processo automatizado
- ✅ **Monitoramento:** PM2 + Nginx configurados

---

**DuoFuturo BI v1.0** - Transformando dados em futuro 🚀