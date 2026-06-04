-- Run in pgAdmin against the database in application.yml (default: postgres).
-- Passwords are AES/GCM encrypted using config secret-key / iv-key from application.yml.

UPDATE admin_user
SET password = 'e8jBc+DkeaKweAtibTzxVImeZdRSoULY', updated_by = 'SYSTEM'
WHERE email = 'admin@example.com';


UPDATE admin_user
SET password = 'as3fafm6OfXaUtnp7vLERO2OvUj2RD6o', updated_by = 'SYSTEM'
WHERE email = 'admin@admin.com';