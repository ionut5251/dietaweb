import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import plansRouter from './routes/plans.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/plans', plansRouter);

const frontendPath = path.join(__dirname, '..', 'frontend');
const sharedPath = path.join(__dirname, '..', 'shared');
app.use(express.static(frontendPath));
app.use('/shared', express.static(sharedPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
