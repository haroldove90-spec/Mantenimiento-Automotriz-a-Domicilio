import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ChevronRight, 
  Car, 
  Bell, 
  Sparkles, 
  MessageCircle,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
// import { db } from '../lib/firebase';
// import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { mockDb } from '../lib/mockData';
import { geminiService } from '../services/geminiService';
import { formatWhatsAppLink, getMaintenanceMessage } from '../lib/utils';

export default function ServiceHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const data = await mockDb.get('receptions');
      const finished = data.filter((r: any) => r.status === 'terminado');
      setHistory(finished || []);
    };
    fetch();
  }, []);

  const handleGetReminders = async () => {
    setLoadingReminders(true);
    try {
      // If history is empty, use mock history for demo
      const dataToAnalyze = history.length > 0 ? history : [
        { vehicle: 'Toyota RAV4', service: 'Cambio de aceite', completedAt: '2025-10-01' },
      ];
      const result = await geminiService.getMaintenanceReminders(dataToAnalyze);
      setReminders(result.reminders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingReminders(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark tracking-tight">Historial de Servicios</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Registro completo automotriz</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text" 
                placeholder="Buscar por placa, cliente o auto..." 
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-3 px-6">Fecha</th>
                  <th className="py-3 px-6">Vehículo / Cliente</th>
                  <th className="py-3 px-6">Servicio</th>
                  <th className="py-3 px-6">Estado</th>
                  <th className="py-3 px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {history.length > 0 ? (
                  history.map((record, i) => (
                    <HistoryRow key={i} record={record} />
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                      Sin registros históricos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-dark p-6 rounded-xl shadow-lg text-white">
             <div className="flex items-center gap-2 mb-6">
               <Sparkles className="text-primary w-5 h-5" />
               <h3 className="font-bold text-lg tracking-tight">IA Predictiva</h3>
             </div>
             
             <button 
               onClick={handleGetReminders}
               disabled={loadingReminders}
               className="w-full bg-primary hover:bg-blue-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all mb-6 text-sm"
             >
               {loadingReminders ? 'Analizando...' : 'Generar Alertas'}
             </button>

             <div className="space-y-4">
               {reminders.map((reminder, i) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   key={i} 
                   className="bg-white/5 border border-white/10 rounded-lg p-4 group hover:bg-white/10 transition-all"
                 >
                   <p className="text-[13px] text-gray-300 leading-relaxed mb-3">{reminder}</p>
                   <button 
                     onClick={() => window.open(formatWhatsAppLink('55', getMaintenanceMessage('Cliente', 'Vehículo', reminder)), '_blank')}
                     className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider transition-opacity"
                   >
                     <MessageCircle className="w-3.5 h-3.5" /> Enviar Recordatorio
                   </button>
                 </motion.div>
               ))}
               {reminders.length === 0 && (
                 <div className="text-center py-10">
                   <Clock className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                   <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                     Analiza el historial para sugerir mantenimientos
                   </p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ record }: any) {
  return (
    <tr className="hover:bg-gray-50 transition-colors cursor-pointer">
      <td className="py-4 px-6 text-xs font-mono font-bold text-gray-400">
        {record.completedAt || 'N/A'}
      </td>
      <td className="py-4 px-6">
        <p className="text-sm font-bold text-dark">{record.vehicleInfo || 'Sedán'}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cliente General</p>
      </td>
      <td className="py-4 px-6">
        <span className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
          {record.serviceType || 'Mantenimiento'}
        </span>
      </td>
      <td className="py-4 px-6">
        <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px] uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" /> Completado
        </div>
      </td>
      <td className="py-4 px-6 text-right">
        <ChevronRight className="w-4 h-4 text-gray-300 inline" />
      </td>
    </tr>
  );
}
