module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    // Clave quemada directamente para saltarnos a Vercel
const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;
    if (req.method === 'GET') {
        return res.status(200).json({ status: "OK", message: "Servidor Groq forzado listo." });
    }

    if (req.method === 'POST') {
        try {
            const message = req.body && req.body.message;
            if (!message) {
                return res.status(400).json({ reply: "El mensaje llegó vacío." });
            }

            const requestBody = {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "Eres un psicólogo experto en salud mental, especializado en TDAH y ansiedad. Tu enfoque es empático, estructurado y libre de juicio. Ayuda al usuario a desahogarse y organiza sus ideas."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1024
            };

            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({
                    reply: "Error de conexión con el motor de IA.",
                    detalle: data.error ? data.error.message : JSON.stringify(data)
                });
            }

            const respuestaIA = data.choices?.[0]?.message?.content;
            return res.status(200).json({ reply: respuestaIA || "No se recibió texto." });

        } catch (error) {
            return res.status(500).json({ 
                reply: "Error crítico en el servidor del chat.", 
                detalle: error.message 
            });
        }
    }

    return res.status(405).json({ reply: "Método no permitido" });
};
