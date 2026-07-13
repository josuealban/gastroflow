import { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

interface HealthResponse {
  status: string;
  service: string;
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:3000/api/v1/health')
      .then(response => setHealth(response.data))
      .catch(err => setError(err.message));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>GastroFlow SaaS</h1>
        <p>Temporarily Frontend Page</p>
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>API Gateway Health Check:</h2>
          {health ? (
            <div>
              <p>Status: <strong style={{ color: 'green' }}>{health.status}</strong></p>
              <p>Service: <strong>{health.service}</strong></p>
            </div>
          ) : error ? (
            <p style={{ color: 'red' }}>Error: {error}</p>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
