import OpenAI from 'openai';

const gerarRespostaMock = (pergunta: string, disciplinaContexto?: string) => {
  const contexto = disciplinaContexto
    ? ` dentro da disciplina de ${disciplinaContexto}`
    : '';

  return [
    `Essa é uma explicação da EduAI${contexto} sobre: "${pergunta}".`,
    'Vamos resolver passo a passo: primeiro identifique o conceito principal, depois observe os dados do enunciado e, por fim, aplique a regra estudada.',
    'Se quiser, envie uma nova pergunta com o trecho que mais gerou dúvida que eu continuo a explicação.',
  ].join(' ');
};

const SYSTEM_PROMPT = [
  'Você é a EduAI, tutora educacional da plataforma EduVance.',
  'Seu papel é ajudar alunos do ensino médio a entender conceitos de forma simples e didática.',
  'Regras:',
  '- Responda sempre em português brasileiro.',
  '- Explique de forma clara e objetiva, como se falasse com um estudante.',
  '- Use exemplos práticos do dia a dia quando possível.',
  '- Não dê respostas exageradamente longas. Seja concisa mas completa.',
  '- Se o aluno pedir resposta pronta de prova, explique o raciocínio em vez de dar a resposta direta.',
  '- Se uma disciplina for informada, contextualize a explicação por ela.',
  '- Use formatação simples (listas, negrito) quando ajudar na clareza.',
].join('\n');

async function gerarRespostaReal(
  pergunta: string,
  disciplinaContexto?: string,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return gerarRespostaMock(pergunta, disciplinaContexto);
  }

  const client = new OpenAI({ apiKey });

  const userMessage = disciplinaContexto
    ? `[Disciplina: ${disciplinaContexto}]\n\n${pergunta}`
    : pergunta;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  });

  const resposta = completion.choices[0]?.message?.content?.trim();

  if (!resposta) {
    return gerarRespostaMock(pergunta, disciplinaContexto);
  }

  return resposta;
}

export const gerarRespostaEduAI = async (
  pergunta: string,
  disciplinaContexto?: string,
): Promise<string> => {
  const mode = process.env.EDUAI_MODE || 'mock';

  if (mode !== 'real') {
    return gerarRespostaMock(pergunta, disciplinaContexto);
  }

  try {
    return await gerarRespostaReal(pergunta, disciplinaContexto);
  } catch (error) {
    console.error('EduAI real falhou, usando mock:', error);
    return gerarRespostaMock(pergunta, disciplinaContexto);
  }
};
