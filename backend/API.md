# EduVance Backend API

Base URL local:

```txt
http://localhost:3333
```

Para rotas protegidas, envie o token JWT no header:

```txt
Authorization: Bearer SEU_TOKEN
```

## Auth

### Registrar usuario

- Metodo: `POST`
- URL: `/api/auth/register`
- Precisa de token: nao
- Quem pode acessar: qualquer pessoa

Body:

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "senha": "123456",
  "tipo": "aluno",
  "turma": "8A",
  "matricula": "2026001"
}
```

### Login

- Metodo: `POST`
- URL: `/api/auth/login`
- Precisa de token: nao
- Quem pode acessar: qualquer usuario cadastrado

Body:

```json
{
  "email": "maria@email.com",
  "senha": "123456"
}
```

### Usuario logado

- Metodo: `GET`
- URL: `/api/auth/me`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

## Disciplinas

### Criar disciplina

- Metodo: `POST`
- URL: `/api/disciplinas`
- Precisa de token: sim
- Quem pode acessar: professor e admin

Body:

```json
{
  "nome": "Matematica",
  "categoria": "Exatas",
  "emoji": "📐",
  "descricao": "Conteudos de matematica para o ensino fundamental."
}
```

### Listar disciplinas

- Metodo: `GET`
- URL: `/api/disciplinas`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

### Buscar disciplina por id

- Metodo: `GET`
- URL: `/api/disciplinas/:id`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

## Aulas

### Criar aula

- Metodo: `POST`
- URL: `/api/aulas`
- Precisa de token: sim
- Quem pode acessar: professor e admin

Body:

```json
{
  "titulo": "Introducao a fracoes",
  "descricao": "Primeira aula sobre fracoes.",
  "urlVideo": "https://exemplo.com/video",
  "disciplina": "ID_DA_DISCIPLINA",
  "modulo": "Modulo 1",
  "ordem": 1,
  "duracao": 12,
  "xpReward": 50
}
```

### Listar aulas

- Metodo: `GET`
- URL: `/api/aulas`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Opcionalmente, filtre por disciplina:

```txt
/api/aulas?disciplina=ID_DA_DISCIPLINA
```

### Buscar aula por id

- Metodo: `GET`
- URL: `/api/aulas/:id`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

### Atualizar aula

- Metodo: `PUT`
- URL: `/api/aulas/:id`
- Precisa de token: sim
- Quem pode acessar: professor e admin

Body:

```json
{
  "titulo": "Introducao a fracoes atualizada",
  "descricao": "Descricao atualizada.",
  "ordem": 2,
  "xpReward": 75
}
```

### Deletar aula

- Metodo: `DELETE`
- URL: `/api/aulas/:id`
- Precisa de token: sim
- Quem pode acessar: professor e admin
