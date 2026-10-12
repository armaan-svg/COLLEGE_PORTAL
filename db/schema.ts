import { pgTable, serial, text, timestamp, integer, check, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  reference: text('reference').notNull().unique().default(sql`'NASA2026-BIAS-' || lpad(nextval('registration_reference_seq')::text, 6, '0')`),
  ownerId: text('owner_id').notNull().unique(),
  teamName: text('team_name').notNull(),
  institution: text('institution').notNull(),
  category: text('category').notNull(),
  mentor: text('mentor'),
  status: text('status').notNull().default('pending'),
  memberCount: integer('member_count').notNull(),
  consentVersion: text('consent_version').notNull().default('2026-01'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, table => [
  check('valid_category', sql`${table.category} in ('school', 'college')`),
  check('valid_status', sql`${table.status} in ('pending', 'approved', 'rejected')`),
  check('valid_member_count', sql`${table.memberCount} between 1 and 20`),
  index('registration_status_idx').on(table.status),
  uniqueIndex('unique_team_name').on(sql`lower(${table.teamName})`),
]);
export const participants = pgTable('participants', {
  id: serial('id').primaryKey(),
  registrationId: integer('registration_id').notNull().references(() => registrations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  mobile: text('mobile').notNull().unique(),
  institution: text('institution').notNull(),
  role: text('role').notNull(),
}, table => [check('valid_member_role', sql`${table.role} in ('leader', 'member')`), index('participant_registration_idx').on(table.registrationId)]);
export const administrators = pgTable('administrators', { userId: text('user_id').primaryKey(), createdAt: timestamp('created_at').defaultNow() });
export const eventConfig = pgTable('event_config', {
  id: integer('id').primaryKey().default(1),
  minMembers: integer('min_members').notNull().default(4),
  maxMembers: integer('max_members').notNull().default(6),
  registrationOpen: integer('registration_open').notNull().default(0),
}, table => [check('valid_team_limits', sql`${table.minMembers} >= 1 and ${table.maxMembers} >= ${table.minMembers} and ${table.maxMembers} <= 20`)]);
export const audit = pgTable('audit', {
  id: serial('id').primaryKey(), actorId: text('actor_id').notNull(), action: text('action').notNull(),
  reference: text('reference').notNull(), createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});
