import { useNavigate } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="text-center" style={{ paddingTop: '4rem' }}>
      <FileQuestion size={80} style={{ color: 'var(--gray-400)', marginBottom: '1.5rem' }} />
      <h1 style={{ fontSize: 'var(--text-5xl)', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
        La página que buscas no existe o fue movida.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        <Home size={18} />
        Volver al Dashboard
      </button>
    </div>
  );
}
