// api/chat.js
module.exports = async function handler(req, res) {
    // Configuración CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Manejo de OPTIONS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Verificar API Key
    const apiKey = process.env.GROQ_API_KEY?.trim();
    
    if (!apiKey) {
        console.error("GROQ_API_KEY no configurada");
        return res.status(500).json({ 
            reply: "Error de configuración del servidor." 
        });
    }

    // GET - Estado
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: "OK", 
            message: "Servidor Groq funcionando correctamente" 
        });
    }

    // POST - Procesar mensaje
    if (req.method === 'POST') {
        try {
            const { message } = req.body;
            
            if (!message) {
                return res.status(400).json({ 
                    reply: "Por favor, escribe un mensaje." 
                });
            }

            console.log("📨 Mensaje recibido");

            const requestBody = {
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "Eres un psicólogo experto en salud mental. Responde de manera empática y profesional."
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
                console.error("❌ Error Groq:", data);
                return res.status(response.status).json({ 
                    reply: data.error?.message || "Error al procesar tu mensaje." 
                });
            }

            const respuestaIA = data.choices?.[0]?.message?.content;

            if (!respuestaIA) {
                return res.status(500).json({ 
                    reply: "No pude generar una respuesta en este momento." 
                });
            }

            return res.status(200).json({ reply: respuestaIA });

        } catch (error) {
            console.error("🔥 Error:", error);
            return res.status(500).json({ 
                reply: "Error interno del servidor. Intenta de nuevo." 
            });
        }
    }

    return res.status(405).json({ reply: "Método no permitido" });
};