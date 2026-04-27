-- ==========================================
-- SCRIPT SQL PARA TAFER SERVICIOS (SUPABASE)
-- Copia y pega esto en el "SQL Editor" de Supabase
-- ==========================================

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
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  address TEXT
);

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
  link_color TEXT DEFAULT '#2563eb'
);

INSERT INTO settings (id, app_name, logo_url, nav_color, button_color, link_color) 
VALUES ('00000000-0000-0000-0000-000000000000', 'Tafer Servicios', 'https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png', '#000000', '#000000', '#2563eb')
ON CONFLICT (id) DO NOTHING;

-- HABILITAR ACCESO PÚBLICO (Políticas RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Public Update Settings" ON settings FOR UPDATE USING (true);
