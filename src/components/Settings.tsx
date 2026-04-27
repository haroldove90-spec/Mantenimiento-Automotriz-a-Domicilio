import React, { useState, useEffect } from 'react';
import { Save, Upload, RefreshCw } from 'lucide-react';
import { mockDb } from '../lib/mockData';

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    app_name: 'Tafer Servicios',
    logo_url: 'https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png',
    nav_color: '#000000',
    button_color: '#000000',
    link_color: '#2563eb'
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
              <label className="text-xs font-bold text-gray-400 uppercase">URL del Logo (PNG/JPG)</label>
              <div className="flex gap-2">
                <input 
                  value={config.logo_url}
                  onChange={e => setConfig({...config, logo_url: e.target.value})}
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm outline-none focus:ring-1 focus:ring-dark"
                  placeholder="https://..."
                />
              </div>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg flex items-center justify-center border border-dashed border-gray-200">
                <img src={config.logo_url} alt="Logo" className="h-16 object-contain" onError={(e: any) => e.target.src = 'https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png'} />
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
