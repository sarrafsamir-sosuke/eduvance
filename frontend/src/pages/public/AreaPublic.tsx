import { useNavigate, useParams } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { PublicLayout } from '../../components/layouts/PublicLayout';
import { Button, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { categoryGradient, professorName } from '../../lib/helpers';
import { SHOWCASE_DISCIPLINAS } from '../../lib/showcase';
import { getAreaBySlug } from '../../lib/types';

const WHY = [
  { icon: 'target', title: 'Raciocínio crítico', text: 'Desenvolva pensamento analítico para resolver problemas complexos do dia a dia.' },
  { icon: 'sparkles', title: 'Compreensão do mundo', text: 'Entenda fenômenos, contextos e mudanças que moldam a sociedade e a natureza.' },
  { icon: 'trophy', title: 'Base para carreiras', text: 'Construa fundamentos sólidos para o vestibular, o ENEM e o futuro profissional.' },
];

export function AreaPublicPage() {
  const { areaSlug } = useParams<{ areaSlug: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const area = getAreaBySlug(areaSlug);

  if (!area) {
    return (
      <PublicLayout>
        <div className="page-pad">
          <EmptyState
            title="Área não encontrada"
            description="Confira o catálogo completo de disciplinas do EduVance."
            action={<Button onClick={() => navigate('/disciplinas')}>Ver disciplinas</Button>}
          />
        </div>
      </PublicLayout>
    );
  }

  const disciplinas = SHOWCASE_DISCIPLINAS.filter((d) => d.categoria === area.categoria);

  function handleAccess() {
    navigate(isAuthenticated ? '/aluno/disciplinas' : '/cadastro');
  }

  return (
    <PublicLayout>
      <section className="area-header" style={{ background: area.gradient }}>
        <button className="area-breadcrumb" type="button" onClick={() => navigate('/disciplinas')}>
          Disciplinas <Icon name="chevronRight" size={14} /> Áreas de Conhecimento
        </button>
        <h1 className="display">
          <span aria-hidden="true">{area.emoji}</span> {area.nome.replace(' e suas Tecnologias', '').replace(' e Sociais Aplicadas', '')}
        </h1>
        <p>{area.descricao}</p>
        <div className="area-badges">
          <span>
            <Icon name="book" size={15} /> {disciplinas.length} Disciplinas
          </span>
          <span>
            <Icon name="clock" size={15} /> 120h de conteúdo
          </span>
        </div>
      </section>

      <section className="area-disciplines">
        {disciplinas.map((d) => (
          <article key={d._id} className="area-discipline-card">
            <div className="area-discipline-top">
              <span className="area-discipline-emoji" style={{ background: categoryGradient(d.categoria) }}>
                {d.emoji}
              </span>
              <span className="area-discipline-count">{d.aulas} aulas</span>
            </div>
            <h3>{d.nome}</h3>
            <p>{d.descricaoCurta}</p>
            <div className="area-discipline-prof">
              <span className="mini-avatar" aria-hidden="true">
                <Icon name="user" size={14} />
              </span>
              {professorName(d.professorNome)}
            </div>
            <Button variant="outline" full onClick={handleAccess}>
              Acessar disciplina
            </Button>
          </article>
        ))}
      </section>

      <section className="landing-section">
        <div className="section-heading">
          <h2 className="display">Por que estudar {area.nome.replace(' e suas Tecnologias', '').replace(' e Sociais Aplicadas', '')}?</h2>
        </div>
        <div className="benefit-grid">
          {WHY.map((item) => (
            <article key={item.title} className="benefit-card">
              <span className="benefit-icon" aria-hidden="true">
                <Icon name={item.icon} size={22} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <div>
          <h2 className="display">Pronto para começar?</h2>
          <p>Crie sua conta gratuita e desbloqueie as aulas desta área.</p>
        </div>
        <div className="landing-cta-actions">
          <Button onClick={() => navigate('/cadastro')}>Começar agora</Button>
        </div>
      </section>
    </PublicLayout>
  );
}
