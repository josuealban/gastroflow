import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { apiClient } from '../api/client';
import type { User } from '../auth/AuthContext';

interface Branch {
  id: string;
  name: string;
  code: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
  isPrimary: boolean;
  status: 'PROVISIONING' | 'ACTIVE' | 'INACTIVE' | 'FAILED';
  createdAt: string;
}
interface StaffRole { id: string; name: string }
interface StaffMember {
  id: string;
  name: string;
  email: string;
  userRoles: Array<{ role: StaffRole }>;
}

export function BranchManagement({ user, onOpen }: { user: User; onOpen: (id: string) => Promise<void> }) {
  const [items, setItems] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [error, setError] = useState('');
  const key = useRef<string | null>(null);
  const can = (permission: string) => user.permissions.includes(permission);
  const canCreate = user.permissions.includes('branches.create');
  const load = useCallback(async () => {
    const response = await apiClient.get<{ items: Branch[] }>('/branches');
    setItems(response.data.items);
  }, []);
  const loadStaff = useCallback(async () => {
    if (!canCreate) return;
    const response = await apiClient.get<StaffMember[]>('/branches/assignable-staff');
    setStaff(response.data);
  }, [canCreate]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (creating) void loadStaff(); }, [creating, loadStaff]);
  useEffect(() => {
    if (!items.some((branch) => branch.status === 'PROVISIONING')) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      void load();
      if (attempts >= 30) window.clearInterval(timer);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [items, load]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    key.current ??= crypto.randomUUID();
    const selected = staff.flatMap((member) => {
      const roleId = String(form.get(`staff-${member.id}`) ?? '');
      return roleId ? [{ userId: member.id, roleIds: [roleId] }] : [];
    });
    const optionalNumber = (name: string) => form.get(name) === '' ? undefined : Number(form.get(name));
    setError('');
    try {
      await apiClient.post('/branches', {
        name: String(form.get('name')),
        code: String(form.get('code')),
        description: String(form.get('description') || '') || undefined,
        address: String(form.get('address') || '') || undefined,
        city: String(form.get('city') || '') || undefined,
        phone: String(form.get('phone') || '') || undefined,
        latitude: optionalNumber('latitude'),
        longitude: optionalNumber('longitude'),
        templateBranchId: form.get('templateBranchId') || undefined,
        initialStaff: selected.length ? selected : undefined,
      }, { headers: { 'Idempotency-Key': key.current } });
      key.current = null;
      setCreating(false);
      await load();
    } catch {
      setError('No fue posible registrar la sucursal. La misma clave se conservará para reintentar.');
    }
  }

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const form = new FormData(event.currentTarget);
    await apiClient.patch(`/branches/${editing.id}`, {
      name: String(form.get('name')),
      description: String(form.get('description') || '') || undefined,
      address: String(form.get('address') || '') || undefined,
      city: String(form.get('city') || '') || undefined,
      phone: String(form.get('phone') || '') || undefined,
    });
    setEditing(null);
    await load();
  }

  return <section className="branch-admin">
    <div className="branch-admin__title"><h2>Sucursales</h2>{can('branches.create') && <button onClick={() => setCreating(true)}>+ Nueva sucursal</button>}</div>
    {creating && <form className="auth-form" onSubmit={(event) => void create(event)}>
      <label>Nombre<input name="name" minLength={3} maxLength={100} required /></label>
      <label>Código<input name="code" minLength={2} maxLength={20} pattern="[A-Za-z0-9-]+" required /></label>
      <label>Descripción<textarea name="description" maxLength={500} /></label>
      <label>Dirección<input name="address" maxLength={250} /></label>
      <label>Ciudad<input name="city" maxLength={100} /></label>
      <label>Teléfono<input name="phone" maxLength={30} /></label>
      <label>Latitud<input name="latitude" type="number" min={-90} max={90} step="any" /></label>
      <label>Longitud<input name="longitude" type="number" min={-180} max={180} step="any" /></label>
      <label>Plantilla<select name="templateBranchId" required={items.some((branch) => branch.status === 'ACTIVE')}><option value="">Sin plantilla</option>{items.filter((branch) => branch.status === 'ACTIVE').map((branch) => <option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label>
      {staff.map((member) => <label key={member.id}>{member.name} ({member.email})<select name={`staff-${member.id}`}><option value="">No asignar</option>{member.userRoles.map(({ role }) => <option key={role.id} value={role.id}>{role.name}</option>)}</select></label>)}
      {error && <p className="error-message">{error}</p>}
      <button>Crear</button><button type="button" onClick={() => setCreating(false)}>Cancelar</button>
    </form>}
    {editing && <form className="auth-form" onSubmit={(event) => void update(event)}>
      <label>Nombre<input name="name" defaultValue={editing.name} minLength={3} maxLength={100} required /></label>
      <label>Descripción<textarea name="description" defaultValue={editing.description ?? ''} maxLength={500} /></label>
      <label>Dirección<input name="address" defaultValue={editing.address ?? ''} maxLength={250} /></label>
      <label>Ciudad<input name="city" defaultValue={editing.city ?? ''} maxLength={100} /></label>
      <label>Teléfono<input name="phone" defaultValue={editing.phone ?? ''} maxLength={30} /></label>
      <button>Guardar</button><button type="button" onClick={() => setEditing(null)}>Cancelar</button>
    </form>}
    <div className="branch-grid">{items.map((branch) => <article className="branch-card" key={branch.id}>
      <strong>{branch.name}</strong><span>{branch.code} · {branch.city ?? 'Sin ciudad'}</span><span>{branch.isPrimary ? 'Principal' : 'Sucursal'} · {branch.status}</span><span>{new Date(branch.createdAt).toLocaleDateString()}</span>
      {branch.status === 'ACTIVE' && <button onClick={() => void onOpen(branch.id)}>Abrir</button>}
      {can('branches.update') && <button onClick={() => setEditing(branch)}>Editar</button>}
      {branch.status === 'FAILED' && can('branches.retry-provisioning') && <button onClick={() => void apiClient.post(`/branches/${branch.id}/retry-provisioning`).then(load)}>Reintentar</button>}
      {branch.status === 'ACTIVE' && !branch.isPrimary && can('branches.deactivate') && <button onClick={() => void apiClient.patch(`/branches/${branch.id}/status`, { status: 'INACTIVE' }).then(load)}>Desactivar</button>}
      {branch.status === 'INACTIVE' && can('branches.deactivate') && <button onClick={() => void apiClient.patch(`/branches/${branch.id}/status`, { status: 'ACTIVE' }).then(load)}>Activar</button>}
    </article>)}</div>
  </section>;
}
