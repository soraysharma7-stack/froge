import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

export interface AppErrorRecord {
  id: string;
  message: string;
  stack?: string;
  processed: boolean;
  timestamp: number;
}

// In-memory fallback queue for autonomous error tracking & self-healing
const localErrorQueue: AppErrorRecord[] = [];

let db: Firestore | null = null;
let firestoreAvailable = false;
let firestoreCheckDone = false;

try {
  if (!getApps().length) {
    initializeApp();
  }
  db = getFirestore();
} catch (e: any) {
  console.log('[ContinuousLearner] Firebase Admin not configured for default credentials, using local queue.');
}

export class ContinuousLearner {
  private interval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  /**
   * Log an error into the autonomous self-healing queue
   */
  public static reportError(message: string, stack?: string) {
    localErrorQueue.push({
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      message,
      stack,
      processed: false,
      timestamp: Date.now(),
    });
    if (localErrorQueue.length > 50) {
      localErrorQueue.shift();
    }
  }

  start() {
    if (this.interval) return;
    console.log('[FROGÉ Continuous Learner] Autonomous Self-Healing Monitor Started...');
    this.interval = setInterval(async () => {
      await this.monitor();
    }, 60000); // Check every minute
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async monitor() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      // 1. Check if Firestore is reachable (only attempt if not known to be disabled)
      if (db && (!firestoreCheckDone || firestoreAvailable)) {
        try {
          const errorsSnapshot = await db
            .collection('errors')
            .where('processed', '==', false)
            .limit(5)
            .get();

          firestoreAvailable = true;
          firestoreCheckDone = true;

          for (const doc of errorsSnapshot.docs) {
            const errorData = doc.data();
            console.log('[ContinuousLearner] Analyzing error from Firestore:', errorData.message);
            await this.analyzeAndFix(doc.id, errorData, true);
          }
        } catch (dbError: any) {
          firestoreAvailable = false;
          firestoreCheckDone = true;
          if (String(dbError?.message || '').includes('PERMISSION_DENIED') || dbError?.code === 7) {
            console.log('[ContinuousLearner] Cloud Firestore API is not enabled in project. Operating in self-contained local memory mode.');
          } else {
            console.warn('[ContinuousLearner] Firestore unavailable, switched to local memory buffer:', dbError?.message || dbError);
          }
        }
      }

      // 2. Process in-memory error queue
      const pendingLocal = localErrorQueue.filter((e) => !e.processed).slice(0, 3);
      for (const item of pendingLocal) {
        console.log('[ContinuousLearner] Analyzing local error record:', item.message);
        await this.analyzeAndFix(item.id, item, false);
      }
    } catch (error: any) {
      console.warn('[ContinuousLearner] Monitoring loop safe catch:', error?.message || error);
    } finally {
      this.isProcessing = false;
    }
  }

  async analyzeAndFix(docId: string, errorData: any, isFirestore: boolean) {
    try {
      const msg = (errorData.message || '').toString();
      const stack = (errorData.stack || '').toString();

      // Autonomous deterministic rule-based error diagnostics (zero external quota consumption)
      let rootCause = 'General runtime or logic irregularity detected in execution flow.';
      let recommendedFix = 'Safeguard null/undefined checks and implement defensive fallback handling.';

      if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
        rootCause = 'Model Gateway rate limit reached.';
        recommendedFix = 'Ensure your connected model endpoint has sufficient rate limit allocation.';
      } else if (msg.includes('timeout') || msg.includes('timed out')) {
        rootCause = 'Network latency or upstream socket response timeout.';
        recommendedFix = 'Increase network timeout thresholds and apply resilient progressive streaming.';
      } else if (msg.includes('SyntaxError') || msg.includes('JSON')) {
        rootCause = 'Malformed JSON payload or unparseable stream event.';
        recommendedFix = 'Sanitize JSON string before parse with safe try-catch wrapper.';
      } else if (msg.includes('token') || msg.includes('allowance')) {
        rootCause = 'Token allowance or quota clamp triggered.';
        recommendedFix = 'Remove restrictive token clamps and grant abundant token balance.';
      }

      console.log(`[ContinuousLearner] Self-Healing Diagnosis for ${docId}:`, {
        error: msg.slice(0, 100),
        rootCause,
        recommendedFix,
      });

      // Mark as processed
      if (isFirestore && db && firestoreAvailable) {
        await db.collection('errors').doc(docId).update({ processed: true });
      } else {
        const localItem = localErrorQueue.find((e) => e.id === docId);
        if (localItem) localItem.processed = true;
      }
    } catch (error: any) {
      console.warn('[ContinuousLearner] Analysis Error:', error?.message || error);
      const localItem = localErrorQueue.find((e) => e.id === docId);
      if (localItem) localItem.processed = true;
    }
  }
}
