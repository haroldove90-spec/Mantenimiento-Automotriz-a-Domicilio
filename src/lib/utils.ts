export const formatWhatsAppLink = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const getMaintenanceMessage = (clientName: string, vehicle: string, service: string) => {
  return `Hola ${clientName}, de AutoDoc Home. 🚗💨 Tu ${vehicle} necesita pronto: ${service}. ¿Te gustaría agendar una cita para esta semana?`;
};

export const getAppointmentReminder = (clientName: string, date: string, time: string, service: string) => {
  return `Hola ${clientName}, recordatorio de tu cita con AutoDoc Home para el día ${date} a las ${time} para el servicio de ${service}. Por favor confirma si estarás disponible. 👍`;
};

export const getServicePhotoMessage = (clientName: string) => {
  return `Hola ${clientName}, el servicio ha terminado. Te adjunto las fotografías de evidencia del trabajo realizado. ¡Gracias por confiar en AutoDoc Home! ✨`;
};
