import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button, Input } from '../../components/ui';
import { api, getApiErrorMessage } from '../../lib/api';

export function RedefinirSenhaPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState({ senha: '', confirmar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (form.senha.length < 6) {
      setError('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (form.senha !== form.confirmar) {
      setError('As senhas precisam ser iguais.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, senha: form.senha });
      navigate('/login', {
        replace: true,
        state: { message: 'Senha redefinida com sucesso. Faça login com a nova senha.' },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível redefinir a senha. O link pode ter expirado.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="recover-page">
      <Link to="/" className="recover-brand">
        <BrandLogo size="md" />
      </Link>

      <form className="recover-card" onSubmit={handleSubmit}>
        <span className="recover-lock" aria-hidden="true">
          <Icon name="shield" size={24} />
        </span>
        <h1>Redefinir senha</h1>
        <p>Escolha uma nova senha para acessar sua conta EduVance.</p>

        <Input
          icon="lock"
          label="Nova senha"
          minLength={6}
          onChange={(event) => setForm({ ...form, senha: event.target.value })}
          placeholder="Mínimo 6 caracteres"
          required
          type="password"
          value={form.senha}
        />
        <Input
          icon="lock"
          label="Confirmar nova senha"
          minLength={6}
          onChange={(event) => setForm({ ...form, confirmar: event.target.value })}
          placeholder="Repita a nova senha"
          required
          type="password"
          value={form.confirmar}
        />

        {error ? <p className="form-feedback error">{error}</p> : null}

        <Button full type="submit" loading={loading}>
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </Button>
        <Link className="text-link" to="/login">
          Voltar para o login
        </Link>
      </form>
    </main>
  );
}
