import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Button } from '../../components/ui';
import { api, getApiErrorMessage } from '../../lib/api';
import type { ConversaAI, EduAiLimite, MensagemAI } from '../../lib/types';

const DISCIPLINAS_CONTEXTO = [
  'Geral',
  'Matemática',
  'Física',
  'Química',
  'Biologia',
  'História',
  'Geografia',
  'Língua Portuguesa',
  'Tecnologia e Inovação',
];

interface ChatMessage {
  role: 'user' | 'assistant';
  conteudo: string;
}

export function EduAIPage() {
  const [params, setParams] = useSearchParams();
  const [conversas, setConversas] = useState<ConversaAI[]>([]);
  const [conversaId, setConversaId] = useState<string | null>(params.get('conversa'));
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pergunta, setPergunta] = useState('');
  const [contexto, setContexto] = useState('Geral');
  const [limite, setLimite] = useState<EduAiLimite | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  function loadConversas() {
    api.get<ConversaAI[]>('/eduai/conversas').then((r) => setConversas(r.data)).catch(() => undefined);
  }
  function loadLimite() {
    api.get<EduAiLimite>('/eduai/limite').then((r) => setLimite(r.data)).catch(() => undefined);
  }

  useEffect(() => {
    loadConversas();
    loadLimite();
  }, []);

  // Carrega mensagens ao selecionar uma conversa.
  useEffect(() => {
    if (!conversaId) {
      setMessages([]);
      return;
    }
    api
      .get<{ conversa: ConversaAI; mensagens: MensagemAI[] }>(`/eduai/conversas/${conversaId}`)
      .then((r) => {
        setMessages(r.data.mensagens.map((m) => ({ role: m.role, conteudo: m.conteudo })));
        if (r.data.conversa?.disciplinaContexto) setContexto(r.data.conversa.disciplinaContexto);
      })
      .catch(() => undefined);
  }, [conversaId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  function startNew() {
    setConversaId(null);
    setMessages([]);
    setError('');
    params.delete('conversa');
    setParams(params, { replace: true });
  }

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = pergunta.trim();
    if (!text || sending) return;

    setMessages((prev) => [...prev, { role: 'user', conteudo: text }]);
    setPergunta('');
    setSending(true);
    setError('');

    try {
      const { data } = await api.post<{ resposta: string; conversaId: string; perguntasRestantes: number; aiLimitePerguntas: number; aiPerguntasUsadas: number }>(
        '/eduai/perguntar',
        {
          pergunta: text,
          disciplinaContexto: contexto === 'Geral' ? undefined : contexto,
          conversaId: conversaId ?? undefined,
        },
      );
      setMessages((prev) => [...prev, { role: 'assistant', conteudo: data.resposta }]);
      if (!conversaId) setConversaId(data.conversaId);
      setLimite((prev) =>
        prev
          ? { ...prev, perguntasRestantes: data.perguntasRestantes, aiPerguntasUsadas: data.aiPerguntasUsadas }
          : prev,
      );
      loadConversas();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível falar com a EduAI agora.'));
      setMessages((prev) => prev.slice(0, -1)); // desfaz a pergunta otimista
      setPergunta(text);
    } finally {
      setSending(false);
    }
  }

  const grouped = groupByDay(conversas);

  return (
    <AppLayout>
      <div className="eduai-shell">
        <aside className="eduai-conversations">
          <Button full onClick={startNew}>
            <Icon name="sparkles" size={16} /> Nova conversa
          </Button>
          <div className="eduai-conv-list">
            {conversas.length === 0 ? (
              <p className="panel-empty-text">Suas conversas aparecerão aqui.</p>
            ) : (
              grouped.map((group) => (
                <div key={group.label}>
                  <span className="eduai-conv-day">{group.label}</span>
                  {group.items.map((conversa) => (
                    <button
                      key={conversa._id}
                      type="button"
                      className={`eduai-conv-item${conversaId === conversa._id ? ' active' : ''}`}
                      onClick={() => setConversaId(conversa._id)}
                    >
                      <Icon name="robot" size={15} />
                      <span>{conversa.titulo}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="eduai-chat">
          <header className="eduai-chat-head">
            <span className="eduai-avatar" aria-hidden="true">
              <Icon name="robot" size={18} />
            </span>
            <div>
              <strong>EduAI</strong>
              <span>Sempre online para ajudar</span>
            </div>
            {limite ? (
              <span className="eduai-limit">
                {limite.perguntasRestantes} de {limite.aiLimitePerguntas} perguntas hoje
              </span>
            ) : null}
          </header>

          <div className="eduai-messages" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="eduai-welcome">
                <span className="eduai-avatar lg" aria-hidden="true">
                  <Icon name="robot" size={26} />
                </span>
                <h2>Olá! Como posso ajudar nos seus estudos?</h2>
                <p>Escolha uma matéria e faça sua pergunta. Eu explico passo a passo.</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`eduai-msg ${msg.role}`}>
                  {msg.role === 'assistant' ? (
                    <span className="eduai-avatar sm" aria-hidden="true">
                      <Icon name="robot" size={14} />
                    </span>
                  ) : null}
                  <div className="eduai-bubble">{msg.conteudo}</div>
                </div>
              ))
            )}
            {sending ? (
              <div className="eduai-msg assistant">
                <span className="eduai-avatar sm" aria-hidden="true">
                  <Icon name="robot" size={14} />
                </span>
                <div className="eduai-bubble eduai-typing">
                  <span /> <span /> <span />
                </div>
              </div>
            ) : null}
          </div>

          {error ? <p className="form-feedback error eduai-error">{error}</p> : null}

          <form className="eduai-input" onSubmit={handleSend}>
            <select value={contexto} onChange={(e) => setContexto(e.target.value)} aria-label="Disciplina de contexto">
              {DISCIPLINAS_CONTEXTO.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Faça uma pergunta sobre a matéria..."
            />
            <button type="submit" aria-label="Enviar" disabled={sending || !pergunta.trim()}>
              <Icon name="send" size={18} />
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}

function groupByDay(conversas: ConversaAI[]): Array<{ label: string; items: ConversaAI[] }> {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const groups: Record<string, ConversaAI[]> = {};
  for (const conversa of conversas) {
    const date = conversa.updatedAt ? new Date(conversa.updatedAt).toDateString() : '';
    const label = date === today ? 'Hoje' : date === yesterday ? 'Ontem' : 'Anteriores';
    (groups[label] ??= []).push(conversa);
  }
  const order = ['Hoje', 'Ontem', 'Anteriores'];
  return order.filter((l) => groups[l]?.length).map((label) => ({ label, items: groups[label] }));
}
