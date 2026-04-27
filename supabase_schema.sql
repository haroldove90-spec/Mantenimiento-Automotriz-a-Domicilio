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

-- HABILITAR ACCESO PÚBLICO (Políticas RLS)
-- Solo usa esto para pruebas iniciales sin autenticación
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read" ON services FOR SELECT USING (true);
CREATE POLICY "Public Write" ON services FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Write Clients" ON clients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Write Apps" ON appointments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Write Quotes" ON quotes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE receptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Write Receptions" ON receptions FOR ALL USING (true) WITH CHECK (true);
