import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button } from '../../components/ui';

const features = [
  {
    icon: 'sparkles',
    title: 'Geração automática de exercícios com IA',
    text: 'Crie listas, provas e resumos em segundos. A EduAI avalia o conteúdo da aula e gera questões adaptadas ao nível da turma.',
  },
  {
    icon: 'users',
    title: 'Gestão de turma simplificada',
    text: 'Controle presença, notas e comportamento em um único lugar, sincronizado com a rotina da escola.',
    featured: true,
  },
  {
    icon: 'chart',
    title: 'Análise de desempenho',
    text: 'Identifique alunos em risco antes mesmo das avaliações com mapas de calor de aprendizagem.',
  },
  {
    icon: 'trophy',
    title: 'Gamificação integrada',
    text: 'Transforme o esforço dos alunos em emblemas e pontos automaticamente, aumentando o engajamento.',
  },
];

export function ProfessoresPage() {
  const navigate = useNavigate();

  return (
    <PublicLayout>
      <section className="prof-hero">
        <div className="prof-hero-copy">
          <span className="eyebrow">
            <Icon name="sparkles" size={15} /> Educação do futuro
          </span>
          <h1 className="display">
            Potencialize seu ensino com Inteligência Artificial e Dados.
          </h1>
          <p>
            Reduza o trabalho administrativo, gere atividades personalizadas e acompanhe o progresso real de
            cada aluno em tempo real.
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate('/cadastro?tipo=professor')}>Solicitar demonstração</Button>
            <Button variant="outline" onClick={() => navigate('/planos')}>
              Ver planos
            </Button>
          </div>
        </div>
        <div className="prof-hero-card">
          <div className="prof-hero-stat">
            <Icon name="chart" size={20} />
            <div>
              <strong>+24%</strong>
              <span>Engajamento médio</span>
            </div>
          </div>
          <div className="prof-hero-bars">
            <span style={{ height: '40%' }} />
            <span style={{ height: '65%' }} />
            <span style={{ height: '52%' }} />
            <span style={{ height: '80%' }} />
            <span style={{ height: '70%' }} />
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <h2 className="display">Uma plataforma, controle total.</h2>
          <p>Ferramentas desenhadas para elevar a prática docente e focar no que importa: aprendizagem.</p>
        </div>
        <div className="prof-feature-grid">
          {features.map((item) => (
            <article key={item.title} className={`prof-feature-card${item.featured ? ' is-featured' : ''}`}>
              <span className="benefit-icon" aria-hidden="true">
                <Icon name={item.icon} size={22} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="prof-cta">
        <h2 className="display">Pronto para transformar sua sala de aula?</h2>
        <p>Junte-se a escolas que já usam o EduVance para elevar o padrão de ensino.</p>
        <div className="landing-cta-actions">
          <Button onClick={() => navigate('/cadastro?tipo=professor')}>Testar grátis por 30 dias</Button>
          <Button variant="outline" onClick={() => navigate('/login-professor')}>
            Já sou professor
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
