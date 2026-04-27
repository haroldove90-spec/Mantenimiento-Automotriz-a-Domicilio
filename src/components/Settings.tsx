import React, { useState, useEffect } from 'react';
import { Save, Upload, RefreshCw, AlertCircle } from 'lucide-react';
import { mockDb } from '../lib/mockData';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<any>({
    app_name: 'Tafer Servicios',
    logo_url: 'https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png',
    nav_color: '#000000',
    button_color: '#000000',
    link_color: '#2563eb',
    logo_size: 40,
    show_app_name: true
  });

  useEffect(() => {
    const fetch = async () => {
      const data = await mockDb.get('settings');
      if (data && data.length > 0) {
        setConfig(data[0]);
      }
    };
    fetch();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig({ ...config, logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await mockDb.update('settings', '00000000-0000-0000-0000-000000000000', config);
      alert('Configuración guardada. Recarga la página para aplicar cambios.');
      window.location.reload();
    } catch (error: any) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-dark">Configuración General</h2>
        <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mt-1">Personaliza la identidad de tu aplicación</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visual Branding */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-lg flex items-center gap-2">Branding</h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Nombre del Programa</label>
              <input 
                value={config.app_name}
                onChange={e => setConfig({...config, app_name: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-dark"
                placeholder="Ej: Mi Taller Pro"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Logo de la Empresa</label>
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 flex items-center justify-center overflow-hidden shrink-0">
                  <img src={config.logo_url} alt="Logo" className="w-full h-full object-contain" onError={(e: any) => e.target.src = 'https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png'} />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-[10px] text-gray-400 font-medium">Sube una imagen cuadrada (PNG/JPG) con fondo transparente preferiblemente.</p>
                   <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold hover:bg-gray-100 cursor-pointer transition-colors text-dark">
                    <Upload className="w-3 h-3" /> Seleccionar Imagen
                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase mb-2">
                  <AlertCircle className="w-4 h-4" /> Importante: Actualización de Base de Datos
                </div>
                <p className="text-[10px] text-amber-600 font-medium mb-3">
                  Si ves errores como "Could not find column" o "duplicate key" al guardar, debes copiar el script SQL de ayuda y pegarlo en el editor de Supabase.
                </p>
                <button 
                  onClick={() => {
                    const sql = `-- REPARACIONES Y MIGRACIONES FORZADAS (Ejecutar en el SQL Editor de Supabase)
DO $$ 
BEGIN 
    -- 1. Clientes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='address') THEN
        ALTER TABLE clients ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='vehicle_make') THEN
        ALTER TABLE clients ADD COLUMN vehicle_make TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='vehicle_model') THEN
        ALTER TABLE clients ADD COLUMN vehicle_model TEXT;
    END IF;
    ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_phone_key;

    -- 2. Citas (Asegurar status y notes)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='status') THEN
        ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'pendiente';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='notes') THEN
        ALTER TABLE appointments ADD COLUMN notes TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='address') THEN
        ALTER TABLE appointments ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='client_name') THEN
        ALTER TABLE appointments ADD COLUMN client_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='vehicle_info') THEN
        ALTER TABLE appointments ADD COLUMN vehicle_info TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='appointments' AND column_name='service_type') THEN
        ALTER TABLE appointments ADD COLUMN service_type TEXT;
    END IF;
END $$;`;
                    navigator.clipboard.writeText(sql);
                    alert("¡Script SQL copiado! Pégalo en el SQL Editor de Supabase, ejecútalo y luego REFRESCA esta página.");
                  }}
                  className="w-full bg-amber-100 text-amber-700 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-amber-200 transition-colors"
                >
                  Copiar Script de Reparación SQL
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre de la Aplicación</label>
                  <input 
                    type="text"
                    value={config.app_name}
                    onChange={e => setConfig({...config, app_name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg p-2.5 text-sm mt-1 outline-none focus:ring-1 focus:ring-dark"
                    placeholder="Ej. Tafer Servicios"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mostrar Nombre</label>
                    <p className="text-[9px] text-gray-400 font-medium">Muestra el nombre junto al logotipo.</p>
                  </div>
                  <button 
                    onClick={() => setConfig({...config, show_app_name: !config.show_app_name})}
                    className={`w-10 h-5 rounded-full transition-all relative ${config.show_app_name ? 'bg-dark' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${config.show_app_name ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tamaño del Logo</label>
                    <p className="text-[9px] text-gray-400 font-medium">Ajusta el alto del logotipo ({config.logo_size}px).</p>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="120" 
                  step="5"
                  value={config.logo_size}
                  onChange={e => setConfig({...config, logo_size: parseInt(e.target.value)})}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-dark"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colors */}
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <h3 className="font-bold text-lg">Personalización de Colores</h3>
          
          <div className="space-y-4">
            <ColorPicker 
              label="Barra de Navegación" 
              value={config.nav_color} 
              onChange={val => setConfig({...config, nav_color: val})} 
            />
            <ColorPicker 
              label="Color de Botones" 
              value={config.button_color} 
              onChange={val => setConfig({...config, button_color: val})} 
            />
            <ColorPicker 
              label="Color de Links" 
              value={config.link_color} 
              onChange={val => setConfig({...config, link_color: val})} 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-dark text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg text-sm"
        >
          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
      <label className="text-xs font-bold text-gray-500 uppercase">{label}</label>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono font-bold text-gray-400">{value}</span>
        <input 
          type="color" 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border-0 cursor-pointer overflow-hidden p-0"
        />
      </div>
    </div>
  );
}
