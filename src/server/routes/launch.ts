import express, { Request, Response } from 'express';
import { LaunchService } from '../services/launchService';

export const launchRouter = express.Router();
const launchService = new LaunchService();

// Launch an instance
launchRouter.post('/:instanceId', async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;
    const { accountEmail, accountToken } = req.body;
    
    const result = await launchService.launchInstance(instanceId, {
      accountEmail,
      accountToken,
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to launch instance' });
  }
});

// Get launch status
launchRouter.get('/status/:instanceId', async (req: Request, res: Response) => {
  try {
    const status = await launchService.getStatus(req.params.instanceId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get status' });
  }
});
