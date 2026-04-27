export const formatWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const getMaintenanceMessage = (clientName: string, vehicle: string, service: string) => {
  return `Hola ${clientName}, de AutoDoc Home. 🚗💨 Tu ${vehicle} necesita pronto: ${service}. ¿Te gustaría agendar una cita para esta semana?`;
};

export const getAppointmentReminder = (clientName: string, date: string, time: string, service: string, vehicle?: string, address?: string) => {
  return `🛠️ *RECORDATORIO DE SERVICIO*\n\n` +
    `Hola *${clientName}*,\n` +
    `Te enviamos los detalles de tu próximo servicio:\n\n` +
    `📅 *Fecha:* ${date}\n` +
    `⏰ *Hora:* ${time}\n` +
    `🚗 *Vehículo:* ${vehicle || 'Registrado'}\n` +
    `🔧 *Servicio:* ${service}\n` +
    `📍 *Ubicación:* ${address || 'Taller'}\n\n` +
    `Por favor confirma de recibido. ¡Estamos a tus órdenes! 🏁`;
};

export const getServicePhotoMessage = (clientName: string) => {
  return `Hola ${clientName}, el servicio ha terminado. Te adjunto las fotografías de evidencia del trabajo realizado. ¡Gracias por confiar en AutoDoc Home! ✨`;
};
