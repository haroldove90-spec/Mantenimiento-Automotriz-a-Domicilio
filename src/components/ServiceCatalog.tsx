import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Wrench, Clock, DollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

export default function ServiceCatalog() {
  const [services, setServices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    estimatedDuration: '',
    category: 'Mantenimiento'
  });

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        basePrice: parseFloat(formData.basePrice as string),
        updatedAt: serverTimestamp()
      };

      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), data);
      } else {
        await addDoc(collection(db, 'services'), { ...data, createdAt: serverTimestamp() });
      }

      setShowForm(false);
      setEditingService(null);
      setFormData({ name: '', description: '', basePrice: '', estimatedDuration: '', category: 'Mantenimiento' });
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Error al guardar el servicio");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      basePrice: service.basePrice.toString(),
      estimatedDuration: service.estimatedDuration || '',
      category: service.category || 'Mantenimiento'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este servicio?")) {
      await deleteDoc(doc(db, 'services', id));
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark tracking-tight">Catálogo de Servicios</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Gestiona los servicios que ofrece tu taller</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setFormData({ name: '', description: '', basePrice: '', estimatedDuration: '', category: 'Mantenimiento' }); setShowForm(true); }}
          className="bg-dark text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm text-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Servicio
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar servicios..."
          className="w-full bg-white border border-gray-100 rounded-lg py-3 pl-10 pr-4 text-sm font-medium focus:ring-1 focus:ring-primary outline-none shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service, i) => (
          <motion.div 
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-2 rounded-lg text-primary">
                <Wrench className="w-5 h-5" />
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleEdit(service)} className="p-1.5 text-dark hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(service.id)} className="p-1.5 text-dark hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="font-bold text-dark mb-1">{service.name}</h3>
            <p className="text-xs text-gray-500 line-clamp-2 h-8 mb-4">{service.description}</p>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold uppercase">
                <Clock className="w-3.5 h-3.5" /> {service.estimatedDuration}
              </div>
              <div className="text-lg font-bold text-dark font-mono">
                ${service.basePrice.toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50">
                <h3 className="font-bold text-dark">{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-dark">×</button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre del Servicio</label>
                  <input 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Ej: Alineación y Balanceo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Descripción</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none h-24 resize-none"
                    placeholder="Detalles sobre el servicio..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Precio Base (MXN)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        required
                        type="number"
                        value={formData.basePrice}
                        onChange={e => setFormData({...formData, basePrice: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-8 pr-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Duración Est.</label>
                    <input 
                      value={formData.estimatedDuration}
                      onChange={e => setFormData({...formData, estimatedDuration: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Ej: 1 hr"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm"
                  >
                    Cancelar
                  </button>
                  <button 
                    disabled={loading}
                    type="submit"
                    className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-all text-sm shadow-sm"
                  >
                    {loading ? 'Guardando...' : 'Guardar Servicio'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
