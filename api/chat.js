module.exports = async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');

    const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;

    if (!apiKey) {
        return res.status(500).json({ reply: "Error: La clave GEMINI_API_KEY no está configurada en Vercel." });
    }

    if (req.method === 'GET') {
        return res.status(200).json({ status: "OK", message: "Servidor nativo HTTP listo." });
    }

    if (req.method === 'POST') {
        try {
            const message = req.body && req.body.message;
            if (!message) {
                return res.status(400).json({ reply: "El mensaje llegó vacío al servidor." });
            }

            // Construimos el cuerpo de la petición con la instrucción del sistema incluida
            const prompt = `System: Eres un psicólogo experto en salud mental, especializado en TDAH y ansiedad. Tu enfoque es empático, estructurado y libre de juicio. Ayuda al usuario a desahogarse y organiza sus ideas.\n\nUser: ${message}`;
            
            const requestBody = {
                contents: [
                    {
                        parts: [
                            { text: prompt }
                        ]
                    }
                ]
            };

            // Llamada directa por HTTP Fetch a los servidores de Google usando la API Key en la URL
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            
            const googleResponse = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const data = await googleResponse.json();

            // Si Google responde con un error, lo capturamos detalladamente
            if (!googleResponse.ok) {
                console.error("Error directo de Google API:", data);
                return res.status(googleResponse.status).json({
                    reply: "Google rechazó la conexión directa.",
                    detalle: data.error ? data.error.message : JSON.stringify(data)
                });
            }

            // Extraemos el texto de la respuesta estructurada de Gemini
            const respuestaIA = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!respuestaIA) {
                return res.status(500).json({ reply: "Google no devolvió texto en la respuesta." });
            }

            return res.status(200).json({ reply: respuestaIA });

        } catch (error) {
            console.error("Error en el fetch del backend:", error);
            return res.status(500).json({ 
                reply: "Error crítico al procesar la petición HTTP.", 
                detalle: error.message 
            });
        }
    }

    return res.status(405).json({ reply: "Método no permitido" });
};