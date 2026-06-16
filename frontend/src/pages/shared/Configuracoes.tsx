import { useState } from 'react';

import { Icon } from '../../components/Icon';
import { AppLayout } from '../../components/layouts/AppLayout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

function Toggle({ checked, onChange, label, desc }: { checked: boolean; onChange: () => void; label: string; desc: string }) {
  return (
    <div className="settings-toggle">
      <div>
        <strong>{label}</strong>
        <p>{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`switch${checked ? ' on' : ''}`}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}

export function ConfiguracoesPage() {
  const { user } = useAuth();
  const [notif, setNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [sound, setSound] = useState(true);
  const [idioma, setIdioma] = useState('pt-BR');
  const [saved, setSaved] = useState(false);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <AppLayout>
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Configurações</h1>
            <span className="page-subtitle">Gerencie sua conta, preferências e notificações.</span>
          </div>
        </div>

        <div className="settings-grid">
          <section className="panel">
            <h2 className="panel-title-sm">
              <Icon name="user" size={16} /> Conta
            </h2>
            <div className="settings-fields">
              <Input label="Nome" defaultValue={user?.nome} />
              <Input label="E-mail" defaultValue={user?.email} type="email" />
              <Input label="Tipo de conta" defaultValue={user?.tipo} disabled />
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title-sm">
              <Icon name="lock" size={16} /> Segurança
            </h2>
            <div className="settings-fields">
              <Input label="Senha atual" type="password" placeholder="••••••" />
              <Input label="Nova senha" type="password" placeholder="Mínimo 6 caracteres" />
              <Input label="Confirmar nova senha" type="password" placeholder="Repita a nova senha" />
              <Button variant="outline">Alterar senha</Button>
            </div>
          </section>

          <section className="panel">
            <h2 className="panel-title-sm">
              <Icon name="bell" size={16} /> Notificações
            </h2>
            <Toggle checked={notif} onChange={() => setNotif((v) => !v)} label="Notificações no app" desc="Avisos de aulas, conquistas e streak." />
            <Toggle checked={emailNotif} onChange={() => setEmailNotif((v) => !v)} label="E-mail semanal" desc="Resumo do seu progresso por e-mail." />
            <Toggle checked={sound} onChange={() => setSound((v) => !v)} label="Sons" desc="Efeitos sonoros ao ganhar XP." />
          </section>

          <section className="panel">
            <h2 className="panel-title-sm">
              <Icon name="sparkles" size={16} /> Aparência e idioma
            </h2>
            <div className="settings-fields">
              <p className="settings-hint">Use o botão de tema na barra superior para alternar entre claro e escuro.</p>
              <label className="input-group">
                <span className="input-label">Idioma e região</span>
                <span className="input-shell">
                  <select className="input-field input-select" value={idioma} onChange={(e) => setIdioma(e.target.value)}>
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                  </select>
                </span>
              </label>
            </div>
          </section>
        </div>

        <div className="settings-actions">
          {saved ? <span className="form-feedback success inline">Preferências salvas!</span> : null}
          <Button onClick={save}>Salvar alterações</Button>
        </div>
      </div>
    </AppLayout>
  );
}
