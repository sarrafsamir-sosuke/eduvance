# EduVance Backend API

Base URL local:

```txt
http://localhost:3333
```

Para rotas protegidas, envie o token JWT no header:

```txt
Authorization: Bearer SEU_TOKEN
```

## Formato das respostas

- Todas as rotas retornam JSON.
- Erros retornam pelo menos o campo `message`.
- Rotas protegidas usam token JWT no header `Authorization`.
- Nenhuma rota deve retornar o campo `senha` do usuario.

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
  "xpReward": 50,
  "planoMinimo": "gratis"
}
```

`planoMinimo` pode ser `"gratis"` ou `"premium"`. Aulas premium so podem ser acessadas por usuarios premium, professores e admins.

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
  "planoMinimo": "gratis",
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
  "planoMinimo": "gratis",
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
    "planoMinimo": "gratis",
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
  "planoMinimo": "gratis",
  "ativo": true
}
```

Observacao: professor e admin podem ver `respostaCorreta`.
`planoMinimo` pode ser `"gratis"` ou `"premium"`. Quizzes premium so podem ser acessados por usuarios premium, professores e admins.

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

## Planos

### Meu plano

- Metodo: `GET`
- URL: `/api/planos/me`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
{
  "plano": "gratis",
  "aiPerguntasUsadas": 0,
  "aiLimitePerguntas": 5
}
```

### Upgrade para premium

- Metodo: `PATCH`
- URL: `/api/planos/upgrade`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
{
  "message": "Plano atualizado para premium.",
  "user": {
    "id": "ID_DO_USUARIO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "tipo": "aluno",
    "plano": "premium",
    "aiPerguntasUsadas": 0,
    "aiLimitePerguntas": 100
  }
}
```

### Voltar para gratis

- Metodo: `PATCH`
- URL: `/api/planos/downgrade`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
{
  "message": "Plano atualizado para gratis.",
  "user": {
    "id": "ID_DO_USUARIO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "tipo": "aluno",
    "plano": "gratis",
    "aiPerguntasUsadas": 0,
    "aiLimitePerguntas": 5
  }
}
```

## EduAI

A EduAI usa resposta simulada quando `EDUAI_MODE=mock`.

### Perguntar para EduAI

- Metodo: `POST`
- URL: `/api/eduai/perguntar`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Body:

```json
{
  "pergunta": "Como resolver uma equacao do primeiro grau?",
  "disciplinaContexto": "Matematica"
}
```

Para continuar uma conversa existente, envie também:

```json
{
  "conversaId": "ID_DA_CONVERSA",
  "pergunta": "Pode dar outro exemplo?",
  "disciplinaContexto": "Matematica"
}
```

Resposta de exemplo:

```json
{
  "resposta": "Essa é uma explicação da EduAI sobre: \"Como resolver uma equacao do primeiro grau?\". Vamos resolver passo a passo...",
  "conversaId": "ID_DA_CONVERSA",
  "aiPerguntasUsadas": 1,
  "aiLimitePerguntas": 5,
  "perguntasRestantes": 4
}
```

Se o usuário atingir o limite do plano:

```json
{
  "message": "Você atingiu o limite de perguntas da EduAI para o seu plano."
}
```

### Listar conversas da EduAI

- Metodo: `GET`
- URL: `/api/eduai/conversas`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
[
  {
    "_id": "ID_DA_CONVERSA",
    "usuario": "ID_DO_USUARIO",
    "titulo": "Como resolver uma equacao do primeiro grau?",
    "disciplinaContexto": "Matematica",
    "createdAt": "2026-06-08T03:00:00.000Z",
    "updatedAt": "2026-06-08T03:00:00.000Z"
  }
]
```

### Buscar conversa por id

- Metodo: `GET`
- URL: `/api/eduai/conversas/:id`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
{
  "conversa": {
    "_id": "ID_DA_CONVERSA",
    "usuario": "ID_DO_USUARIO",
    "titulo": "Como resolver uma equacao do primeiro grau?",
    "disciplinaContexto": "Matematica"
  },
  "mensagens": [
    {
      "_id": "ID_DA_MENSAGEM",
      "role": "user",
      "conteudo": "Como resolver uma equacao do primeiro grau?"
    },
    {
      "_id": "ID_DA_MENSAGEM",
      "role": "assistant",
      "conteudo": "Essa é uma explicação da EduAI..."
    }
  ]
}
```

### Ver limite da EduAI

- Metodo: `GET`
- URL: `/api/eduai/limite`
- Precisa de token: sim
- Quem pode acessar: aluno, professor e admin

Resposta de exemplo:

```json
{
  "plano": "gratis",
  "aiPerguntasUsadas": 1,
  "aiLimitePerguntas": 5,
  "perguntasRestantes": 4
}
```

### Resetar limite da EduAI

- Metodo: `PATCH`
- URL: `/api/eduai/resetar-limite`
- Precisa de token: sim
- Quem pode acessar: admin

Body:

```json
{
  "userId": "ID_DO_USUARIO"
}
```

Resposta de exemplo:

```json
{
  "message": "Limite da EduAI resetado com sucesso.",
  "user": {
    "_id": "ID_DO_USUARIO",
    "nome": "Maria Silva",
    "email": "maria@email.com",
    "tipo": "aluno",
    "plano": "gratis",
    "aiPerguntasUsadas": 0,
    "aiLimitePerguntas": 5
  }
}
```
