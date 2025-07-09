import { GitCommit } from '../../types';

/**
 * Point represents a 2D coordinate
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Visual representation of a commit node
 */
export interface CommitNode {
  commit: GitCommit;
  position: Point;
  lane: number;
  connections: Connection[];
  isSelected: boolean;
  isHighlighted: boolean;
}

/**
 * Visual connection between commits
 */
export interface Connection {
  from: Point;
  to: Point;
  type: 'parent' | 'merge' | 'branch';
  color: string;
  lane: number;
}

/**
 * Layout configuration for the graph
 */
export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalSpacing: number;
  verticalSpacing: number;
  laneWidth: number;
  maxLanes: number;
  viewMode: 'linear' | 'tree' | 'timeline';
}

/**
 * Graph layout result
 */
export interface GraphLayout {
  nodes: CommitNode[];
  connections: Connection[];
  bounds: {
    width: number;
    height: number;
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  lanes: number;
}

/**
 * Branch information for layout calculations
 */
interface BranchInfo {
  name: string;
  lane: number;
  color: string;
  commits: string[];
  startY: number;
  endY: number;
}

/**
 * GraphEngine
 * Handles layout calculations and positioning for git commit visualization
 */
export class GraphEngine {
  private config: LayoutConfig;
  private branchColors: string[] = [
    '#ff6b6b', // Red
    '#4ecdc4', // Teal
    '#45b7d1', // Blue
    '#96ceb4', // Green
    '#ffeaa7', // Yellow
    '#dda0dd', // Plum
    '#98d8c8', // Mint
    '#f7dc6f', // Light Yellow
    '#bb8fce', // Purple
    '#85c1e9', // Light Blue
  ];

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = {
      nodeWidth: 16,
      nodeHeight: 16,
      horizontalSpacing: 80,
      verticalSpacing: 50,
      laneWidth: 40,
      maxLanes: 10,
      viewMode: 'linear',
      ...config,
    };
  }

  /**
   * Calculate layout for a list of commits
   */
  calculateLayout(commits: GitCommit[], selectedCommits: string[] = [], branchFilter?: string | null): GraphLayout {
    if (commits.length === 0) {
      return {
        nodes: [],
        connections: [],
        bounds: { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 },
        lanes: 0,
      };
    }

    // Filter commits by branch if specified
    const filteredCommits = branchFilter ? this.filterCommitsByBranch(commits, branchFilter) : commits;

    switch (this.config.viewMode) {
      case 'linear':
        return this.calculateLinearLayout(filteredCommits, selectedCommits);
      case 'tree':
        return this.calculateTreeLayout(filteredCommits, selectedCommits);
      case 'timeline':
        return this.calculateTimelineLayout(filteredCommits, selectedCommits);
      default:
        return this.calculateLinearLayout(filteredCommits, selectedCommits);
    }
  }

  /**
   * Filter commits to only include those from a specific branch
   */
  private filterCommitsByBranch(commits: GitCommit[], branchName: string): GitCommit[] {
    if (!branchName) return commits;
    
    // If branch filter is applied, show only commits that belong to the specified branch
    return commits.filter(commit => 
      commit.branches.includes(branchName) || 
      // Also include commits that don't have branch info (fallback)
      (commit.branches.length === 0 && branchName === 'main')
    );
  }

