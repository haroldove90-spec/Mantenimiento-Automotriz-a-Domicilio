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
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import AppointmentCalendar from './components/Calendar';
import ClientsList from './components/ClientsList';
import Quotes from './components/Quotes';
import ServiceEvidence from './components/ServiceEvidence';
import ServiceCatalog from './components/ServiceCatalog';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user && false) { // Disable login check for direct access
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-surface p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center border border-gray-100"
        >
          <div className="bg-primary w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AutoDoc Home</h1>
          <p className="text-slate-500 mb-8">Administrador Inteligente para Taller a Domicilio</p>
          <button 
            onClick={handleLogin}
            className="w-full bg-dark text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            Iniciar Sesión con Google
          </button>
        </motion.div>
      </div>
    );
  }

  return (
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
                  <span className="font-bold text-lg text-white">A</span>
                </div>
                <span className="font-bold text-lg tracking-tight uppercase">AutoDoc</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              <NavItem icon={<ClipboardList />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
              <NavItem icon={<CalendarIcon />} label="Calendario" active={activeTab === 'calendar'} onClick={() => setActiveTab('calendar')} />
              <NavItem icon={<FileText />} label="Presupuestos" active={activeTab === 'quotes'} onClick={() => setActiveTab('quotes')} />
              <NavItem icon={<Wrench />} label="Servicios" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
              <NavItem icon={<Camera />} label="Evidencia" active={activeTab === 'evidence'} onClick={() => setActiveTab('evidence')} />
              <NavItem icon={<Users />} label="Clientes" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />
            </nav>

            <div className="p-6 border-t border-gray-800 mt-auto">
              <div className="flex items-center gap-3 mb-6">
                <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full bg-gray-700" />
                <div className="flex flex-col text-sm truncate">
                  <span className="font-semibold">{user.displayName}</span>
                  <span className="text-gray-500 text-xs truncate">{user.email}</span>
                </div>
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
              {activeTab === 'evidence' && <ServiceEvidence />}
              {activeTab === 'clients' && <ClientsList />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-primary text-white' 
          : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
    >
      {React.cloneElement(icon, { className: 'w-5 h-5' })}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
