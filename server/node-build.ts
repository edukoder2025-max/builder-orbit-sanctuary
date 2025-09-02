import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

// Configuración básica
const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../spa');

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
console.log('Sirviendo archivos estáticos desde:', distPath);
app.use(express.static(distPath));

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Ruta para el frontend SPA
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path === '/api') {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('Error al enviar index.html:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// Iniciar el servidor
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${port}`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('\nRutas disponibles:');
    console.log(`- Frontend: http://localhost:${port}`);
    console.log(`- API: http://localhost:${port}/api`);
    console.log(`- Health check: http://localhost:${port}/health`);
  }
});

// Manejo de cierre
const shutdown = () => {
  console.log('\n🛑 Apagando el servidor...');
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forzando cierre...');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
