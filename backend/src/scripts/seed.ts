import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose, { Types } from 'mongoose';

import Aula from '../models/Aula';
import Disciplina from '../models/Disciplina';
import Quiz, { IQuestaoQuiz } from '../models/Quiz';
import User, { UserType } from '../models/User';
import { getAiLimitByPlan, PlanType } from '../utils/plan';

dotenv.config();

interface SeedUser {
  nome: string;
  email: string;
  senha: string;
  tipo: UserType;
  plano: PlanType;
}

interface SeedDisciplina {
  nome: string;
  categoria: string;
  emoji: string;
  descricao: string;
  aulas: {
    titulo: string;
    descricao: string;
    modulo: string;
    ordem: number;
    duracao: number;
    xpReward: number;
    planoMinimo: PlanType;
  }[];
  quiz: {
    titulo: string;
    descricao: string;
    planoMinimo: PlanType;
    questoes: IQuestaoQuiz[];
  };
}

const users: SeedUser[] = [
  {
    nome: 'Admin EduVance',
    email: 'admin@eduvance.com',
    senha: '123456',
    tipo: 'admin',
    plano: 'premium',
  },
  {
    nome: 'Professor EduVance',
    email: 'professor@eduvance.com',
    senha: '123456',
    tipo: 'professor',
    plano: 'premium',
  },
  {
    nome: 'Aluno Grátis',
    email: 'aluno@eduvance.com',
    senha: '123456',
    tipo: 'aluno',
    plano: 'gratis',
  },
  {
    nome: 'Aluno Premium',
    email: 'premium@eduvance.com',
    senha: '123456',
    tipo: 'aluno',
    plano: 'premium',
  },
];

