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
        maxCount: options?.maxCount || 100,
        format: {
          hash: '%H',
          shortHash: '%h',
          author: '%an',
          authorEmail: '%ae',
          authorDate: '%ai',
          committer: '%cn',
          committerEmail: '%ce',
          committerDate: '%ci',
          message: '%s',
          body: '%b',
          refs: '%D',
        }
      });

      const commits: GitCommit[] = log.all.map((commit: any) => ({
        hash: commit.hash,
        shortHash: commit.shortHash,
        author: {
          name: commit.author,
          email: commit.authorEmail,
          date: new Date(commit.authorDate),
        },
        committer: {
          name: commit.committer,
          email: commit.committerEmail,
          date: new Date(commit.committerDate),
        },
        message: commit.message,
        summary: commit.message,
        body: commit.body,
        parents: [], // TODO: Parse parent commits
        refs: commit.refs ? commit.refs.split(', ') : [],
        tags: [], // TODO: Parse tags
        branches: [], // TODO: Parse branches
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
   * Static method to get commits from a repository
   */
  static async getCommits(path: string, options?: { maxCount?: number }): Promise<GitCommit[]> {
    const service = new GitService({ repositoryPath: path });
    const result = await service.getCommits(options);
    return result.commits;
  }
}

export default GitService; 
