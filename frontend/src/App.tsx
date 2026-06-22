import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute, RoleRoute } from './components/routing/ProtectedRoute';

// Auth
import { CadastroPage } from './pages/auth/Cadastro';
import { LoginPage } from './pages/auth/Login';
import { RecuperarSenhaPage } from './pages/auth/RecuperarSenha';
import { RedefinirSenhaPage } from './pages/auth/RedefinirSenha';

// Público
import { AreaPublicPage } from './pages/public/AreaPublic';
import { CheckoutPage } from './pages/public/Checkout';
import { ComoFuncionaPage } from './pages/public/ComoFunciona';
import { DisciplinasPublicPage } from './pages/public/DisciplinasPublic';
import { LandingPage } from './pages/public/Landing';
import { PagamentoEfetuadoPage } from './pages/public/PagamentoEfetuado';
import { PagamentoFalhouPage } from './pages/public/PagamentoFalhou';
import { PagamentoPendentePage } from './pages/public/PagamentoPendente';
import { PlanosPage } from './pages/public/Planos';
import { ProfessoresPage } from './pages/public/Professores';
import { SobrePage } from './pages/public/Sobre';

// Aluno
import { AlunoAreaPage } from './pages/aluno/Area';
import { AulaPage } from './pages/aluno/Aula';
import { AlunoCatalogoPage } from './pages/aluno/Catalogo';
import { AlunoConquistasPage } from './pages/aluno/Conquistas';
import { DisciplinaDetalhePage } from './pages/aluno/DisciplinaDetalhe';
import { AlunoDisciplinasPage } from './pages/aluno/Disciplinas';
import { EduAIPage } from './pages/aluno/EduAI';
import { AlunoInicioPage } from './pages/aluno/Inicio';
import { AlunoPerfilPage } from './pages/aluno/Perfil';
import { AlunoPlanosPage } from './pages/aluno/Planos';
import { QuizPage } from './pages/aluno/Quiz';
import { QuizzesPage } from './pages/aluno/Quizzes';

// Professor
import { ProfessorAulasPage } from './pages/professor/Aulas';
import { ProfessorInicioPage } from './pages/professor/Inicio';
import { ProfessorQuizzesPage } from './pages/professor/Quizzes';
import { SubirAulaPage } from './pages/professor/SubirAula';

// Admin
import { AdminInicioPage } from './pages/admin/Inicio';
import { AdminRankingPage } from './pages/admin/Ranking';
import { AdminUsuariosPage } from './pages/admin/Usuarios';

// Compartilhado
import { NotFoundPage } from './pages/NotFound';
import { ConfiguracoesPage } from './pages/shared/Configuracoes';

export default function App() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* Login de professor nao tem mais tela publica dedicada. Redireciona ao login normal. */}
      <Route path="/login-professor" element={<Navigate to="/login" replace />} />
      <Route path="/cadastro" element={<CadastroPage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      <Route path="/redefinir-senha/:token" element={<RedefinirSenhaPage />} />
      <Route path="/disciplinas" element={<DisciplinasPublicPage />} />
      <Route path="/disciplinas/:areaSlug" element={<AreaPublicPage />} />
      <Route path="/professores" element={<ProfessoresPage />} />
      <Route path="/planos" element={<PlanosPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/pagamento-efetuado" element={<PagamentoEfetuadoPage />} />
      <Route path="/pagamento-pendente" element={<PagamentoPendentePage />} />
      <Route path="/pagamento-falhou" element={<PagamentoFalhouPage />} />
      <Route path="/como-funciona" element={<ComoFuncionaPage />} />
      <Route path="/sobre" element={<SobrePage />} />

      {/* Protegido */}
      <Route element={<ProtectedRoute />}>
        {/* Aluno */}
        <Route element={<RoleRoute allow={['aluno']} />}>
          <Route path="/aluno/inicio" element={<AlunoInicioPage />} />
          <Route path="/aluno/disciplinas" element={<AlunoDisciplinasPage />} />
          <Route path="/aluno/catalogo" element={<AlunoCatalogoPage />} />
          <Route path="/aluno/areas/:areaSlug" element={<AlunoAreaPage />} />
          <Route path="/aluno/disciplinas/:disciplinaId/aulas" element={<DisciplinaDetalhePage />} />
          <Route path="/aluno/aulas/:aulaId" element={<AulaPage />} />
          <Route path="/aluno/quizzes" element={<QuizzesPage />} />
          <Route path="/aluno/quizzes/:quizId" element={<QuizPage />} />
          <Route path="/aluno/eduai" element={<EduAIPage />} />
          <Route path="/aluno/planos" element={<AlunoPlanosPage />} />
          <Route path="/aluno/perfil" element={<AlunoPerfilPage />} />
          <Route path="/aluno/conquistas" element={<AlunoConquistasPage />} />
          <Route path="/aluno/configuracoes" element={<ConfiguracoesPage />} />
        </Route>

        {/* Professor */}
        <Route element={<RoleRoute allow={['professor', 'admin']} />}>
          <Route path="/professor/inicio" element={<ProfessorInicioPage />} />
          <Route path="/professor/aulas" element={<ProfessorAulasPage />} />
          <Route path="/professor/subir-aula" element={<SubirAulaPage />} />
          <Route path="/professor/quizzes" element={<ProfessorQuizzesPage />} />
          <Route path="/professor/configuracoes" element={<ConfiguracoesPage />} />
        </Route>

        {/* Admin */}
        <Route element={<RoleRoute allow={['admin']} />}>
          <Route path="/admin/inicio" element={<AdminInicioPage />} />
          <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
          <Route path="/admin/ranking" element={<AdminRankingPage />} />
          <Route path="/admin/configuracoes" element={<ConfiguracoesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
