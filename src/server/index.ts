import express from 'express';
import { instanceRouter } from './routes/instances';
import { launchRouter } from './routes/launch';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../dist/client')));

// API Routes
app.use('/instances', instanceRouter);
app.use('/launch', launchRouter);

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/client/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Prism Launcher Web server running on http://localhost:${PORT}`);
});
