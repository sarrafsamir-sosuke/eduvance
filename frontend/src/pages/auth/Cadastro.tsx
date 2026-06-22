import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AuthLayout } from '../../components/layouts/AuthLayout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../lib/api';

export function CadastroPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!form.nome.trim() || !form.email.trim() || !form.senha) {
      setError('Preencha nome, e-mail e senha para criar sua conta.');
      return;
    }
    if (form.senha.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (form.senha !== form.confirmarSenha) {
      setError('As senhas precisam ser iguais.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nome: form.nome.trim(),
        email: form.email,
        senha: form.senha,
        tipo: 'aluno',
      });
      navigate('/login', {
        replace: true,
        state: { message: 'Conta criada com sucesso. Faça login para continuar.' },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível criar a conta.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Transforme o aprendizado em uma jornada épica."
      subtitle="Ganhe XP, conclua aulas e acompanhe sua evolução."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-form-heading">
          <h1>Criar conta</h1>
          <p>Junte-se ao EduVance como aluno.</p>
        </div>

        <Input
          icon="user"
          label="Nome"
          onChange={(event) => setForm({ ...form, nome: event.target.value })}
          placeholder="Digite seu nome"
          required
          value={form.nome}
        />
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
          minLength={6}
          onChange={(event) => setForm({ ...form, senha: event.target.value })}
          placeholder="Mínimo 6 caracteres"
          required
          type="password"
          value={form.senha}
        />
        <Input
          icon="lock"
          label="Confirmar senha"
          minLength={6}
          onChange={(event) => setForm({ ...form, confirmarSenha: event.target.value })}
          placeholder="Repita sua senha"
          required
          type="password"
          value={form.confirmarSenha}
        />

        {error ? <p className="form-feedback error">{error}</p> : null}

        <Button full type="submit" loading={loading}>
          {loading ? 'Criando...' : 'Criar conta'}
        </Button>
        <p className="auth-link-row">
          Já tenho conta. <Link to="/login">Entrar</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
