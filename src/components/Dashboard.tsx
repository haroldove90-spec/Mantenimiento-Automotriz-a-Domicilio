import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  MessageCircle,
  Camera,
  ChevronRight,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const stats = [
    { label: 'Citas Hoy', value: '12', trend: '+2 programadas', trendColor: 'text-green-500' },
    { label: 'Presupuestos', value: '$4,250', trend: '5 pendientes', trendColor: 'text-gray-500' },
    { label: 'WhatsApp', value: '48', trend: 'Todos enviados', trendColor: 'text-blue-500' },
    { label: 'Completados', value: '156', trend: 'Este mes', trendColor: 'text-gray-500' },
  ];

  return (
    <div className="p-0 grid grid-cols-12 gap-6">
      {/* Stats Row */}
      <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm"
          >
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-dark">{stat.value}</h3>
            <p className={`text-xs mt-2 ${stat.trendColor}`}>{stat.trend}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Area: Next Appointments */}
      <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-fit">
        <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-dark">Próximas Citas (Hoy)</h3>
          <button className="text-[10px] bg-dark text-white font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-all">Ver Calendario</button>
        </div>
        <div className="divide-y divide-gray-50 font-sans">
          <ServiceRow 
            time="09:00"
            client="Carlos Mendoza"
            vehicle="Audi A3"
            service="Cambio de aceite y filtros"
            address="Av. Reforma 12"
            status="WA ENVIADO"
            statusColor="bg-green-100 text-green-700"
          />
          <ServiceRow 
            time="11:30"
            client="Lucia Ferreyra"
            vehicle="Mazda CX-5"
            service="Revisión de frenos"
            address="Calle 50 No. 23"
            status="PENDIENTE"
            statusColor="bg-blue-100 text-blue-700"
          />
          <ServiceRow 
            time="14:00"
            client="Roberto Silva"
            vehicle="Toyota Hilux"
            service="Escaneo de motor"
            address="Parque Industrial"
            status="PROGRAMADO"
            statusColor="bg-gray-100 text-gray-500"
          />
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Evidence Widget */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold mb-4 flex items-center justify-between text-sm">
            Evidencia Reciente
            <span className="text-[10px] text-gray-400">Sincronizado</span>
          </h3>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                    <div className="absolute inset-x-0 bottom-0 py-2 flex items-center justify-center bg-dark/80 text-white text-[9px] font-bold uppercase tracking-widest cursor-pointer">ENVIAR WA</div>
                  </div>
                ))}
                <div className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white shadow-inner">
                  <Plus className="text-xl text-dark" />
                </div>
              </div>
        </div>

        {/* Quick History Search */}
        <div className="bg-dark p-5 rounded-xl shadow-lg text-white">
          <h3 className="font-bold mb-3 text-sm">Buscador Histórico</h3>
          <div className="relative mb-4">
            <input type="text" placeholder="Placa o Cliente..." className="w-full bg-gray-800 border-none rounded-lg py-2 px-3 text-xs placeholder-gray-500 focus:ring-1 focus:ring-primary outline-none" />
          </div>
          <div className="space-y-3">
            <div className="text-[11px] border-l-2 border-primary pl-3">
              <p className="font-bold">JHK-892 (Toyota Corolla)</p>
              <p className="text-gray-400">Último: 12 Mar 2024</p>
              <p className="text-primary mt-1 cursor-pointer hover:underline">Repetir servicio →</p>
            </div>
            <div className="text-[11px] border-l-2 border-gray-700 pl-3 opacity-60">
              <p className="font-bold">XLS-002 (Ford F-150)</p>
              <p className="text-gray-400">Último: 05 Ene 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceRow({ time, client, vehicle, service, address, status, statusColor }: any) {
  return (
    <div className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors cursor-pointer">
      <div className="w-16 font-mono text-sm font-bold text-gray-400">{time}</div>
      <div className="flex-1">
        <p className="font-bold text-sm text-dark">{client} • {vehicle}</p>
        <p className="text-xs text-gray-500 font-medium">{service} • {address}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className={`px-2 py-1 ${statusColor} text-[10px] font-bold rounded uppercase tracking-wider`}>
          {status}
        </span>
        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-dark text-white hover:bg-gray-800 transition-colors">
          <Camera className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AiSuggestion({ text, phone }: { text: string, phone: string }) {
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent('Hola! Te hablo de AutoDoc Home...')}`;
  
  return (
    <div className="bg-white/10 p-4 rounded-xl backdrop-blur-md border border-white/10">
      <p className="text-sm leading-relaxed mb-3">{text}</p>
      <a 
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] flex items-center gap-1.5 font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        <MessageCircle className="w-3.5 h-3.5" /> Enviar WhatsApp
      </a>
    </div>
  );
}
