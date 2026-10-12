DO $$
DECLARE
  previous_admin_context text := current_setting('app.is_admin', true);
BEGIN
  PERFORM set_config('app.is_admin', 'true', true);
  INSERT INTO event_config (id, registration_open)
  VALUES (1, 1)
  ON CONFLICT (id) DO UPDATE SET registration_open = EXCLUDED.registration_open;
  PERFORM set_config('app.is_admin', COALESCE(previous_admin_context, 'false'), true);
END
$$;
