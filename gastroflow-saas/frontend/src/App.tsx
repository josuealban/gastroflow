import { useCallback, useEffect, useState } from 'react';
import { apiClient } from './api/client';
import './App.css';

type ServiceStatus = 'up' | 'down';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'unavailable';
  service: 'api-gateway';
  dependencies: {
    core: ServiceStatus;
    audit: ServiceStatus;
  };
}

interface ApiFailure {
  response?: {
    data?: HealthResponse;
  };
}

const unavailableHealth: HealthResponse = {
  status: 'unavailable',
  service: 'api-gateway',
  dependencies: { core: 'down', audit: 'down' },
};

function App() {
  const [health, setHealth] = useState<HealthResponse>(unavailableHealth);
  const [gatewayStatus, setGatewayStatus] = useState<ServiceStatus>('down');
  const [isChecking, setIsChecking] = useState(true);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);

    try {
      const response = await apiClient.get<HealthResponse>('/health');
      setHealth(response.data);
      setGatewayStatus('up');
    } catch (error: unknown) {
      const gatewayResponse = (error as ApiFailure).response?.data;
      setHealth(gatewayResponse ?? unavailableHealth);
      setGatewayStatus(gatewayResponse ? 'up' : 'down');

      if (import.meta.env.DEV) {
        console.error('No fue posible completar la comprobación de salud.', error);
      }
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const generalStatus = isChecking
    ? 'Conectando con los servicios...'
    : health.status === 'ok'
      ? 'Sistema operativo'
      : health.status === 'degraded'
        ? 'Operación parcial'
        : 'API principal no disponible';

  return (
    <main className="status-page">
      <section className="status-panel" aria-live="polite">
        <p className="eyebrow">Plataforma de gestión</p>
        <h1>GastroFlow</h1>
        <p className="description">
          Plataforma de gestión para restaurantes y sucursales
        </p>

        <div className={`summary summary--${health.status}`}>
          <span className="summary__indicator" aria-hidden="true" />
          <strong>{generalStatus}</strong>
        </div>

        <dl className="services">
          <ServiceRow label="Gateway" status={gatewayStatus} />
          <ServiceRow label="Core" status={health.dependencies.core} />
          <ServiceRow label="Audit" status={health.dependencies.audit} />
        </dl>

        <button type="button" onClick={() => void checkHealth()} disabled={isChecking}>
          Comprobar nuevamente
        </button>
      </section>
    </main>
  );
}

function ServiceRow({ label, status }: { label: string; status: ServiceStatus }) {
  return (
    <div className="service-row">
      <dt>{label}</dt>
      <dd className={`service-status service-status--${status}`}>
        {status === 'up' ? 'Disponible' : 'No disponible'}
      </dd>
    </div>
  );
}

export default App;
