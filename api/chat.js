const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;

module.exports = async function handler(req, res) {
    // Asegurar que las cabeceras permitan JSON correctamente
    res.setHeader('Content-Type', 'application/json');

    if (!apiKey) {
        return res.status(500).json({ reply: "Falta la clave GEMINI_API_KEY en Vercel." });
    }

    if (req.method === 'GET') {
        return res.status(200).json({ status: "OK", message: "Servidor clásico respondiendo." });
    }

    if (req.method === 'POST') {
        try {
            // Validar que el cuerpo de la petición exista
            const message = req.body && req.body.message;
            if (!message) {
                return res.status(400).json({ reply: "El mensaje llegó vacío al servidor." });
            }

            const ai = new GoogleGenerativeAI(apiKey);
            const model = ai.getGenerativeModel({ 
                model: 'gemini-1.5-flash',
                systemInstruction: "Eres un psicólogo experto en salud mental, especializado en TDAH y ansiedad. Tu enfoque es empático, estructurado y libre de juicio. Ayuda al usuario a desahogarse y organiza sus ideas."
            });

            const result = await model.generateContent(message);
            const response = await result.response;
            const respuestaIA = response.text();

            return res.status(200).json({ reply: respuestaIA });

        } catch (error) {
            console.error("Error interno en Gemini:", error);
            return res.status(500).json({ 
                reply: "Error al conectar con Gemini.", 
                detalle: error.message 
            });
        }
    }

    return res.status(405).json({ reply: "Método no permitido" });
};