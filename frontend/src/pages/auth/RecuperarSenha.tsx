import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { BrandLogo } from '../../components/brand/BrandLogo';
import { Icon } from '../../components/Icon';
import { Button, Input } from '../../components/ui';
import { api, getApiErrorMessage } from '../../lib/api';

export function RecuperarSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post<{ message: string; token?: string; resetUrl?: string }>(
        '/auth/forgot-password',
        { email: email.trim().toLowerCase() },
      );
      setSent(true);
      // Em desenvolvimento o backend devolve o token para facilitar o teste.
      if (data.token) setDevToken(data.token);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível enviar o link de recuperação.'));
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
          <Icon name="lock" size={24} />
        </span>
        <h1>Recuperar senha</h1>
        <p>Informe o e-mail associado à sua conta para receber as instruções de acesso.</p>

        <Input
          icon="mail"
          label="E-mail"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nome@escola.com.br"
          required
          type="email"
          value={email}
        />

        {sent ? (
          <div className="form-feedback success">
            Se este e-mail existir no EduVance, enviaremos um link de recuperação.
            {devToken ? (
              <span className="recover-dev">
                Ambiente de teste: <Link to={`/redefinir-senha/${devToken}`}>redefinir senha agora</Link>
              </span>
            ) : null}
          </div>
        ) : null}
        {error ? <p className="form-feedback error">{error}</p> : null}

        <Button full type="submit" loading={loading}>
          {loading ? 'Enviando...' : 'Enviar link'}
        </Button>
        <Link className="text-link" to="/login">
          Voltar para o login
        </Link>
      </form>
    </main>
  );
}
