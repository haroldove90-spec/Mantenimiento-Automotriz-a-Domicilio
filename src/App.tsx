import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Car, 
  ClipboardList, 
  Camera, 
  Plus,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  Search,
  Menu,
  X,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Wrench
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
// Firebase temporarily disabled
// import { auth, db } from './lib/firebase';
// import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import AppointmentCalendar from './components/Calendar';
import ClientsList from './components/ClientsList';
import Quotes from './components/Quotes';
import CarReception from './components/CarReception';
import ServiceCatalog from './components/ServiceCatalog';
import Settings from './components/Settings';
import PwaInstallBanner from './components/PwaInstallBanner';
import { mockDb } from './lib/mockData';

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="p-8 text-center"><h1>Algo salió mal. Por favor recarga la página.</h1></div>;
    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>({
    displayName: 'Administrador',
    email: 'admin@autodoc.com',
    photoURL: 'https://ui-avatars.com/api/?name=Admin&background=0284c7&color=fff'
  });
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      const data = await mockDb.get('settings');
      if (data && data.length > 0) {
        setConfig(data[0]);
      }
    };
    fetchConfig();
  }, []);

  const handleLogin = async () => {
    // Simple mock login
    setUser({
      displayName: 'Administrador',
      email: 'admin@autodoc.com',
      photoURL: 'https://ui-avatars.com/api/?name=Admin&background=0284c7&color=fff'
    });
  };

  const handleLogout = () => setUser(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && false) { // Disable login check for direct access
    return null; // Should not happen with mock user, but ensuring no leak
  }

  const navColor = config?.nav_color || '#000000';

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-surface overflow-hidden font-sans text-dark relative flex-col lg:flex-row">
      {/* Mobile Nav Bar */}
      <div 
        className="lg:hidden h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 flex items-center justify-between z-50 sticky top-0"
      >
        <div className="flex items-center gap-2">
           <img 
               src={config?.logo_url || "https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png"} 
               alt="Logo" 
               className="object-contain" 
               style={{ height: config?.logo_size ? Math.min(config.logo_size, 40) : 32, width: 'auto' }}
             />
          {config?.show_app_name !== false && (
            <span className="font-black text-xs tracking-tighter uppercase">{config?.app_name || "TAFER"}</span>
          )}
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-50 rounded-lg">
          <Menu className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-dark/20 backdrop-blur-[2px] z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 z-[70] shadow-2xl lg:hidden"
              style={{ backgroundColor: navColor }}
            >
              <SidebarContent 
                activeTab={activeTab} 
                setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} 
                user={user} 
                handleLogout={handleLogout}
                onClose={() => setIsSidebarOpen(false)}
                config={config}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - More subtle persistent style */}
      <aside 
        className="hidden lg:flex w-72 flex-col z-50 shrink-0 sticky top-0 h-screen border-r border-gray-100 shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)]"
        style={{ backgroundColor: navColor }}
      >
        <SidebarContent 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          handleLogout={handleLogout}
          config={config}
        />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative h-screen overflow-hidden">
        <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-sm uppercase tracking-[0.2em] text-gray-400">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="bg-gray-50 border-none rounded-xl py-2 pl-10 pr-4 text-xs w-64 focus:ring-1 focus:ring-gray-100 transition-all outline-none"
              />
            </div>
            <button className="relative p-2 text-gray-400 hover:text-dark transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'calendar' && <AppointmentCalendar />}
              {activeTab === 'quotes' && <Quotes />}
              {activeTab === 'services' && <ServiceCatalog />}
              {activeTab === 'reception' && <CarReception />}
              {activeTab === 'clients' && <ClientsList />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <PwaInstallBanner />
    </div>
    </ErrorBoundary>
  );
}

interface SidebarContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  handleLogout: () => void;
  onClose?: () => void;
  config?: any;
}

function SidebarContent({ activeTab, setActiveTab, user, handleLogout, onClose, config }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full text-white">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img 
            src={config?.logo_url || "https://cdn.pixabay.com/photo/2016/04/01/09/23/car-1299321_1280.png"} 
            alt="Logo" 
            className="object-contain" 
            style={{ height: config?.logo_size || 40, width: 'auto' }}
          />
          {config?.show_app_name !== false && (
            <span className="font-black text-xl tracking-tighter uppercase">{config?.app_name || "TAFER"}</span>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
            <X className="w-5 h-5 text-white/50" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <NavItem icon={<ClipboardList />} label="Resumen" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <NavItem icon={<CalendarIcon />} label="Calendario" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
        <NavItem icon={<FileText />} label="Presupuestos" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
        <NavItem icon={<Wrench />} label="Servicios" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
        <NavItem icon={<Camera />} label="Recepción de Autos" active={activeTab === 'reception'} onClick={() => setActiveTab('reception')} />
        <NavItem icon={<Users />} label="Directorio de Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
        <NavItem icon={<SettingsIcon />} label="Configuración" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </nav>

      <div className="p-6 mt-auto border-t border-white/5">
        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl mb-6">
          {user && (
            <>
              <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-xl bg-white/10" />
              <div className="flex flex-col text-sm truncate min-w-0">
                <span className="font-bold truncate">{user.displayName}</span>
                <span className="text-white/40 text-[10px] truncate">{user.email}</span>
              </div>
            </>
          )}
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 py-3 rounded-xl"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-dark text-white font-black shadow-lg shadow-black/20' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
