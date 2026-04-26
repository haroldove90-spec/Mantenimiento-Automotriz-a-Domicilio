import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const geminiService = {
  async analyzeServiceText(text: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extrae información de este texto de un cliente para un taller mecánico: "${text}". 
      Responde SOLO en JSON con este formato: 
      { "date": "YYYY-MM-DD", "time": "HH:mm", "serviceType": "string", "vehicleInfo": "string", "notes": "string" }`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async estimatePrice(serviceType: string, vehicleInfo: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Eres un experto mecánico. Sugiere un presupuesto estimado para el servicio "${serviceType}" para el vehículo "${vehicleInfo}". 
      Considera precios promedio de mercado para servicio a domicilio.
      Responde SOLO en JSON con este formato: 
      { "items": [{ "description": "string", "quantity": number, "price": number }], "total": number }`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '{}');
  },

  async getMaintenanceReminders(history: any[]) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analiza este historial de servicios: ${JSON.stringify(history)}. 
      Sugiere 3 recordatorios de mantenimiento preventivo.
      Responde SOLO en JSON con este formato: 
      { "reminders": ["string", "string", "string"] }`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text || '{}');
  }
};
