module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;

    if (!apiKey) {
        return res.status(500).json({ reply: "Error: La clave GROQ_API_KEY no está configurada en Vercel." });
    }

    if (req.method === 'GET') {
        return res.status(200).json({ status: "OK", message: "Servidor Groq listo." });
    }

    if (req.method === 'POST') {
        try {
            const message = req.body && req.body.message;
            if (!message) {
                return res.status(400).json({ reply: "El mensaje llegó vacío al servidor." });
            }

            // Estructura oficial de Groq en formato Chat Completions
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

            // Llamada directa a los servidores de Groq
            const googleResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const data = await googleResponse.json();

            if (!googleResponse.ok) {
                console.error("Error directo de Groq API:", data);
                return res.status(googleResponse.status).json({
                    reply: "Groq rechazó la conexión.",
                    detalle: data.error ? data.error.message : JSON.stringify(data)
                });
            }

            // Extraemos el texto de la respuesta de Groq
            const respuestaIA = data.choices?.[0]?.message?.content;

            if (!respuestaIA) {
                return res.status(500).json({ reply: "Groq no devolvió texto en la respuesta." });
            }

            return res.status(200).json({ reply: respuestaIA });

        } catch (error) {
            console.error("Error en el fetch de Groq:", error);
            return res.status(500).json({ 
                reply: "Error crítico al procesar la petición con Groq.", 
                detalle: error.message 
            });
        }
    }

    return res.status(405).json({ reply: "Método no permitido" });
};