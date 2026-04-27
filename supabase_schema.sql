-- ==========================================
-- SCRIPT SQL PARA TAFER SERVICIOS (SUPABASE)
-- Copia y pega esto en el "SQL Editor" de Supabase
-- ==========================================

-- NOTA IMPORTANTE: Si recibes errores como "Could not find the 'address' column",
-- asegúrate de ejecutar este script COMPLETAMENTE.
-- Después de ejecutarlo, si el error persiste en la App, refresca la pestaña del navegador 
-- para que Supabase actualice su caché de esquema.

-- 1. Catálogo de Servicios
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  estimated_duration TEXT,
  category TEXT DEFAULT 'Mantenimiento'
);

-- 2. Base de Clientes
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT,
  phone TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  address TEXT
);

-- MIGRACIÓN DE CLIENTES
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='address') THEN
        ALTER TABLE clients ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='name') THEN
        ALTER TABLE clients ADD COLUMN name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='vehicle_make') THEN
        ALTER TABLE clients ADD COLUMN vehicle_make TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='vehicle_model') THEN
        ALTER TABLE clients ADD COLUMN vehicle_model TEXT;
    END IF;
    -- Eliminar la restricción única de teléfono si existe
    ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_phone_key;
END $$;

-- 3. Citas de Calendario
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_name TEXT,
  phone TEXT,
  vehicle_info TEXT,
  service_type TEXT,
  address TEXT,
  date DATE,
  time TEXT,
  status TEXT DEFAULT 'pendiente',
  notes TEXT
);

-- MIGRACIÓN DE CITAS
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='address') THEN
        ALTER TABLE appointments ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='client_name') THEN
        ALTER TABLE appointments ADD COLUMN client_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='vehicle_info') THEN
        ALTER TABLE appointments ADD COLUMN vehicle_info TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='notes') THEN
        ALTER TABLE appointments ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='service_type') THEN
        ALTER TABLE appointments ADD COLUMN service_type TEXT;
    END IF;
END $$;

-- 4. Presupuestos (Quotes)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_name TEXT,
  phone TEXT,
  vehicle_info TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  service_type TEXT,
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'sent'
);

-- 5. Entradas de Taller (Receptions)
CREATE TABLE IF NOT EXISTS receptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_name TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  service_type TEXT,
  date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'en proceso',
  inventory JSONB DEFAULT '{}',
  evidences TEXT[] DEFAULT '{}'
);

-- 6. Configuración de la App
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000',
  created_at TIMESTAMPTZ DEFAULT now(),
  app_name TEXT DEFAULT 'Tafer Servicios',
  logo_url TEXT DEFAULT 'https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png',
  nav_color TEXT DEFAULT '#000000',
  button_color TEXT DEFAULT '#000000',
  link_color TEXT DEFAULT '#2563eb',
  logo_size INTEGER DEFAULT 40,
  show_app_name BOOLEAN DEFAULT true
);

-- MIGRACIÓN: Asegurar columnas nuevas en settings
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='logo_size') THEN
        ALTER TABLE settings ADD COLUMN logo_size INTEGER DEFAULT 40;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='settings' AND column_name='show_app_name') THEN
        ALTER TABLE settings ADD COLUMN show_app_name BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Insertar configuración inicial si no existe
INSERT INTO settings (id, app_name, logo_url, nav_color, button_color, link_color, logo_size, show_app_name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Tafer Servicios', 'https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png', '#000000', '#000000', '#2563eb', 40, true)
ON CONFLICT (id) DO NOTHING;

-- 7. HABILITAR ACCESO PÚBLICO (Políticas RLS)
-- Nota: Esto habilita lectura/escritura pública para simplificar el demo.

DO $$ 
BEGIN 
    -- Services
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public Read Services" ON services;
    CREATE POLICY "Public Read Services" ON services FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public Write Services" ON services;
    CREATE POLICY "Public Write Services" ON services FOR ALL USING (true);

    -- Clients
    ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public All Clients" ON clients;
    CREATE POLICY "Public All Clients" ON clients FOR ALL USING (true);

    -- Appointments
    ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public All Appointments" ON appointments;
    CREATE POLICY "Public All Appointments" ON appointments FOR ALL USING (true);

    -- Quotes
    ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public All Quotes" ON quotes;
    CREATE POLICY "Public All Quotes" ON quotes FOR ALL USING (true);

    -- Receptions
    ALTER TABLE receptions ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public All Receptions" ON receptions;
    CREATE POLICY "Public All Receptions" ON receptions FOR ALL USING (true);

    -- Settings
    ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public Read Settings" ON settings;
    CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Public Update Settings" ON settings;
    CREATE POLICY "Public Update Settings" ON settings FOR UPDATE USING (true);
END $$;
