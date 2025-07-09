import simpleGit, { SimpleGit } from 'simple-git';
import { GitRepository, GitCommit, GitBranch, GitStatus } from '../../types';
import { GitServiceConfig, GitLogResult } from './types';

/**
 * GitService
 * Core service for Git operations using simple-git
 */
export class GitService {
  private git: SimpleGit;
  private repositoryPath: string;

  constructor(config: GitServiceConfig) {
    this.repositoryPath = config.repositoryPath;
    this.git = simpleGit(config.repositoryPath);
  }

  /**
   * Check if a directory is a valid Git repository
   */
  async isValidRepository(path: string): Promise<boolean> {
    try {
      const git = simpleGit(path);
      await git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get repository information
   */
  async getRepository(): Promise<GitRepository> {
    const status = await this.getStatus();
    const branches = await this.getBranches();
    
    return {
      path: this.repositoryPath,
      name: this.repositoryPath.split('/').pop() || 'repository',
      isValid: true,
      currentBranch: status.current,
      branches,
      remotes: [], // TODO: Implement remotes
      status,
    };
  }

  /**
   * Get commit history
   */
  async getCommits(options?: { maxCount?: number }): Promise<GitLogResult> {
    try {
      const log = await this.git.log({
        '--numstat': null, // Include numerical file statistics
        '--show-signature': null, // Include GPG signature info if available
        maxCount: options?.maxCount || 100,
        format: {
          hash: '%H',
          shortHash: '%h',
          author: '%an',
          authorEmail: '%ae',
          authorDate: '%ai',
          authorDateISO: '%aI',
          committer: '%cn',
          committerEmail: '%ce',
          committerDate: '%ci',
          committerDateISO: '%cI',
          message: '%s',
          body: '%b',
          notes: '%N',
          refs: '%D',
          parents: '%P',
          tree: '%T',
          encoding: '%e',
          authorDateRelative: '%ar',
          committerDateRelative: '%cr',
          rawBody: '%B',
        }
      });

      const commits: GitCommit[] = log.all.map((commit: any) => ({
        hash: commit.hash,
        shortHash: commit.shortHash,
        author: {
          name: commit.author,
          email: commit.authorEmail,
          date: new Date(commit.authorDate),
          dateISO: commit.authorDateISO,
          dateRelative: commit.authorDateRelative,
        },
        committer: {
          name: commit.committer,
          email: commit.committerEmail,
          date: new Date(commit.committerDate),
          dateISO: commit.committerDateISO,
          dateRelative: commit.committerDateRelative,
        },
        message: commit.message,
        summary: commit.message,
        body: commit.body,
        rawBody: commit.rawBody,
        notes: commit.notes,
        encoding: commit.encoding,
        tree: commit.tree,
        parents: commit.parents ? commit.parents.split(' ').filter((p: string) => p.length > 0) : [],
        refs: commit.refs ? commit.refs.split(', ').filter((r: string) => r.length > 0) : [],
        tags: commit.refs ? this.parseTagsFromRefs(commit.refs) : [],
        branches: commit.refs ? this.parseBranchesFromRefs(commit.refs) : [],
        stats: this.parseCommitStats(commit),
        signature: commit.signature || null,
      }));

      return {
        commits,
        hasMore: log.all.length === (options?.maxCount || 100),
        total: log.total || log.all.length,
      };
    } catch (error) {
      throw new Error(`Failed to get commits: ${error}`);
    }
  }

  /**
   * Get repository status
   */
  async getStatus(): Promise<GitStatus> {
    try {
      const status = await this.git.status();
      
      return {
        current: status.current || 'main',
        tracking: status.tracking || undefined,
        ahead: status.ahead || 0,
        behind: status.behind || 0,
        created: status.created || [],
        deleted: status.deleted || [],
        modified: status.modified || [],
        renamed: status.renamed?.map(r => r.to) || [],
        staged: status.staged || [],
        conflicted: status.conflicted || [],
        not_added: status.not_added || [],
      };
    } catch (error) {
      throw new Error(`Failed to get status: ${error}`);
    }
  }

  /**
   * Get all branches
   */
  async getBranches(): Promise<GitBranch[]> {
    try {
      const branches = await this.git.branchLocal();
      
      return branches.all.map(branchName => ({
        name: branchName,
        current: branchName === branches.current,
        commit: '', // TODO: Get commit hash for branch
        remote: undefined,
        upstream: undefined,
      }));
    } catch (error) {
      throw new Error(`Failed to get branches: ${error}`);
    }
  }

  /**
   * Update the repository path
   */
  setRepositoryPath(path: string): void {
    this.repositoryPath = path;
    this.git = simpleGit(path);
  }

  // Static utility methods for IPC handlers
  
  /**
   * Static method to validate if a directory is a Git repository
   */
  static async validateRepository(path: string): Promise<boolean> {
    try {
      const git = simpleGit(path);
      await git.status();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Static method to open a repository and get its information
   */
  static async openRepository(path: string): Promise<GitRepository> {
    const service = new GitService({ repositoryPath: path });
    return await service.getRepository();
  }

  /**
   * Parse tags from Git refs string
   */
  private parseTagsFromRefs(refs: string): string[] {
    if (!refs) return [];
    
    return refs.split(', ')
      .filter(ref => ref.startsWith('tag: '))
      .map(ref => ref.replace('tag: ', '').trim())
      .filter(tag => tag.length > 0);
  }

  /**
   * Parse branches from Git refs string
   */
  private parseBranchesFromRefs(refs: string): string[] {
    if (!refs) return [];
    
    return refs.split(', ')
      .filter(ref => !ref.startsWith('tag: ') && ref.trim().length > 0)
      .map(ref => {
        // Remove origin/ prefix for remote branches
        if (ref.startsWith('origin/')) {
          return ref.replace('origin/', '');
        }
        return ref.trim();
      })
      .filter((branch, index, array) => array.indexOf(branch) === index) // Remove duplicates
      .filter(branch => branch.length > 0);
  }

  /**
   * Parse commit statistics from Git log output
   */
  private parseCommitStats(commit: any): { files: number; insertions: number; deletions: number; changedFiles: string[] } | null {
    try {
      // Simple-git provides stats in different formats, try to extract what we can
      let files = 0;
      let insertions = 0;
      let deletions = 0;
      let changedFiles: string[] = [];

      // Check if we have diff stats from simple-git
      if (commit.diff && commit.diff.files) {
        files = commit.diff.files.length;
        changedFiles = commit.diff.files.map((f: any) => f.file || f.path || '');
        insertions = commit.diff.insertions || 0;
        deletions = commit.diff.deletions || 0;
      } else if (commit.numstat) {
        // Parse from numstat format: "insertions\tdeletions\tfilename"
        const statLines = commit.numstat.split('\n').filter((line: string) => line.trim());
        files = statLines.length;
        
        statLines.forEach((line: string) => {
          const parts = line.trim().split('\t');
          if (parts.length >= 3) {
            const lineInsertions = parseInt(parts[0]) || 0;
            const lineDeletions = parseInt(parts[1]) || 0;
            const filename = parts[2] || '';
            
            insertions += lineInsertions;
            deletions += lineDeletions;
            if (filename) {
              changedFiles.push(filename);
            }
          }
        });
      } else if (commit.stat) {
        // Fallback: Parse from stat string if available
        const statLines = commit.stat.split('\n').filter((line: string) => line.trim());
        files = statLines.length;
        changedFiles = statLines.map((line: string) => {
          const parts = line.trim().split(/\s+/);
          return parts[0] || '';
        }).filter((f: string) => f);
      }

      return {
        files,
        insertions,
        deletions,
        changedFiles: changedFiles.filter((f: string) => f.length > 0)
      };
    } catch (error) {
      // If parsing fails, return null - we'll handle this gracefully in the UI
      return null;
    }
  }

  /**
   * Static method to get commits from a repository
   */
  static async getCommits(path: string, options?: { maxCount?: number }): Promise<GitCommit[]> {
    const service = new GitService({ repositoryPath: path });
    const result = await service.getCommits(options);
    return result.commits;
  }
}

export default GitService; 
