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
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, X, Phone, User as UserIcon, Car, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, getDocs, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { formatWhatsAppLink, getAppointmentReminder } from '../lib/utils';

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
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
    time: '09:00',
    notes: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'appointments'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay) return;
    setLoading(true);

    try {
      // 1. Create/Get Client (we'll just create a new one for now or store details)
      // For simplicity and following the user request closely, we'll store the strings
      // but ensure we meet the "Save/Show" requirement.
      
      // 1. Sync Client Data
      const clientQuery = query(collection(db, 'clients'), where('phone', '==', formData.phone));
      const clientSnap = await getDocs(clientQuery);
      
      const clientData = {
        name: formData.clientName,
        phone: formData.phone,
        vehicleMake: formData.make,
        vehicleModel: formData.model,
        address: formData.address,
        updatedAt: serverTimestamp()
      };

      if (clientSnap.empty) {
        await addDoc(collection(db, 'clients'), {
          ...clientData,
          createdAt: serverTimestamp()
        });
      } else {
        await updateDoc(doc(db, 'clients', clientSnap.docs[0].id), clientData);
      }

      const appointmentDate = new Date(selectedDay);
      const [hours, minutes] = formData.time.split(':');
      appointmentDate.setHours(parseInt(hours), parseInt(minutes));

      const newAppointment = {
        clientName: formData.clientName,
        phone: formData.phone,
        vehicleInfo: `${formData.make} ${formData.model}`,
        serviceType: formData.serviceType,
        address: formData.address,
        date: appointmentDate.toISOString(),
        time: formData.time,
        status: 'pending',
        notes: formData.notes,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'appointments'), newAppointment);

      // WhatsApp Confirmation
      const whatsappMsg = getAppointmentReminder(
        formData.clientName,
        format(appointmentDate, 'dd/MM/yyyy'),
        formData.time,
        formData.serviceType
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
        time: '09:00',
        notes: ''
      });
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Error al guardar la cita");
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
                      {app.serviceType}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-[9px] font-bold text-gray-400 px-1.5">
                      + {dayAppointments.length - 3} más
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
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Servicio</label>
                    <input 
                      required
                      value={formData.serviceType}
                      onChange={e => setFormData({...formData, serviceType: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 px-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                      placeholder="Cambio de aceite"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase">Hora</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                      <input 
                        type="time"
                        required
                        value={formData.time}
                        onChange={e => setFormData({...formData, time: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
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
                key={i} 
                className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-blue-50 px-2 py-0.5 rounded">
                    {app.time || '00:00'}
                  </span>
                  <button 
                    onClick={async () => {
                      if(confirm("¿Borrar cita?")) {
                        await deleteDoc(doc(db, 'appointments', app.id));
                      }
                    }}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h4 className="font-bold text-dark leading-tight mb-1">{app.serviceType}</h4>
                <p className="text-xs text-gray-500 mb-4 font-medium">{app.vehicleInfo}</p>
                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> 1h est.
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Oficina
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
    </div>
  );
}
