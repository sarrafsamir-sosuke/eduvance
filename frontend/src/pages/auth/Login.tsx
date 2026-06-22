import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button, Input } from '../../components/ui';
import { homePathForUser, useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../lib/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const flashMessage = (location.state as { message?: string } | null)?.message;
  const [notice, setNotice] = useState(flashMessage ?? '');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const user = await login(form.email, form.senha);
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from && !from.startsWith('/login') ? from : homePathForUser(user), { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível entrar. Confira seus dados.'));
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
          icon="mail"
          label="E-mail"
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          placeholder="seu@email.com"
          required
          type="email"
          value={form.email}
        />
        <Input
          icon="lock"
          label="Senha"
          onChange={(event) => setForm({ ...form, senha: event.target.value })}
          placeholder="Digite sua senha"
          required
          type="password"
          value={form.senha}
        />

        {notice ? <p className="form-feedback success">{notice}</p> : null}
        {error ? <p className="form-feedback error">{error}</p> : null}

        <Button full type="submit" loading={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>

        <p className="auth-link-row">
          Esqueceu a senha? <Link to="/recuperar-senha">Recuperar</Link>
        </p>
        <p className="auth-link-row">
          Ainda não tem conta? <Link to="/cadastro">Criar conta</Link>
        </p>

        <div className="auth-demo">
          <strong>Contas de teste</strong>
          <span>aluno@eduvance.com · premium@eduvance.com</span>
          <span>professor@eduvance.com · admin@eduvance.com</span>
          <span>Senha: 123456</span>
        </div>
      </form>
    </AuthLayout>
  );
}
