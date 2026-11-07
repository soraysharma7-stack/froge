/**
 * FROGÉ Code - Virtual File System (VFS)
 * 
 * In-Memory isolated file tree management with:
 * - Hierarchy traversal & path sanitization (denies escaping /workspace)
 * - CRUD operations for files and directories
 * - Real-time diff calculation
 * - Snapshot creation and rollback (for task checkpoints & pause/resume)
 * - Code metrics calculation (LOC, size, extension categorization)
 */

import { GeneratedCodeFile, VFSChangeEvent, VFSSnapshot, VirtualFileNode } from './types';

export class VirtualFileSystem {
  private files: Map<string, string> = new Map();
  private changeHistory: VFSChangeEvent[] = [];

  constructor(initialFiles?: Record<string, string> | GeneratedCodeFile[]) {
    if (initialFiles) {
      if (Array.isArray(initialFiles)) {
        for (const file of initialFiles) {
          this.writeFile(file.path, file.content);
        }
      } else {
        for (const [path, content] of Object.entries(initialFiles)) {
          this.writeFile(path, content);
        }
      }
    }
  }

  /**
   * Path Sanitizer: Enforces canonical virtual workspace pathing and strictly denies directory traversal
   */
  public sanitizePath(inputPath: string): string {
    if (!inputPath || typeof inputPath !== 'string') {
      throw new Error('Security Violation: Invalid file path parameter');
    }

    // Reject null byte injection
    if (inputPath.includes('\0') || inputPath.includes('%00')) {
      throw new Error(`Security Violation: Path contains illegal null byte injection`);
    }

    // Try decoding URI components to prevent URL-encoded traversal (%2e%2e%2f)
    let decoded = inputPath;
    try {
      decoded = decodeURIComponent(inputPath);
    } catch {
      // If decoding fails, continue with original
    }

    let clean = decoded.trim().replace(/\\/g, '/');

    // Deny dot-dot traversal
    if (clean.includes('../') || clean.includes('/..') || clean === '..' || clean.includes('..')) {
      throw new Error(`Security Violation: Path '${inputPath}' contains illegal directory traversal`);
    }

    // Strip leading ./
    while (clean.startsWith('./')) {
      clean = clean.slice(2);
    }

    // Normalize multiple consecutive slashes
    clean = clean.replace(/\/+/g, '/');

    // Deny host root escape & sensitive directories
    const forbiddenRoots = [
      '/etc', '/root', '/proc', '/sys', '/var', '/dev',
      '/boot', '/usr', '/bin', '/sbin', '/home', '/tmp', '/opt'
    ];

    for (const root of forbiddenRoots) {
      if (clean === root || clean.startsWith(`${root}/`)) {
        throw new Error(`Security Violation: Path '${inputPath}' attempts to access host system directory '${root}'`);
      }
    }

    // Ensure leading slash for canonical VFS representation
    if (!clean.startsWith('/')) {
      clean = '/' + clean;
    }

    return clean;
  }

  public writeFile(path: string, content: string): void {
    const cleanPath = this.sanitizePath(path);
    const isNew = !this.files.has(cleanPath);
    this.files.set(cleanPath, content);

    this.changeHistory.push({
      id: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      action: isNew ? 'create' : 'update',
      path: cleanPath,
      timestamp: new Date().toISOString(),
      diffSummary: isNew ? `Created ${cleanPath} (${content.split('\n').length} lines)` : `Updated ${cleanPath}`,
    });
  }

  public readFile(path: string): string {
    const cleanPath = this.sanitizePath(path);
    const content = this.files.get(cleanPath);
    if (content === undefined) {
      throw new Error(`File not found in VFS: ${cleanPath}`);
    }
    return content;
  }

  public fileExists(path: string): boolean {
    try {
      const cleanPath = this.sanitizePath(path);
      return this.files.has(cleanPath);
    } catch {
      return false;
    }
  }

