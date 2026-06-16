// Tipos compartilhados entre as paginas, alinhados com as respostas do backend.

export type UserType = 'aluno' | 'professor' | 'admin';
export type PlanType = 'gratis' | 'premium';

export interface EduVanceUser {
  _id?: string;
  id?: string;
  nome: string;
  email: string;
  tipo: UserType;
  turma?: string;
  matricula?: string;
  plano?: PlanType;
  xp?: number;
  nivel?: number;
  streak?: number;
  lastStudyDate?: string | null;
  totalAulasConcluidas?: number;
  aiPerguntasUsadas?: number;
  aiLimitePerguntas?: number;
}

export interface AuthResponse {
  token: string;
  user: EduVanceUser;
}

export interface Disciplina {
  _id: string;
  nome: string;
  categoria: string;
  emoji?: string;
  descricao?: string;
  professor?: string | { _id?: string; nome?: string };
}

export interface Aula {
  _id: string;
  titulo: string;
  descricao?: string;
  urlVideo?: string;
  disciplina?: string | { _id?: string; nome?: string; categoria?: string; emoji?: string };
  professor?: string | { _id?: string; nome?: string };
  modulo?: string;
  ordem?: number;
  duracao?: number;
  xpReward?: number;
  planoMinimo?: PlanType;
}

export interface QuestaoQuiz {
  pergunta: string;
  alternativas: string[];
  respostaCorreta?: number;
  explicacao?: string;
}

export interface Quiz {
  _id: string;
  titulo: string;
  descricao?: string;
  disciplina?: string | { _id?: string; nome?: string };
  aula?: string | { _id?: string; titulo?: string };
  questoes: QuestaoQuiz[];
  xpPorAcerto?: number;
  planoMinimo?: PlanType;
  ativo?: boolean;
}

export interface ProgressoResumo {
  xp?: number;
  nivel?: number;
  streak?: number;
  lastStudyDate?: string | null;
  totalAulasConcluidas?: number;
  totalAulasDisponiveis?: number;
  percentualConcluido?: number;
  progressosRecentes?: ProgressoItem[];
}

export interface ProgressoItem {
  _id: string;
  aula?: Aula;
  assistida?: boolean;
  percentual?: number;
  xpGanho?: number;
  concluidaEm?: string | null;
}

export interface ResultadoQuiz {
  _id: string;
  quiz?: Quiz;
  respostas?: number[];
  acertos?: number;
  totalQuestoes?: number;
  nota?: number;
  xpGanho?: number;
  finalizadoEm?: string;
}

export interface PlanoInfo {
  plano: PlanType;
  aiPerguntasUsadas: number;
  aiLimitePerguntas: number;
}

export interface EduAiLimite {
  plano: PlanType;
  aiPerguntasUsadas: number;
  aiLimitePerguntas: number;
  perguntasRestantes: number;
}

export interface ConversaAI {
  _id: string;
  usuario?: string;
  titulo: string;
  disciplinaContexto?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MensagemAI {
  _id: string;
  role: 'user' | 'assistant';
  conteudo: string;
}

export interface AdminDashboard {
  totalUsuarios: number;
  totalAlunos: number;
  totalProfessores: number;
  totalAdmins: number;
  totalDisciplinas: number;
  totalAulas: number;
  totalQuizzes: number;
  totalAulasConcluidas: number;
  totalQuizzesRespondidos: number;
  mediaXPAlunos: number;
  top5AlunosPorXP: EduVanceUser[];
}

// Areas da BNCC usadas para agrupar disciplinas e nas paginas publicas de vitrine.
export interface AreaConhecimento {
  slug: string;
  nome: string;
  categoria: string;
  emoji: string;
  descricao: string;
  gradient: string;
}

export const AREAS: AreaConhecimento[] = [
  {
    slug: 'linguagens',
    nome: 'Linguagens e suas Tecnologias',
    categoria: 'Linguagens e suas Tecnologias',
    emoji: '📚',
    descricao: 'Leitura, interpretação, gramática, produção textual, artes e comunicação para expressar ideias com clareza.',
    gradient: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
  },
  {
    slug: 'matematica',
    nome: 'Matemática e suas Tecnologias',
    categoria: 'Matemática e suas Tecnologias',
    emoji: '📐',
    descricao: 'Lógica, funções, geometria e resolução de problemas para desenvolver o raciocínio quantitativo.',
    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  },
  {
    slug: 'ciencias-da-natureza',
    nome: 'Ciências da Natureza e suas Tecnologias',
    categoria: 'Ciências da Natureza e suas Tecnologias',
    emoji: '🧬',
    descricao: 'Explore os mistérios do universo, da biologia celular às leis da física. Domine os conceitos do mundo ao seu redor.',
    gradient: 'linear-gradient(135deg, #0f172a, #1e3a8a)',
  },
  {
    slug: 'ciencias-humanas',
    nome: 'Ciências Humanas e Sociais Aplicadas',
    categoria: 'Ciências Humanas e Sociais Aplicadas',
    emoji: '🏛️',
    descricao: 'História, geografia e sociedade para compreender o mundo, a cultura e o exercício da cidadania.',
    gradient: 'linear-gradient(135deg, #b45309, #92400e)',
  },
  {
    slug: 'formacao-tecnica',
    nome: 'Formação Técnica e Profissional',
    categoria: 'Formação Técnica e Profissional',
    emoji: '💻',
    descricao: 'Tecnologia, programação, dados e inovação para preparar você para as profissões do futuro.',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
  },
];

export function getAreaByCategoria(categoria?: string): AreaConhecimento | undefined {
  if (!categoria) return undefined;
  return AREAS.find((area) => area.categoria === categoria);
}

export function getAreaBySlug(slug?: string): AreaConhecimento | undefined {
  if (!slug) return undefined;
  return AREAS.find((area) => area.slug === slug);
}
