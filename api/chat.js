const { GoogleGenerativeAI } = require('@google/generative-ai');

// Leemos la clave tal cual viene de Vercel sin alterar su estructura
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!apiKey) {
        return res.status(500).json({ reply: "Error: La clave GEMINI_API_KEY no está configurada en Vercel." });
    }

    if (req.method === 'GET') {
        return res.status(200).json({ status: "OK", message: "Servidor adaptado listo." });
    }

    if (req.method === 'POST') {
        try {
            const message = req.body && req.body.message;
            if (!message) {
                return res.status(400).json({ reply: "El mensaje llegó vacío al servidor." });
            }

            // Inicialización directa pasando la clave explícitamente en el cliente
            const ai = new GoogleGenerativeAI(apiKey);
            
            // Forzamos el uso del modelo con la configuración simplificada
            const model = ai.getGenerativeModel({ 
                model: 'gemini-1.5-flash'
            });

            // Agrupamos el contexto del sistema y el mensaje para evitar conflictos de autenticación
            const prompt = `System: Eres un psicólogo experto en salud mental, especializado en TDAH y ansiedad. Tu enfoque es empático, estructurado y libre de juicio. Ayuda al usuario a desahogarse y organiza sus ideas.\n\nUser: ${message}`;

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            
            const response = await result.response;
            const respuestaIA = response.text();

            return res.status(200).json({ reply: respuestaIA });

        } catch (error) {
            console.error("Error en la llamada de Gemini:", error);
            return res.status(500).json({ 
                reply: "Error de conexión con el servicio de Gemini.", 
                detalle: error.message 
            });
        }
    }

    return res.status(405).json({ reply: "Método no permitido" });
};