import { FormEvent, useEffect, useMemo, useState } from 'react';

import {
  AuthLayout,
  Button,
  DisciplineCard,
  EmptyState,
  Input,
  LandingHeader,
  ProgressBar,
  StatCard,
  StudentLayout,
} from './components';
import { BrandLogo } from './components/brand/BrandLogo';

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3333').replace(/\/$/, '');
const TOKEN_KEY = 'eduvance_token';
const USER_KEY = 'eduvance_user';
const AUTH_MESSAGE_KEY = 'eduvance_auth_message';
const THEME_KEY = 'eduvance_theme';

type UserType = 'aluno' | 'professor' | 'admin';
type PlanType = 'gratis' | 'premium';

type EduVanceUser = {
  _id?: string;
  id?: string;
  nome: string;
  email: string;
  tipo: UserType;
  plano?: PlanType;
  xp?: number;
  nivel?: number;
  streak?: number;
  totalAulasConcluidas?: number;
};

type AuthResponse = {
  token: string;
  user: EduVanceUser;
};

type ApiDisciplina = {
  _id: string;
  nome: string;
  categoria: string;
  emoji?: string;
  professor?: string | { nome?: string };
};

type ApiAula = {
  _id: string;
  disciplina?: string | { _id?: string };
};

type ProgressSummary = {
  xp?: number;
  nivel?: number;
  streak?: number;
  totalAulasConcluidas?: number;
  totalAulasDisponiveis?: number;
  percentualConcluido?: number;
};

type Discipline = {
  id: string;
  name: string;
  category: string;
  categoryShort: string;
  professor: string;
  lessons: number;
  progress: number;
  icon: string;
};

type Feedback = {
  type: 'success' | 'error' | 'idle';
  message: string;
};

const defaultUser: EduVanceUser = {
  nome: 'João Silva',
  email: 'aluno@eduvance.com',
  tipo: 'aluno',
  plano: 'premium',
  xp: 2450,
  nivel: 7,
  streak: 7,
  totalAulasConcluidas: 47,
};

const defaultDisciplines: Discipline[] = [
  {
    id: 'matematica',
    name: 'Matemática',
    category: 'Matemática e suas Tecnologias',
    categoryShort: 'Matemática',
    professor: 'Prof. Roberto',
    lessons: 12,
    progress: 68,
    icon: '△',
  },
  {
    id: 'fisica',
    name: 'Física',
    category: 'Ciências da Natureza e suas Tecnologias',
    categoryShort: 'C. Natureza',
    professor: 'Profa. Lúcia',
    lessons: 10,
    progress: 18,
    icon: 'Fx',
  },
  {
    id: 'quimica',
    name: 'Química',
    category: 'Ciências da Natureza e suas Tecnologias',
    categoryShort: 'C. Natureza',
    professor: 'Prof. Denis',
    lessons: 11,
    progress: 78,
    icon: 'Qm',
  },
  {
    id: 'biologia',
    name: 'Biologia',
    category: 'Ciências da Natureza e suas Tecnologias',
    categoryShort: 'C. Natureza',
    professor: 'Profa. Ana',
    lessons: 9,
    progress: 35,
    icon: 'DNA',
  },
  {
    id: 'historia',
    name: 'História',
    category: 'Ciências Humanas e Sociais Aplicadas',
    categoryShort: 'Humanas',
    professor: 'Prof. Marcos',
    lessons: 8,
    progress: 85,
    icon: 'Hs',
  },
  {
    id: 'geografia',
    name: 'Geografia',
    category: 'Ciências Humanas e Sociais Aplicadas',
    categoryShort: 'Humanas',
    professor: 'Profa. Julia',
    lessons: 8,
    progress: 52,
    icon: 'Geo',
  },
  {
    id: 'portugues',
    name: 'Português',
    category: 'Linguagens e suas Tecnologias',
    categoryShort: 'Linguagens',
    professor: 'Prof. Carlos',
    lessons: 14,
    progress: 46,
    icon: 'PT',
  },
  {
    id: 'ingles',
    name: 'Inglês',
    category: 'Linguagens e suas Tecnologias',
    categoryShort: 'Linguagens',
    professor: 'Profa. Sarah',
    lessons: 7,
    progress: 30,
    icon: 'EN',
  },
];