  /**
   * Linear layout - single column of commits following actual Git relationships
   * Shows commits from the current branch or a filtered linear path
   */
  private calculateLinearLayout(commits: GitCommit[], selectedCommits: string[]): GraphLayout {
    const nodes: CommitNode[] = [];
    const connections: Connection[] = [];
    
    // Create a map for quick commit lookup
    const commitMap = new Map<string, GitCommit>();
    commits.forEach(commit => commitMap.set(commit.hash, commit));
    
    // Filter commits to show a linear path (main branch lineage)
    const linearCommits = this.getLinearCommitPath(commits);
    
    // Center the commits horizontally for better visual balance
    const centerX = this.config.laneWidth * 3;
    // Increased spacing for better readability in linear view
    const linearVerticalSpacing = this.config.verticalSpacing * 1.8;
    
    linearCommits.forEach((commit, index) => {
      const y = index * linearVerticalSpacing + this.config.nodeHeight;
      const x = centerX;
      
      const node: CommitNode = {
        commit,
        position: { x, y },
        lane: 0,
        connections: [],
        isSelected: selectedCommits.includes(commit.hash),
        isHighlighted: false,
      };

      nodes.push(node);

      // Add connections to actual Git parents
      if (commit.parents && commit.parents.length > 0) {
        commit.parents.forEach((parentHash) => {
          // Find the parent node in our linearCommits
          const parentNodeIndex = linearCommits.findIndex(c => c.hash === parentHash);
          if (parentNodeIndex !== -1 && parentNodeIndex < index) {
            const parentY = parentNodeIndex * linearVerticalSpacing + this.config.nodeHeight;
            
            const connection: Connection = {
              from: { x, y: parentY + this.config.nodeHeight / 2 },
              to: { x, y: y - this.config.nodeHeight / 2 },
              type: commit.parents.length > 1 ? 'merge' : 'parent',
              color: this.branchColors[0],
              lane: 0,
            };
            connections.push(connection);
          }
        });
      }
    });

    // Calculate bounds with better proportions (more width for metadata in linear view)
    const totalHeight = linearCommits.length * linearVerticalSpacing + this.config.nodeHeight * 3;
    const totalWidth = this.config.laneWidth * 15; // Much wider to accommodate commit metadata
    
    return {
      nodes,
      connections,
      bounds: {
        width: totalWidth,
        height: totalHeight,
        minX: 0,
        maxX: totalWidth,
        minY: 0,
        maxY: totalHeight,
      },
      lanes: 1,
    };
  }

  /**
   * Get a linear path of commits, typically following the main branch
   * This creates a simplified view for linear mode
   */
  private getLinearCommitPath(commits: GitCommit[]): GitCommit[] {
    if (commits.length === 0) return [];
    
    // Create commit map for quick lookup
    const commitMap = new Map<string, GitCommit>();
    commits.forEach(commit => commitMap.set(commit.hash, commit));
    
    // Start with the most recent commit (assuming commits are sorted by recency)
    const linearPath: GitCommit[] = [];
    const visited = new Set<string>();
    
    // Use the first commit as starting point (most recent)
    let currentCommit: GitCommit | null = commits[0];
    
    while (currentCommit && !visited.has(currentCommit.hash)) {
      visited.add(currentCommit.hash);
      linearPath.push(currentCommit);
      
      // Follow the first parent (main line of development)
      if (currentCommit.parents && currentCommit.parents.length > 0) {
        const firstParentHash: string = currentCommit.parents[0];
        currentCommit = commitMap.get(firstParentHash) || null;
      } else {
        // No more parents, we've reached the initial commit
        break;
      }
    }
    
    return linearPath;
  }

  /**
   * Tree layout - shows branches and merges
   */
  private calculateTreeLayout(commits: GitCommit[], selectedCommits: string[]): GraphLayout {
    const nodes: CommitNode[] = [];
    const connections: Connection[] = [];
    const laneAssignments = new Map<string, number>();
    const branches = this.analyzeBranches(commits);
    
    let currentLane = 0;
    const usedLanes = new Set<number>();

    commits.forEach((commit, index) => {
      const y = index * this.config.verticalSpacing;
      
      // Assign lane based on branch analysis
      let lane = laneAssignments.get(commit.hash);
      if (lane === undefined) {
        // Find the branch this commit belongs to
        const branch = branches.find(b => b.commits.includes(commit.hash));
        if (branch) {
          lane = branch.lane;
        } else {
          // Assign new lane
          lane = this.findAvailableLane(usedLanes, currentLane);
          currentLane = Math.max(currentLane, lane + 1);
        }
        laneAssignments.set(commit.hash, lane);
      }
      
      usedLanes.add(lane);
      const x = this.config.laneWidth + (lane * this.config.laneWidth);

      const node: CommitNode = {
        commit,
        position: { x, y },
        lane,
        connections: [],
        isSelected: selectedCommits.includes(commit.hash),
        isHighlighted: false,
      };

      nodes.push(node);

      // Add connections to parents
      if (commit.parents && commit.parents.length > 0) {
        commit.parents.forEach((parentHash, _parentIndex) => {
          const parentNode = nodes.find(n => n.commit.hash === parentHash);
          if (parentNode) {
            const isMerge = commit.parents.length > 1;
            const connectionType = isMerge ? 'merge' : 'parent';
            const color = this.branchColors[lane % this.branchColors.length];

            const connection: Connection = {
              from: parentNode.position,
              to: { x, y },
              type: connectionType,
              color,
              lane,
            };
            connections.push(connection);
          }
        });
      }
    });

    const maxLane = Math.max(...Array.from(usedLanes));
    const height = Math.max(0, (commits.length - 1) * this.config.verticalSpacing + this.config.nodeHeight);
    const width = this.config.laneWidth * (maxLane + 2);

    return {
      nodes,
      connections,
      bounds: {
        width,
        height,
        minX: 0,
        maxX: width,
        minY: 0,
        maxY: height,
      },
      lanes: maxLane + 1,
    };
  }

