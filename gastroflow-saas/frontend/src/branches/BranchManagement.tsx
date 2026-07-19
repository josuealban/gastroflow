import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { apiClient } from '../api/client';
import type { User } from '../auth/AuthContext';
import { createIdempotencyKeyController } from './idempotency-key.js';
import { pollBranchProvisioning } from './provisioning-polling.js';
import type { ProvisioningProgress } from './provisioning-polling.js';

interface Branch { id:string; name:string; code:string; description:string|null; address:string|null; city:string|null; phone:string|null; latitude:number|null; longitude:number|null; isPrimary:boolean; status:'PROVISIONING'|'ACTIVE'|'INACTIVE'|'FAILED'; createdAt:string }
interface StaffRole { id:string; name:string }
interface StaffMember { id:string; name:string; email:string; userRoles:Array<{role:StaffRole}> }

export function BranchManagement({ user, onOpen }: { user:User; onOpen:(id:string)=>Promise<void> }) {
  const [items,setItems]=useState<Branch[]>([]), [staff,setStaff]=useState<StaffMember[]>([]);
  const [creating,setCreating]=useState(false), [editing,setEditing]=useState<Branch|null>(null);
  const [error,setError]=useState(''), [progress,setProgress]=useState<Record<string,ProvisioningProgress>>({});
  const key=useRef(createIdempotencyKeyController(()=>crypto.randomUUID())), can=(permission:string)=>user.permissions.includes(permission);
  const canCreate=can('branches.create');
  const load=useCallback(async()=>setItems((await apiClient.get<{items:Branch[]}>('/branches')).data.items),[]);
  const loadStaff=useCallback(async()=>{if(canCreate)setStaff((await apiClient.get<StaffMember[]>('/branches/assignable-staff')).data)},[canCreate]);
  useEffect(()=>{void load()},[load]);
  useEffect(()=>{if(creating)void loadStaff()},[creating,loadStaff]);
  useEffect(()=>{
    const stops=items.filter((branch)=>branch.status==='PROVISIONING').map((branch)=>pollBranchProvisioning({
      branchId:branch.id,
      fetchProgress:async(id)=>(await apiClient.get<ProvisioningProgress>(`/branches/${id}/provisioning`)).data,
      onProgress:(value)=>{setProgress((current)=>({...current,[branch.id]:value}));if(value.branchStatus==='ACTIVE'||value.branchStatus==='FAILED')void load()},
      onError:()=>setError('No fue posible consultar el progreso de aprovisionamiento.'),maxPolls:30,intervalMs:4000,
    }));
    return()=>stops.forEach((stop)=>stop());
  },[items,load]);

  async function create(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=new FormData(event.currentTarget),idempotencyKey=key.current.getOrCreate();setError('');
    const selected=staff.flatMap((member)=>{const roleId=String(form.get(`staff-${member.id}`)??'');return roleId?[{userId:member.id,roleIds:[roleId]}]:[]});
    const number=(name:string)=>form.get(name)===''?undefined:Number(form.get(name));
    try{await apiClient.post('/branches',{name:String(form.get('name')),code:String(form.get('code')).trim().toUpperCase(),description:String(form.get('description')||'')||undefined,address:String(form.get('address')||'')||undefined,city:String(form.get('city')||'')||undefined,phone:String(form.get('phone')||'')||undefined,latitude:number('latitude'),longitude:number('longitude'),templateBranchId:form.get('templateBranchId')||undefined,initialStaff:selected.length?selected:undefined},{headers:{'Idempotency-Key':idempotencyKey}});key.current.onSuccess();setCreating(false);await load()}
    catch(requestError){key.current.onError(requestError);setError(key.current.peek()?'No fue posible confirmar el registro. La misma clave se conservará para reintentar.':'La solicitud fue rechazada. Corrige los datos antes de reintentar.')}
  }
  async function update(event:FormEvent<HTMLFormElement>){event.preventDefault();if(!editing)return;const form=new FormData(event.currentTarget),number=(name:string)=>form.get(name)===''?undefined:Number(form.get(name));try{await apiClient.patch(`/branches/${editing.id}`,{name:String(form.get('name')),description:String(form.get('description')||'')||undefined,address:String(form.get('address')||'')||undefined,city:String(form.get('city')||'')||undefined,phone:String(form.get('phone')||'')||undefined,latitude:number('latitude'),longitude:number('longitude')});setEditing(null);await load()}catch{setError('No fue posible editar la sucursal.')}}
  async function action(run:()=>Promise<unknown>,message:string){setError('');try{await run();await load()}catch{setError(message)}}
  function cancelCreate(){key.current.cancel();setCreating(false);setError('')}

  return <section className="branch-admin"><div className="branch-admin__title"><h2>Sucursales</h2>{canCreate&&<button onClick={()=>setCreating(true)}>+ Nueva sucursal</button>}</div>
    {creating&&<form className="auth-form" onSubmit={(event)=>void create(event)}>
      <label>Nombre<input name="name" minLength={3} maxLength={100} required/></label><label>Código<input name="code" minLength={2} maxLength={20} pattern="[A-Za-z0-9-]+" required/></label><label>Descripción<textarea name="description" maxLength={500}/></label><label>Dirección<input name="address" maxLength={250}/></label><label>Ciudad<input name="city" maxLength={100}/></label><label>Teléfono<input name="phone" maxLength={30}/></label><label>Latitud<input name="latitude" type="number" min={-90} max={90} step="any"/></label><label>Longitud<input name="longitude" type="number" min={-180} max={180} step="any"/></label>
      <label>Plantilla<select name="templateBranchId" required={items.some((branch)=>branch.status==='ACTIVE')}><option value="">Sin plantilla</option>{items.filter((branch)=>branch.status==='ACTIVE').map((branch)=><option value={branch.id} key={branch.id}>{branch.name}</option>)}</select></label>
      {staff.map((member)=><label key={member.id}>{member.name} ({member.email})<select name={`staff-${member.id}`}><option value="">No asignar</option>{member.userRoles.map(({role})=><option key={role.id} value={role.id}>{role.name}</option>)}</select></label>)}{error&&<p className="error-message">{error}</p>}<button>Crear</button><button type="button" onClick={cancelCreate}>Cancelar y descartar clave</button>
    </form>}
    {editing&&<form className="auth-form" onSubmit={(event)=>void update(event)}><label>Nombre<input name="name" defaultValue={editing.name} minLength={3} maxLength={100} required/></label><label>Descripción<textarea name="description" defaultValue={editing.description??''} maxLength={500}/></label><label>Dirección<input name="address" defaultValue={editing.address??''} maxLength={250}/></label><label>Ciudad<input name="city" defaultValue={editing.city??''} maxLength={100}/></label><label>Teléfono<input name="phone" defaultValue={editing.phone??''} maxLength={30}/></label><label>Latitud<input name="latitude" type="number" min={-90} max={90} step="any" defaultValue={editing.latitude??''}/></label><label>Longitud<input name="longitude" type="number" min={-180} max={180} step="any" defaultValue={editing.longitude??''}/></label><button>Guardar</button><button type="button" onClick={()=>setEditing(null)}>Cancelar</button></form>}
    {error&&!creating&&<p className="error-message">{error}</p>}<div className="branch-grid">{items.map((branch)=><article className="branch-card" key={branch.id}><strong>{branch.name}</strong><span>{branch.code} · {branch.city??'Sin ciudad'}</span><span>{branch.isPrimary?'Principal':'Sucursal'} · {branch.status}</span><span>{new Date(branch.createdAt).toLocaleDateString()}</span>{progress[branch.id]&&<span>Job: {progress[branch.id].jobStatus} · Intentos {progress[branch.id].attempts}/{progress[branch.id].maxAttempts}{progress[branch.id].errorMessage?` · ${progress[branch.id].errorMessage}`:''}</span>}{branch.status==='ACTIVE'&&<button onClick={()=>void onOpen(branch.id)}>Abrir</button>}{can('branches.update')&&<button onClick={()=>setEditing(branch)}>Editar</button>}{branch.status==='FAILED'&&can('branches.retry-provisioning')&&<button onClick={()=>void action(()=>apiClient.post(`/branches/${branch.id}/retry-provisioning`),'No fue posible reintentar el aprovisionamiento.')}>Reintentar</button>}{branch.status==='ACTIVE'&&!branch.isPrimary&&can('branches.deactivate')&&<button onClick={()=>void action(()=>apiClient.patch(`/branches/${branch.id}/status`,{status:'INACTIVE'}),'No fue posible desactivar la sucursal.')}>Desactivar</button>}{branch.status==='INACTIVE'&&can('branches.deactivate')&&<button onClick={()=>void action(()=>apiClient.patch(`/branches/${branch.id}/status`,{status:'ACTIVE'}),'No fue posible activar la sucursal.')}>Activar</button>}</article>)}</div>
  </section>
}
