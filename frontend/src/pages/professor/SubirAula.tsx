import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Button, Input, Select, Textarea } from '../../components/ui';
import { api, getApiErrorMessage } from '../../lib/api';
import { useApi } from '../../lib/hooks';
import type { Disciplina, PlanType } from '../../lib/types';

type VideoMode = 'url' | 'file';

export function SubirAulaPage() {
  const navigate = useNavigate();
  const disciplinas = useApi<Disciplina[]>('/disciplinas');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    disciplina: '',
    modulo: '',
    ordem: '1',
    duracao: '15',
    xpReward: '50',
    planoMinimo: 'gratis' as PlanType,
    urlVideo: '',
  });
  const [videoMode, setVideoMode] = useState<VideoMode>('file');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setVideoFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && /\.(mp4|mov|avi|mkv|webm)$/i.test(file.name)) {
      setVideoFile(file);
      setVideoMode('file');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.titulo.trim() || !form.disciplina) {
      setError('Informe ao menos o título e a disciplina da aula.');
      return;
    }

    if (videoMode === 'url' && !form.urlVideo.trim()) {
      setError('Informe a URL do vídeo ou selecione um arquivo local.');
      return;
    }

    if (videoMode === 'file' && !videoFile) {
      setError('Selecione um arquivo de vídeo para enviar.');
      return;
    }

    setLoading(true);
    try {
      if (videoMode === 'file' && videoFile) {
        const fd = new FormData();
        fd.append('titulo', form.titulo.trim());
        if (form.descricao.trim()) fd.append('descricao', form.descricao.trim());
        fd.append('disciplina', form.disciplina);
        if (form.modulo.trim()) fd.append('modulo', form.modulo.trim());
        fd.append('ordem', String(Number(form.ordem) || 1));
        if (form.duracao) fd.append('duracao', String(Number(form.duracao) || 15));
        fd.append('xpReward', String(Number(form.xpReward) || 50));
        fd.append('planoMinimo', form.planoMinimo);
        fd.append('video', videoFile);

        await api.post('/aulas', fd);
      } else {
        await api.post('/aulas', {
          titulo: form.titulo.trim(),
          descricao: form.descricao.trim() || undefined,
          urlVideo: form.urlVideo.trim(),
          disciplina: form.disciplina,
          modulo: form.modulo.trim() || undefined,
          ordem: Number(form.ordem) || 1,
          duracao: Number(form.duracao) || undefined,
          xpReward: Number(form.xpReward) || 50,
          planoMinimo: form.planoMinimo,
        });
      }
      setSuccess('Aula publicada com sucesso!');
      setForm((prev) => ({ ...prev, titulo: '', descricao: '', modulo: '', urlVideo: '' }));
      setVideoFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível publicar a aula.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Upload de aula</h1>
            <span className="page-subtitle">Publique uma nova aula para seus alunos.</span>
          </div>
        </div>

        <form className="upload-grid" onSubmit={handleSubmit}>
          <div className="upload-main">
            <div className="video-mode-toggle" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <Button
                type="button"
                variant={videoMode === 'file' ? 'primary' : 'outline'}
                onClick={() => setVideoMode('file')}
              >
                <Icon name="upload" size={16} /> Enviar arquivo
              </Button>
              <Button
                type="button"
                variant={videoMode === 'url' ? 'primary' : 'outline'}
                onClick={() => setVideoMode('url')}
              >
                <Icon name="play" size={16} /> URL externa
              </Button>
            </div>

            {videoMode === 'file' ? (
              <div
                className="dropzone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{ cursor: 'pointer' }}
              >
                <span className="dropzone-icon">
                  <Icon name="upload" size={28} />
                </span>
                {videoFile ? (
                  <>
                    <strong>{videoFile.name}</strong>
                    <span className="dropzone-hint">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB · Clique para trocar
                    </span>
                  </>
                ) : (
                  <>
                    <strong>Arraste e solte seu vídeo aqui</strong>
                    <span className="dropzone-hint">ou clique para selecionar · MP4, MOV, AVI, MKV, WebM</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/mov,video/avi,video/x-matroska,video/webm,.mp4,.mov,.avi,.mkv,.webm"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <Input
                label="URL do vídeo"
                icon="play"
                placeholder="https://..."
                value={form.urlVideo}
                onChange={(e) => update('urlVideo', e.target.value)}
              />
            )}

            <Input
              label="Título da aula"
              placeholder="Ex: Introdução à Física Quântica"
              value={form.titulo}
              onChange={(e) => update('titulo', e.target.value)}
              required
            />
            <Textarea
              label="Descrição"
              placeholder="Descreva os principais tópicos abordados nesta aula..."
              rows={4}
              value={form.descricao}
              onChange={(e) => update('descricao', e.target.value)}
            />

            <div className="upload-row">
              <Select label="Disciplina" value={form.disciplina} onChange={(e) => update('disciplina', e.target.value)} required>
                <option value="">Selecione uma disciplina</option>
                {(disciplinas.data ?? []).map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.nome}
                  </option>
                ))}
              </Select>
              <Input label="Módulo" placeholder="Ex: Módulo 1" value={form.modulo} onChange={(e) => update('modulo', e.target.value)} />
            </div>

            <div className="upload-row three">
              <Input label="Ordem" type="number" min={1} value={form.ordem} onChange={(e) => update('ordem', e.target.value)} />
              <Input label="Duração (min)" type="number" min={1} value={form.duracao} onChange={(e) => update('duracao', e.target.value)} />
              <Input label="XP da aula" type="number" min={0} value={form.xpReward} onChange={(e) => update('xpReward', e.target.value)} />
            </div>
          </div>

          <aside className="upload-side">
            <h2 className="panel-title-sm">Publicação</h2>
            <Select label="Plano mínimo" value={form.planoMinimo} onChange={(e) => update('planoMinimo', e.target.value)}>
              <option value="gratis">Grátis (todos)</option>
              <option value="premium">Premium</option>
            </Select>

            <div className="upload-cover" aria-hidden="true">
              <Icon name="grid" size={22} />
              <span>Capa da aula (simulado)</span>
            </div>

            {error ? <p className="form-feedback error">{error}</p> : null}
            {success ? <p className="form-feedback success">{success}</p> : null}

            <Button full type="submit" loading={loading}>
              <Icon name="upload" size={16} /> Publicar aula
            </Button>
            <Button variant="outline" full onClick={() => navigate('/professor/aulas')}>
              Ver minhas aulas
            </Button>
          </aside>
        </form>
      </div>
    </AppLayout>
  );
}