  public deleteFile(path: string): boolean {
    const cleanPath = this.sanitizePath(path);
    if (this.files.has(cleanPath)) {
      this.files.delete(cleanPath);
      this.changeHistory.push({
        id: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        action: 'delete',
        path: cleanPath,
        timestamp: new Date().toISOString(),
        diffSummary: `Deleted ${cleanPath}`,
      });
      return true;
    }
    return false;
  }

  public renameFile(oldPath: string, newPath: string): void {
    const cleanOld = this.sanitizePath(oldPath);
    const cleanNew = this.sanitizePath(newPath);

    const content = this.readFile(cleanOld);
    this.files.delete(cleanOld);
    this.files.set(cleanNew, content);

    this.changeHistory.push({
      id: `chg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      action: 'rename',
      path: cleanNew,
      previousPath: cleanOld,
      timestamp: new Date().toISOString(),
      diffSummary: `Renamed ${cleanOld} to ${cleanNew}`,
    });
  }

  public getAllFiles(): GeneratedCodeFile[] {
    const result: GeneratedCodeFile[] = [];
    for (const [path, content] of this.files.entries()) {
      const ext = path.split('.').pop() || 'txt';
      const lines = content.split('\n').length;
      result.push({
        path,
        content,
        language: ext === 'ts' || ext === 'tsx' ? 'typescript' : ext === 'py' ? 'python' : ext === 'json' ? 'json' : 'javascript',
        linesOfCode: lines,
        sizeBytes: new Blob([content]).size,
        isClean: true,
      });
    }
    return result;
  }

  public getRawMap(): Record<string, string> {
    const map: Record<string, string> = {};
    for (const [path, content] of this.files.entries()) {
      map[path] = content;
    }
    return map;
  }

  /**
   * Constructs a nested hierarchical tree structure for UI rendering
   */
  public getDirectoryTree(): VirtualFileNode {
    const root: VirtualFileNode = {
      path: '/',
      name: 'workspace',
      extension: '',
      content: '',
      sizeBytes: 0,
      linesOfCode: 0,
      isDirectory: true,
      modifiedAt: new Date().toISOString(),
      children: [],
    };

    for (const [filePath, content] of this.files.entries()) {
      const parts = filePath.replace(/^\//, '').split('/');
      let currentLevel = root;

      let accumulatedPath = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        accumulatedPath += '/' + part;
        const isFile = i === parts.length - 1;

        if (isFile) {
          const ext = part.split('.').pop() || '';
          currentLevel.children = currentLevel.children || [];
          currentLevel.children.push({
            path: accumulatedPath,
            name: part,
            extension: ext,
            content,
            sizeBytes: new Blob([content]).size,
            linesOfCode: content.split('\n').length,
            isDirectory: false,
            modifiedAt: new Date().toISOString(),
          });
        } else {
          currentLevel.children = currentLevel.children || [];
          let dirNode = currentLevel.children.find((c) => c.isDirectory && c.name === part);
          if (!dirNode) {
            dirNode = {
              path: accumulatedPath,
              name: part,
              extension: '',
              content: '',
              sizeBytes: 0,
              linesOfCode: 0,
              isDirectory: true,
              modifiedAt: new Date().toISOString(),
              children: [],
            };
            currentLevel.children.push(dirNode);
          }
          currentLevel = dirNode;
        }
      }
    }

    return root;
  }

  /**
   * Creates an immutable snapshot for task state checkpointing
   */
  public createSnapshot(description?: string): VFSSnapshot {
    return {
      snapshotId: `snap_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      files: this.getRawMap(),
      description: description || 'Workspace state snapshot',
    };
  }

  /**
   * Restores workspace to a previous snapshot
   */
  public restoreSnapshot(snapshot: VFSSnapshot): void {
    this.files.clear();
    for (const [path, content] of Object.entries(snapshot.files)) {
      this.files.set(path, content);
    }
  }

  public getChangeHistory(): VFSChangeEvent[] {
    return [...this.changeHistory];
  }
}