const categoryFilters = [
  'Todas',
  'Linguagens',
  'Matemática',
  'Ciências da Natureza',
  'Ciências Humanas',
  'Formação Técnica',
];

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { message?: string }).message ?? 'Não foi possível concluir a operação.');
  }

  return data as T;
}

function storeSession(token: string | undefined, user: EduVanceUser) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function getStoredUser(): EduVanceUser {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return defaultUser;
  }

  try {
    return { ...defaultUser, ...JSON.parse(rawUser) };
  } catch {
    return defaultUser;
  }
}

function useRouter() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return { path, navigate };
}

function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem(THEME_KEY) === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return {
    isDarkMode,
    toggleTheme: () => setIsDarkMode((current) => !current),
  };
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getProfessorName(professor: ApiDisciplina['professor']) {
  if (!professor || typeof professor === 'string') {
    return 'Professor EduVance';
  }

  return professor.nome ?? 'Professor EduVance';
}

function getDisciplineId(aula: ApiAula) {
  if (!aula.disciplina) {
    return '';
  }

  if (typeof aula.disciplina === 'string') {
    return aula.disciplina;
  }

  return aula.disciplina._id ?? '';
}

function useStudentDashboardData() {
  const [user, setUser] = useState<EduVanceUser>(() => getStoredUser());
  const [summary, setSummary] = useState<ProgressSummary | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    apiRequest<EduVanceUser>('/api/auth/me', { headers })
      .then((apiUser) => {
        const nextUser = { ...defaultUser, ...apiUser };
        setUser(nextUser);
        localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      })
      .catch(() => undefined);

    apiRequest<ProgressSummary>('/api/progresso/resumo', { headers })
      .then(setSummary)
      .catch(() => undefined);
  }, []);

  return { user, summary };
}

function LandingPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main className="landing-page">
      <LandingHeader onNavigate={onNavigate} />

      <section className="landing-hero" id="sobre">
        <div className="hero-copy">
          <span className="eyebrow">Plataforma educacional inteligente</span>
          <h1>Aprenda, evolua e acompanhe seu progresso.</h1>
          <p>
            Transforme o estudo em uma jornada clara, gamificada e eficiente
            com aulas, quizzes, XP, streak e apoio da EduAI.
          </p>

          <div className="hero-actions">
            <Button onClick={() => onNavigate('/cadastro')}>{'Criar conta ->'}</Button>
            <Button variant="secondary" onClick={() => onNavigate('/login')}>Entrar</Button>
          </div>

          <div className="hero-metrics" aria-label="Métricas do EduVance">
            <strong>12+</strong>
            <span>Disciplinas</span>
            <strong>500+</strong>
            <span>Alunos</span>
            <strong>98%</strong>
            <span>Aprovação</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Resumo de progresso do aluno">
          <div className="achievement-card">
            <span>★</span>
            <div>
              <small>Conquista</small>
              <strong>Mestre das Frações</strong>
            </div>
          </div>

          <article className="student-preview-card">
            <div className="student-preview-top">
              <span className="student-avatar">JS</span>
              <div>
                <h2>João Silva</h2>
                <p>3 Ano B</p>
              </div>
              <strong className="streak-pill">7 dias</strong>
            </div>

            <div className="xp-row">
              <span>Progresso para nível 8</span>
              <strong>850/1000 XP</strong>
            </div>
            <ProgressBar value={85} />

            <div className="subject-row">
              <span>△</span>
              <p>Matemática</p>
              <strong>92%</strong>
            </div>
            <div className="subject-row">
              <span>Qm</span>
              <p>Química</p>
              <strong>78%</strong>
            </div>
          </article>

          <div className="xp-chip">+50 XP</div>
        </div>
      </section>

      <section className="landing-section benefits" id="disciplinas">
        <div className="section-heading">
          <span className="eyebrow">Benefícios</span>
          <h2>Uma rotina de estudos com clareza.</h2>
        </div>
        <div className="benefit-grid">
          <article>
            <span>XP</span>
            <h3>Progresso visível</h3>
            <p>Acompanhe aulas concluídas, nível, streak e evolução geral.</p>
          </article>
          <article>
            <span>AI</span>
            <h3>Apoio inteligente</h3>
            <p>A EduAI ajuda com dúvidas e resumos dentro do fluxo de estudos.</p>
          </article>
          <article>
            <span>✓</span>
            <h3>Conteúdo organizado</h3>
            <p>Disciplinas, aulas e quizzes separados por áreas de conhecimento.</p>
          </article>
        </div>
      </section>

      <section className="landing-section how-it-works" id="como-funciona">
        <div className="section-heading">
          <span className="eyebrow">Como funciona</span>
          <h2>Do primeiro acesso ao acompanhamento.</h2>
        </div>
        <div className="steps-grid">
          <article>
            <strong>01</strong>
            <h3>Crie sua conta</h3>
            <p>Aluno ou professor entra no ambiente certo desde o cadastro.</p>
          </article>
          <article>
            <strong>02</strong>
            <h3>Escolha as disciplinas</h3>
            <p>Acesse aulas gratuitas ou premium conforme seu plano.</p>
          </article>
          <article>
            <strong>03</strong>
            <h3>Evolua com dados</h3>
            <p>Ganhe XP em aulas e quizzes enquanto acompanha seu desempenho.</p>
          </article>
        </div>
      </section>

      <section className="landing-section plan-strip" id="planos">
        <div>
          <span className="eyebrow">Planos</span>
          <h2>Grátis para começar, premium para ir mais longe.</h2>
        </div>
        <Button onClick={() => onNavigate('/cadastro')}>Começar agora</Button>
      </section>
    </main>
  );
}

function RegisterStudentPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [feedback, setFeedback] = useState<Feedback>({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback({ type: 'idle', message: '' });

    if (!form.nome.trim() || !form.email.trim() || !form.senha) {
      setFeedback({ type: 'error', message: 'Preencha nome, e-mail e senha para criar sua conta.' });
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setFeedback({ type: 'error', message: 'As senhas precisam ser iguais.' });
      return;
    }

    setLoading(true);

    try {
      await apiRequest<EduVanceUser>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          senha: form.senha,
          tipo: 'aluno',
        }),
      });

      localStorage.setItem(AUTH_MESSAGE_KEY, 'Conta criada com sucesso. Faça login para continuar.');
      onNavigate('/login');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível criar a conta.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Transforme o aprendizado em uma jornada épica."
      subtitle="Ganhe XP, conclua aulas e acompanhe sua evolução."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-heading">
          <h1>Criar conta</h1>
          <p>Junte-se ao EduVance como aluno.</p>
        </div>

        <div className="role-switch" aria-label="Tipo de conta">
          <button className="active" type="button">Aluno</button>
          <button type="button" onClick={() => onNavigate('/cadastro-professor')}>Professor</button>
        </div>

        <Input
          icon="●"
          label="Nome"
          onChange={(event) => setForm({ ...form, nome: event.target.value })}
          placeholder="Digite seu nome"
          required
          value={form.nome}
        />
        <Input
          icon="@"
          label="E-mail"
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="seu@email.com"
          required
          type="email"
          value={form.email}
        />
        <Input
          icon="□"
          label="Senha"
          minLength={6}
          onChange={(event) => setForm({ ...form, senha: event.target.value })}
          placeholder="Mínimo 6 caracteres"
          required
          type="password"
          value={form.senha}
        />
        <Input
          icon="□"
          label="Confirmar senha"
          minLength={6}
          onChange={(event) => setForm({ ...form, confirmarSenha: event.target.value })}
          placeholder="Repita sua senha"
          required
          type="password"
          value={form.confirmarSenha}
        />

        {feedback.message ? <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p> : null}

        <Button full type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar conta ->'}
        </Button>
        <p className="auth-link-row">
          Já tenho conta. <button type="button" onClick={() => onNavigate('/login')}>Entrar</button>
        </p>
      </form>
    </AuthLayout>
  );
}

function RegisterTeacherPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    areaAtuacao: '',
    senha: '',
    confirmarSenha: '',
  });
  const [feedback, setFeedback] = useState<Feedback>({ type: 'idle', message: '' });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback({ type: 'idle', message: '' });

    if (!form.nome.trim() || !form.email.trim() || !form.areaAtuacao.trim() || !form.senha) {
      setFeedback({ type: 'error', message: 'Preencha todos os campos para criar sua conta.' });
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setFeedback({ type: 'error', message: 'As senhas precisam ser iguais.' });
      return;
    }

    setLoading(true);

    try {
      await apiRequest<EduVanceUser>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.nome.trim(),
          email: form.email.trim().toLowerCase(),
          senha: form.senha,
          tipo: 'professor',
          turma: form.areaAtuacao.trim(),
        }),
      });

      localStorage.setItem(AUTH_MESSAGE_KEY, 'Conta de professor criada. Faça login para continuar.');
      onNavigate('/login');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível criar a conta.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Organize turmas, aulas e progresso em um só lugar."
      subtitle="Ferramentas simples para acompanhar seus alunos."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-heading">
          <h1>Criar conta</h1>
          <p>Acesse seu ambiente de professor.</p>
        </div>

        <div className="role-switch" aria-label="Tipo de conta">
          <button type="button" onClick={() => onNavigate('/cadastro')}>Aluno</button>
          <button className="active" type="button">Professor</button>
        </div>

        <Input
          icon="●"
          label="Nome"
          onChange={(event) => setForm({ ...form, nome: event.target.value })}
          placeholder="Digite seu nome"
          required
          value={form.nome}
        />
        <Input
          icon="@"
          label="E-mail institucional"
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="professor@email.com"
          required
          type="email"
          value={form.email}
        />
        <Input
          icon="▣"
          label="Disciplina ou área de atuação"
          onChange={(event) => setForm({ ...form, areaAtuacao: event.target.value })}
          placeholder="Matemática, Biologia, Tecnologia..."
          required
          value={form.areaAtuacao}
        />
        <Input
          icon="□"
          label="Senha"
          minLength={6}
          onChange={(event) => setForm({ ...form, senha: event.target.value })}
          placeholder="Mínimo 6 caracteres"
          required
          type="password"
          value={form.senha}
        />
        <Input
          icon="□"
          label="Confirmar senha"
          minLength={6}
          onChange={(event) => setForm({ ...form, confirmarSenha: event.target.value })}
          placeholder="Repita sua senha"
          required
          type="password"
          value={form.confirmarSenha}
        />

        {feedback.message ? <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p> : null}

        <Button full type="submit" disabled={loading}>
          {loading ? 'Criando...' : 'Criar conta ->'}
        </Button>
        <p className="auth-link-row">
          Já tenho conta. <button type="button" onClick={() => onNavigate('/login')}>Entrar</button>
        </p>
      </form>
    </AuthLayout>
  );
}

function LoginPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [feedback, setFeedback] = useState<Feedback>(() => {
    const authMessage = localStorage.getItem(AUTH_MESSAGE_KEY);

    return authMessage
      ? { type: 'success', message: authMessage }
      : { type: 'idle', message: '' };
  });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    localStorage.removeItem(AUTH_MESSAGE_KEY);
    setFeedback({ type: 'idle', message: '' });

    try {
      const session = await apiRequest<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email.trim().toLowerCase(), senha: form.senha }),
      });

      storeSession(session.token, session.user);
      onNavigate(session.user.tipo === 'professor' ? '/professor/inicio' : '/aluno/inicio');
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Não foi possível entrar.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Volte para sua jornada de estudos."
      subtitle="Continue aulas, quizzes, progresso e conversas com a EduAI."
    >
      <form className="auth-form auth-form-compact" onSubmit={handleSubmit}>
        <div className="auth-form-heading">
          <h1>Entrar</h1>
          <p>Acesse sua conta EduVance.</p>
        </div>
        <Input
          icon="@"
          label="E-mail"
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="seu@email.com"
          required
          type="email"
          value={form.email}
        />
        <Input
          icon="□"
          label="Senha"
          onChange={(event) => setForm({ ...form, senha: event.target.value })}
          placeholder="Digite sua senha"
          required
          type="password"
          value={form.senha}
        />
        {feedback.message ? <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p> : null}
        <Button full type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar ->'}</Button>
        <p className="auth-link-row">
          Esqueceu a senha? <button type="button" onClick={() => onNavigate('/recuperar-senha')}>Recuperar</button>
        </p>
        <p className="auth-link-row">
          Ainda não tem conta? <button type="button" onClick={() => onNavigate('/cadastro')}>Criar conta</button>
        </p>
      </form>
    </AuthLayout>
  );
}

function ForgotPasswordPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="recover-page">
      <button className="recover-brand" type="button" onClick={() => onNavigate('/')}>
        <BrandLogo size="md" />
      </button>
      <form className="recover-card" onSubmit={handleSubmit}>
        <span className="recover-lock" aria-hidden="true">□</span>
        <h1>Recuperar senha</h1>
        <p>Informe o e-mail associado à sua conta para receber as instruções de acesso.</p>
        <Input
          icon="@"
          label="E-mail"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nome@escola.com.br"
          required
          type="email"
          value={email}
        />
        {sent ? (
          <p className="form-feedback success">
            Se este e-mail existir no EduVance, enviaremos um link de recuperação.
          </p>
        ) : null}
        <Button full type="submit">{'Enviar link ->'}</Button>
        <button className="text-link" type="button" onClick={() => onNavigate('/login')}>
          Voltar para o login
        </button>
      </form>
    </main>
  );
}

function StudentHomePage({
  activePath,
  isDarkMode,
  onNavigate,
  onToggleTheme,
}: {
  activePath: string;
  isDarkMode: boolean;
  onNavigate: (path: string) => void;
  onToggleTheme: () => void;
}) {
  const { user, summary } = useStudentDashboardData();
  const nivel = summary?.nivel ?? user.nivel ?? defaultUser.nivel ?? 1;
  const xp = summary?.xp ?? user.xp ?? defaultUser.xp ?? 0;
  const streak = summary?.streak ?? user.streak ?? defaultUser.streak ?? 0;
  const totalAulas = summary?.totalAulasConcluidas ?? user.totalAulasConcluidas ?? defaultUser.totalAulasConcluidas ?? 0;
  const nextLevelXp = Math.max(3000, Math.ceil((xp + 500) / 500) * 500);
  const xpPercent = Math.min(100, Math.round((xp / nextLevelXp) * 100));

  return (
    <StudentLayout
      activePath={activePath}
      isDarkMode={isDarkMode}
      onNavigate={onNavigate}
      onToggleTheme={onToggleTheme}
    >
      <section className="student-content dashboard-content">
        <div className="dashboard-greeting">
          <h1>Bom dia, {user.nome.split(' ')[0]}</h1>
        </div>

        <div className="stats-grid">
          <StatCard icon="▶" label="Aulas assistidas" value={String(totalAulas)} />
          <StatCard icon="✓" label="Exercícios resolvidos" value="128" tone="green" />
          <StatCard icon="!" label="Sequência atual" value={`${streak} dias`} tone="red" />
          <StatCard icon="★" label="Média geral" value="8.4" tone="yellow" />
        </div>

        <section className="level-banner">
          <span className="level-badge">★</span>
          <div>
            <small>Nível atual</small>
            <strong>LVL {nivel}</strong>
          </div>
          <div className="level-progress">
            <div className="xp-row">
              <span>{xp.toLocaleString('pt-BR')} XP</span>
              <span>{nextLevelXp.toLocaleString('pt-BR')} XP para Nível {nivel + 1}</span>
            </div>
            <ProgressBar value={xpPercent} />
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="dashboard-panel continue-panel">
            <div className="panel-title">
              <h2>Continue estudando</h2>
            </div>
            {[
              ['Geometria Analítica', 'Módulo 3 • Cônicas', 65, '△'],
              ['Biologia Celular', 'Módulo 5 • Mitose', 30, 'DNA'],
              ['História do Brasil', 'Módulo 2 • Era Vargas', 85, 'Hs'],
            ].map(([title, meta, progress, icon]) => (
              <article className="lesson-row" key={title}>
                <span>{icon}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{meta}</p>
                  <ProgressBar value={Number(progress)} />
                </div>
                <button aria-label={`Acessar ${title}`} type="button">{'->'}</button>
              </article>
            ))}
          </section>

          <section className="dashboard-panel eduai-panel">
            <div className="panel-title">
              <h2>EduAI</h2>
              <button type="button">Ver tudo</button>
            </div>
            {['Resumo: Era Vargas', 'Fórmula de Bhaskara', 'Dúvida: RNA x DNA'].map((item) => (
              <article className="ai-row" key={item}>
                <span>AI</span>
                <p>{item}</p>
              </article>
            ))}
            <Button variant="outline" full>Nova conversa</Button>
          </section>

          <aside className="dashboard-side">
            <section className="dashboard-panel materials-panel">
              <h2>Materiais</h2>
              {['Lista_Exercicios_Cônicas.pdf', 'Resumo_Mitose.pdf', 'Anotacoes_Aula_12'].map((item) => (
                <article className="material-row" key={item}>
                  <span>{item.endsWith('.pdf') ? 'PDF' : 'DOC'}</span>
                  <p>{item}</p>
                </article>
              ))}
            </section>

            <section className="streak-panel">
              <strong>{streak} Dias!</strong>
              <p>Você está pegando fogo!</p>
              <div className="week-row" aria-label="Sequência semanal">
                {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </section>
          </aside>

          <section className="dashboard-panel upcoming-panel">
            <div className="panel-title">
              <h2>Próximas aulas</h2>
              <span>▣</span>
            </div>
            {[
              ['14', 'NOV', 'Física: Leis de Newton', '14:00 - 15:30 • Prof. Carlos'],
              ['15', 'NOV', 'Química: Estequiometria', '09:00 - 10:30 • Profa. Ana'],
            ].map(([day, month, title, meta]) => (
              <article className="class-row" key={title}>
                <span>
                  <strong>{day}</strong>
                  <small>{month}</small>
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{meta}</p>
                </div>
              </article>
            ))}
          </section>

          <section className="dashboard-panel achievements-panel">
            <div className="panel-title">
              <h2>Conquistas recentes</h2>
              <button type="button">Ver todas</button>
            </div>
            <div className="achievement-list">
              {[
                ['★', 'Mestre da Semana', 'Mais XP na turma'],
                ['◇', 'Sabe-Tudo', '100 exercícios'],
                ['●', 'Focado', '2h sem pausas'],
              ].map(([icon, title, meta]) => (
                <article key={title}>
                  <span>{icon}</span>
                  <strong>{title}</strong>
                  <p>{meta}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </StudentLayout>
  );
}

function StudentDisciplinesPage({
  activePath,
  isDarkMode,
  onNavigate,
  onToggleTheme,
}: {
  activePath: string;
  isDarkMode: boolean;
  onNavigate: (path: string) => void;
  onToggleTheme: () => void;
}) {
  const [disciplines, setDisciplines] = useState(defaultDisciplines);
  const [filter, setFilter] = useState('Todas');
  const [query, setQuery] = useState('');
  const [usingMock, setUsingMock] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      apiRequest<ApiDisciplina[]>('/api/disciplinas', { headers }),
      apiRequest<ApiAula[]>('/api/aulas', { headers }),
    ])
      .then(([apiDisciplines, apiLessons]) => {
        const nextDisciplines = apiDisciplines.map((item, index) => {
          const lessonCount = apiLessons.filter((lesson) => getDisciplineId(lesson) === item._id).length;
          const fallback = defaultDisciplines[index % defaultDisciplines.length];

          return {
            id: item._id,
            name: item.nome,
            category: item.categoria,
            categoryShort: fallback.categoryShort,
            professor: getProfessorName(item.professor),
            lessons: lessonCount || fallback.lessons,
            progress: fallback.progress,
            icon: item.emoji ?? fallback.icon,
          };
        });

        if (nextDisciplines.length > 0) {
          setDisciplines(nextDisciplines);
          setUsingMock(false);
        }
      })
      .catch(() => {
        setUsingMock(true);
      });
  }, []);

  const filteredDisciplines = useMemo(() => {
    return disciplines.filter((discipline) => {
      const matchesFilter =
        filter === 'Todas' || normalizeText(discipline.category).includes(normalizeText(filter));
      const matchesQuery = normalizeText(discipline.name).includes(normalizeText(query));

      return matchesFilter && matchesQuery;
    });
  }, [disciplines, filter, query]);

  const groupedDisciplines = useMemo(() => {
    return filteredDisciplines.reduce<Record<string, Discipline[]>>((groups, discipline) => {
      groups[discipline.category] = groups[discipline.category] ?? [];
      groups[discipline.category].push(discipline);
      return groups;
    }, {});
  }, [filteredDisciplines]);

  return (
    <StudentLayout
      activePath={activePath}
      isDarkMode={isDarkMode}
      onNavigate={onNavigate}
      onToggleTheme={onToggleTheme}
    >
      <section className="student-content">
        <div className="discipline-header">
          <div>
            <h1>Disciplinas</h1>
            <span>{disciplines.length} disciplinas</span>
          </div>
          <label className="page-search">
            <span aria-hidden="true">⌕</span>
            <input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar disciplina..."
              value={query}
            />
          </label>
        </div>

        <div className="filter-row" aria-label="Filtros de disciplinas">
          {categoryFilters.map((item) => (
            <button
              className={filter === item ? 'active' : ''}
              key={item}
              type="button"
              onClick={() => setFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {usingMock ? (
          <p className="data-note">Dados de demonstração. Ao entrar com token válido, a lista tenta carregar do backend.</p>
        ) : null}

        {Object.keys(groupedDisciplines).length === 0 ? (
          <EmptyState
            title="Nenhuma disciplina encontrada"
            description="Ajuste o filtro ou busque por outro nome de disciplina."
          />
        ) : (
          Object.entries(groupedDisciplines).map(([category, items]) => (
            <section className="discipline-section" key={category}>
              <h2>{category}</h2>
              <div className="discipline-grid">
                {items.map((discipline) => (
                  <DisciplineCard
                    category={discipline.category}
                    categoryShort={discipline.categoryShort}
                    icon={discipline.icon}
                    key={discipline.id}
                    lessons={discipline.lessons}
                    name={discipline.name}
                    onAccess={() => onNavigate('/aluno/inicio')}
                    professor={discipline.professor}
                    progress={discipline.progress}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </section>
    </StudentLayout>
  );
}

function ProfessorPlaceholderPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main className="placeholder-page">
      <EmptyState
        title="Painel do professor em preparação"
        description="A conta de professor já pode ser criada. A tela completa do professor fica como próximo passo do EduVance."
        action={<Button onClick={() => onNavigate('/')}>Voltar para a landing</Button>}
      />
    </main>
  );
}

function NotFoundPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main className="placeholder-page">
      <EmptyState
        title="Página não encontrada"
        description="Volte para o início do EduVance e continue navegando."
        action={<Button onClick={() => onNavigate('/')}>Ir para o início</Button>}
      />
    </main>
  );
}

function App() {
  const { path, navigate } = useRouter();
  const { isDarkMode, toggleTheme } = useTheme();

  if (path === '/') {
    return <LandingPage onNavigate={navigate} />;
  }

  if (path === '/cadastro') {
    return <RegisterStudentPage onNavigate={navigate} />;
  }

  if (path === '/cadastro-professor') {
    return <RegisterTeacherPage onNavigate={navigate} />;
  }

  if (path === '/recuperar-senha') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }

  if (path === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (path === '/aluno/inicio') {
    return (
      <StudentHomePage
        activePath={path}
        isDarkMode={isDarkMode}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (path === '/aluno/disciplinas') {
    return (
      <StudentDisciplinesPage
        activePath={path}
        isDarkMode={isDarkMode}
        onNavigate={navigate}
        onToggleTheme={toggleTheme}
      />
    );
  }

  if (path === '/professor/inicio') {
    return <ProfessorPlaceholderPage onNavigate={navigate} />;
  }

  return <NotFoundPage onNavigate={navigate} />;
}

export default App;
