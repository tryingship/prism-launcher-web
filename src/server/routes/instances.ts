import express, { Request, Response } from 'express';
import { InstanceManager } from '../services/instanceManager';

export const instanceRouter = express.Router();
const instanceManager = new InstanceManager();

// Get all instances
instanceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const instances = await instanceManager.getInstances();
    res.json(instances);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instances' });
  }
});

// Get specific instance
instanceRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const instance = await instanceManager.getInstance(req.params.id);
    if (!instance) {
      return res.status(404).json({ error: 'Instance not found' });
    }
    res.json(instance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch instance' });
  }
});

// Create new instance
instanceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const { name, minecraftVersion, modLoader } = req.body;
    const instance = await instanceManager.createInstance({
      name,
      minecraftVersion,
      modLoader,
    });
    res.status(201).json(instance);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create instance' });
  }
});

// Delete instance
instanceRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    await instanceManager.deleteInstance(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete instance' });
  }
});
