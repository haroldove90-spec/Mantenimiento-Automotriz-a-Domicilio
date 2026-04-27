-- Tabla de Clientes
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    vehicle_make TEXT,
    vehicle_model TEXT,
    vehicle_info TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Catálogo de Servicios
CREATE TABLE services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC,
    estimated_duration TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Citas
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone TEXT,
    vehicle_info TEXT,
    service_type TEXT,
    address TEXT,
    date DATE,
    time TEXT,
    status TEXT DEFAULT 'pendiente',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Presupuestos
CREATE TABLE quotes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    vehicle_make TEXT,
    vehicle_model TEXT,
    service_type TEXT,
    items JSONB DEFAULT '[]',
    total NUMERIC,
    status TEXT DEFAULT 'enviado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Recepción de Autos
CREATE TABLE receptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id),
    client_name TEXT NOT NULL,
    vehicle_make TEXT,
    vehicle_model TEXT,
    service_type TEXT,
    status TEXT DEFAULT 'en proceso',
    date DATE DEFAULT CURRENT_DATE,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) - Para simplificar en este demo, permitiremos acceso total
-- En producción deberías restringir esto
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE receptions ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso (Permitir todo para el demo anon)
CREATE POLICY "Allow all for anon" ON clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON quotes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for anon" ON receptions FOR ALL USING (true) WITH CHECK (true);
