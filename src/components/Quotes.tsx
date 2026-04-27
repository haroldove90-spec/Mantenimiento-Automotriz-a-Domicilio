import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Send, Download, FileText, CheckCircle, MessageCircle, Search, Eye, Edit2, ChevronLeft, User, Phone, Car, Clock, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { formatWhatsAppLink } from '../lib/utils';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { mockDb } from '../lib/mockData';

export default function Quotes() {
  const [view, setView] = useState<'list' | 'form' | 'details'>('list');
  const [quotes, setQuotes] = useState<any[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  
  // Form State
  const [availableServices, setAvailableServices] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([{ description: '', quantity: 1, price: 0 }]);
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const allQuotes = await mockDb.get('quotes');
      const allServices = await mockDb.get('services');
      setQuotes(allQuotes);
      setAvailableServices(allServices);
    };
    fetch();
  }, []);

  const addServiceItem = (service: any) => {
    const newItem = { description: service.name, quantity: 1, price: (service.base_price || service.basePrice || 0) };
    if (items.length === 1 && items[0].description === '' && items[0].price === 0) {
      setItems([newItem]);
    } else {
      setItems([...items, newItem]);
    }
    if (!serviceType) setServiceType(service.name);
  };

  const resetForm = () => {
    setItems([{ description: '', quantity: 1, price: 0 }]);
    setClientName('');
    setPhone('');
    setAddress('');
    setVehicleMake('');
    setVehicleModel('');
    setServiceType('');
    setEditingId(null);
  };

  const addItem = () => setItems([...items, { description: '', quantity: 1, price: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleAiEstimate = async () => {
    if (!serviceType) return alert("Ingresa el servicio para estimar");
    setLoading(true);
    try {
      const result = await geminiService.estimatePrice(serviceType, `${vehicleMake} ${vehicleModel}`);
      setItems(result.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInvoice = async () => {
    if (!clientName || !phone) return alert("Nombre y teléfono son obligatorios");
    setLoading(true);
    try {
      // Sync Client Data
      const clients = await mockDb.query('clients', 'phone', phone);
      
      const clientData = {
        name: clientName,
        phone: phone,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        address: address,
      };

      if (clients.length === 0) {
        await mockDb.add('clients', clientData);
      } else {
        await mockDb.update('clients', clients[0].id, clientData);
      }

      const quoteData = {
        client_name: clientName,
        phone,
        address,
        vehicle_make: vehicleMake,
        vehicle_model: vehicleModel,
        service_type: serviceType,
        items,
        total: parseFloat(total.toString()),
        status: 'sent',
      };

      if (editingId) {
        await mockDb.update('quotes', editingId, quoteData);
      } else {
        await mockDb.add('quotes', quoteData);
      }

      // Refresh list
      const data = await mockDb.get('quotes');
      setQuotes(data);

      // Auto-send WhatsApp
      const message = `*Presupuesto Automotriz*\n\nHola ${clientName}, aquí tienes el presupuesto para tu ${vehicleMake} ${vehicleModel}:\n\n` + 
        items.map(i => `- ${i.description}: $${Number(i.price).toLocaleString()} x ${i.quantity}`).join('\n') + 
        `\n\n*TOTAL: $${total.toLocaleString()} MXN*\n\n¿Deseas agendar el servicio?`;
      
      const waLink = formatWhatsAppLink(phone, message);
      window.open(waLink, '_blank');

      setView('list');
      resetForm();
    } catch (error: any) {
      console.error("Error saving quote:", error);
      alert(`Error al guardar presupuesto: ${error.message || 'Error técnico'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (quote: any) => {
    setEditingId(quote.id);
    setClientName(quote.client_name || quote.clientName);
    setPhone(quote.phone);
    setAddress(quote.address || '');
    setVehicleMake(quote.vehicle_make || quote.vehicleMake);
    setVehicleModel(quote.vehicle_model || quote.vehicleModel);
    setServiceType(quote.service_type || quote.serviceType);
    setItems(quote.items);
    setView('form');
  };

  const handleResend = (quote: any) => {
    const message = `*Re-envío de Presupuesto*\n\nHola ${quote.client_name || quote.clientName}, te recordamos el presupuesto para tu ${quote.vehicle_make || quote.vehicleMake} ${quote.vehicle_model || quote.vehicleModel}:\n\n` + 
      quote.items.map((i: any) => `- ${i.description}: $${Number(i.price).toLocaleString()} x ${i.quantity}`).join('\n') + 
      `\n\n*TOTAL: $${quote.total?.toLocaleString()} MXN*\n\n¿Deseas agendar el servicio?`;
    
    const waLink = formatWhatsAppLink(quote.phone, message);
    window.open(waLink, '_blank');
  };

  const exportPDF = (quote: any) => {
    const doc = new jsPDF() as any;
    doc.setFontSize(20);
    doc.text("Presupuesto Automotriz", 14, 20);
    doc.setFontSize(10);
    doc.text(`Cliente: ${quote.client_name || quote.clientName}`, 14, 30);
    doc.text(`Vehículo: ${quote.vehicle_make || quote.vehicleMake} ${quote.vehicle_model || quote.vehicleModel}`, 14, 36);
    doc.text(`Servicio: ${quote.service_type || quote.serviceType}`, 14, 42);
    doc.text(`Fecha: ${quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}`, 14, 48);

    doc.autoTable({
      startY: 55,
      head: [['Descripción', 'Cant.', 'Precio', 'Subtotal']],
      body: quote.items.map((i: any) => [
        i.description,
        i.quantity,
        `$${i.price}`,
        `$${i.price * i.quantity}`
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.text(`TOTAL: $${quote.total} MXN`, 14, finalY);
    doc.save(`Presupuesto_${quote.client_name || quote.clientName}.pdf`);
  };

  const exportAllToPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(20);
    doc.text("Historial de Presupuestos", 14, 20);
    
    doc.autoTable({
      startY: 30,
      head: [['Fecha', 'Cliente', 'Vehículo', 'Servicio', 'Total']],
      body: quotes.map(q => [
        q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'N/A',
        q.client_name || q.clientName,
        `${q.vehicle_make || q.vehicleMake} ${q.vehicle_model || q.vehicleModel}`,
        q.service_type || q.serviceType,
        `$${q.total}`
      ]),
    });
    doc.save("Historial_Presupuestos.pdf");
  };

  if (view === 'form') {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        <div className="flex items-center gap-4">
          <button onClick={() => { setView('list'); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-dark tracking-tight">{editingId ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}</h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Completa los datos para el cliente</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre del Cliente</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Juan Pérez"
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="5512345678"
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Marca Vehículo</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        value={vehicleMake}
                        onChange={(e) => setVehicleMake(e.target.value)}
                        placeholder="Toyota"
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Submarca/Modelo</label>
                    <input 
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                      placeholder="Corolla"
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Domicilio del Cliente</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle 123, Col. Centro"
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-3 pl-10 pr-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Servicio / Motivo</label>
                <div className="flex gap-2">
                  <input 
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="Ej: Cambio de Frenos o Afinación Mayor"
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm font-medium focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button 
                    onClick={handleAiEstimate}
                    disabled={loading}
                    className="bg-primary/10 text-primary px-4 rounded-lg font-bold hover:bg-primary/20 transition-all text-xs uppercase"
                  >
                    Sugerir IA
                  </button>
                </div>
              </div>

              {availableServices.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Seleccionar del Catálogo</label>
                  <div className="flex flex-wrap gap-2">
                    {availableServices.map(s => (
                      <button 
                        key={s.id}
                        onClick={() => addServiceItem(s)}
                        className="text-[10px] bg-gray-50 border border-gray-100 hover:border-primary hover:text-primary px-2 py-1 rounded transition-colors"
                      >
                        + {s.name} (${s.basePrice})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-gray-50 pt-6">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <th className="pb-4 px-2">Descripción</th>
                      <th className="pb-4 px-2 w-20">Cant.</th>
                      <th className="pb-4 px-2 w-32">Precio</th>
                      <th className="pb-4 px-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {items.map((item, i) => (
                      <tr key={i} className="group">
                        <td className="py-3 px-2">
                          <input 
                            value={item.description}
                            onChange={(e) => updateItem(i, 'description', e.target.value)}
                            className="w-full bg-transparent border-none rounded-lg p-1 text-sm focus:ring-1 focus:ring-primary outline-none"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input 
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                            className="w-full bg-transparent border-none rounded-lg p-1 text-sm text-center font-mono focus:ring-1 focus:ring-primary outline-none"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input 
                            type="number"
                            value={item.price}
                            onChange={(e) => updateItem(i, 'price', Number(e.target.value))}
                            className="w-full bg-transparent border-none rounded-lg p-1 text-sm text-right font-mono focus:ring-1 focus:ring-primary outline-none"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={addItem} className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-primary hover:underline uppercase tracking-wider">
                  <Plus className="w-3.5 h-3.5" /> Agregar Línea
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-6 font-sans">Resumen del Presupuesto</h4>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 text-sm font-medium">
                  <span>Subtotal</span>
                  <span className="font-mono">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-500 text-sm font-medium">
                  <span>IVA (0%)</span>
                  <span className="font-mono">$0.00</span>
                </div>
                <div className="h-px bg-gray-50"></div>
                <div className="flex justify-between text-dark font-bold text-xl tracking-tight">
                  <span>TOTAL</span>
                  <span className="font-mono">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleSaveInvoice}
                  disabled={loading}
                  className="w-full bg-dark text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-sm text-sm"
                >
                  <MessageCircle className="w-5 h-5 text-primary" /> {loading ? 'Procesando...' : 'Guardar en Historial y Enviar WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark tracking-tight">Historial de Presupuestos</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Consulta y gestiona tus cotizaciones</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportAllToPDF}
            className="border border-gray-100 bg-white text-dark px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-50 transition-all shadow-sm text-sm"
          >
            <Download className="w-4 h-4 text-primary" /> Exportar Historial
          </button>
          <button 
            onClick={() => { resetForm(); setView('form'); }}
            className="bg-dark text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" /> Crear Presupuesto
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans">
            <thead>
              <tr className="bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <th className="py-3 px-6">Cliente / Vehículo</th>
                <th className="py-3 px-6">Servicio</th>
                <th className="py-3 px-6">Total</th>
                <th className="py-3 px-6">Fecha</th>
                <th className="py-3 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-dark">{quote.client_name || quote.clientName}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase">{quote.vehicle_make || quote.vehicleMake} {quote.vehicle_model || quote.vehicleModel}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">
                      {quote.service_type || quote.serviceType || 'General'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-dark font-mono">${(quote.total || 0).toLocaleString()} MXN</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-400 font-bold uppercase">
                    {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                       <button 
                        onClick={() => exportPDF(quote)}
                        className="p-2 text-dark hover:text-primary transition-colors"
                        title="Exportar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                       <button 
                        onClick={() => handleResend(quote)}
                        className="p-2 text-dark hover:text-green-600 transition-colors"
                        title="Reenviar WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(quote)}
                        className="p-2 text-dark hover:text-primary transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async () => {
                          if(confirm("¿Borrar presupuesto?")) {
                            await mockDb.delete('quotes', quote.id);
                            const data = await mockDb.get('quotes');
                            setQuotes(data);
                          }
                        }}
                        className="p-2 text-dark hover:text-red-500 transition-colors"
                        title="Borrar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {quotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <FileText className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center">No hay presupuestos generados aún</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