const disciplinas: SeedDisciplina[] = [
  {
    nome: 'Matemática',
    categoria: 'Matemática e suas Tecnologias',
    emoji: '📐',
    descricao: 'Conteúdos essenciais de matemática, lógica, funções e resolução de problemas.',
    aulas: [
      {
        titulo: 'Introdução à Matemática Básica',
        descricao: 'Revisão de operações, expressões numéricas e raciocínio lógico.',
        modulo: 'Fundamentos',
        ordem: 1,
        duracao: 18,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Funções e Gráficos',
        descricao: 'Conceitos iniciais de função, plano cartesiano e interpretação de gráficos.',
        modulo: 'Álgebra',
        ordem: 2,
        duracao: 24,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Exercícios Avançados de Matemática',
        descricao: 'Lista guiada com problemas de álgebra e interpretação matemática.',
        modulo: 'Prática Avançada',
        ordem: 3,
        duracao: 30,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de Matemática Básica',
      descricao: 'Avaliação rápida sobre operações e funções.',
      planoMinimo: 'gratis',
      questoes: [
        {
          pergunta: 'Qual é o resultado de 8 x 7?',
          alternativas: ['48', '54', '56', '64'],
          respostaCorreta: 2,
          explicacao: '8 multiplicado por 7 é igual a 56.',
        },
        {
          pergunta: 'Em uma função, o eixo horizontal costuma representar qual variável?',
          alternativas: ['x', 'y', 'z', 'tempo sempre'],
          respostaCorreta: 0,
          explicacao: 'No plano cartesiano, o eixo horizontal representa geralmente a variável x.',
        },
        {
          pergunta: 'Qual número é primo?',
          alternativas: ['9', '15', '21', '23'],
          respostaCorreta: 3,
          explicacao: '23 é primo porque só é divisível por 1 e por ele mesmo.',
        },
      ],
    },
  },
  {
    nome: 'Física',
    categoria: 'Ciências da Natureza e suas Tecnologias',
    emoji: '⚛️',
    descricao: 'Estudo de movimento, energia, forças e fenômenos físicos do cotidiano.',
    aulas: [
      {
        titulo: 'Introdução ao Movimento',
        descricao: 'Conceitos de posição, deslocamento, velocidade e aceleração.',
        modulo: 'Cinemática',
        ordem: 1,
        duracao: 20,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Leis de Newton na Prática',
        descricao: 'Aplicações das três leis de Newton em situações reais.',
        modulo: 'Dinâmica',
        ordem: 2,
        duracao: 26,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Energia, Trabalho e Potência',
        descricao: 'Resolução de problemas envolvendo energia mecânica e potência.',
        modulo: 'Energia',
        ordem: 3,
        duracao: 28,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de Física: Movimento',
      descricao: 'Questões introdutórias sobre movimento e forças.',
      planoMinimo: 'premium',
      questoes: [
        {
          pergunta: 'Qual grandeza mede a variação da posição pelo tempo?',
          alternativas: ['Força', 'Velocidade', 'Massa', 'Temperatura'],
          respostaCorreta: 1,
          explicacao: 'Velocidade relaciona deslocamento e intervalo de tempo.',
        },
        {
          pergunta: 'A unidade de força no Sistema Internacional é:',
          alternativas: ['Joule', 'Watt', 'Newton', 'Pascal'],
          respostaCorreta: 2,
          explicacao: 'Força é medida em Newton, simbolizado por N.',
        },
        {
          pergunta: 'Qual lei relaciona força, massa e aceleração?',
          alternativas: ['Primeira lei de Newton', 'Segunda lei de Newton', 'Lei de Ohm', 'Lei da Gravitação apenas'],
          respostaCorreta: 1,
          explicacao: 'A segunda lei de Newton é representada por F = m.a.',
        },
      ],
    },
  },
  {
    nome: 'Química',
    categoria: 'Ciências da Natureza e suas Tecnologias',
    emoji: '🧪',
    descricao: 'Fundamentos de matéria, substâncias, reações químicas e tabela periódica.',
    aulas: [
      {
        titulo: 'Matéria, Substâncias e Misturas',
        descricao: 'Diferenças entre substância pura, mistura homogênea e heterogênea.',
        modulo: 'Fundamentos',
        ordem: 1,
        duracao: 19,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Tabela Periódica Essencial',
        descricao: 'Organização dos elementos e propriedades periódicas.',
        modulo: 'Elementos Químicos',
        ordem: 2,
        duracao: 25,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Reações Químicas e Balanceamento',
        descricao: 'Como identificar e balancear equações químicas simples.',
        modulo: 'Reações',
        ordem: 3,
        duracao: 29,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de Química Geral',
      descricao: 'Questões básicas sobre matéria e tabela periódica.',
      planoMinimo: 'gratis',
      questoes: [
        {
          pergunta: 'Qual partícula tem carga negativa?',
          alternativas: ['Próton', 'Nêutron', 'Elétron', 'Molécula'],
          respostaCorreta: 2,
          explicacao: 'O elétron possui carga elétrica negativa.',
        },
        {
          pergunta: 'A água é representada pela fórmula:',
          alternativas: ['CO2', 'H2O', 'O2', 'NaCl'],
          respostaCorreta: 1,
          explicacao: 'A molécula de água possui dois átomos de hidrogênio e um de oxigênio.',
        },
        {
          pergunta: 'Mistura homogênea apresenta:',
          alternativas: ['Duas fases sempre', 'Uma única fase visível', 'Somente elementos metálicos', 'Apenas gases'],
          respostaCorreta: 1,
          explicacao: 'Misturas homogêneas apresentam aspecto uniforme, com uma fase visível.',
        },
      ],
    },
  },
  {
    nome: 'Biologia',
    categoria: 'Ciências da Natureza e suas Tecnologias',
    emoji: '🧬',
    descricao: 'Estudo dos seres vivos, células, genética, ecologia e saúde.',
    aulas: [
      {
        titulo: 'Células e Organização da Vida',
        descricao: 'Diferenças entre células procariontes, eucariontes, animais e vegetais.',
        modulo: 'Citologia',
        ordem: 1,
        duracao: 20,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Genética: DNA e Hereditariedade',
        descricao: 'Conceitos de DNA, genes, cromossomos e herança genética.',
        modulo: 'Genética',
        ordem: 2,
        duracao: 27,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Ecologia e Relações Ambientais',
        descricao: 'Ecossistemas, cadeias alimentares e impactos ambientais.',
        modulo: 'Ecologia',
        ordem: 3,
        duracao: 28,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de Biologia Celular',
      descricao: 'Perguntas sobre células e organização dos seres vivos.',
      planoMinimo: 'premium',
      questoes: [
        {
          pergunta: 'Qual estrutura controla a entrada e saída de substâncias da célula?',
          alternativas: ['Núcleo', 'Membrana plasmática', 'Ribossomo', 'Parede celular em animais'],
          respostaCorreta: 1,
          explicacao: 'A membrana plasmática regula trocas entre célula e ambiente.',
        },
        {
          pergunta: 'O DNA está relacionado principalmente com:',
          alternativas: ['Reserva de água', 'Informação genética', 'Digestão extracelular', 'Contração muscular apenas'],
          respostaCorreta: 1,
          explicacao: 'O DNA armazena informações genéticas dos seres vivos.',
        },
        {
          pergunta: 'Produtores em uma cadeia alimentar são geralmente:',
          alternativas: ['Fungos', 'Herbívoros', 'Plantas e algas', 'Predadores finais'],
          respostaCorreta: 2,
          explicacao: 'Produtores fazem fotossíntese e formam a base de muitas cadeias alimentares.',
        },
      ],
    },
  },
  {
    nome: 'História',
    categoria: 'Ciências Humanas e Sociais Aplicadas',
    emoji: '🏛️',
    descricao: 'Análise de processos históricos, sociedades, cultura e cidadania.',
    aulas: [
      {
        titulo: 'Introdução ao Estudo da História',
        descricao: 'Fontes históricas, tempo histórico e interpretação de documentos.',
        modulo: 'Fundamentos',
        ordem: 1,
        duracao: 18,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Brasil Colonial: Sociedade e Economia',
        descricao: 'Formação do Brasil colonial, ciclos econômicos e relações sociais.',
        modulo: 'História do Brasil',
        ordem: 2,
        duracao: 26,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Revoluções e Mundo Contemporâneo',
        descricao: 'Revoluções modernas e seus impactos políticos e sociais.',
        modulo: 'Mundo Contemporâneo',
        ordem: 3,
        duracao: 30,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de História do Brasil',
      descricao: 'Questões sobre fontes históricas e período colonial.',
      planoMinimo: 'gratis',
      questoes: [
        {
          pergunta: 'Documento, fotografia e relato oral são exemplos de:',
          alternativas: ['Fontes históricas', 'Mapas climáticos', 'Operações matemáticas', 'Experimentos químicos'],
          respostaCorreta: 0,
          explicacao: 'Fontes históricas ajudam a estudar e interpretar o passado.',
        },
        {
          pergunta: 'Qual produto marcou o início da colonização portuguesa no Brasil?',
          alternativas: ['Café', 'Petróleo', 'Pau-brasil', 'Soja'],
          respostaCorreta: 2,
          explicacao: 'O pau-brasil foi explorado nos primeiros anos da colonização.',
        },
        {
          pergunta: 'O tempo histórico é:',
          alternativas: ['Sempre igual ao tempo do relógio', 'Uma forma de analisar mudanças e permanências', 'Apenas uma data comemorativa', 'Somente o calendário escolar'],
          respostaCorreta: 1,
          explicacao: 'Tempo histórico considera processos, mudanças e permanências nas sociedades.',
        },
      ],
    },
  },
  {
    nome: 'Geografia',
    categoria: 'Ciências Humanas e Sociais Aplicadas',
    emoji: '🌎',
    descricao: 'Estudo do espaço geográfico, natureza, sociedade, mapas e território.',
    aulas: [
      {
        titulo: 'Espaço Geográfico e Paisagem',
        descricao: 'Conceitos básicos para compreender a organização do espaço.',
        modulo: 'Fundamentos',
        ordem: 1,
        duracao: 19,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Cartografia e Leitura de Mapas',
        descricao: 'Escalas, coordenadas geográficas, legendas e orientação.',
        modulo: 'Cartografia',
        ordem: 2,
        duracao: 24,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Globalização e Redes Urbanas',
        descricao: 'Fluxos econômicos, tecnologia, cidades e desigualdades.',
        modulo: 'Geografia Humana',
        ordem: 3,
        duracao: 29,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de Geografia e Cartografia',
      descricao: 'Avaliação sobre espaço geográfico e leitura de mapas.',
      planoMinimo: 'premium',
      questoes: [
        {
          pergunta: 'A cartografia é a área que estuda:',
          alternativas: ['Produção de mapas', 'Reações químicas', 'Gramática normativa', 'Células animais'],
          respostaCorreta: 0,
          explicacao: 'Cartografia envolve elaboração, leitura e interpretação de mapas.',
        },
        {
          pergunta: 'Latitude e longitude são usadas para:',
          alternativas: ['Medir massa', 'Localizar pontos na superfície terrestre', 'Calcular nota escolar', 'Definir a cor do solo'],
          respostaCorreta: 1,
          explicacao: 'Coordenadas geográficas permitem localizar pontos no planeta.',
        },
        {
          pergunta: 'Paisagem geográfica inclui:',
          alternativas: ['Apenas elementos naturais', 'Apenas construções humanas', 'Elementos naturais e humanos visíveis', 'Somente mapas políticos'],
          respostaCorreta: 2,
          explicacao: 'A paisagem reúne elementos naturais e culturais percebidos no espaço.',
        },
      ],
    },
  },
  {
    nome: 'Língua Portuguesa',
    categoria: 'Linguagens e suas Tecnologias',
    emoji: '📚',
    descricao: 'Leitura, interpretação, gramática, produção textual e comunicação.',
    aulas: [
      {
        titulo: 'Interpretação de Textos',
        descricao: 'Estratégias para compreender ideias principais e inferências.',
        modulo: 'Leitura',
        ordem: 1,
        duracao: 21,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Classes de Palavras na Prática',
        descricao: 'Substantivos, verbos, adjetivos e seus usos no texto.',
        modulo: 'Gramática',
        ordem: 2,
        duracao: 25,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Redação Argumentativa',
        descricao: 'Estrutura de introdução, desenvolvimento, conclusão e repertório.',
        modulo: 'Produção Textual',
        ordem: 3,
        duracao: 32,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de Língua Portuguesa',
      descricao: 'Questões de interpretação e gramática.',
      planoMinimo: 'gratis',
      questoes: [
        {
          pergunta: 'Inferir uma informação significa:',
          alternativas: ['Copiar exatamente uma frase', 'Concluir algo com base em pistas do texto', 'Ignorar o contexto', 'Trocar todas as palavras por sinônimos'],
          respostaCorreta: 1,
          explicacao: 'Inferência é uma conclusão construída a partir de pistas textuais.',
        },
        {
          pergunta: 'Qual classe de palavra indica ação, estado ou fenômeno?',
          alternativas: ['Substantivo', 'Verbo', 'Adjetivo', 'Artigo'],
          respostaCorreta: 1,
          explicacao: 'Verbos expressam ações, estados ou fenômenos.',
        },
        {
          pergunta: 'Em uma redação argumentativa, a tese é:',
          alternativas: ['A opinião central defendida', 'A lista de referências', 'O título obrigatório', 'A contagem de linhas'],
          respostaCorreta: 0,
          explicacao: 'A tese apresenta o ponto de vista principal que será defendido.',
        },
      ],
    },
  },
  {
    nome: 'Tecnologia e Inovação',
    categoria: 'Formação Técnica e Profissional',
    emoji: '💻',
    descricao: 'Introdução à tecnologia, programação, inovação, dados e mundo digital.',
    aulas: [
      {
        titulo: 'Introdução ao Pensamento Computacional',
        descricao: 'Decomposição, padrões, abstração e algoritmos no cotidiano.',
        modulo: 'Fundamentos Digitais',
        ordem: 1,
        duracao: 22,
        xpReward: 50,
        planoMinimo: 'gratis',
      },
      {
        titulo: 'Lógica de Programação com Exemplos',
        descricao: 'Variáveis, condições, repetições e resolução de problemas.',
        modulo: 'Programação',
        ordem: 2,
        duracao: 30,
        xpReward: 70,
        planoMinimo: 'premium',
      },
      {
        titulo: 'Inovação, IA e Futuro do Trabalho',
        descricao: 'Como novas tecnologias impactam profissões, estudo e sociedade.',
        modulo: 'Inovação',
        ordem: 3,
        duracao: 28,
        xpReward: 90,
        planoMinimo: 'premium',
      },
    ],
    quiz: {
      titulo: 'Quiz de Tecnologia e Inovação',
      descricao: 'Questões sobre pensamento computacional e tecnologia.',
      planoMinimo: 'premium',
      questoes: [
        {
          pergunta: 'Pensamento computacional envolve:',
          alternativas: ['Apenas montar computadores', 'Resolver problemas com lógica e etapas', 'Memorizar senhas', 'Usar redes sociais'],
          respostaCorreta: 1,
          explicacao: 'Pensamento computacional ajuda a resolver problemas por meio de decomposição e algoritmos.',
        },
        {
          pergunta: 'Um algoritmo é:',
          alternativas: ['Uma sequência de passos para resolver um problema', 'Um cabo de energia', 'Uma imagem digital', 'Um tipo de vírus sempre'],
          respostaCorreta: 0,
          explicacao: 'Algoritmos descrevem passos organizados para chegar a um resultado.',
        },
        {
          pergunta: 'IA significa:',
          alternativas: ['Internet Analógica', 'Inteligência Artificial', 'Índice Acadêmico', 'Informação Alternativa'],
          respostaCorreta: 1,
          explicacao: 'IA é a sigla para Inteligência Artificial.',
        },
      ],
    },
  },
];

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI nao foi definida no arquivo .env');
  }

  await mongoose.connect(mongoUri);
};

const createOrUpdateUsers = async () => {
  const createdUsers = new Map<string, { _id: Types.ObjectId }>();

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.senha, 10);

    const savedUser = await User.findOneAndUpdate(
      { email: user.email },
      {
        nome: user.nome,
        email: user.email,
        senha: hashedPassword,
        tipo: user.tipo,
        plano: user.plano,
        aiLimitePerguntas: getAiLimitByPlan(user.plano),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!savedUser) {
      throw new Error(`Nao foi possivel criar usuario ${user.email}`);
    }

    createdUsers.set(user.email, { _id: savedUser._id as Types.ObjectId });
    console.log(`Usuario pronto: ${user.email}`);
  }

  return createdUsers;
};

const getDemoVideoUrl = (disciplinaNome: string, ordem: number) => {
  const slug = disciplinaNome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return `https://videos.eduvance.local/${slug}/aula-${ordem}`;
};

const runSeed = async () => {
  await connectDatabase();
  console.log('MongoDB conectado para seed.');

  const createdUsers = await createOrUpdateUsers();
  const professor = createdUsers.get('professor@eduvance.com');

  if (!professor) {
    throw new Error('Professor EduVance nao foi encontrado no seed.');
  }

  const professorId = professor._id;
  let totalAulas = 0;
  let totalQuizzes = 0;

  for (const disciplinaData of disciplinas) {
    const disciplina = await Disciplina.findOneAndUpdate(
      { nome: disciplinaData.nome },
      {
        nome: disciplinaData.nome,
        categoria: disciplinaData.categoria,
        emoji: disciplinaData.emoji,
        descricao: disciplinaData.descricao,
        professor: professorId,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log(`Disciplina pronta: ${disciplina.nome}`);

    const aulasDaDisciplina = [];

    for (const aulaData of disciplinaData.aulas) {
      const aula = await Aula.findOneAndUpdate(
        {
          titulo: aulaData.titulo,
        },
        {
          ...aulaData,
          urlVideo: getDemoVideoUrl(disciplinaData.nome, aulaData.ordem),
          disciplina: disciplina._id,
          professor: professorId,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        },
      );

      aulasDaDisciplina.push(aula);
      totalAulas += 1;
      console.log(`  Aula pronta: ${aula.titulo}`);
    }

    await Quiz.findOneAndUpdate(
      {
        titulo: disciplinaData.quiz.titulo,
      },
      {
        titulo: disciplinaData.quiz.titulo,
        descricao: disciplinaData.quiz.descricao,
        disciplina: disciplina._id,
        aula: aulasDaDisciplina[0]?._id,
        professor: professorId,
        questoes: disciplinaData.quiz.questoes,
        xpPorAcerto: 10,
        planoMinimo: disciplinaData.quiz.planoMinimo,
        ativo: true,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    totalQuizzes += 1;
    console.log(`  Quiz pronto: ${disciplinaData.quiz.titulo}`);
  }

  console.log('Seed finalizado com sucesso.');
  console.log(`Usuarios demo: ${users.length}`);
  console.log(`Disciplinas demo: ${disciplinas.length}`);
  console.log(`Aulas demo verificadas/criadas: ${totalAulas}`);
  console.log(`Quizzes demo verificados/criados: ${totalQuizzes}`);
};

runSeed()
  .catch((error) => {
    console.error('Erro ao executar seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
