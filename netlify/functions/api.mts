import { getUser } from '@netlify/identity';
import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../../db/index';
import { administrators, audit, eventConfig, participants, registrations } from '../../db/schema';
import { registrationSchema } from '../../src/lib/validation';
import { z } from 'zod';
import type { Config } from '@netlify/functions';

class HttpError extends Error { constructor(public status: number, message: string) { super(message); } }
export default async (request: Request) => {
  const path = new URL(request.url).pathname.replace(/^\/api\/?/, '');
  const json = (value: unknown, status = 200) => Response.json(value, { status, headers: { 'Cache-Control': 'no-store' } });
  try {
    if (request.method === 'GET' && path === 'config') {
      const [settings] = await db.select().from(eventConfig).where(eq(eventConfig.id, 1));
      return json(settings ?? { minMembers: 4, maxMembers: 6, registrationOpen: 0 });
    }
    if (request.method === 'GET' && path.startsWith('verify/')) {
      const reference = decodeURIComponent(path.slice(7));
      if (!/^NASA2026-BIAS-\d{6,}$/.test(reference)) throw new HttpError(404, 'No matching registration was found.');
      return await db.transaction(async transaction => {
        await transaction.execute(sql`select set_config('app.verification_reference', ${reference}, true)`);
        const [record] = await transaction.select({ reference: registrations.reference, teamName: registrations.teamName, institution: registrations.institution, category: registrations.category, status: registrations.status }).from(registrations).where(eq(registrations.reference, reference));
        if (!record) throw new HttpError(404, 'No matching registration was found.');
        return json(record);
      });
    }
    const user = await getUser();
    if (!user || !user.confirmedAt) throw new HttpError(401, 'Please sign in with a confirmed account.');
    if (!['GET', 'HEAD'].includes(request.method) && request.headers.get('origin') !== new URL(request.url).origin) throw new HttpError(403, 'Request origin is not permitted.');
    const [administrator] = await db.select().from(administrators).where(eq(administrators.userId, user.id));
    const isAdmin = !!administrator;
    if (path.startsWith('admin') && !isAdmin) throw new HttpError(403, 'This account is not authorized for administration.');
    return await db.transaction(async transaction => {
      await transaction.execute(sql`select set_config('app.owner_id', ${user.id}, true), set_config('app.is_admin', ${isAdmin ? 'true' : 'false'}, true)`);
      if (path === 'session' && request.method === 'GET') return json({ isAdmin });
      if (path === 'registration' && request.method === 'GET') {
        const [record] = await transaction.select().from(registrations).where(eq(registrations.ownerId, user.id));
        if (!record) return json(null);
        const members = await transaction.select().from(participants).where(eq(participants.registrationId, record.id));
        return json({ ...record, members });
      }
      if (path === 'registration' && request.method === 'POST') {
        const parsed = registrationSchema.safeParse(await request.json());
        if (!parsed.success) throw new HttpError(400, parsed.error.issues.map(issue => issue.message).join(' '));
        const input = parsed.data;
        const [settings] = await transaction.select().from(eventConfig).where(eq(eventConfig.id, 1));
        if (!settings?.registrationOpen) throw new HttpError(409, 'Registration is awaiting organizer confirmation. Please check back soon.');
        if (input.members.length < settings.minMembers || input.members.length > settings.maxMembers) throw new HttpError(400, `Teams must contain ${settings.minMembers}–${settings.maxMembers} members.`);
        if (input.members.find(member => member.role === 'leader')?.email !== user.email?.toLowerCase()) throw new HttpError(400, 'The team leader email must match the signed-in account.');
        const [record] = await transaction.insert(registrations).values({ ownerId: user.id, teamName: input.teamName, institution: input.institution, category: input.category, mentor: input.mentor, memberCount: input.members.length }).returning();
        await transaction.insert(participants).values(input.members.map(member => ({ ...member, registrationId: record.id })));
        await transaction.insert(audit).values({ actorId: user.id, action: 'register', reference: record.reference });
        return json(record, 201);
      }
      if (path === 'admin/registrations' && request.method === 'GET') {
        const records = await transaction.select().from(registrations).orderBy(desc(registrations.createdAt));
        const members = await transaction.select().from(participants);
        return json(records.map(record => ({ ...record, members: members.filter(member => member.registrationId === record.id) })));
      }
      if (path.startsWith('admin/registrations/') && request.method === 'PATCH') {
        const reference = decodeURIComponent(path.slice('admin/registrations/'.length));
        const input = z.object({ status: z.enum(['pending', 'approved', 'rejected']).optional(), teamName: z.string().trim().min(2).max(100).optional(), institution: z.string().trim().min(2).max(200).optional(), mentor: z.string().trim().max(120).optional() }).refine(value => Object.keys(value).length > 0).parse(await request.json());
        const [record] = await transaction.update(registrations).set(input).where(eq(registrations.reference, reference)).returning();
        if (!record) throw new HttpError(404, 'Registration not found.');
        await transaction.insert(audit).values({ actorId: user.id, action: input.status ? `status:${input.status}` : 'update-team', reference });
        return json(record);
      }
      if (path.startsWith('admin/registrations/') && request.method === 'DELETE') {
        const reference = decodeURIComponent(path.slice('admin/registrations/'.length));
        const [record] = await transaction.delete(registrations).where(and(eq(registrations.reference, reference), eq(registrations.status, 'rejected'))).returning();
        if (!record) throw new HttpError(409, 'Only rejected registrations may be deleted.');
        await transaction.insert(audit).values({ actorId: user.id, action: 'delete', reference });
        return json({ deleted: true });
      }
      if (path === 'admin/config' && request.method === 'PATCH') {
        const input = z.object({ minMembers: z.number().int().min(1).max(20), maxMembers: z.number().int().min(1).max(20), registrationOpen: z.union([z.literal(0), z.literal(1)]) }).refine(value => value.maxMembers >= value.minMembers).parse(await request.json());
        const [settings] = await transaction.insert(eventConfig).values({ id: 1, ...input }).onConflictDoUpdate({ target: eventConfig.id, set: input }).returning();
        await transaction.insert(audit).values({ actorId: user.id, action: 'update-config', reference: 'event-2026' });
        return json(settings);
      }
      throw new HttpError(404, 'This action is not available.');
    });
  } catch (error) {
    if (error instanceof HttpError) return json({ error: error.message }, error.status);
    if (error instanceof z.ZodError || error instanceof SyntaxError) return json({ error: 'Please check the submitted fields.' }, 400);
    const code = (error as { code?: string; cause?: { code?: string } }).code ?? (error as { cause?: { code?: string } }).cause?.code;
    if (code === '23505') return json({ error: 'This account, team name, email or mobile number is already registered.' }, 409);
    if (code === '23514' || code === 'P0001') return json({ error: 'The registration does not meet the current team rules.' }, 400);
    return json({ error: 'The service is temporarily unavailable. Please try again shortly.' }, 503);
  }
};
export const config: Config = { path: '/api/*' };
