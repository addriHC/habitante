import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';

const AUTH_KEY = 'habitante_backoffice_auth';

function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(email) {
  localStorage.setItem(
    AUTH_KEY,
    JSON.stringify({
      email,
      loggedAt: new Date().toISOString()
    })
  );
}

function clearSession() {
  localStorage.removeItem(AUTH_KEY);
}

function LoginPage() {
  const navigate = useNavigate();

  const existing = getSession();
  if (existing) {
    return <Navigate to="/panel" replace />;
  }

  function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '').trim();

    if (!email || !password) {
      return;
    }

    saveSession(email);
    navigate('/panel', { replace: true });
  }

  return (
    <main className="bo-shell">
      <section className="bo-card">
        <img
          src="https://i.postimg.cc/MKncLryk/habitantelogo2.png"
          alt="Habitante"
          className="bo-logo"
        />
        <p className="bo-kicker">Plataforma Habitante</p>
        <h1>Acceso Backoffice</h1>
        <p className="bo-subtext">Inicia sesión para gestionar inversores, operaciones y documentación.</p>

        <form onSubmit={handleSubmit} className="bo-form">
          <label>
            <span>Email</span>
            <input name="email" type="email" placeholder="tu@email.com" required />
          </label>

          <label>
            <span>Contraseña</span>
            <input name="password" type="password" placeholder="••••••••" required />
          </label>

          <button type="submit">Entrar en plataforma</button>
        </form>
      </section>
    </main>
  );
}

function PanelPage() {
  const navigate = useNavigate();
  const session = getSession();

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    clearSession();
    navigate('/login', { replace: true });
  }

  return (
    <main className="bo-shell">
      <section className="bo-card">
        <p className="bo-kicker">Backoffice</p>
        <h1>Bienvenido</h1>
        <p className="bo-subtext">Sesión iniciada como {session.email}</p>

        <div className="bo-grid">
          <article className="bo-panel-tile">
            <span className="material-symbols-outlined">real_estate_agent</span>
            <h2>Promociones</h2>
            <p>Gestiona activos, estados y métricas de cada proyecto.</p>
          </article>
          <article className="bo-panel-tile">
            <span className="material-symbols-outlined">group</span>
            <h2>Inversores</h2>
            <p>Administra perfiles, KYC y seguimiento de compromisos.</p>
          </article>
          <article className="bo-panel-tile">
            <span className="material-symbols-outlined">folder_managed</span>
            <h2>Documentos</h2>
            <p>Centraliza contratos, anexos y evidencia operativa.</p>
          </article>
        </div>

        <div className="bo-actions">
          <button onClick={handleLogout} className="bo-ghost-btn">Cerrar sesión</button>
          <a href="/" className="bo-link-btn">Volver a la web</a>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const session = getSession();

  return (
    <Routes>
      <Route path="/" element={<Navigate to={session ? '/panel' : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/panel" element={<PanelPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
