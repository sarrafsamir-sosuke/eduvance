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

export const gerarRespostaEduAI = async (
  pergunta: string,
  disciplinaContexto?: string,
): Promise<string> => {
  const mode = process.env.EDUAI_MODE || 'mock';

  if (mode === 'mock') {
    return gerarRespostaMock(pergunta, disciplinaContexto);
  }

  // Ponto preparado para integrar uma API real de IA no futuro.
  return gerarRespostaMock(pergunta, disciplinaContexto);
};
