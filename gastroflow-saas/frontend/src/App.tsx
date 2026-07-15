import { useCallback, useEffect, useState } from 'react';
import { apiClient } from './api/client';
import './App.css';

type ServiceStatus = 'ok' | 'unavailable';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'unavailable';
  services: {
    apiGateway: { status: ServiceStatus };
    coreService: { status: ServiceStatus };
    operationsService: { status: ServiceStatus };
  };
  timestamp: string;
}

interface ApiFailure {
  response?: { data?: HealthResponse };
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [gatewayStatus, setGatewayStatus] =
    useState<ServiceStatus>('unavailable');
  const [isChecking, setIsChecking] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setErrorMessage(null);

    try {
      const response = await apiClient.get<HealthResponse>('/health');
      setHealth(response.data);
      setGatewayStatus('ok');
    } catch (error: unknown) {
      const gatewayResponse = (error as ApiFailure).response?.data;

      if (gatewayResponse?.services) {
        setHealth(gatewayResponse);
        setGatewayStatus('ok');
        setErrorMessage(
          'El API Gateway respondió, pero uno o más servicios internos no están disponibles.',
        );
      } else {
        setHealth(null);
        setGatewayStatus('unavailable');
        setErrorMessage(
          'No fue posible conectar con el API Gateway. Verifica que el backend esté iniciado.',
        );
      }
    } finally {
      setLastUpdated(new Date());
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  const systemStatus = health?.status ?? 'unavailable';
  const generalStatus = isChecking
    ? 'Consultando el estado real...'
    : systemStatus === 'ok'
      ? 'Todos los servicios están disponibles'
      : systemStatus === 'degraded'
        ? 'El sistema funciona de forma degradada'
        : 'El sistema no está disponible';

  return (
    <main className="status-page">
      <section
        className="status-panel"
        aria-live="polite"
        aria-busy={isChecking}
      >
        <p className="eyebrow">Estado técnico</p>
        <h1>GastroFlow</h1>
        <p className="description">MVP académico con visión de titulación</p>

        <div className={`summary summary--${systemStatus}`}>
          <span className="summary__indicator" aria-hidden="true" />
          <strong>{generalStatus}</strong>
        </div>

        <dl className="services">
          <ServiceRow label="API Gateway" status={gatewayStatus} />
          <ServiceRow
            label="Core Service"
            status={health?.services.coreService.status ?? 'unavailable'}
          />
          <ServiceRow
            label="Operations Service"
            status={health?.services.operationsService.status ?? 'unavailable'}
          />
        </dl>

        {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

        <p className="last-updated">
          Última actualización:{' '}
          {lastUpdated
            ? lastUpdated.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            : 'pendiente'}
        </p>

        <button
          type="button"
          onClick={() => void checkHealth()}
          disabled={isChecking}
        >
          {isChecking ? 'Actualizando...' : 'Actualizar estado'}
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
        {status === 'ok' ? 'Disponible' : 'No disponible'}
      </dd>
    </div>
  );
}

export default App;
