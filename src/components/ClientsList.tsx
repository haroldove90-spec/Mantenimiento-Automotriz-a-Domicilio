import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Phone, Mail, MapPin, ChevronRight, User } from 'lucide-react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'clients'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClients(docs);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark tracking-tight">Directorio de Clientes</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Gestión y búsqueda rápida</p>
        </div>
        <button className="bg-dark text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm text-sm">
          <Plus className="w-4 h-4" /> Agregar Cliente
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, placa o teléfono..."
          className="w-full bg-white border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.length > 0 ? (
          clients.map((client, i) => (
            <ClientCard key={i} client={client} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl">
            <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Sin clientes registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ClientCard({ client }: any) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-dark font-bold border border-gray-100 group-hover:bg-primary group-hover:text-white transition-colors">
          {client.name ? client.name[0] : <User className="w-4 h-4" />}
        </div>
        <button className="text-gray-300 hover:text-dark">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <h3 className="font-bold text-dark mb-1">{client.name || 'Cliente Nuevo'}</h3>
      <div className="space-y-2 mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Phone className="w-3.5 h-3.5 text-gray-400" /> {client.phone || 'N/A'}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {client.address || 'Ubicación no registrada'}
        </div>
      </div>
      
      <div className="mt-5 flex gap-2">
        <span className="text-[9px] uppercase font-bold tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">2 Vehículos</span>
        <span className="text-[9px] uppercase font-bold tracking-wider bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">Activo</span>
      </div>
    </motion.div>
  );
}
