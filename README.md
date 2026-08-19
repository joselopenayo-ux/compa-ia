# Bot de WhatsApp con Claude — Guía paso a paso

## Lo que necesitas tener a mano
- WHATSAPP_TOKEN: el "Identificador de acceso" que generaste en Meta.
- PHONE_NUMBER_ID: 1239656229233567 (el que ya tienes).
- ANTHROPIC_API_KEY: la consigues en https://console.anthropic.com (sección API Keys).
- VERIFY_TOKEN: esto lo inventas tú, cualquier palabra secreta, ej: "mibot2026seguro".

## Pasos para publicar el bot gratis en Render.com

1. Crea una cuenta en https://render.com (puedes usar tu cuenta de Google/GitHub).
2. Sube estos archivos a un repositorio de GitHub (te explico cómo abajo).
3. En Render, crea un "New Web Service" y conéctalo a tu repositorio de GitHub.
4. En "Build Command" pon: npm install
5. En "Start Command" pon: npm start
6. En la sección "Environment Variables" agrega las 4 variables de arriba.
7. Haz clic en "Create Web Service" y espera a que termine el despliegue (2-3 minutos).
8. Render te dará una URL como: https://tu-bot.onrender.com
9. Tu webhook completo será: https://tu-bot.onrender.com/webhook

## Configurar el webhook en Meta
1. Ve al panel de tu app en developers.facebook.com
2. WhatsApp > Configuración > Webhook
3. Pega la URL del webhook y el mismo VERIFY_TOKEN que pusiste en Render
4. Suscríbete al campo "messages"

¡Listo! Ahora cualquier mensaje que te escriban a tu número de WhatsApp de prueba
será respondido automáticamente por Claude.
