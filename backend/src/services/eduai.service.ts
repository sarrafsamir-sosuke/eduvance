const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const GEMINI_TIMEOUT_MS = 15000;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_TIMEOUT_MS = 15000;

type EduAIProvider = 'openrouter' | 'gemini' | 'mock';

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
  'Responda em português brasileiro, com linguagem simples, clara e objetiva.',
  "Use vocabulário e ortografia do Brasil. Por exemplo: escreva 'frações', não 'fracções'.",
  'Explique conteúdos escolares e técnicos de forma didática, como para um aluno do ensino médio/técnico.',
  'Regras:',
  "- Não use tabelas em Markdown e não use pipes '|'.",
  "- Não use títulos com '##'.",
  '- Evite excesso de negrito, asteriscos ou outros marcadores visuais.',
  '- Não use blocos de código, exceto quando o aluno pedir programação.',
  '- Prefira parágrafos curtos e listas simples com hífen quando necessário.',
  '- Evite respostas muito longas. Seja objetiva, clara e educacional.',
  '- Quando possível, use exemplos práticos.',
  '- Se o aluno pedir resposta pronta de prova, explique o raciocínio em vez de dar a resposta direta.',
  '- Se uma disciplina for informada, contextualize a explicação por ela.',
].join('\n');

const TABLE_SEPARATOR_PATTERN = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/;

const cleanAIResponse = (text: string): string => {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  const cleanedLines = lines.map((rawLine) => {
    let line = rawLine.trimEnd();

    if (TABLE_SEPARATOR_PATTERN.test(line)) {
      return '';
    }

    line = line
      .replace(/^#{1,6}\s*/, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/`{3,}\w*/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^(\s*)\*\s+/, '$1- ')
      .replace(/^\s*>\s?/, '');

    if (line.includes('|')) {
      const tableCells = line.split('|').map((cell) => cell.trim()).filter(Boolean);

      if (tableCells.length === 2) {
        line = `${tableCells[0]}: ${tableCells[1]}`;
      } else if (tableCells.length > 2) {
        line = `- ${tableCells.join(' - ')}`;
      } else {
        line = line.replace(/\s*\|\s*/g, ' ');
      }
    }

    return line
      .replace(/\*\*/g, '')
      .replace(/#{2,}/g, '')
      .replace(/[ \t]{2,}/g, ' ')
      .trimEnd();
  });

  return cleanedLines
    .join('\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

class ProviderRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ProviderRequestError';
    this.status = status;
  }
}

const normalizeEnv = (value?: string) => value?.trim().toLowerCase();

const sanitizeForLog = (value: string) => {
  const secrets = [process.env.OPENROUTER_API_KEY, process.env.GEMINI_API_KEY].filter(
    (secret): secret is string => Boolean(secret),
  );

  return secrets.reduce((text, secret) => text.split(secret).join('[redacted]'), value);
};

const logProviderFallback = (provider: EduAIProvider, error: unknown) => {
  if (error instanceof ProviderRequestError) {
    console.error(`EduAI ${provider} falhou, usando mock:`, {
      message: sanitizeForLog(error.message),
      status: error.status,
    });
    return;
  }

  if (error instanceof Error) {
    console.error(`EduAI ${provider} falhou, usando mock:`, {
      message: sanitizeForLog(error.message),
      name: error.name,
    });
    return;
  }

  console.error(`EduAI ${provider} falhou, usando mock.`);
};

const resolveProvider = (): EduAIProvider => {
  const configuredProvider = normalizeEnv(process.env.AI_PROVIDER);

  if (configuredProvider === 'openrouter' || configuredProvider === 'gemini') {
    return configuredProvider;
  }

  if (configuredProvider) {
    console.warn(`AI_PROVIDER "${configuredProvider}" nao suportado. Tentando provedor disponivel.`);
  }

  if (process.env.OPENROUTER_API_KEY) {
    return 'openrouter';
  }

  if (process.env.GEMINI_API_KEY) {
    return 'gemini';
  }

  return 'mock';
};

const getUserMessage = (pergunta: string, disciplinaContexto?: string) => {
  if (!disciplinaContexto) {
    return pergunta;
  }

  return `[Disciplina: ${disciplinaContexto}]\n\n${pergunta}`;
};

const getFrontendReferer = () => {
  const frontendUrl = process.env.FRONTEND_URL?.split(',').map((url) => url.trim()).find(Boolean);

  return frontendUrl || 'http://localhost:5180';
};

async function gerarRespostaOpenRouter(
  pergunta: string,
  disciplinaContexto?: string,
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new ProviderRequestError('OPENROUTER_API_KEY nao foi definida.');
  }

  const model = process.env.OPENROUTER_MODEL || 'openrouter/free';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': getFrontendReferer(),
        'X-Title': 'EduVance',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: getUserMessage(pergunta, disciplinaContexto),
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new ProviderRequestError(
        `OpenRouter respondeu com status HTTP ${response.status}.`,
        response.status,
      );
    }

    const data = (await response.json()) as OpenRouterResponse;
    const resposta = data.choices?.[0]?.message?.content?.trim();

    if (!resposta) {
      throw new ProviderRequestError('OpenRouter nao retornou texto na resposta.');
    }

    const respostaLimpa = cleanAIResponse(resposta);

    if (!respostaLimpa) {
      throw new ProviderRequestError('OpenRouter retornou texto vazio apos limpeza.');
    }

    return respostaLimpa;
  } finally {
    clearTimeout(timeout);
  }
}

async function gerarRespostaGemini(
  pergunta: string,
  disciplinaContexto?: string,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new ProviderRequestError('GEMINI_API_KEY nao foi definida.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const userMessage = getUserMessage(pergunta, disciplinaContexto);
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
      throw new ProviderRequestError(
        `Gemini respondeu com status HTTP ${response.status}.`,
        response.status,
      );
    }

    const data = (await response.json()) as GeminiResponse;
    const resposta = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!resposta) {
      throw new ProviderRequestError('Gemini nao retornou texto na resposta.');
    }

    const respostaLimpa = cleanAIResponse(resposta);

    if (!respostaLimpa) {
      throw new ProviderRequestError('Gemini retornou texto vazio apos limpeza.');
    }

    return respostaLimpa;
  } finally {
    clearTimeout(timeout);
  }
}

export const gerarRespostaEduAI = async (
  pergunta: string,
  disciplinaContexto?: string,
): Promise<string> => {
  const mode = normalizeEnv(process.env.EDUAI_MODE) || 'mock';

  if (mode !== 'real') {
    return cleanAIResponse(gerarRespostaMock(pergunta, disciplinaContexto));
  }

  const provider = resolveProvider();

  if (provider === 'mock') {
    return cleanAIResponse(gerarRespostaMock(pergunta, disciplinaContexto));
  }

  try {
    if (provider === 'openrouter') {
      return await gerarRespostaOpenRouter(pergunta, disciplinaContexto);
    }

    return await gerarRespostaGemini(pergunta, disciplinaContexto);
  } catch (error) {
    logProviderFallback(provider, error);
    return cleanAIResponse(gerarRespostaMock(pergunta, disciplinaContexto));
  }
};
