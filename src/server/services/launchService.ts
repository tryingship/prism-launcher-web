import { spawn } from 'child_process';
import path from 'path';
import { InstanceManager } from './instanceManager';

export interface LaunchOptions {
  accountEmail: string;
  accountToken: string;
}

export interface LaunchResult {
  success: boolean;
  processId?: number;
  error?: string;
}

interface LaunchStatus {
  running: boolean;
  startTime?: string;
  processId?: number;
}

export class LaunchService {
  private instanceManager: InstanceManager;
  private runningProcesses: Map<string, number> = new Map();

  constructor() {
    this.instanceManager = new InstanceManager();
  }

  async launchInstance(
    instanceId: string,
    options: LaunchOptions
  ): Promise<LaunchResult> {
    try {
      const instance = await this.instanceManager.getInstance(instanceId);
      if (!instance) {
        return { success: false, error: 'Instance not found' };
      }

      // TODO: Download minecraft & dependencies if needed
      // TODO: Construct proper JVM arguments
      // TODO: Handle different mod loaders

      const launchArgs = this.buildLaunchArgs(instanceId, instance, options);
      console.log('Launching with args:', launchArgs);

      // Spawn Java process
      const javaProcess = spawn('java', launchArgs, {
        cwd: path.join(process.cwd(), 'data', 'instances', instanceId),
      });

      const pid = javaProcess.pid || 0;
      this.runningProcesses.set(instanceId, pid);

      javaProcess.stdout?.on('data', (data) => {
        console.log(`[${instance.name}] ${data}`);
      });

      javaProcess.stderr?.on('data', (data) => {
        console.error(`[${instance.name}] ${data}`);
      });

      javaProcess.on('exit', () => {
        this.runningProcesses.delete(instanceId);
      });

      return { success: true, processId: pid };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStatus(instanceId: string): Promise<LaunchStatus> {
    const running = this.runningProcesses.has(instanceId);
    return {
      running,
      processId: this.runningProcesses.get(instanceId),
    };
  }

  private buildLaunchArgs(
    instanceId: string,
    instance: any,
    options: LaunchOptions
  ): string[] {
    const args: string[] = [
      '-Xmx2G', // Max memory
      '-Xms1G', // Initial memory
      '-XX:+UnlockExperimentalVMOptions',
      '-XX:G1NewGenSize=50M',
      '-XX:G1MaxNewGenSize=450M',
      '-XX:G1HeapRegionSize=16M',
      '-XX:G1ReservePercent=15',
      '-XX:G1HeapWastePercent=5',
      '-XX:G1MixedGCCountTarget=4',
      '-XX:InitiatingHeapOccupancyPercent=20',
      '-XX:G1RSetUpdatingPauseTimePercent=5',
      '-XX:MaxGCPauseMillis=200',
      '-XX:PauseTimeIntervalMillis=300',
      '-XX:+PerfDisableSharedMem',
      '-XX:+AlwaysPreTouch',
      '-XX:+UseStringDeduplication',
    ];

    // TODO: Add main class and game arguments based on version and mod loader

    return args;
  }
}