  /**
   * Timeline layout - organizes commits chronologically
   */
  private calculateTimelineLayout(commits: GitCommit[], selectedCommits: string[]): GraphLayout {
    // Sort commits by date for timeline view
    const sortedCommits = [...commits].sort((a, b) => 
      a.author.date.getTime() - b.author.date.getTime()
    );

    const nodes: CommitNode[] = [];
    const connections: Connection[] = [];
    
    sortedCommits.forEach((commit, index) => {
      const y = index * this.config.verticalSpacing;
      const x = this.config.laneWidth;
      
      const node: CommitNode = {
        commit,
        position: { x, y },
        lane: 0,
        connections: [],
        isSelected: selectedCommits.includes(commit.hash),
        isHighlighted: false,
      };

      nodes.push(node);

      // Find connections to other commits (not necessarily sequential)
      const originalIndex = commits.findIndex(c => c.hash === commit.hash);
      if (originalIndex > 0) {
        const connection: Connection = {
          from: { x, y: y - this.config.verticalSpacing + this.config.nodeHeight },
          to: { x, y: y },
          type: 'parent',
          color: this.branchColors[0],
          lane: 0,
        };
        connections.push(connection);
      }
    });

    const height = Math.max(0, (sortedCommits.length - 1) * this.config.verticalSpacing + this.config.nodeHeight);
    const width = this.config.laneWidth * 2;

    return {
      nodes,
      connections,
      bounds: {
        width,
        height,
        minX: 0,
        maxX: width,
        minY: 0,
        maxY: height,
      },
      lanes: 1,
    };
  }

  /**
   * Analyze commits to identify branches
   */
  private analyzeBranches(commits: GitCommit[]): BranchInfo[] {
    const branches: BranchInfo[] = [];
    const processedCommits = new Set<string>();
    let laneCounter = 0;

    // Simple branch detection - in a real implementation, this would be more sophisticated
    commits.forEach((commit, index) => {
      if (!processedCommits.has(commit.hash)) {
        const branch: BranchInfo = {
          name: `branch-${laneCounter}`,
          lane: laneCounter,
          color: this.branchColors[laneCounter % this.branchColors.length],
          commits: [commit.hash],
          startY: index * this.config.verticalSpacing,
          endY: index * this.config.verticalSpacing,
        };

        branches.push(branch);
        processedCommits.add(commit.hash);
        laneCounter++;
      }
    });

    return branches;
  }

  /**
   * Find an available lane for positioning
   */
  private findAvailableLane(usedLanes: Set<number>, startLane: number): number {
    let lane = startLane;
    while (usedLanes.has(lane) && lane < this.config.maxLanes) {
      lane++;
    }
    return Math.min(lane, this.config.maxLanes - 1);
  }

  /**
   * Update layout configuration
   */
  updateConfig(newConfig: Partial<LayoutConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): LayoutConfig {
    return { ...this.config };
  }

  /**
   * Get branch colors for rendering
   */
  getBranchColors(): string[] {
    return [...this.branchColors];
  }

  /**
   * Calculate the position for a specific commit
   */
  getCommitPosition(commitHash: string, layout: GraphLayout): Point | null {
    const node = layout.nodes.find(n => n.commit.hash === commitHash);
    return node ? node.position : null;
  }

  /**
   * Find commit at a specific position
   */
  getCommitAtPosition(position: Point, layout: GraphLayout, tolerance: number = 10): CommitNode | null {
    return layout.nodes.find(node => {
      const dx = Math.abs(node.position.x - position.x);
      const dy = Math.abs(node.position.y - position.y);
      return dx <= tolerance && dy <= tolerance;
    }) || null;
  }
}

export default GraphEngine; 
