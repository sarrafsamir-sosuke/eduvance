import type { Aula, Disciplina } from './types';

// Extrai o _id de um campo que pode vir como string ou objeto populado.
export function refId(value?: string | { _id?: string } | null): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value._id ?? '';
}

// Extrai um nome de um campo de referencia (professor, disciplina...).
export function refName(value?: string | { nome?: string } | null, fallback = ''): string {
  if (!value || typeof value === 'string') return fallback;
  return value.nome ?? fallback;
}

export function professorName(value?: Disciplina['professor'] | Aula['professor']): string {
  return refName(value, 'Professor EduVance');
}

export function disciplinaIdOfAula(aula: Aula): string {
  return refId(aula.disciplina as string | { _id?: string });
}

const DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

export function normalize(value: string): string {
  return value.normalize('NFD').replace(DIACRITICS, '').toLowerCase();
}

export function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function formatDuration(minutes?: number): string {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export function firstName(name?: string): string {
  if (!name) return '';
  return name.trim().split(/\s+/)[0];
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

// Agrupa aulas por modulo preservando a ordem de aparição dos módulos.
export function groupAulasByModulo(aulas: Aula[]): Array<{ modulo: string; aulas: Aula[] }> {
  const ordered = [...aulas].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
  const map = new Map<string, Aula[]>();
  for (const aula of ordered) {
    const modulo = aula.modulo?.trim() || 'Módulo Geral';
    if (!map.has(modulo)) map.set(modulo, []);
    map.get(modulo)!.push(aula);
  }
  return Array.from(map.entries()).map(([modulo, list]) => ({ modulo, aulas: list }));
}

// Cores estáveis por categoria para os cabeçalhos/cards de disciplina.
const CATEGORY_GRADIENTS: Record<string, string> = {
  'Linguagens e suas Tecnologias': 'linear-gradient(135deg, #7c3aed, #4f46e5)',
  'Matemática e suas Tecnologias': 'linear-gradient(135deg, #2563eb, #1d4ed8)',
  'Ciências da Natureza e suas Tecnologias': 'linear-gradient(135deg, #0ea5e9, #1d4ed8)',
  'Ciências Humanas e Sociais Aplicadas': 'linear-gradient(135deg, #d97706, #b45309)',
  'Formação Técnica e Profissional': 'linear-gradient(135deg, #059669, #047857)',
};

export function categoryGradient(categoria?: string): string {
  if (categoria && CATEGORY_GRADIENTS[categoria]) return CATEGORY_GRADIENTS[categoria];
  return 'linear-gradient(135deg, #2563eb, #1d4ed8)';
}

const CATEGORY_SHORT: Record<string, string> = {
  'Linguagens e suas Tecnologias': 'Linguagens',
  'Matemática e suas Tecnologias': 'Matemática',
  'Ciências da Natureza e suas Tecnologias': 'C. Natureza',
  'Ciências Humanas e Sociais Aplicadas': 'Humanas',
  'Formação Técnica e Profissional': 'Técnica',
};

export function categoryShort(categoria?: string): string {
  if (categoria && CATEGORY_SHORT[categoria]) return CATEGORY_SHORT[categoria];
  return categoria ?? 'Geral';
}

// Progresso pseudo-determinístico por disciplina enquanto o backend não tem o dado por disciplina.
export function fallbackProgress(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return 15 + (hash % 80);
}
