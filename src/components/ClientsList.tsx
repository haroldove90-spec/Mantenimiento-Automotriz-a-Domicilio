import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, Phone, Mail, MapPin, ChevronRight, User, ArrowLeft, History, FileText, Calendar, Edit2, Save, Download, Trash2, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// import { db } from '../lib/firebase';
// import { collection, query, onSnapshot, orderBy, where, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { mockDb } from '../lib/mockData';
import { loadLogoToDoc } from '../lib/pdfUtils';

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [view, setView] = useState<'list' | 'details' | 'edit' | 'new'>('list');
  const [history, setHistory] = useState<{ appointments: any[], quotes: any[] }>({ appointments: [], quotes: [] });
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    address: '',
    vehicle_make: '',
    vehicle_model: ''
  });

  useEffect(() => {
    const fetch = async () => {
      const allClients = await mockDb.get('clients');
      setClients(allClients);
    };
    fetch();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mockDb.add('clients', newClient);
      const all = await mockDb.get('clients');
      setClients(all);
      setView('list');
      setNewClient({ name: '', phone: '', address: '', vehicle_make: '', vehicle_model: '' });
    } catch (error: any) {
      console.error("Error creating client:", error);
      let errorMsg = error.message || 'Intenta de nuevo';
      
      if (errorMsg.includes('column') || errorMsg.includes('schema cache')) {
        errorMsg += "\n\n⚠️ TIP: La base de datos no tiene las columnas necesarias. Ve a Configuración y usa el botón 'Copiar Script de Reparación SQL'.";
      }
      if (errorMsg.includes('duplicate key')) {
        errorMsg = "Este teléfono ya está registrado. \n\n⚠️ TIP: Ve a Configuración y presiona 'Copiar Script de Reparación SQL' para permitir teléfonos duplicados.";
      }
      
      alert(`Error al crear cliente: ${errorMsg}`);
    }
  };

  const fetchClientHistory = async (client: any) => {
    if (!client.phone) return;
    setLoadingHistory(true);
    try {
      const appts = await mockDb.query('appointments', 'phone', client.phone);
      const quotes = await mockDb.query('quotes', 'phone', client.phone);
      
      setHistory({
        appointments: appts,
        quotes: quotes
      });
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    fetchClientHistory(client);
    setView('details');
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    try {
      const { id, ...data } = selectedClient;
      await mockDb.update('clients', id, data);
      const all = await mockDb.get('clients');
      setClients(all);
      setView('details');
    } catch (error) {
      alert("Error al actualizar cliente");
    }
  };

  const handleDeleteClient = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de eliminar este cliente? Se borrará su historial de este catálogo (aunque las citas y presupuestos permanezcan en sus módulos).")) {
      try {
        await mockDb.delete('clients', id);
        const all = await mockDb.get('clients');
        setClients(all);
        if (selectedClient?.id === id) setView('list');
      } catch (error) {
        alert("Error al eliminar cliente");
      }
    }
  };

  const exportToPDF = async () => {
    if (!selectedClient) return;
    const doc = new jsPDF() as any;
    
    const settings = await mockDb.get('settings');
    const config = settings?.[0];
    
    if (config?.logo_url) {
      await loadLogoToDoc(doc, config.logo_url);
    }
    doc.text("Historial de Cliente", 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Cliente: ${selectedClient.name}`, 14, 32);
    doc.text(`Teléfono: ${selectedClient.phone}`, 14, 38);
    doc.text(`Dirección: ${selectedClient.address || 'N/A'}`, 14, 44);
    doc.text(`Vehículo: ${selectedClient.vehicle_make || selectedClient.vehicleMake} ${selectedClient.vehicle_model || selectedClient.vehicleModel}`, 14, 50);
    
    doc.setFontSize(14);
    doc.text("Presupuestos", 14, 65);
    
    const quoteData = history.quotes.map(q => [
      q.createdAt?.toDate ? q.createdAt.toDate().toLocaleDateString() : 'N/A',
      q.service_type || q.serviceType || 'Varios',
      `$${q.total || 0}`,
      q.status || 'N/A'
    ]);
    
    doc.autoTable({
      startY: 70,
      head: [['Fecha', 'Servicio', 'Total', 'Estado']],
      body: quoteData,
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text("Citas", 14, finalY);
    
    const apptData = history.appointments.map(a => [
      a.date || 'N/A',
      a.time || 'N/A',
      a.service_type || a.serviceType || 'Mantenimiento',
      a.notes || ''
    ]);
    
    doc.autoTable({
      startY: finalY + 5,
      head: [['Fecha', 'Hora', 'Servicio', 'Descripción']],
      body: apptData,
    });
    
    doc.save(`Historial_${selectedClient.name}.pdf`);
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) || 
    c.phone?.includes(search) ||
    c.vehicleMake?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <AnimatePresence mode="wait">
        {view === 'list' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-dark tracking-tight">Directorio de Clientes</h2>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Gestión y búsqueda rápida</p>
              </div>
              <button 
                onClick={() => setView('new')}
                className="bg-dark text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" /> Agregar Cliente
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre, placa o teléfono..."
                className="w-full bg-white border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none shadow-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.length > 0 ? (
                filteredClients.map((client, i) => (
                  <ClientCard 
                    key={client.id} 
                    client={client} 
                    onClick={() => handleSelectClient(client)} 
                    onDelete={(e) => handleDeleteClient(client.id, e)}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl">
                  <User className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Sin clientes coincidentes</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {view === 'details' && selectedClient && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="bg-dark p-6 text-white relative">
              <button 
                onClick={() => setView('list')}
                className="absolute left-6 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col items-center mt-4">
                <div className="w-20 h-20 bg-primary/20 backdrop-blur-md rounded-full flex items-center justify-center text-primary text-2xl font-bold mb-4 border-2 border-white/10">
                  {selectedClient.name[0]}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{selectedClient.name}</h2>
                <div className="flex gap-4 mt-2 text-gray-300 text-sm font-medium">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {selectedClient.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {selectedClient.address || 'Sin dirección'}</span>
                  <span className="flex items-center gap-1"><History className="w-3 h-3" /> Cliente desde {selectedClient.createdAt?.toDate ? selectedClient.createdAt.toDate().getFullYear() : '2024'}</span>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => setView('edit')}
                    className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    <Edit2 className="w-3 h-3" /> Editar Perfil
                  </button>
                  <button 
                    onClick={exportToPDF}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                  >
                    <Download className="w-3 h-3" /> Exportar PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 bg-gray-50/30">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Presupuestos Generados
                </h3>
                {loadingHistory ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map(n => <div key={n} className="h-24 bg-gray-100 rounded-xl" />)}
                  </div>
                ) : history.quotes.length > 0 ? (
                  <div className="space-y-3">
                    {history.quotes.map(q => (
                      <div key={q.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                        <div>
                          <p className="font-bold text-dark text-sm">{q.serviceType || 'Varios'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            {q.createdAt?.toDate ? q.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-dark text-sm">${q.total}</p>
                          <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded font-bold uppercase">{q.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No hay presupuestos previos.</p>
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Historial de Citas
                </h3>
                {loadingHistory ? (
                  <div className="animate-pulse space-y-4">
                    {[1, 2].map(n => <div key={n} className="h-24 bg-gray-100 rounded-xl" />)}
                  </div>
                ) : history.appointments.length > 0 ? (
                  <div className="space-y-3">
                    {history.appointments.map(a => (
                      <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 bg-gray-50 rounded-lg flex flex-col items-center justify-center border border-gray-100">
                          <p className="text-[9px] font-bold text-gray-400 uppercase">Día</p>
                          <p className="text-xs font-bold text-dark">{a.date?.split('-')[2] || '?'}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-dark text-sm">{a.serviceType || 'Mantenimiento'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{a.time || '--:--'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No hay citas previas.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'edit' && selectedClient && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden max-w-2xl mx-auto"
          >
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-dark">Editar Información</h3>
              <button onClick={() => setView('details')} className="text-gray-400 hover:text-dark transition-colors"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            
            <form onSubmit={handleUpdateClient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Nombre Completo</label>
                  <input 
                    value={selectedClient.name}
                    onChange={(e) => setSelectedClient({ ...selectedClient, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Teléfono (WhatsApp)</label>
                  <input 
                    value={selectedClient.phone}
                    onChange={(e) => setSelectedClient({ ...selectedClient, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Marca Vehículo</label>
                  <input 
                    value={selectedClient.vehicle_make || selectedClient.vehicleMake || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, vehicle_make: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Modelo Vehículo</label>
                  <input 
                    value={selectedClient.vehicle_model || selectedClient.vehicleModel || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, vehicle_model: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Dirección</label>
                  <input 
                    value={selectedClient.address || ''}
                    onChange={(e) => setSelectedClient({ ...selectedClient, address: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <button 
                  type="submit"
                  className="w-full bg-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md"
                >
                  <Save className="w-5 h-5 text-primary" /> Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {view === 'new' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden max-w-2xl mx-auto"
          >
            <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-bold text-dark">Nuevo Cliente</h3>
              <button onClick={() => setView('list')} className="text-gray-400 hover:text-dark transition-colors"><Plus className="w-5 h-5 rotate-45" /></button>
            </div>
            
            <form onSubmit={handleCreateClient} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Nombre Completo</label>
                  <input 
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Teléfono (WhatsApp)</label>
                  <input 
                    required
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                    placeholder="5512345678"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Marca Vehículo</label>
                  <input 
                    value={newClient.vehicle_make}
                    onChange={(e) => setNewClient({ ...newClient, vehicle_make: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                    placeholder="Toyota"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Modelo Vehículo</label>
                  <input 
                    value={newClient.vehicle_model}
                    onChange={(e) => setNewClient({ ...newClient, vehicle_model: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                    placeholder="Corolla"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Dirección</label>
                  <input 
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-1 focus:ring-dark outline-none"
                    placeholder="Calle 123, Col. Centro"
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-50">
                <button 
                  type="submit"
                  className="w-full bg-dark text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-md"
                >
                  <Save className="w-5 h-5 text-primary" /> Crear Cliente
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ClientCard({ client, onClick, onDelete }: { client: any, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden active:scale-95"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-dark font-bold border border-gray-100 group-hover:bg-dark group-hover:text-white group-hover:border-dark transition-all duration-300">
          {client.name ? client.name[0] : <User className="w-4 h-4" />}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
          <button 
            onClick={onDelete}
            className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-primary">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      <h3 className="font-bold text-dark mb-1 text-base">{client.name || 'Cliente Nuevo'}</h3>
      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-2">
        ALTA: {client.createdAt?.toDate ? client.createdAt.toDate().toLocaleDateString() : 'N/A'}
      </p>
      <div className="space-y-2.5 mt-2 pt-4 border-t border-gray-50 text-left">
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider truncate">
          <Phone className="w-3.5 h-3.5 text-primary" /> {client.phone || 'S/N'}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider truncate">
          <MapPin className="w-3.5 h-3.5 text-gray-400" /> {client.address || 'Sin dirección'}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider">
          <Car className="w-3.5 h-3.5 text-gray-400" /> {client.vehicle_make || client.vehicleMake} {client.vehicle_model || client.vehicleModel || ''}
        </div>
      </div>
      
      <div className="mt-5 pt-2 flex items-center justify-between">
        <span className="text-[8px] uppercase font-black tracking-[0.1em] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Automático</span>
        <span className="text-[10px] font-bold text-primary flex items-center gap-1 group-hover:underline underline-offset-4">
           Ver Historial
        </span>
      </div>
    </motion.div>
  );
}
