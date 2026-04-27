import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Trash2, CheckCircle, Clock, X, User as UserIcon, Car, MapPin, Search, Download, FileText, ImageIcon, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { mockDb } from '../lib/mockData';
import { jsPDF } from 'jspdf';

export default function CarReception() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [services, setServices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    vehicleMake: '',
    vehicleModel: '',
    serviceType: '',
    status: 'en proceso',
    date: new Date().toISOString().split('T')[0],
    photos: [] as string[]
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetch = async () => {
      const receptions = await mockDb.get('receptions');
      const clientsList = await mockDb.get('clients');
      setServices(receptions || []);
      setClients(clientsList || []);
    };
    fetch();
  }, []);

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData({
        ...formData,
        clientId: client.id,
        clientName: client.name,
        vehicleMake: client.vehicleMake || '',
        vehicleModel: client.vehicleModel || ''
      });
    }
  };

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Error cam", err);
      setIsCapturing(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        setFormData({ ...formData, photos: [...formData.photos, data] });
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCapturing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newService = {
        client_id: formData.clientId || null,
        client_name: formData.clientName,
        vehicle_make: formData.vehicleMake,
        vehicle_model: formData.vehicleModel,
        service_type: formData.serviceType,
        status: formData.status,
        date: formData.date,
        photos: formData.photos,
      };
      await mockDb.add('receptions', newService);
      const data = await mockDb.get('receptions');
      setServices(data);
      setView('list');
      resetForm();
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      vehicleMake: '',
      vehicleModel: '',
      serviceType: '',
      status: 'en proceso',
      date: new Date().toISOString().split('T')[0],
      photos: []
    });
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await mockDb.update('receptions', id, { status: newStatus });
    const data = await mockDb.get('receptions');
    setServices(data);
  };

  const exportPDF = (service: any) => {
    const doc = new jsPDF() as any;
    doc.setFontSize(20);
    doc.text("Recepción de Vehículo", 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Cliente: ${service.clientName}`, 14, 30);
    doc.text(`Vehículo: ${service.vehicleMake} ${service.vehicleModel}`, 14, 36);
    doc.text(`Servicio: ${service.serviceType}`, 14, 42);
    doc.text(`Fecha: ${service.date}`, 14, 48);
    doc.text(`Estatus: ${service.status}`, 14, 54);

    if (service.photos && service.photos.length > 0) {
      doc.text("Evidencias:", 14, 65);
      let y = 70;
      service.photos.forEach((photo: string, index: number) => {
        if (y > 220) { doc.addPage(); y = 20; }
        doc.addImage(photo, 'JPEG', 14, y, 50, 40);
        y += 45;
      });
    }
    
    doc.save(`Recepcion_${service.clientName}_${service.date}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark tracking-tight">Recepción de Autos</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Gestión de entrada y evidencias</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('form')}
            className="bg-dark text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Nueva Recepción
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'form' ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-2xl mx-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-dark">Formulario de Ingreso</h3>
              <button onClick={() => setView('list')} className="text-gray-400 hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Cliente Registrado</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm focus:ring-1 focus:ring-dark outline-none"
                  value={formData.clientId}
                  onChange={(e) => handleClientSelect(e.target.value)}
                >
                  <option value="">Selecciona un cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {!formData.clientId && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre del Cliente (Nuevo)</label>
                  <input 
                    required
                    value={formData.clientName}
                    onChange={e => setFormData({...formData, clientName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Marca</label>
                  <input 
                    required
                    value={formData.vehicleMake}
                    onChange={e => setFormData({...formData, vehicleMake: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Modelo/Submarca</label>
                  <input 
                    required
                    value={formData.vehicleModel}
                    onChange={e => setFormData({...formData, vehicleModel: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Tipo de Servicio</label>
                  <input 
                    required
                    value={formData.serviceType}
                    onChange={e => setFormData({...formData, serviceType: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha</label>
                  <input 
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2.5 px-4 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Evidencia Fotográfica ({formData.photos.length})</label>
                  <button 
                    type="button"
                    onClick={startCamera}
                    className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3 h-3" /> Tomar Foto
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {formData.photos.map((p, i) => (
                    <div key={i} className="aspect-square rounded-lg border border-gray-100 overflow-hidden relative group">
                      <img src={p} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, photos: formData.photos.filter((_, idx) => idx !== i)})}
                        className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-dark text-white py-3 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-gray-800 transition-all shadow-md"
              >
                {loading ? 'Guardando...' : 'Registrar Ingreso'}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
               <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="py-3 px-6">Auto / Cliente</th>
                      <th className="py-3 px-6">Servicio</th>
                      <th className="py-3 px-6">Estatus</th>
                      <th className="py-3 px-6">Fecha</th>
                      <th className="py-3 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {services.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="py-4 px-6 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-dark font-bold border border-gray-100 group-hover:bg-dark group-hover:text-white transition-all">
                              {s.vehicleMake[0]}
                            </div>
                            <div>
                              <p className="font-bold text-dark">{s.vehicleMake} {s.vehicleModel}</p>
                              <p className="text-[10px] text-gray-400 font-bold uppercase">{s.clientName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           <span className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                            {s.serviceType}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <select 
                            value={s.status}
                            onChange={(e) => updateStatus(s.id, e.target.value)}
                            className={`text-[10px] font-bold uppercase tracking-wider border-none rounded px-2 py-1 outline-none ${
                              s.status === 'en proceso' ? 'bg-blue-50 text-blue-600' :
                              s.status === 'terminado' ? 'bg-green-50 text-green-600' :
                              'bg-red-50 text-red-600'
                            }`}
                          >
                            <option value="en proceso">En Proceso</option>
                            <option value="terminado">Terminado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="py-4 px-6 text-xs text-gray-400 font-bold uppercase">
                          {s.date}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                             <button 
                                onClick={() => exportPDF(s)}
                                className="p-2 text-dark hover:text-primary transition-colors"
                                title="Exportar PDF con Evidencias"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                             <button 
                                onClick={async () => { if(confirm("¿Borrar?")) { await mockDb.delete('receptions', s.id); const data = await mockDb.get('receptions'); setServices(data); } }}
                                className="p-2 text-dark hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {services.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Car className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">No hay recepciones activas</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-dark/95 flex flex-col items-center justify-center p-4"
          >
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex gap-8 mt-10">
              <button 
                onClick={stopCamera}
                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={takePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 rounded-full border-2 border-dark flex items-center justify-center">
                  <div className="w-12 h-12 bg-dark rounded-full shadow-inner" />
                </div>
              </button>
              <div className="w-14" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
