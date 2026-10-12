import { refreshSession } from '@netlify/identity';
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  await refreshSession();
  let response: Response;
  try { response = await fetch(`/api/${path}`, { ...init, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...init.headers } }); }
  catch { throw new Error('Unable to connect. Check your network connection and try again.'); }
  let value;
  try { value = await response.json(); }
  catch { throw new Error('The registration service is currently unavailable. Please try again shortly.'); }
  if (!response.ok) throw new Error(value.error ?? 'Unable to complete this request.');
  return value as T;
}
export type Registration = { id: number; reference: string; teamName: string; institution: string; category: 'school' | 'college'; status: 'pending' | 'approved' | 'rejected'; mentor?: string; createdAt: string; members: { id: number; name: string; email: string; mobile: string; institution: string; role: string }[] };
export type Settings = { minMembers: number; maxMembers: number; registrationOpen: number };
