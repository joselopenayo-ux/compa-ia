// Servidor de WhatsApp Bot conectado con Claude (Anthropic)
const express = require("express");
const app = express();
app.use(express.json());

// ==== Variables de entorno (las configuraremos en Render, NO aquí en el código) ====
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;           // Token que tú inventas para verificar el webhook
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;       // Token de acceso de Meta
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;     // El "Phone Number ID" que copiaste de Meta
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY; // Tu API key de Anthropic (console.anthropic.com)

// ==== 1) Verificación del Webhook (Meta llama esto una vez al configurar) ====
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verificado correctamente");
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// ==== 2) Recepción de mensajes entrantes ====
app.post("/webhook", async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message && message.type === "text") {
      const from = message.from; // número del usuario que escribió
      const userText = message.text.body;

      console.log(`Mensaje recibido de ${from}: ${userText}`);

      // Llamamos a Claude para generar la respuesta
      const respuesta = await preguntarAClaude(userText);

      // Enviamos la respuesta de vuelta por WhatsApp
      await enviarMensajeWhatsApp(from, respuesta);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error procesando el mensaje:", error);
    res.sendStatus(200); // Siempre respondemos 200 para que Meta no reintente en loop
  }
});

// ==== Función: llamar a la API de Claude ====
async function preguntarAClaude(mensajeUsuario) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system:
        "Eres un asistente amable que responde por WhatsApp. Responde de forma breve, clara y en español, salvo que te escriban en otro idioma.",
      messages: [{ role: "user", content: mensajeUsuario }],
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.error("Error de la API de Claude:", data.error);
    return "Perdón, tuve un problema para responder. Intenta de nuevo en un momento.";
  }

  const textoRespuesta = data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");

  return textoRespuesta || "No pude generar una respuesta, intenta de nuevo.";
}

// ==== Función: enviar mensaje por WhatsApp Cloud API ====
async function enviarMensajeWhatsApp(to, texto) {
  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: texto },
    }),
  });

  const data = await response.json();
  if (data.error) {
    console.error("Error enviando mensaje de WhatsApp:", data.error);
  }
}

// ==== Iniciar servidor ====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
