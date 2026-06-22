import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, Button, EmptyState, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { api, API_BASE_URL, getApiErrorMessage } from '../../lib/api';
import { disciplinaIdOfAula, formatDuration, professorName, refName } from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { Aula, ProgressoItem } from '../../lib/types';

const MATERIAIS = [
  { tipo: 'PDF', nome: 'Lista de exercícios', meta: 'PDF · 1.2 MB' },
  { tipo: 'PDF', nome: 'Slides da aula', meta: 'PDF · 4.5 MB' },
  { tipo: 'XLS', nome: 'Planilha de apoio', meta: 'XLSX · 0.8 MB' },
];

export function AulaPage() {
  const { aulaId } = useParams<{ aulaId: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const aulaReq = useApi<Aula>(aulaId ? `/aulas/${aulaId}` : null, [aulaId]);
  const aula = aulaReq.data;
  const disciplinaId = aula ? disciplinaIdOfAula(aula) : '';
  const siblings = useApi<Aula[]>(disciplinaId ? `/aulas?disciplina=${disciplinaId}` : null, [disciplinaId]);
  const progressoReq = useApi<ProgressoItem & { assistida?: boolean }>(aulaId ? `/progresso/aulas/${aulaId}` : null, [aulaId]);

  const [done, setDone] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'materiais' | 'descricao'>('descricao');

  useEffect(() => {
    if (progressoReq.data?.assistida) setDone(true);
  }, [progressoReq.data]);

  const orderedSiblings = useMemo(
    () => [...(siblings.data ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)),
    [siblings.data],
  );
  const currentIndex = orderedSiblings.findIndex((a) => a._id === aulaId);
  const nextSibling = currentIndex >= 0 ? orderedSiblings[currentIndex + 1] : undefined;

  async function handleConcluir() {
    if (!aulaId || done) return;
    setSaving(true);
    setError('');
    try {
      const { data } = await api.post<{ xpGanho?: number; message: string }>('/progresso/concluir-aula', { aulaId });
      setDone(true);
      setXpGained(data.xpGanho ?? aula?.xpReward ?? 0);
      await refreshUser().catch(() => undefined);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível concluir a aula.'));
    } finally {
      setSaving(false);
    }
  }

  if (aulaReq.loading) {
    return (
      <AppLayout>
        <div className="page">
          <Spinner label="Carregando aula..." />
        </div>
      </AppLayout>
    );
  }

  if (!aula) {
    return (
      <AppLayout>
        <div className="page">
          <EmptyState
            title="Aula não encontrada"
            description={aulaReq.error || 'Esta aula pode ter sido removida.'}
            action={<Button onClick={() => navigate('/aluno/disciplinas')}>Ver disciplinas</Button>}
          />
        </div>
      </AppLayout>
    );
  }

  const disciplinaNome = refName(aula.disciplina as { nome?: string }, 'Disciplina');

  return (
    <AppLayout>
      <div className="page aula-page">
        <button
          className="back-link"
          type="button"
          onClick={() => (disciplinaId ? navigate(`/aluno/disciplinas/${disciplinaId}/aulas`) : navigate('/aluno/disciplinas'))}
        >
          <Icon name="arrowLeft" size={16} /> {disciplinaNome}
        </button>

        <div className="aula-grid">
          <div className="aula-main">
            <div className="video-frame">
              {aula.urlVideo ? (() => {
                const isLocal = aula.urlVideo.startsWith('/uploads');
                const isDirectVideo = /\.(mp4|mov|avi|mkv|webm)(\?|$)/i.test(aula.urlVideo);
                const videoSrc = isLocal ? `${API_BASE_URL}${aula.urlVideo}` : aula.urlVideo;

                if (isLocal || isDirectVideo) {
                  return (
                    <video
                      controls
                      controlsList="nodownload"
                      preload="metadata"
                      src={videoSrc}
                      style={{ width: '100%', borderRadius: 'var(--radius-lg, 12px)', background: '#000' }}
                    >
                      Seu navegador não suporta o player de vídeo.
                    </video>
                  );
                }

                return (
                  <div className="video-placeholder">
                    <span className="video-play" aria-hidden="true">
                      <Icon name="play" size={28} />
                    </span>
                    <p>Vídeo externo</p>
                    <a href={aula.urlVideo} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                      Abrir vídeo em nova aba
                    </a>
                  </div>
                );
              })() : (
                <div className="video-placeholder">
                  <span className="video-play" aria-hidden="true">
                    <Icon name="play" size={28} />
                  </span>
                  <p>Vídeo da aula ainda não disponível.</p>
                  <small style={{ color: 'var(--muted)' }}>Use o conteúdo textual para estudar.</small>
                </div>
              )}
            </div>

            <div className="aula-header">
              <div>
                {aula.modulo ? <span className="aula-module-tag">{aula.modulo}</span> : null}
                <h1>{aula.titulo}</h1>
                <p className="aula-prof">
                  <Icon name="user" size={15} /> {professorName(aula.professor)} · {formatDuration(aula.duracao)} ·{' '}
                  {aula.xpReward ?? 50} XP
                </p>
              </div>
              <div className="aula-actions">
                <Button variant="outline">
                  <Icon name="doc" size={16} /> Materiais
                </Button>
                <Button onClick={handleConcluir} loading={saving} disabled={done}>
                  <Icon name={done ? 'checkCircle' : 'check'} size={16} />
                  {done ? 'Concluída' : 'Marcar como concluída'}
                </Button>
              </div>
            </div>

            {xpGained !== null ? (
              <div className="aula-xp-toast">
                <Icon name="star" size={18} /> Aula concluída! Você ganhou +{xpGained} XP.
              </div>
            ) : null}
            {error ? <p className="form-feedback error">{error}</p> : null}

            <div className="tabs" role="tablist">
              <button role="tab" aria-selected={activeTab === 'descricao'} className={activeTab === 'descricao' ? 'active' : ''} onClick={() => setActiveTab('descricao')}>
                Descrição
              </button>
              <button role="tab" aria-selected={activeTab === 'materiais'} className={activeTab === 'materiais' ? 'active' : ''} onClick={() => setActiveTab('materiais')}>
                Materiais ({MATERIAIS.length})
              </button>
            </div>

            {activeTab === 'descricao' ? (
              <p className="aula-description">{aula.descricao ?? 'Esta aula faz parte da trilha da disciplina. Assista ao vídeo, baixe os materiais e marque como concluída para ganhar XP.'}</p>
            ) : (
              <div className="materials-grid">
                {MATERIAIS.map((m) => (
                  <article key={m.nome} className="material-card">
                    <span className="material-type">{m.tipo}</span>
                    <div>
                      <h4>{m.nome}</h4>
                      <small>{m.meta}</small>
                    </div>
                    <button type="button" className="material-download" aria-label={`Baixar ${m.nome}`}>
                      <Icon name="arrowRight" size={16} />
                    </button>
                  </article>
                ))}
              </div>
            )}

            {nextSibling ? (
              <div className="aula-next">
                <span>Próxima aula</span>
                <button type="button" onClick={() => navigate(`/aluno/aulas/${nextSibling._id}`)}>
                  {nextSibling.titulo} <Icon name="arrowRight" size={16} />
                </button>
              </div>
            ) : null}
          </div>

          <aside className="aula-side">
            <h2 className="section-label">Aulas desta disciplina</h2>
            <div className="aula-list">
              {orderedSiblings.map((sib, index) => {
                const isCurrent = sib._id === aulaId;
                return (
                  <article
                    key={sib._id}
                    className={`aula-list-item${isCurrent ? ' is-current' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => !isCurrent && navigate(`/aluno/aulas/${sib._id}`)}
                  >
                    <span className="aula-list-index" aria-hidden="true">
                      {isCurrent && done ? <Icon name="checkCircle" size={16} /> : index + 1}
                    </span>
                    <div>
                      <h4>{sib.titulo}</h4>
                      <small>{formatDuration(sib.duracao)}</small>
                    </div>
                    {isCurrent ? <Badge tone="blue">Atual</Badge> : null}
                  </article>
                );
              })}
              {orderedSiblings.length === 0 ? <p className="panel-empty-text">Sem outras aulas.</p> : null}
            </div>
            {disciplinaId ? (
              <Button variant="outline" full onClick={() => navigate(`/aluno/disciplinas/${disciplinaId}/aulas`)}>
                Ver disciplina
              </Button>
            ) : null}
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
