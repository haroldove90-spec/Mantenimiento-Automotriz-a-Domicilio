import React, { useState, useEffect } from 'react';
import { Download, X, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Wait a few seconds to show
      setTimeout(() => setShowBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-6 right-6 z-[200] max-w-sm mx-auto"
        >
          <div className="bg-dark text-white p-6 rounded-2xl shadow-2xl border border-primary/20 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary opacity-10 rounded-full blur-2xl"></div>
            
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 animate-bounce">
                <Star className="text-dark w-8 h-8 fill-dark" />
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-1">¡Instala Tafer Servicios!</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  Accede más rápido desde tu pantalla de inicio y gestiona tu taller sin distracciones.
                </p>
                
                <button 
                  onClick={handleInstall}
                  className="w-full bg-primary text-dark py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"
                >
                  <Download className="w-4 h-4" /> Instalar en el Dispositivo
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
