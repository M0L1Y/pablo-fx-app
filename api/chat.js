import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());

// 1. Inicialización ultra segura del SDK oficial de Google
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

// 2. RUTA DE DIAGNÓSTICO (Para probar directamente en el navegador)
app.get('/api/chat', (req, res) => {
    if (!apiKey) {
        return res.status(500).json({ 
            status: "Error", 
            message: "La variable GEMINI_API_KEY no está configurada en Vercel." 
        });
    }
    return res.status(200).json({ 
        status: "OK", 
        message: "El servidor de la API está vivo y listo para recibir mensajes POST." 
    });
});

// 3. RUTA PRINCIPAL DEL CHAT
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "El mensaje está vacío" });
        }

        // Llamada usando la estructura del nuevo SDK
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: "Eres un psicólogo experto en salud mental, especializado en TDAH y ansiedad. Tu enfoque es empático, estructurado y libre de juicio. Ayuda al usuario a desahogarse y organiza sus ideas."
            }
        });

        // El nuevo SDK devuelve el texto directamente en response.text
        const respuestaIA = response.text || "No se generó texto.";
        return res.status(200).json({ reply: respuestaIA });

    } catch (error) {
        console.error("Error detallado en la API:", error);
        return res.status(500).json({ 
            error: "Error interno en el backend de Google AI", 
            message: error.message 
        });
    }
});

export default app;