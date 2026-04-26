import React, { useState } from 'react';
import { Send, Bot, Sparkles, Plus, ClipboardCheck, MessageCircle, MessageSquareText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { formatWhatsAppLink } from '../lib/utils';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AiAdmin() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const result = await geminiService.analyzeServiceText(inputText);
      setAiResponse(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const saveCita = async () => {
    if (!aiResponse) return;
    try {
      await addDoc(collection(db, 'appointments'), {
        ...aiResponse,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      alert('Cita guardada correctamente');
      setAiResponse(null);
      setInputText('');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-dark p-8 rounded-xl text-white shadow-lg relative overflow-hidden">
        <Bot className="absolute -right-4 -bottom-4 w-48 h-48 opacity-10 rotate-12" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="uppercase tracking-widest text-[10px] font-bold text-gray-400">Inteligencia Artificial</span>
          </div>
          <h1 className="text-2xl font-bold mb-4 tracking-tight">Administrador Inteligente</h1>
          <p className="text-gray-400 text-sm font-medium max-w-xl leading-relaxed">
            Pega el mensaje de tu cliente aquí abajo. Analizaré la fecha, el vehículo y el servicio solicitado automáticamente.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <MessageSquareText className="w-3.5 h-3.5" /> Entrada de Texto
          </label>
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Ej: "Hola, soy Juan. Quisiera un cambio de aceite para mi Toyota Corolla 2015 el próximo martes a las 10am en mi oficina."'
            className="w-full h-48 p-4 rounded-lg bg-gray-50 border border-gray-100 focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm font-medium"
          />
          <button 
            disabled={loading}
            onClick={handleAnalyze}
            className="w-full bg-dark text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Sparkles className="w-4 h-4 text-primary" /> Analizar con IA</>}
          </button>
        </div>

        <div className="col-span-12 lg:col-span-6 space-y-6">
          <AnimatePresence>
            {aiResponse ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="bg-blue-50 text-primary p-2 rounded-lg">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-primary bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">Datos Extraídos</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Servicio</p>
                    <p className="text-sm font-bold text-dark">{aiResponse.serviceType || 'Not found'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Vehículo</p>
                    <p className="text-sm font-bold text-dark">{aiResponse.vehicleInfo || 'Not found'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fecha</p>
                    <p className="text-sm font-bold text-dark">{aiResponse.date || 'TBD'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hora</p>
                    <p className="text-sm font-bold text-dark">{aiResponse.time || 'TBD'}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Notas</p>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-600 font-medium leading-relaxed italic">"{aiResponse.notes || 'Sin notas adicionales'}"</p>
                  </div>
                </div>

                <button 
                  onClick={saveCita}
                  className="w-full bg-dark text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Confirmar Cita
                </button>
              </motion.div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-300 py-10 px-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                <Bot className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-xs font-bold uppercase tracking-widest leading-relaxed">Los resultados aparecerán aquí</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
