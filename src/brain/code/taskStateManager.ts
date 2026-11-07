/**
 * FROGÉ Code - Task Lifecycle & State Manager (Pause / Resume / Step / Checkpoint)
 * 
 * Implements deterministic task state machine:
 * - Lifecycle states: idle | queued | running | paused | resumed | completed | failed | aborted
 * - Checkpoint snapshot generation & rollback
 * - Step-by-step stage execution
 * - Event callbacks for UI synchronization
 */

import {
  FrogeCodeStage,
  FrogeCodeTaskState,
  TaskExecutionStatus,
  TaskStateCheckpoint,
  VFSSnapshot,
} from './types';

export const ORDERED_CODE_STAGES: FrogeCodeStage[] = [
  'understand_requirements',
  'create_project_plan',
  'generate_files',
  'run_application',
  'run_initial_tests',
  'find_errors',
  'apply_fixes',
  'retest_verification',
  'security_audit',
  'final_result',
];

export class TaskStateManager {
  private activeTasks: Map<string, FrogeCodeTaskState> = new Map();
  private stateListeners: Map<string, Array<(state: FrogeCodeTaskState) => void>> = new Map();

  /**
   * Initializes a new task in idle state
   */
  public createTask(prompt: string): FrogeCodeTaskState {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    const task: FrogeCodeTaskState = {
      taskId,
      prompt,
      status: 'idle',
      currentStage: 'understand_requirements',
      stageIndex: 0,
      totalStages: ORDERED_CODE_STAGES.length,
      progressPercent: 0,
      createdAt: now,
      updatedAt: now,
      checkpoints: [],
      canPause: false,
      canResume: false,
      canStep: true,
      canAbort: false,
    };

    this.activeTasks.set(taskId, task);
    this.notify(taskId);
    return task;
  }

  public getTask(taskId: string): FrogeCodeTaskState | undefined {
    return this.activeTasks.get(taskId);
  }

  public subscribe(taskId: string, listener: (state: FrogeCodeTaskState) => void): () => void {
    const listeners = this.stateListeners.get(taskId) || [];
    listeners.push(listener);
    this.stateListeners.set(taskId, listeners);
    return () => {
      const current = this.stateListeners.get(taskId) || [];
      this.stateListeners.set(
        taskId,
        current.filter((l) => l !== listener)
      );
    };
  }

  private notify(taskId: string): void {
    const task = this.activeTasks.get(taskId);
    if (!task) return;
    const listeners = this.stateListeners.get(taskId) || [];
    for (const l of listeners) {
      l({ ...task });
    }
  }

  public start(taskId: string): FrogeCodeTaskState {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = 'running';
    task.updatedAt = new Date().toISOString();
    task.canPause = true;
    task.canResume = false;
    task.canAbort = true;
    task.canStep = false;

    this.notify(taskId);
    return task;
  }

  public pause(taskId: string, vfsSnapshot?: VFSSnapshot): FrogeCodeTaskState {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = 'paused';
    task.pausedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    task.canPause = false;
    task.canResume = true;
    task.canStep = true;
    task.canAbort = true;

    // Save checkpoint
    const checkpoint: TaskStateCheckpoint = {
      checkpointId: `chk_${Date.now()}`,
      taskId,
      timestamp: new Date().toISOString(),
      status: 'paused',
      currentStage: task.currentStage,
      stageIndex: task.stageIndex,
      totalStages: task.totalStages,
      completedStages: ORDERED_CODE_STAGES.slice(0, task.stageIndex),
      memoryState: {},
      vfsSnapshot: vfsSnapshot || { snapshotId: 'snap_empty', timestamp: new Date().toISOString(), files: {} },
      logs: [`Paused at stage ${task.currentStage} (${task.progressPercent}%)`],
    };

    task.checkpoints.push(checkpoint);
    this.notify(taskId);
    return task;
  }

  public resume(taskId: string): FrogeCodeTaskState {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = 'resumed';
    task.resumedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    task.canPause = true;
    task.canResume = false;
    task.canStep = false;
    task.canAbort = true;

    this.notify(taskId);
    return task;
  }

  public advanceStage(taskId: string, completedStage: FrogeCodeStage): FrogeCodeTaskState {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const nextIndex = task.stageIndex + 1;
    task.stageIndex = nextIndex;
    task.progressPercent = Math.min(100, Math.round((nextIndex / task.totalStages) * 100));

    if (nextIndex >= task.totalStages) {
      task.status = 'completed';
      task.currentStage = 'final_result';
      task.completedAt = new Date().toISOString();
      task.canPause = false;
      task.canResume = false;
      task.canStep = false;
      task.canAbort = false;
    } else {
      task.currentStage = ORDERED_CODE_STAGES[nextIndex];
    }

    task.updatedAt = new Date().toISOString();
    this.notify(taskId);
    return task;
  }

  public abort(taskId: string): FrogeCodeTaskState {
    const task = this.activeTasks.get(taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    task.status = 'aborted';
    task.updatedAt = new Date().toISOString();
    task.canPause = false;
    task.canResume = false;
    task.canStep = false;
    task.canAbort = false;

    this.notify(taskId);
    return task;
  }
}

export const taskStateManager = new TaskStateManager();
