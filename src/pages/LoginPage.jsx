import { useState } from 'react';
import { LockKeyhole, LogIn, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function authMessage(error) {
  if (!error) return '';
  if (error.message?.toLowerCase().includes('invalid login credentials')) {
    return 'El correo o la contraseña no son correctos.';
  }
  if (error.message?.toLowerCase().includes('email not confirmed')) {
    return 'El correo aún no ha sido confirmado.';
  }
  return 'No se pudo iniciar sesión. Intenta nuevamente.';
}

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error: signInError } = await signIn({ email, password });
      if (signInError) {
        setError(authMessage(signInError));
        return;
      }

      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
    } catch {
      setError('No se pudo iniciar sesión. Intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="login-title">
        <div className="auth-brand-mark">JO</div>
        <p className="auth-eyebrow">Gestión de colecciones</p>
        <h1 id="login-title">Ingresar a AtelierData</h1>
        <p className="auth-description">Usa las credenciales asignadas por el administrador.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="login-email">Correo electrónico</label>
            <div className="auth-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                id="login-email"
                className="form-input auth-input"
                type="email"
                autoComplete="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="login-password">Contraseña</label>
            <div className="auth-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                id="login-password"
                className="form-input auth-input"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="btn btn-primary btn-lg auth-submit" type="submit" disabled={submitting}>
            <LogIn size={17} aria-hidden="true" />
            {submitting ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </section>
    </main>
  );
}
