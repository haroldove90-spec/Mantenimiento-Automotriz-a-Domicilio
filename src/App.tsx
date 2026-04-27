import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Car, 
  ClipboardList, 
  Camera, 
  Plus,
  Bell,
  Settings,
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
import PwaInstallBanner from './components/PwaInstallBanner';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    // No auth listener for now
    setLoading(false);
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

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-surface overflow-hidden font-sans text-dark">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-64 bg-dark text-white flex flex-col z-50 shrink-0"
          >
            <div className="p-6 border-bottom flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center">
                  <span className="font-bold text-lg text-dark">T</span>
                </div>
                <span className="font-bold text-lg tracking-tight uppercase">Tafer</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              <NavItem icon={<ClipboardList />} label="Resumen" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavItem icon={<CalendarIcon />} label="Calendario" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
              <NavItem icon={<FileText />} label="Presupuestos" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
              <NavItem icon={<Wrench />} label="Servicios" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
              <NavItem icon={<Camera />} label="Recepción de Autos" active={activeTab === 'reception'} onClick={() => setActiveTab('reception')} />
              <NavItem icon={<Users />} label="Directorio de Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
            </nav>

            <div className="p-6 border-t border-gray-800 mt-auto">
              <div className="flex items-center gap-3 mb-6">
                {user && (
                  <>
                    <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full bg-gray-700" />
                    <div className="flex flex-col text-sm truncate">
                      <span className="font-semibold">{user.displayName}</span>
                      <span className="text-gray-500 text-xs truncate">{user.email}</span>
                    </div>
                  </>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-gray-200 bg-white sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-semibold text-lg uppercase tracking-tight text-dark">{activeTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-dark transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'calendar' && <AppointmentCalendar />}
              {activeTab === 'quotes' && <Quotes />}
              {activeTab === 'services' && <ServiceCatalog />}
              {activeTab === 'reception' && <CarReception />}
              {activeTab === 'clients' && <ClientsList />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <PwaInstallBanner />
    </div>
    </ErrorBoundary>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-primary text-dark font-black' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
