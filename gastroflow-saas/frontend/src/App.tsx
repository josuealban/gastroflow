import { useEffect, useState } from 'react';
import apiClient from './api/client';
import './App.css';

interface DependencyStatus {
  coreService: string;
  auditService: string;
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'unavailable';
  service: string;
  dependencies: DependencyStatus;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);
    apiClient.get<HealthResponse>('/health')
      .then((response) => {
        setHealth(response.data);
      })
      .catch((err: Error) => {
        setErrorMsg(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getStatusText = (status: 'ok' | 'degraded' | 'unavailable') => {
    if (status === 'ok') return 'Sistema operativo';
    if (status === 'degraded') return 'Operación parcial';
    return 'API principal no disponible';
  };

  const getStatusColor = (status: 'ok' | 'degraded' | 'unavailable') => {
    if (status === 'ok') return '#10b981'; // Green
    if (status === 'degraded') return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>GastroFlow SaaS</h1>
        <p>Página Temporal de Monitoreo de Salud</p>
        
        <div style={{ marginTop: '20px', padding: '25px', border: '1px solid #333', borderRadius: '12px', backgroundColor: '#1e1e1e', color: '#fff', width: '350px', textAlign: 'left', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', borderBottom: '1px solid #444', paddingBottom: '8px' }}>Estado de los Servicios:</h2>
          
          {loading ? (
            <p style={{ color: '#9ca3af' }}>Conectando...</p>
          ) : errorMsg ? (
            <div>
              <p style={{ color: '#ef4444', fontWeight: 'bold' }}>Error de Conexión</p>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>{errorMsg}</p>
            </div>
          ) : health ? (
            <div>
              <p>
                Estado General: <strong style={{ color: getStatusColor(health.status) }}>{getStatusText(health.status)}</strong>
              </p>
              <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Servicio: {health.service}</p>
              
              <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #333' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '5px' }}>Dependencias:</p>
                <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: 0, fontSize: '0.85rem' }}>
                  <li style={{ margin: '4px 0' }}>
                    Core Service: <strong style={{ color: health.dependencies.coreService === 'ok' || health.dependencies.coreService === 'up' ? '#10b981' : '#ef4444' }}>
                      {health.dependencies.coreService === 'ok' || health.dependencies.coreService === 'up' ? 'Activo' : 'Inactivo'}
                    </strong>
                  </li>
                  <li style={{ margin: '4px 0' }}>
                    Audit Service: <strong style={{ color: health.dependencies.auditService === 'ok' || health.dependencies.auditService === 'up' ? '#10b981' : '#ef4444' }}>
                      {health.dependencies.auditService === 'ok' || health.dependencies.auditService === 'up' ? 'Activo' : 'Inactivo'}
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </header>
    </div>
  );
}

export default App;
