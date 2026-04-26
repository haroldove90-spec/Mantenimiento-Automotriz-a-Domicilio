import React, { useState, useRef } from 'react';
import { Camera, Send, CheckCircle, Trash2, MessageCircle, Share2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatWhatsAppLink, getServicePhotoMessage } from '../lib/utils';

export default function ServiceEvidence() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      setIsCapturing(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const data = canvasRef.current.toDataURL('image/jpeg');
        setPhotos([...photos, data]);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCapturing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-dark tracking-tight">Evidencia Fotográfica</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-1">Documentación visual del servicio</p>
        </div>
        {!isCapturing && (
          <button 
            onClick={startCamera}
            className="bg-dark text-white px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-sm text-sm"
          >
            <Camera className="w-4 h-4" /> Nueva Foto
          </button>
        )}
      </div>

      <AnimatePresence>
        {isCapturing && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] bg-dark flex flex-col items-center justify-center p-4"
          >
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl border border-gray-800" />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="flex gap-6 mt-8">
              <button 
                onClick={stopCamera}
                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-white/20"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={takePhoto}
                className="w-18 h-18 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dark flex items-center justify-center">
                  <div className="w-10 h-10 bg-dark rounded-full" />
                </div>
              </button>
              <div className="w-14" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos.map((photo, i) => (
          <motion.div 
            layoutId={`photo-${i}`}
            key={i} 
            className="aspect-square rounded-xl overflow-hidden relative group border border-gray-100 shadow-sm"
          >
            <img src={photo} alt={`Evidence ${i}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-dark/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))}
                className="p-2 bg-white/20 backdrop-blur-md rounded-lg text-white hover:bg-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {photos.length === 0 && !isCapturing && (
          <div className="col-span-full py-20 text-center bg-gray-50 border-2 border-dashed border-gray-100 rounded-xl">
            <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider">Sin fotos capturadas</p>
          </div>
        )}
      </div>

      {photos.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-lg font-bold text-dark tracking-tight">Fotos Listas</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{photos.length} fotos capturadas</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <button 
              onClick={() => window.open(formatWhatsAppLink('55', getServicePhotoMessage('Cliente')), '_blank')}
              className="flex-1 md:flex-none bg-dark text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all text-sm"
            >
              <MessageCircle className="w-5 h-5 text-primary" /> Enviar por WhatsApp
            </button>
             <button className="flex-1 md:flex-none bg-dark text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all text-sm">
              <CheckCircle className="w-5 h-5 text-gray-400" /> Finalizar Servicio
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
