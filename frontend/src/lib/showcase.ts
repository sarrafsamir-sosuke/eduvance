// Catálogo público (vitrine). Espelha as disciplinas semeadas no backend, usado nas
// páginas públicas onde o visitante ainda não tem token para acessar /api/disciplinas.
import type { Disciplina } from './types';

export interface ShowcaseDisciplina extends Disciplina {
  professorNome: string;
  aulas: number;
  progressoDemo: number;
  descricaoCurta: string;
}

export const SHOWCASE_DISCIPLINAS: ShowcaseDisciplina[] = [
  {
    _id: 'showcase-portugues',
    nome: 'Língua Portuguesa',
    categoria: 'Linguagens e suas Tecnologias',
    emoji: '📚',
    professorNome: 'Prof. Carlos',
    aulas: 14,
    progressoDemo: 46,
    descricaoCurta: 'Leitura, interpretação, gramática e produção textual.',
  },
  {
    _id: 'showcase-arte',
    nome: 'Arte',
    categoria: 'Linguagens e suas Tecnologias',
    emoji: '🎨',
    professorNome: 'Profa. Júlia',
    aulas: 8,
    progressoDemo: 22,
    descricaoCurta: 'Linguagens artísticas, cultura e expressão criativa.',
  },
  {
    _id: 'showcase-ingles',
    nome: 'Inglês',
    categoria: 'Linguagens e suas Tecnologias',
    emoji: '🇬🇧',
    professorNome: 'Profa. Sarah',
    aulas: 7,
    progressoDemo: 30,
    descricaoCurta: 'Vocabulário, conversação e interpretação em inglês.',
  },
  {
    _id: 'showcase-matematica',
    nome: 'Matemática',
    categoria: 'Matemática e suas Tecnologias',
    emoji: '📐',
    professorNome: 'Prof. Roberto',
    aulas: 12,
    progressoDemo: 68,
    descricaoCurta: 'Lógica, funções, geometria e resolução de problemas.',
  },
  {
    _id: 'showcase-biologia',
    nome: 'Biologia',
    categoria: 'Ciências da Natureza e suas Tecnologias',
    emoji: '🧬',
    professorNome: 'Profa. Ana',
    aulas: 9,
    progressoDemo: 35,
    descricaoCurta: 'Células, genética, ecologia e os seres vivos.',
  },
  {
    _id: 'showcase-quimica',
    nome: 'Química',
    categoria: 'Ciências da Natureza e suas Tecnologias',
    emoji: '🧪',
    professorNome: 'Prof. Denis',
    aulas: 11,
    progressoDemo: 78,
    descricaoCurta: 'Matéria, reações químicas e tabela periódica.',
  },
  {
    _id: 'showcase-fisica',
    nome: 'Física',
    categoria: 'Ciências da Natureza e suas Tecnologias',
    emoji: '⚛️',
    professorNome: 'Profa. Lúcia',
    aulas: 10,
    progressoDemo: 18,
    descricaoCurta: 'Movimento, energia, forças e fenômenos físicos.',
  },
  {
    _id: 'showcase-historia',
    nome: 'História',
    categoria: 'Ciências Humanas e Sociais Aplicadas',
    emoji: '🏛️',
    professorNome: 'Prof. Marcos',
    aulas: 8,
    progressoDemo: 85,
    descricaoCurta: 'Processos históricos, sociedade, cultura e cidadania.',
  },
  {
    _id: 'showcase-geografia',
    nome: 'Geografia',
    categoria: 'Ciências Humanas e Sociais Aplicadas',
    emoji: '🌎',
    professorNome: 'Profa. Julia',
    aulas: 8,
    progressoDemo: 52,
    descricaoCurta: 'Espaço geográfico, mapas, natureza e território.',
  },
  {
    _id: 'showcase-tecnologia',
    nome: 'Tecnologia e Inovação',
    categoria: 'Formação Técnica e Profissional',
    emoji: '💻',
    professorNome: 'Prof. Denis',
    aulas: 9,
    progressoDemo: 40,
    descricaoCurta: 'Pensamento computacional, programação e inovação.',
  },
];
