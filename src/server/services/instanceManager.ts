import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'crypto';

export interface Instance {
  id: string;
  name: string;
  minecraftVersion: string;
  modLoader: 'vanilla' | 'forge' | 'fabric' | 'quilt';
  createdAt: string;
  mods: string[];
}

export class InstanceManager {
  private instancesDir: string;

  constructor() {
    this.instancesDir = path.join(process.cwd(), 'data', 'instances');
    this.ensureDir(this.instancesDir);
  }

  private ensureDir(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async getInstances(): Promise<Instance[]> {
    const files = fs.readdirSync(this.instancesDir);
    const instances: Instance[] = [];

    for (const file of files) {
      const instancePath = path.join(this.instancesDir, file, 'instance.json');
      if (fs.existsSync(instancePath)) {
        const data = fs.readFileSync(instancePath, 'utf-8');
        instances.push(JSON.parse(data));
      }
    }

    return instances;
  }

  async getInstance(id: string): Promise<Instance | null> {
    const instancePath = path.join(this.instancesDir, id, 'instance.json');
    if (!fs.existsSync(instancePath)) {
      return null;
    }
    const data = fs.readFileSync(instancePath, 'utf-8');
    return JSON.parse(data);
  }

  async createInstance(options: {
    name: string;
    minecraftVersion: string;
    modLoader: 'vanilla' | 'forge' | 'fabric' | 'quilt';
  }): Promise<Instance> {
    const id = uuidv4().split('-')[0]; // Simple UUID
    const instanceDir = path.join(this.instancesDir, id);
    this.ensureDir(instanceDir);

    // Create subdirectories
    this.ensureDir(path.join(instanceDir, 'mods'));
    this.ensureDir(path.join(instanceDir, 'config'));
    this.ensureDir(path.join(instanceDir, 'saves'));

    const instance: Instance = {
      id,
      name: options.name,
      minecraftVersion: options.minecraftVersion,
      modLoader: options.modLoader,
      createdAt: new Date().toISOString(),
      mods: [],
    };

    const instancePath = path.join(instanceDir, 'instance.json');
    fs.writeFileSync(instancePath, JSON.stringify(instance, null, 2));

    return instance;
  }

  async deleteInstance(id: string): Promise<void> {
    const instanceDir = path.join(this.instancesDir, id);
    if (fs.existsSync(instanceDir)) {
      fs.rmSync(instanceDir, { recursive: true, force: true });
    }
  }
}
