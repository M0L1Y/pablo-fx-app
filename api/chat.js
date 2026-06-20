const { GoogleGenerativeAI } = require('@google/generative-ai');

// Forzar la lectura limpia de la clave de entorno
const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    if (!apiKey) {
        return res.status(500).json({ reply: "Error: La clave GEMINI_API_KEY no está configurada o llegó vacía a Vercel." });
    }

    if (req.method === 'GET') {
        return res.status(200).json({ status: "OK", message: "Servidor clásico respondiendo." });
    }

    if (req.method === 'POST') {
        try {
            const message = req.body && req.body.message;
            if (!message) {
                return res.status(400).json({ reply: "El mensaje llegó vacío al servidor." });
            }

            // Inicialización limpia
            const ai = new GoogleGenerativeAI(apiKey);
            
            // Usamos la configuración estándar recomendada para gemini-1.5-flash
            const model = ai.getGenerativeModel({ 
                model: 'gemini-1.5-flash'
            });

            // Pasar la instrucción del sistema y el mensaje en la misma petición para evitar bloqueos
            const prompt = `System: Eres un psicólogo experto en salud mental, especializado en TDAH y ansiedad. Tu enfoque es empático, estructurado y libre de juicio. Ayuda al usuario a desahogarse y organiza sus ideas.\n\nUser: ${message}`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const respuestaIA = response.text();

            if (!respuestaIA) {
                throw new Error("Google devolvió un objeto vacío.");
            }

            return res.status(200).json({ reply: respuestaIA });

        } catch (error) {
            console.error("Error en la llamada de Gemini:", error);
            return res.status(500).json({ 
                reply: "Error al conectar con Gemini.", 
                detalle: error.message 
            });
        }
    }

    return res.status(405).json({ reply: "Método no permitido" });
};