-- Custom SQL migration file, put your code below! --
INSERT INTO event_config (id, min_members, max_members, registration_open) VALUES (1, 4, 6, 0) ON CONFLICT (id) DO NOTHING;
--> statement-breakpoint
ALTER TABLE participants ADD CONSTRAINT valid_email CHECK (email = lower(email) AND email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$');
--> statement-breakpoint
ALTER TABLE participants ADD CONSTRAINT valid_mobile CHECK (mobile ~ '^[1-9][0-9]{7,14}$');
--> statement-breakpoint
ALTER TABLE participants ADD CONSTRAINT valid_member_name CHECK (length(trim(name)) BETWEEN 2 AND 120);
--> statement-breakpoint
ALTER TABLE registrations ADD CONSTRAINT valid_team_name CHECK (length(trim(team_name)) BETWEEN 2 AND 100);
--> statement-breakpoint
ALTER TABLE registrations ADD CONSTRAINT valid_institution CHECK (length(trim(institution)) BETWEEN 2 AND 200);
--> statement-breakpoint
CREATE FUNCTION enforce_registration_rules() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE minimum integer; maximum integer; is_open integer;
BEGIN
  SELECT min_members, max_members, registration_open INTO minimum, maximum, is_open FROM event_config WHERE id = 1;
  IF is_open IS DISTINCT FROM 1 THEN RAISE EXCEPTION 'Registration is closed'; END IF;
  IF NEW.member_count < minimum OR NEW.member_count > maximum THEN RAISE EXCEPTION 'Invalid team size'; END IF;
  IF NEW.status <> 'pending' THEN RAISE EXCEPTION 'New registrations must be pending'; END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER registration_rules BEFORE INSERT ON registrations FOR EACH ROW EXECUTE FUNCTION enforce_registration_rules();
--> statement-breakpoint
CREATE FUNCTION check_registration_members() RETURNS trigger LANGUAGE plpgsql SET search_path = public, pg_temp AS $$
DECLARE registration_key integer; expected integer; actual integer; leaders integer;
BEGIN
  IF TG_TABLE_NAME = 'registrations' THEN
    registration_key := COALESCE(NEW.id, OLD.id);
  ELSE
    registration_key := COALESCE(NEW.registration_id, OLD.registration_id);
  END IF;
  SELECT member_count INTO expected FROM registrations WHERE id = registration_key;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT count(*), count(*) FILTER (WHERE role = 'leader') INTO actual, leaders FROM participants WHERE registration_id = registration_key;
  IF actual <> expected OR leaders <> 1 THEN RAISE EXCEPTION 'Invalid team membership'; END IF;
  RETURN NULL;
END $$;
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER registration_member_check AFTER INSERT OR UPDATE ON registrations DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_registration_members();
--> statement-breakpoint
CREATE CONSTRAINT TRIGGER participant_member_check AFTER INSERT OR UPDATE OR DELETE ON participants DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION check_registration_members();
--> statement-breakpoint
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE registrations FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY registration_read ON registrations FOR SELECT USING (
  owner_id = current_setting('app.owner_id', true)
  OR current_setting('app.is_admin', true) = 'true'
  OR reference = current_setting('app.verification_reference', true)
);
--> statement-breakpoint
CREATE POLICY registration_insert ON registrations FOR INSERT WITH CHECK (owner_id = current_setting('app.owner_id', true) AND status = 'pending');
--> statement-breakpoint
CREATE POLICY registration_admin_update ON registrations FOR UPDATE USING (current_setting('app.is_admin', true) = 'true') WITH CHECK (current_setting('app.is_admin', true) = 'true');
--> statement-breakpoint
CREATE POLICY registration_admin_delete ON registrations FOR DELETE USING (current_setting('app.is_admin', true) = 'true' AND status = 'rejected');
--> statement-breakpoint
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE participants FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY participant_read ON participants FOR SELECT USING (
  current_setting('app.is_admin', true) = 'true' OR EXISTS (SELECT 1 FROM registrations WHERE registrations.id = registration_id AND registrations.owner_id = current_setting('app.owner_id', true))
);
--> statement-breakpoint
CREATE POLICY participant_insert ON participants FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM registrations WHERE registrations.id = registration_id AND registrations.owner_id = current_setting('app.owner_id', true) AND registrations.status = 'pending')
);
--> statement-breakpoint
CREATE POLICY participant_admin_update ON participants FOR UPDATE USING (current_setting('app.is_admin', true) = 'true') WITH CHECK (current_setting('app.is_admin', true) = 'true');
--> statement-breakpoint
CREATE POLICY participant_admin_delete ON participants FOR DELETE USING (current_setting('app.is_admin', true) = 'true');
--> statement-breakpoint
ALTER TABLE audit ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY audit_write ON audit FOR INSERT WITH CHECK (actor_id = current_setting('app.owner_id', true));
--> statement-breakpoint
CREATE POLICY audit_admin_read ON audit FOR SELECT USING (current_setting('app.is_admin', true) = 'true');
--> statement-breakpoint
ALTER TABLE event_config ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE event_config FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY config_read ON event_config FOR SELECT USING (true);
--> statement-breakpoint
CREATE POLICY config_admin_write ON event_config FOR ALL USING (current_setting('app.is_admin', true) = 'true') WITH CHECK (current_setting('app.is_admin', true) = 'true');
--> statement-breakpoint
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON registrations, participants, administrators, audit, event_config FROM PUBLIC;
--> statement-breakpoint
REVOKE ALL ON SEQUENCE registration_reference_seq FROM PUBLIC;
