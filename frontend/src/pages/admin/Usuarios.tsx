import { useMemo, useState } from 'react';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Badge, EmptyState, Spinner, StatCard } from '../../components/ui';
import { normalize } from '../../lib/helpers';
import { useApi } from '../../lib/hooks';
import type { EduVanceUser } from '../../lib/types';

const FILTERS: Array<{ key: string; label: string; tipo?: string }> = [
  { key: 'todos', label: 'Todos' },
  { key: 'aluno', label: 'Alunos', tipo: 'aluno' },
  { key: 'professor', label: 'Professores', tipo: 'professor' },
  { key: 'admin', label: 'Administradores', tipo: 'admin' },
];

function initials(name?: string) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts[parts.length - 1]?.[0] ?? '')).toUpperCase();
}

export function AdminUsuariosPage() {
  const [filter, setFilter] = useState('todos');
  const [query, setQuery] = useState('');
  const tipo = FILTERS.find((f) => f.key === filter)?.tipo;
  const users = useApi<EduVanceUser[]>(tipo ? `/admin/users?tipo=${tipo}` : '/admin/users', [tipo]);
  const all = useApi<EduVanceUser[]>('/admin/users');

  const filtered = useMemo(() => {
    return (users.data ?? []).filter((u) => normalize(`${u.nome} ${u.email}`).includes(normalize(query)));
  }, [users.data, query]);

  const counts = useMemo(() => {
    const list = all.data ?? [];
    return {
      total: list.length,
      alunos: list.filter((u) => u.tipo === 'aluno').length,
      professores: list.filter((u) => u.tipo === 'professor').length,
      premium: list.filter((u) => u.plano === 'premium').length,
    };
  }, [all.data]);

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Usuários</h1>
            <span className="page-subtitle">Gerencie alunos, professores e administradores.</span>
          </div>
          <label className="page-search">
            <Icon name="search" size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar usuários..." />
          </label>
        </div>

        <div className="admin-stats four">
          <StatCard icon="users" label="Total" value={String(counts.total)} tone="blue" />
          <StatCard icon="user" label="Alunos" value={String(counts.alunos)} tone="green" />
          <StatCard icon="shield" label="Professores" value={String(counts.professores)} tone="purple" />
          <StatCard icon="star" label="Premium" value={String(counts.premium)} tone="yellow" />
        </div>

        <div className="filter-row">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" className={filter === f.key ? 'active' : ''} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {users.loading ? (
          <Spinner label="Carregando usuários..." />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum usuário encontrado" description="Ajuste o filtro ou a busca." />
        ) : (
          <div className="users-table">
            <div className="users-table-head">
              <span>Usuário</span>
              <span>E-mail</span>
              <span>Tipo</span>
              <span>Plano</span>
              <span>XP</span>
            </div>
            {filtered.map((u) => (
              <div className="users-table-row" key={u._id}>
                <div className="admin-user-cell">
                  <span className="admin-avatar" aria-hidden="true">
                    {initials(u.nome)}
                  </span>
                  <div>
                    <strong>{u.nome}</strong>
                    <small className="show-mobile">{u.email}</small>
                  </div>
                </div>
                <span className="users-email">{u.email}</span>
                <span className="admin-role">{u.tipo}</span>
                <span>{u.plano === 'premium' ? <Badge tone="yellow">Premium</Badge> : <Badge tone="slate">Grátis</Badge>}</span>
                <span className="users-xp">{(u.xp ?? 0).toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
