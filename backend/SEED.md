# Seed EduVance

O seed popula o MongoDB com dados de demonstração para o TCC.

## Como rodar

```bash
npm run seed
```

O comando usa a `MONGO_URI` do arquivo `.env`.

## Usuários criados

```txt
admin@eduvance.com / 123456
professor@eduvance.com / 123456
aluno@eduvance.com / 123456
premium@eduvance.com / 123456
```

## Perfis de teste

- `admin@eduvance.com`: acessa o dashboard administrativo.
- `professor@eduvance.com`: cria e gerencia conteúdos.
- `aluno@eduvance.com`: plano grátis, vê apenas aulas e quizzes grátis.
- `premium@eduvance.com`: plano premium, vê aulas e quizzes grátis e premium.

## Conteúdo criado

- 8 disciplinas.
- 24 aulas, sendo a primeira de cada disciplina grátis e as outras premium.
- 8 quizzes, com alguns grátis e alguns premium.

O seed é seguro para rodar mais de uma vez: ele atualiza ou reaproveita os registros de demonstração em vez de duplicar tudo.
