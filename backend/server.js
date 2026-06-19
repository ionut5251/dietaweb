import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import plansRouter from './routes/plans.js';
import aiRouter from './routes/ai.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json({ limit: '12mb' }));

app.use('/api/plans', plansRouter);
app.use('/api/ai', aiRouter);

const frontendPath = path.join(__dirname, '..', 'frontend');
const sharedPath = path.join(__dirname, '..', 'shared');
app.use(express.static(frontendPath));
app.use('/shared', express.static(sharedPath));

app.get('/deploy-config.json', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'deploy-config.json'));
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  const claude = process.env.ANTHROPIC_API_KEY ? '✓ Claude (rutinas)' : '✗ Claude inactivo (añade ANTHROPIC_API_KEY)';
  const openai = process.env.OPENAI_API_KEY ? '✓ OpenAI (dieta)' : '✗ OpenAI inactivo';
  console.log(`Servidor en http://localhost:${PORT}`);
  console.log(`  IA: ${claude} | ${openai}`);
});
