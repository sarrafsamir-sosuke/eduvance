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

## Quizzes

### Criar quiz

- Metodo: `POST`
- URL: `/api/quizzes`
- Precisa de token: sim
- Quem pode acessar: professor e admin

Body:

```json
{
  "titulo": "Quiz de fracoes",
  "descricao": "Verifica os conceitos iniciais de fracoes.",
  "disciplina": "ID_DA_DISCIPLINA",
  "aula": "ID_DA_AULA",
  "xpPorAcerto": 10,
  "questoes": [
    {
      "pergunta": "Qual fracao representa metade?",
      "alternativas": ["1/3", "1/2", "2/3", "3/4"],
      "respostaCorreta": 1,
      "explicacao": "Metade significa uma parte de duas."
    }
  ]
}
```

Resposta de exemplo:

```json
{
  "_id": "ID_DO_QUIZ",
  "titulo": "Quiz de fracoes",
  "disciplina": {
    "_id": "ID_DA_DISCIPLINA",
    "nome": "Matematica"
  },
  "aula": {
    "_id": "ID_DA_AULA",
    "titulo": "Introducao a fracoes"
  },
  "professor": {
    "_id": "ID_DO_PROFESSOR",
    "nome": "Professor"
  },
  "questoes": [
    {
      "pergunta": "Qual fracao representa metade?",
      "alternativas": ["1/3", "1/2", "2/3", "3/4"],
      "respostaCorreta": 1,
      "explicacao": "Metade significa uma parte de duas."
    }
  ],
  "xpPorAcerto": 10,
  "ativo": true
}
```

### Listar quizzes

- Metodo: `GET`
- URL: `/api/quizzes`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DO_QUIZ",
    "titulo": "Quiz de fracoes",
    "disciplina": {
      "_id": "ID_DA_DISCIPLINA",
      "nome": "Matematica"
    },
    "aula": {
      "_id": "ID_DA_AULA",
      "titulo": "Introducao a fracoes"
    },
    "questoes": [
      {
        "pergunta": "Qual fracao representa metade?",
        "alternativas": ["1/3", "1/2", "2/3", "3/4"],
        "explicacao": "Metade significa uma parte de duas."
      }
    ],
    "xpPorAcerto": 10,
    "ativo": true
  }
]
```

### Buscar quiz por id

- Metodo: `GET`
- URL: `/api/quizzes/:id`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo para aluno:

```json
{
  "_id": "ID_DO_QUIZ",
  "titulo": "Quiz de fracoes",
  "questoes": [
    {
      "pergunta": "Qual fracao representa metade?",
      "alternativas": ["1/3", "1/2", "2/3", "3/4"],
      "explicacao": "Metade significa uma parte de duas."
    }
  ],
  "xpPorAcerto": 10,
  "ativo": true
}
```

Observacao: professor e admin podem ver `respostaCorreta`.

### Responder quiz

- Metodo: `POST`
- URL: `/api/quizzes/:id/responder`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Body:

```json
{
  "respostas": [1]
}
```

Resposta de exemplo:

```json
{
  "message": "Quiz respondido com sucesso.",
  "resultado": {
    "_id": "ID_DO_RESULTADO",
    "usuario": "ID_DO_USUARIO",
    "quiz": {
      "_id": "ID_DO_QUIZ",
      "titulo": "Quiz de fracoes"
    },
    "respostas": [1],
    "acertos": 1,
    "totalQuestoes": 1,
    "nota": 10,
    "xpGanho": 10
  },
  "correcoes": [
    {
      "pergunta": "Qual fracao representa metade?",
      "respostaAluno": 1,
      "respostaCorreta": 1,
      "correta": true,
      "explicacao": "Metade significa uma parte de duas."
    }
  ],
  "user": {
    "id": "ID_DO_USUARIO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "xp": 560,
    "nivel": 2,
    "streak": 3,
    "lastStudyDate": "2026-06-08",
    "totalAulasConcluidas": 11
  }
}
```

Observacao: se o usuario responder o mesmo quiz novamente, o XP nao sera somado outra vez.

### Listar meus resultados de quiz

- Metodo: `GET`
- URL: `/api/quizzes/me/resultados`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DO_RESULTADO",
    "quiz": {
      "_id": "ID_DO_QUIZ",
      "titulo": "Quiz de fracoes",
      "disciplina": {
        "_id": "ID_DA_DISCIPLINA",
        "nome": "Matematica"
      },
      "aula": {
        "_id": "ID_DA_AULA",
        "titulo": "Introducao a fracoes"
      }
    },
    "respostas": [1],
    "acertos": 1,
    "totalQuestoes": 1,
    "nota": 10,
    "xpGanho": 10,
    "finalizadoEm": "2026-06-08T03:00:00.000Z"
  }
]
```

## Admin

Todas as rotas admin precisam de token JWT de um usuario com `tipo: "admin"`.

### Dashboard administrativo

- Metodo: `GET`
- URL: `/api/admin/dashboard`
- Precisa de token: sim
- Quem pode acessar: admin

Resposta de exemplo:

```json
{
  "totalUsuarios": 120,
  "totalAlunos": 100,
  "totalProfessores": 18,
  "totalAdmins": 2,
  "totalDisciplinas": 8,
  "totalAulas": 40,
  "totalQuizzes": 12,
  "totalAulasConcluidas": 350,
  "totalQuizzesRespondidos": 210,
  "mediaXPAlunos": 740,
  "top5AlunosPorXP": [
    {
      "_id": "ID_DO_ALUNO",
      "nome": "Maria Silva",
      "email": "maria@email.com",
      "xp": 3200,
      "nivel": 4,
      "streak": 7,
      "totalAulasConcluidas": 22
    }
  ]
}
```

### Listar usuarios

- Metodo: `GET`
- URL: `/api/admin/users`
- Precisa de token: sim
- Quem pode acessar: admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DO_USUARIO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "tipo": "aluno",
    "xp": 800,
    "nivel": 2,
    "streak": 4,
    "totalAulasConcluidas": 12
  }
]
```

### Listar usuarios por tipo

- Metodo: `GET`
- URL: `/api/admin/users?tipo=aluno`
- Precisa de token: sim
- Quem pode acessar: admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DO_ALUNO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "tipo": "aluno",
    "xp": 800,
    "nivel": 2,
    "streak": 4,
    "totalAulasConcluidas": 12
  }
]
```

### Ranking de alunos

- Metodo: `GET`
- URL: `/api/admin/ranking`
- Precisa de token: sim
- Quem pode acessar: admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DO_ALUNO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "xp": 3200,
    "nivel": 4,
    "streak": 7,
    "totalAulasConcluidas": 22
  }
]
```

### Ranking de alunos com limite

- Metodo: `GET`
- URL: `/api/admin/ranking?limit=10`
- Precisa de token: sim
- Quem pode acessar: admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DO_ALUNO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "xp": 3200,
    "nivel": 4,
    "streak": 7,
    "totalAulasConcluidas": 22
  }
]
```
