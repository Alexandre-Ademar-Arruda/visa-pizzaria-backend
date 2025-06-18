/** 
 * keepAlive.js
 * ------------
 * Módulo simples para evitar que o free tier da Render
 * entre em “sleep mode”.
 */

const https = require('https');        // Módulo nativo do Node p/ HTTPS
const { URL } = require('url');        // Ajuda a validar a URL

// 🔧 Substitua pela URL pública do backend
const RENDER_URL = 'https://visa-pizzaria-backend.onrender.com';

// Valida se a URL usa HTTPS
const parsedURL = new URL(RENDER_URL);
if (parsedURL.protocol !== 'https:') {
  throw new Error('A URL precisa começar com https://');
}

// Função para enviar um ping ao Render
function pingRender() {
  https.get(RENDER_URL, res => {
    console.log(`[${new Date().toISOString()}] Ping → status ${res.statusCode}`);

    // Descarta dados para evitar consumo desnecessário de memória
    res.on('data', () => {});
  })
  .on('error', err => {
    console.error(`[Ping ERROR] ${err.message}`);
  });
}

// 🔧 Define intervalo para 14 minutos (14 * 60 * 1000 ms)
const INTERVAL = 14 * 60 * 1000;

// Executa primeiro ping ao iniciar o script
pingRender();

// Repete o ping a cada 14 minutos
setInterval(pingRender, INTERVAL);

// Exporta a função (opcional)
module.exports = pingRender;