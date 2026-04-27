
// Simple Local Storage based persistence for "No Firebase" mode
const getStore = (key: string) => JSON.parse(localStorage.getItem(`autodoc_${key}`) || '[]');
const setStore = (key: string, data: any) => localStorage.setItem(`autodoc_${key}`, JSON.stringify(data));

export const mockDb = {
  get: (collection: string) => getStore(collection),
  
  add: (collection: string, data: any) => {
    const items = getStore(collection);
    const newItem = { 
      id: Math.random().toString(36).substr(2, 9), 
      createdAt: { toDate: () => new Date() },
      ...data 
    };
    setStore(collection, [...items, newItem]);
    return newItem;
  },
  
  update: (collection: string, id: string, data: any) => {
    const items = getStore(collection);
    const updated = items.map((item: any) => item.id === id ? { ...item, ...data } : item);
    setStore(collection, updated);
  },
  
  delete: (collection: string, id: string) => {
    const items = getStore(collection);
    setStore(collection, items.filter((item: any) => item.id !== id));
  },

  query: (collection: string, field: string, value: any) => {
    return getStore(collection).filter((item: any) => item[field] === value);
  }
};

// Initial data if empty
if (getStore('clients').length === 0) {
  setStore('clients', [
    { id: '1', name: 'Carlos Mendoza', phone: '5512345678', address: 'Av. Reforma 12', vehicleMake: 'Audi', vehicleModel: 'A3', createdAt: { toDate: () => new Date() } },
    { id: '2', name: 'Lucia Ferreyra', phone: '5587654321', address: 'Calle 50 No. 23', vehicleMake: 'Mazda', vehicleModel: 'CX-5', createdAt: { toDate: () => new Date() } }
  ]);
}

if (getStore('services').length === 0) {
  setStore('services', [
    { id: '1', name: 'Cambio de Aceite', description: 'Cambio de aceite sintético y filtro', basePrice: 1200, estimatedDuration: '45 min', category: 'Mantenimiento' },
    { id: '2', name: 'Revisión de Frenos', description: 'Limpieza y ajuste de frenos traseros y delanteros', basePrice: 850, estimatedDuration: '1 hr', category: 'Seguridad' },
    { id: '3', name: 'Escaneo Computarizado', description: 'Diagnóstico de códigos de falla OBD2', basePrice: 500, estimatedDuration: '30 min', category: 'Diagnóstico' }
  ]);
}
