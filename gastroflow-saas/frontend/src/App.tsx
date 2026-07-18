import { useState } from 'react';
import type { FormEvent } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import './App.css';

function Content() {
  const auth = useAuth();
  const [error, setError] = useState('');
  if (!auth.ready) return <main className="status-page"><section className="status-panel">Restaurando sesión…</section></main>;
  if (!auth.user) return <Login error={error} onSubmit={async (value) => { setError(''); try { await auth.login(value); } catch { setError('Credenciales inválidas o servicio no disponible'); } }} />;
  if (!auth.user.branchId && auth.branches.length > 0) return (
    <main className="status-page"><section className="status-panel"><p className="eyebrow">Selecciona una sucursal</p><h1>GastroFlow</h1><div className="branch-grid">{auth.branches.map((branch) => <button className="branch-card" key={branch.id} onClick={() => void auth.selectBranch(branch.id)}><strong>{branch.name}</strong><span>{branch.code} · {branch.city ?? 'Sin ciudad'}</span><span>{branch.isPrimary ? 'Principal' : 'Sucursal'} · {branch.roles.join(', ')}</span></button>)}</div><button onClick={() => void auth.logout()}>Cerrar sesión</button></section></main>
  );
  const activeBranch = auth.branches.find((branch) => branch.id === auth.user?.branchId);
  return <main className="status-page"><section className="status-panel"><p className="eyebrow">Sesión activa</p><h1>{auth.user.name}</h1><p>{auth.user.email}</p><dl className="services"><div className="service-row"><dt>Restaurante</dt><dd>{auth.user.restaurantName}</dd></div><div className="service-row"><dt>Sucursal</dt><dd>{activeBranch?.name ?? 'Sin asignar'}</dd></div><div className="service-row"><dt>Roles</dt><dd>{auth.user.roles.join(', ') || 'Ninguno'}</dd></div><div className="service-row"><dt>Permisos</dt><dd>{auth.user.permissions.join(', ') || 'Ninguno'}</dd></div><div className="service-row"><dt>Gateway</dt><dd className="service-status--ok">Disponible</dd></div></dl>{auth.branches.length > 1 && <button onClick={auth.changeBranch}>Cambiar sucursal</button>} <button onClick={() => void auth.logout()}>Cerrar sesión</button></section></main>;
}

function Login({ onSubmit, error }: { onSubmit: (value: { restaurantSlug: string; email: string; password: string }) => Promise<void>; error: string }) {
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); const form = new FormData(event.currentTarget); try { await onSubmit({ restaurantSlug: String(form.get('restaurantSlug')), email: String(form.get('email')), password: String(form.get('password')) }); } finally { setBusy(false); } }
  return <main className="status-page"><form className="status-panel auth-form" onSubmit={(event) => void submit(event)}><p className="eyebrow">Acceso seguro</p><h1>GastroFlow</h1><label>Código del restaurante<input name="restaurantSlug" defaultValue="restaurante-demo" required pattern="[a-zA-Z0-9-]{3,60}" /></label><label>Correo<input name="email" type="email" required /></label><label>Contraseña<input name="password" type="password" required /></label>{error && <p className="error-message">{error}</p>}<button disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</button></form></main>;
}
export default function App() { return <AuthProvider><Content /></AuthProvider>; }
