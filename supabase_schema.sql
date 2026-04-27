-- Table: services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC DEFAULT 0,
  estimated_duration TEXT,
  category TEXT
);

-- Table: clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  name TEXT NOT NULL,
  phone TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  address TEXT
);

-- Table: appointments
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

-- Table: quotes (Presupuestos)
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_name TEXT,
  phone TEXT,
  vehicle_info TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  service_type TEXT,
  items JSONB,
  total NUMERIC,
  status TEXT DEFAULT 'sent'
);

-- Table: receptions (Entradas de taller)
CREATE TABLE IF NOT EXISTS receptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  client_name TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  service_type TEXT,
  date DATE,
  status TEXT DEFAULT 'en proceso',
  inventory JSONB,
  evidences TEXT[]
);

-- Habilitar RLS (Row Level Security) para acceso público si no usas Auth aún
-- Si prefieres seguridad total, configura políticas de acceso.
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access" ON services FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access" ON clients FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access" ON appointments FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access" ON quotes FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE receptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access" ON receptions FOR ALL USING (true) WITH CHECK (true);
