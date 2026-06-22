const DEFAULT_API_URL = 'https://eduvance-backend-jy4g.onrender.com/api';

const apiUrl = normalizeApiUrl(process.env.API_URL || DEFAULT_API_URL);
const baseUrl = apiUrl.replace(/\/api$/, '');
const runSimulation = process.env.SMOKE_SIMULATE_PAYMENT === 'true';

const demoStudent = {
  email: 'aluno@eduvance.com',
  senha: '123456',
};

const tempStudent = {
  nome: 'Aluno Teste Deploy',
  email: 'alunoteste.deploy@eduvance.com',
  senha: '123456',
  tipo: 'aluno',
};

const demoAdmin = {
  email: 'admin@eduvance.com',
  senha: '123456',
};

const results = [];
const externalConfig = new Set();

let studentToken = '';
let adminToken = '';
let firstLessonId = '';

function normalizeApiUrl(value) {
  const clean = value.replace(/\/$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

function absoluteUrl(path, root = false) {
  const prefix = root ? baseUrl : apiUrl;
  return `${prefix}${path.startsWith('/') ? path : `/${path}`}`;
}

function printResult(status, label, detail) {
  const suffix = detail ? ` - ${detail}` : '';
  console.log(`${status} ${label}${suffix}`);
}

function record(kind, label, detail) {
  results.push({ kind, label, detail });
  printResult(kind.toUpperCase(), label, detail);
}

async function request(path, options = {}, config = {}) {
  const headers = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(absoluteUrl(path, config.root), {
    ...options,
    headers,
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

async function test(label, fn) {
  try {
    await fn();
  } catch (error) {
    record('fail', label, error instanceof Error ? error.message : String(error));
  }
}

function expectOk(result, label, acceptedStatuses = []) {
  if (result.ok || acceptedStatuses.includes(result.status)) return;
  throw new Error(`status ${result.status}: ${describeResponse(result.data) || label}`);
}

function describeResponse(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.slice(0, 180);
  if (typeof data.message === 'string') return data.message;
  return JSON.stringify(data).slice(0, 180);
}

async function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function ensureStudentLogin() {
  let loginResult = await login(demoStudent);

  if (loginResult.ok && loginResult.data?.token) {
    studentToken = loginResult.data.token;
    record('pass', 'POST /api/auth/login', `demo ${demoStudent.email}`);
    return;
  }

  if (loginResult.status >= 500) {
    throw new Error(`demo login falhou com ${loginResult.status}: ${describeResponse(loginResult.data)}`);
  }

  record('warn', 'POST /api/auth/login', `demo indisponivel (${loginResult.status}); tentando usuario temporario`);

  const registerResult = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(tempStudent),
  });

  if (!registerResult.ok && registerResult.status !== 400) {
    throw new Error(`cadastro temporario falhou com ${registerResult.status}: ${describeResponse(registerResult.data)}`);
  }

  loginResult = await login({
    email: tempStudent.email,
    senha: tempStudent.senha,
  });

  if (!loginResult.ok || !loginResult.data?.token) {
    throw new Error(`login temporario falhou com ${loginResult.status}: ${describeResponse(loginResult.data)}`);
  }

  studentToken = loginResult.data.token;
  record('pass', 'POST /api/auth/login', `temporario ${tempStudent.email}`);
}

async function run() {
  console.log(`Smoke test EduVance`);
  console.log(`API_URL=${apiUrl}`);
  console.log('');

  await test('GET /', async () => {
    const result = await request('/', {}, { root: true });
    expectOk(result, 'GET /');
    record('pass', 'GET /');
  });

  await test('POST /api/auth/login', ensureStudentLogin);

  if (studentToken) {
    await test('GET /api/auth/me', async () => {
      const result = await request('/auth/me', {}, { token: studentToken });
      expectOk(result, 'GET /api/auth/me');
      record('pass', 'GET /api/auth/me');
    });

    await test('GET /api/disciplinas', async () => {
      const result = await request('/disciplinas', {}, { token: studentToken });
      expectOk(result, 'GET /api/disciplinas');
      record('pass', 'GET /api/disciplinas', `${Array.isArray(result.data) ? result.data.length : 0} registros`);
    });

    await test('GET /api/aulas', async () => {
      const result = await request('/aulas', {}, { token: studentToken });
      expectOk(result, 'GET /api/aulas');
      const aulas = Array.isArray(result.data) ? result.data : [];
      firstLessonId = aulas[0]?._id || '';
      record('pass', 'GET /api/aulas', `${aulas.length} registros`);
    });

    if (firstLessonId) {
      await test('GET /api/aulas/:id', async () => {
        const result = await request(`/aulas/${firstLessonId}`, {}, { token: studentToken });
        expectOk(result, 'GET /api/aulas/:id');
        record('pass', 'GET /api/aulas/:id');
      });

      await test('POST /api/progresso/concluir-aula', async () => {
        const result = await request('/progresso/concluir-aula', {
          method: 'POST',
          body: JSON.stringify({ aulaId: firstLessonId }),
        }, { token: studentToken });
        expectOk(result, 'POST /api/progresso/concluir-aula', [400]);
        record(result.ok ? 'pass' : 'warn', 'POST /api/progresso/concluir-aula', describeResponse(result.data));
      });
    } else {
      record('warn', 'GET /api/aulas/:id', 'nenhuma aula encontrada; testes de aula/progresso ignorados');
    }

    await test('GET /api/progresso/resumo', async () => {
      const result = await request('/progresso/resumo', {}, { token: studentToken });
      expectOk(result, 'GET /api/progresso/resumo');
      record('pass', 'GET /api/progresso/resumo');
    });

    await test('GET /api/planos/me', async () => {
      const result = await request('/planos/me', {}, { token: studentToken });
      expectOk(result, 'GET /api/planos/me');
      record('pass', 'GET /api/planos/me', `plano=${result.data?.plano || 'desconhecido'}`);
    });

    await test('GET /api/eduai/limite', async () => {
      const result = await request('/eduai/limite', {}, { token: studentToken });
      expectOk(result, 'GET /api/eduai/limite');
      record('pass', 'GET /api/eduai/limite');
    });

    await test('POST /api/eduai/perguntar', async () => {
      const result = await request('/eduai/perguntar', {
        method: 'POST',
        body: JSON.stringify({
          pergunta: 'Me explique fracoes de forma simples',
          disciplina: 'Matematica',
        }),
      }, { token: studentToken });

      if (result.ok) {
        record('pass', 'POST /api/eduai/perguntar');
        return;
      }

      const detail = describeResponse(result.data);

      if (/limite de perguntas/i.test(detail)) {
        record('warn', 'POST /api/eduai/perguntar', 'limite diario do usuario de teste ja atingido');
        return;
      }

      throw new Error(`status ${result.status}: ${detail}`);
    });

    await test('POST /api/payments/create-checkout', async () => {
      const result = await request('/payments/create-checkout', {
        method: 'POST',
      }, { token: studentToken });

      if (result.ok && result.data?.checkoutUrl) {
        record('pass', 'POST /api/payments/create-checkout', 'checkoutUrl recebido');
        return;
      }

      const detail = describeResponse(result.data);

      if (/MERCADO_PAGO_ACCESS_TOKEN|Mercado Pago|credencial|token/i.test(detail)) {
        externalConfig.add('Configurar MERCADO_PAGO_ACCESS_TOKEN valido no Render.');
        record('warn', 'POST /api/payments/create-checkout', 'configurar MERCADO_PAGO_ACCESS_TOKEN valido no Render');
        return;
      }

      if (/Premium ja esta ativo|Premium ativo|plano Premium/i.test(detail)) {
        record('warn', 'POST /api/payments/create-checkout', 'usuario ja esta premium; checkout nao criado');
        return;
      }

      throw new Error(`status ${result.status}: ${detail}`);
    });

    await test('GET /api/payments/me', async () => {
      const result = await request('/payments/me', {}, { token: studentToken });
      expectOk(result, 'GET /api/payments/me');
      record('pass', 'GET /api/payments/me', `${Array.isArray(result.data) ? result.data.length : 0} registros`);
    });

    if (runSimulation) {
      await test('POST /api/payments/simulate-approved', async () => {
        const result = await request('/payments/simulate-approved', {
          method: 'POST',
        }, { token: studentToken });
        expectOk(result, 'POST /api/payments/simulate-approved');
        record('pass', 'POST /api/payments/simulate-approved');
      });
    } else {
      record('warn', 'POST /api/payments/simulate-approved', 'ignorado; defina SMOKE_SIMULATE_PAYMENT=true para executar');
    }
  }

  await test('POST /api/auth/login admin', async () => {
    const result = await login(demoAdmin);

    if (!result.ok || !result.data?.token) {
      record('warn', 'POST /api/auth/login admin', `admin indisponivel (${result.status}): ${describeResponse(result.data)}`);
      return;
    }

    adminToken = result.data.token;
    record('pass', 'POST /api/auth/login admin');
  });

  if (adminToken) {
    for (const path of ['/admin/dashboard', '/admin/users', '/admin/ranking']) {
      await test(`GET /api${path}`, async () => {
        const result = await request(path, {}, { token: adminToken });
        expectOk(result, `GET /api${path}`);
        record('pass', `GET /api${path}`);
      });
    }
  }

  printSummary();
}

function printSummary() {
  const total = results.length;
  const passed = results.filter((item) => item.kind === 'pass').length;
  const failed = results.filter((item) => item.kind === 'fail').length;
  const warned = results.filter((item) => item.kind === 'warn').length;

  console.log('');
  console.log('Resumo');
  console.log(`Total: ${total}`);
  console.log(`Passaram: ${passed}`);
  console.log(`Avisos: ${warned}`);
  console.log(`Falharam: ${failed}`);

  if (externalConfig.size > 0) {
    console.log('');
    console.log('Configuracoes externas pendentes:');
    for (const item of externalConfig) {
      console.log(`- ${item}`);
    }
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  record('fail', 'smoke-test', error instanceof Error ? error.message : String(error));
  printSummary();
});
