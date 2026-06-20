import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

export default async function handler(req, res) {
    // 1. Validar configuración de la clave
    if (!apiKey) {
        return res.status(500).json({ error: "Falta la clave GEMINI_API_KEY en las variables de Vercel." });
    }

    // 2. Soporte para el método GET (Prueba de diagnóstico)
    if (req.method === 'GET') {
        return res.status(200).json({ status: "OK", message: "Backend nativo corregido y listo." });
    }

    // 3. Soporte para el método POST (Envío de mensajes)
    if (req.method === 'POST') {
        try {
            const { message } = req.body;
            if (!message) {
                return res.status(400).json({ error: "El mensaje está vacío." });
            }

            // Inicialización usando exactamente la clase importada
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
            console.error(error);
            return res.status(500).json({ error: "Error en el servicio de IA", detalle: error.message });
        }
    }

    return res.status(405).json({ error: "Método no permitido" });
}