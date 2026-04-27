import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, X, Phone, User as UserIcon, Car, Trash2, Download, Calendar as CalendarIcon, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatWhatsAppLink, getAppointmentReminder } from '../lib/utils';
import { mockDb } from '../lib/mockData';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { loadLogoToDoc } from '../lib/pdfUtils';

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    make: '',
    model: '',
    address: '',
    serviceType: '',
    date: new Date().toISOString().split('T')[0],
    hour: '09',
    minute: '00',
    period: 'AM',
    notes: ''
  });

  useEffect(() => {
    const fetch = async () => {
      const appointmentsData = await mockDb.get('appointments');
      const allServices = await mockDb.get('services');
      const settingsData = await mockDb.get('settings');
      setAppointments(appointmentsData);
      setServices(allServices);
      if (settingsData && settingsData.length > 0) setConfig(settingsData[0]);
    };
    fetch();
  }, []);

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    setLoading(true);

    try {
      // 1. Sync Client Data
      const clients = await mockDb.query('clients', 'phone', formData.phone);
      
      const clientData = {
        name: formData.clientName,
        phone: formData.phone,
        vehicle_make: formData.make,
        vehicle_model: formData.model,
        address: formData.address,
      };

      if (clients.length === 0) {
        await mockDb.add('clients', clientData);
      } else {
        await mockDb.update('clients', clients[0].id, clientData);
      }

      const timeString = `${formData.hour}:${formData.minute} ${formData.period}`;

      const newAppointment = {
        client_name: formData.clientName,
        phone: formData.phone,
        vehicle_info: `${formData.make} ${formData.model}`,
        service_type: formData.serviceType,
        address: formData.address,
        date: formData.date,
        time: timeString,
        status: 'pendiente',
        notes: formData.notes
      };

      await mockDb.add('appointments', newAppointment);

      // Refresh list
      const data = await mockDb.get('appointments');
      setAppointments(data);

      // WhatsApp Confirmation
      const whatsappMsg = getAppointmentReminder(
        formData.clientName,
        formData.date,
        timeString,
        formData.serviceType,
        `${formData.make} ${formData.model}`,
        formData.address
      );
      
      const waLink = formatWhatsAppLink(formData.phone, whatsappMsg);
      window.open(waLink, '_blank');

      setShowForm(false);
      setFormData({
        clientName: '',
        phone: '',
        make: '',
        model: '',
        address: '',
        serviceType: '',
        date: new Date().toISOString().split('T')[0],
        hour: '09',
        minute: '00',
        period: 'AM',
        notes: ''
      });
    } catch (error: any) {
      console.error("Error saving appointment:", error);
      let errorMsg = error.message || 'Verifica la consola para más detalles';
      
      if (errorMsg.includes('column') || errorMsg.includes('schema cache')) {
        errorMsg += "\n\n⚠️ TIP: La base de datos no tiene las columnas necesarias. Ve a Configuración y presiona 'Copiar Script de Reparación SQL', luego ejecútalo en Supabase.";
      }
      if (errorMsg.includes('duplicate key')) {
        errorMsg = "Ya existe un cliente con ese teléfono en la base de datos local de Supabase. \n\n⚠️ TIP: Ve a Configuración y presiona 'Copiar Script de Reparación SQL' para permitir teléfonos duplicados.";
      }
      
      alert(`Error al guardar: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const exportAllToPDF = async () => {
    const doc = new jsPDF() as any;
    
    let headerX = 14;
    let headerY = 20;

    if (config?.logo_url) {
      const logo: any = await loadLogoToDoc(doc, config.logo_url);
      if (logo) {
        headerX = 14 + logo.width + 5;
        headerY = 10 + (logo.height / 2) + 2;
      }
    }
    
    doc.setFontSize(20);
    doc.text(config?.app_name || "Tafer Servicios", headerX, headerY);
    doc.setFontSize(14);
    doc.text("Historial de Citas", headerX, headerY + 10);
    
    const data = appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(a => [
      a.date || 'N/A',
      a.time || 'N/A',
      a.client_name || a.clientName || 'N/A',
      a.vehicle_info || a.vehicleInfo || 'N/A',
      a.service_type || a.serviceType || 'N/A',
      a.status || 'pendiente'
    ]);
    
    autoTable(doc, {
      startY: Math.max(headerY + 25, 55),
      head: [['Fecha', 'Hora', 'Cliente', 'Vehículo', 'Servicio', 'Estado']],
      body: data,
      headStyles: { fillColor: config?.button_color || '#000000' }
    });
    
    doc.save(`Historial_Citas_${config?.app_name || 'Tafer'}.pdf`);
  };

  const handleResendWhatsApp = (app: any) => {
    const whatsappMsg = getAppointmentReminder(
      app.client_name || app.clientName,
      app.date,
      app.time,
      app.service_type || app.serviceType,
      app.vehicle_info || app.vehicleInfo,
      app.address
    );
    const waLink = formatWhatsAppLink(app.phone, whatsappMsg);
    window.open(waLink, '_blank');
  };

  const exportSingleToPDF = async (app: any) => {
    const doc = new jsPDF() as any;
    let headerX = 14;
    let headerY = 20;

    if (config?.logo_url) {
      const logo: any = await loadLogoToDoc(doc, config.logo_url);
      if (logo) {
        headerX = 14 + logo.width + 5;
        headerY = 10 + (logo.height / 2) + 2;
      }
    }
    doc.setFontSize(18);
    doc.text(config?.app_name || "Tafer Servicios", headerX, headerY);
    doc.setFontSize(14);
    doc.text("Comprobante de Cita", 14, Math.max(headerY + 20, 50));
    doc.setFontSize(10);
    const startY = Math.max(headerY + 30, 60);
    doc.text(`Cliente: ${app.client_name || app.clientName}`, 14, startY);
    doc.text(`WhatsApp: ${app.phone}`, 14, startY + 6);
    doc.text(`Vehículo: ${app.vehicle_info || app.vehicleInfo}`, 14, startY + 12);
    doc.text(`Servicio: ${app.service_type || app.serviceType}`, 14, startY + 18);
    doc.text(`Fecha: ${app.date}`, 14, startY + 24);
    doc.text(`Hora: ${app.time}`, 14, startY + 30);
    doc.text(`Notas: ${app.notes || 'N/A'}`, 14, startY + 36);
    doc.save(`Cita_${app.client_name || app.clientName}.pdf`);
  };

  const appointmentsForSelectedDay = appointments.filter(app => {
    if (!app.date) return false;
    return isSameDay(new Date(app.date), selectedDay || new Date());
  });

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
      <div className="col-span-12 lg:col-span-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-dark capitalize tracking-tight">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Gestión de Citas Programadas</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportAllToPDF}
              className="p-2 hover:bg-gray-50 rounded-lg transition-all border border-gray-100 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500"
            >
              <Download className="w-4 h-4 text-primary" /> Exportar Historial
            </button>
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 rounded-lg transition-all border border-gray-100">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-gray-50 rounded-lg transition-all border border-gray-100">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="bg-gray-50 py-3 text-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
              {day}
            </div>
          ))}
          {calendarDays.map((day, i) => {
            const dayAppointments = appointments.filter(app => app.date && isSameDay(new Date(app.date), day));
            const isClickable = isSameMonth(day, monthStart);
            const isSelected = selectedDay && isSameDay(day, selectedDay);

            return (
              <button
                key={day.toString()}
                onClick={() => isClickable && setSelectedDay(day)}
                className={`min-h-[100px] bg-white p-2 relative group transition-all text-left font-sans ${
                  !isClickable ? 'bg-gray-50/50 cursor-default opacity-30' : ''
                } ${isSelected ? 'ring-2 ring-inset ring-primary bg-blue-50/30' : 'hover:bg-gray-50'}`}
              >
                <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'bg-primary text-white px-2 py-0.5 rounded' : 'text-gray-600'}`}>
                  {format(day, 'd')}
                </span>
                <div className="mt-1 space-y-1 overflow-hidden">
                  {dayAppointments.slice(0, 2).map((app, idx) => (
                    <div key={idx} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-primary truncate leading-none">
                      {app.serviceType || app.service_type}
                    </div>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-[9px] font-bold text-gray-400 px-1.5">
                      + {dayAppointments.length - 2} más
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">
            {format(selectedDay || new Date(), 'd MMMM', { locale: es })}
          </h3>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-dark text-white p-2.5 rounded-lg hover:bg-gray-800 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-6 rounded-xl border border-primary shadow-lg space-y-4 mb-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-dark text-sm uppercase tracking-wider">Nueva Cita</h4>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-dark">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveAppointment} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Nombre Cliente</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input 
                        required
                        value={formData.clientName}
                        onChange={e => setFormData({...formData, clientName: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Juan Perez"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">WhatsApp</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input 
                        required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="5512345678"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Marca Auto</label>
                    <div className="relative">
                      <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input 
                        required
                        value={formData.make}
                        onChange={e => setFormData({...formData, make: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                        placeholder="Toyota"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Modelo/Submarca</label>
                    <input 
                      required
                      value={formData.model}
                      onChange={e => setFormData({...formData, model: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Corolla"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Domicilio del Cliente</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                    <input 
                      required
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Calle 123, Col. Centro"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Fecha</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input 
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Hora</label>
                    <div className="grid grid-cols-3 gap-1">
                      <select 
                        value={formData.hour}
                        onChange={e => setFormData({...formData, hour: e.target.value})}
                        className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs outline-none"
                      >
                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                      <select 
                        value={formData.minute}
                        onChange={e => setFormData({...formData, minute: e.target.value})}
                        className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs outline-none"
                      >
                        {['00', '15', '30', '45'].map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select 
                        value={formData.period}
                        onChange={e => setFormData({...formData, period: e.target.value})}
                        className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-xs outline-none"
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Servicio</label>
                  <select 
                    required
                    value={formData.serviceType}
                    onChange={e => {
                      setFormData({...formData, serviceType: e.target.value});
                    }}
                    className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="">Seleccionar servicio...</option>
                    {services.map(s => (
                      <option key={s.id} value={s.name}>{s.name} - ${s.base_price || s.basePrice || 0}</option>
                    ))}
                    <option value="Otro">Otro (especificar en notas)</option>
                  </select>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-dark text-white py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-gray-800 transition-all shadow-sm"
                >
                  {loading ? 'Guardando...' : 'Agendar y Notificar WhatsApp'}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          {appointmentsForSelectedDay.length > 0 ? (
            appointmentsForSelectedDay.map((app, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={app.id || i} 
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-blue-50 px-2 py-0.5 rounded">
                      {app.time || '00:00'}
                    </span>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleResendWhatsApp(app)}
                        className="p-1 text-gray-300 hover:text-green-500 transition-colors"
                        title="Reenviar WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => exportSingleToPDF(app)}
                        className="p-1 text-gray-300 hover:text-primary transition-colors"
                        title="Exportar PDF"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={async () => {
                          if(confirm("¿Borrar cita?")) {
                            await mockDb.delete('appointments', app.id);
                            const data = await mockDb.get('appointments');
                            setAppointments(data);
                          }
                        }}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                <h4 className="font-bold text-dark leading-tight mb-1">{app.service_type || app.serviceType}</h4>
                <p className="text-xs text-gray-500 mb-4 font-medium">{app.vehicle_info || app.vehicleInfo}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 1h est.
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-1 py-0.5 rounded">
                    <span className="font-black">ESTADO:</span> {app.status || 'pendiente'}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
              <Clock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm font-medium">No hay citas para este día</p>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-12 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-dark uppercase tracking-widest text-sm">Relación Completa de Citas</h3>
            <span className="text-[10px] bg-gray-100 px-3 py-1 rounded-full font-bold text-gray-500">{appointments.length} REGISTROS</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fecha / Hora</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Cliente</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vehículo</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Servicio</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estado</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-dark">{app.date}</div>
                      <div className="text-[10px] text-gray-400">{app.time}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs font-bold text-dark">{app.client_name || app.clientName}</div>
                      <div className="text-[10px] text-gray-400">{app.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500 font-medium">
                      {app.vehicle_info || app.vehicleInfo}
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase">
                        {app.service_type || app.serviceType}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select 
                        value={app.status || 'pendiente'}
                        onChange={async (e) => {
                          await mockDb.update('appointments', app.id, { status: e.target.value });
                          const data = await mockDb.get('appointments');
                          setAppointments(data);
                        }}
                        className="text-[10px] font-bold bg-transparent border-none focus:ring-0 cursor-pointer uppercase"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="completada">Completada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button onClick={() => exportSingleToPDF(app)} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-primary">
                          <Download size={14} />
                        </button>
                        <button onClick={() => handleResendWhatsApp(app)} className="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-green-500">
                          <Phone size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
