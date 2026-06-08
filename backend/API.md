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

## Progresso

### Concluir aula

- Metodo: `POST`
- URL: `/api/progresso/concluir-aula`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Body:

```json
{
  "aulaId": "ID_DA_AULA"
}
```

Observacao: se a aula ja estiver concluida pelo usuario, o XP nao sera somado novamente.

Resposta de exemplo:

```json
{
  "message": "Aula concluida com sucesso.",
  "progresso": {
    "usuario": "ID_DO_USUARIO",
    "aula": "ID_DA_AULA",
    "assistida": true,
    "percentual": 100,
    "xpGanho": 50,
    "concluidaEm": "2026-06-08T03:00:00.000Z"
  },
  "xpGanho": 50,
  "user": {
    "id": "ID_DO_USUARIO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "xp": 550,
    "nivel": 2,
    "streak": 3,
    "lastStudyDate": "2026-06-08",
    "totalAulasConcluidas": 11
  }
}
```

Regras de nivel:

- Nivel 1: 0 XP
- Nivel 2: 500 XP
- Nivel 3: 1000 XP
- Nivel 4: 2000 XP
- Nivel 5: 4000 XP
- Nivel 6: 7000 XP
- Nivel 7: 11000 XP
- Nivel 8: 16000 XP

### Listar meu progresso

- Metodo: `GET`
- URL: `/api/progresso/me`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DO_PROGRESSO",
    "usuario": "ID_DO_USUARIO",
    "aula": {
      "_id": "ID_DA_AULA",
      "titulo": "Introducao a fracoes",
      "disciplina": {
        "_id": "ID_DA_DISCIPLINA",
        "nome": "Matematica",
        "categoria": "Exatas",
        "emoji": "📐"
      },
      "xpReward": 50
    },
    "assistida": true,
    "percentual": 100,
    "xpGanho": 50
  }
]
```

### Resumo do meu progresso

- Metodo: `GET`
- URL: `/api/progresso/resumo`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
{
  "xp": 550,
  "nivel": 2,
  "streak": 3,
  "lastStudyDate": "2026-06-08",
  "totalAulasConcluidas": 11,
  "totalAulasDisponiveis": 40,
  "percentualConcluido": 28,
  "progressosRecentes": [
    {
      "_id": "ID_DO_PROGRESSO",
      "aula": {
        "_id": "ID_DA_AULA",
        "titulo": "Introducao a fracoes",
        "disciplina": {
          "_id": "ID_DA_DISCIPLINA",
          "nome": "Matematica",
          "categoria": "Exatas",
          "emoji": "📐"
        }
      },
      "assistida": true,
      "percentual": 100,
      "xpGanho": 50
    }
  ]
}
```

### Buscar meu progresso em uma aula

- Metodo: `GET`
- URL: `/api/progresso/aulas/:aulaId`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo quando a aula ainda nao foi concluida:

```json
{
  "aula": {
    "_id": "ID_DA_AULA",
    "titulo": "Introducao a fracoes"
  },
  "assistida": false,
  "percentual": 0,
  "xpGanho": 0,
  "concluidaEm": null
}
```
