const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_TIMEOUT_MS = 15000;

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
  'Você é a EduAI, assistente educacional do EduVance.',
  'Explique conteúdos escolares e técnicos de forma simples, clara e objetiva, para alunos do ensino médio/técnico.',
  'Ajude o aluno a entender o assunto passo a passo. Quando possível, use exemplos práticos.',
  'Regras:',
  '- Responda sempre em português brasileiro.',
  '- Evite respostas muito longas. Seja concisa mas completa.',
  '- Se o aluno pedir resposta pronta de prova, explique o raciocínio em vez de dar a resposta direta.',
  '- Se uma disciplina for informada, contextualize a explicação por ela.',
  '- Use formatação simples (listas, negrito) quando ajudar na clareza.',
].join('\n');

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

async function gerarRespostaReal(
  pergunta: string,
  disciplinaContexto?: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return gerarRespostaMock(pergunta, disciplinaContexto);
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const userMessage = disciplinaContexto
    ? `[Disciplina: ${disciplinaContexto}]\n\n${pergunta}`
    : pergunta;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini respondeu ${response.status}: ${errorBody.slice(0, 300)}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const resposta = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!resposta) {
      throw new Error('Gemini nao retornou texto na resposta.');
    }

    return resposta;
  } finally {
    clearTimeout(timeout);
  }
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
