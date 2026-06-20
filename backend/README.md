# EduVance Backend

Backend do EduVance feito com Express, TypeScript, MongoDB e Mongoose.

## Como instalar

```bash
cd backend
npm install
```

## Como configurar o `.env`

Crie o arquivo `.env` na pasta `backend` seguindo o modelo:

```env
PORT=3333
MONGO_URI=sua_string_do_mongodb
JWT_SECRET=eduvance_secret
EDUAI_MODE=mock
FRONTEND_URL=http://localhost:5180
BACKEND_URL=http://localhost:3333
MERCADO_PAGO_ACCESS_TOKEN=
```

Campos:

- `PORT`: porta da API.
- `MONGO_URI`: conexão do MongoDB.
- `JWT_SECRET`: segredo usado para assinar o JWT.
- `EDUAI_MODE`: use `mock` para resposta simulada da EduAI.
- `FRONTEND_URL`: URL do frontend liberada para acessar a API. Em producao, use a URL da Vercel, por exemplo `https://seu-projeto.vercel.app`.
- `BACKEND_URL`: URL publica da API. Em producao, use a URL do Railway, por exemplo `https://sua-api.up.railway.app`.
- `MERCADO_PAGO_ACCESS_TOKEN`: token privado do Mercado Pago usado somente no backend.

No deploy:

- Railway/backend: configure `FRONTEND_URL=https://seu-projeto.vercel.app`.
- Railway/backend: configure `BACKEND_URL=https://sua-api.up.railway.app`.
- Railway/backend: configure `MERCADO_PAGO_ACCESS_TOKEN` com a credencial privada do Mercado Pago.
- Vercel/frontend: configure `VITE_API_URL=https://sua-api.up.railway.app/api`.

## Como rodar o backend

Modo desenvolvimento:

```bash
npm run dev
```

Build TypeScript:

```bash
npm run build
```

Rodar build compilada:

```bash
npm start
```

API local:

```txt
http://localhost:3333
```

## Como rodar o seed

```bash
npm run seed
```

O seed cria dados de demonstração sem apagar dados existentes.

## Usuários de teste

```txt
admin@eduvance.com / 123456
professor@eduvance.com / 123456
aluno@eduvance.com / 123456
premium@eduvance.com / 123456
```

Perfis:

- Admin: acessa dashboard administrativo.
- Professor: cria disciplinas, aulas e quizzes.
- Aluno grátis: acessa conteúdos grátis.
- Aluno premium: acessa conteúdos grátis e premium.

## Principais rotas

Auth:

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Disciplinas:

```txt
POST /api/disciplinas
GET  /api/disciplinas
GET  /api/disciplinas/:id
```

Aulas:

```txt
POST   /api/aulas
GET    /api/aulas
GET    /api/aulas/:id
PUT    /api/aulas/:id
DELETE /api/aulas/:id
```

Progresso:

```txt
POST /api/progresso/concluir-aula
GET  /api/progresso/me
GET  /api/progresso/resumo
GET  /api/progresso/aulas/:aulaId
```

Quizzes:

```txt
POST /api/quizzes
GET  /api/quizzes
GET  /api/quizzes/:id
POST /api/quizzes/:id/responder
GET  /api/quizzes/me/resultados
```

Planos:

```txt
GET   /api/planos/me
PATCH /api/planos/upgrade
PATCH /api/planos/downgrade
```

EduAI:

```txt
POST  /api/eduai/perguntar
GET   /api/eduai/conversas
GET   /api/eduai/conversas/:id
GET   /api/eduai/limite
PATCH /api/eduai/resetar-limite
```

Admin:

```txt
GET /api/admin/dashboard
GET /api/admin/users
GET /api/admin/ranking
```

## Documentação completa

Veja [API.md](./API.md) para exemplos de body e resposta de cada rota.
