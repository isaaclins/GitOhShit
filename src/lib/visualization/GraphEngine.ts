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
   * Tree layout - shows branches and merges with proper Git graph visualization
   */
  private calculateTreeLayout(commits: GitCommit[], selectedCommits: string[]): GraphLayout {
    if (commits.length === 0) {
      return {
        nodes: [],
        connections: [],
        bounds: { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 },
        lanes: 0,
      };
    }

    const nodes: CommitNode[] = [];
    const connections: Connection[] = [];
    
    // Create commit lookup map
    const commitMap = new Map<string, GitCommit>();
    commits.forEach(commit => commitMap.set(commit.hash, commit));
    
    // Track lane assignments and usage
    const laneAssignments = new Map<string, number>();
    const activeLanes = new Map<number, string>(); // lane -> commit hash using that lane
    const laneColors = new Map<number, string>();
    
    let nextAvailableLane = 0;
    
    // Process commits in order (assuming they're already in topological order)
    commits.forEach((commit, index) => {
      const y = index * this.config.verticalSpacing + this.config.nodeHeight;
      
      // Determine lane for this commit
      let assignedLane = laneAssignments.get(commit.hash);
      
      if (assignedLane === undefined) {
        // Check if any parent is in an active lane we can continue
        let parentLane: number | undefined;
        if (commit.parents && commit.parents.length > 0) {
          // Try to continue on the first parent's lane
          const firstParent = commit.parents[0];
          parentLane = laneAssignments.get(firstParent);
        }
        
        if (parentLane !== undefined && activeLanes.get(parentLane) === (commit.parents?.[0] || '')) {
          // Continue on parent's lane
          assignedLane = parentLane;
        } else {
          // Need a new lane
          assignedLane = nextAvailableLane;
          while (activeLanes.has(assignedLane)) {
            assignedLane++;
          }
          nextAvailableLane = Math.max(nextAvailableLane, assignedLane + 1);
        }
        
        laneAssignments.set(commit.hash, assignedLane);
      }
      
      // Update active lanes
      activeLanes.set(assignedLane, commit.hash);
      
      // Assign color for this lane
      if (!laneColors.has(assignedLane)) {
        laneColors.set(assignedLane, this.branchColors[assignedLane % this.branchColors.length]);
      }
      
      const x = this.config.laneWidth + (assignedLane * this.config.laneWidth);
      
      const node: CommitNode = {
        commit,
        position: { x, y },
        lane: assignedLane,
        connections: [],
        isSelected: selectedCommits.includes(commit.hash),
        isHighlighted: false,
      };
      
      nodes.push(node);
      
      // Create connections to parents
      if (commit.parents && commit.parents.length > 0) {
        commit.parents.forEach((parentHash, parentIndex) => {
          const parentCommit = commitMap.get(parentHash);
          if (parentCommit) {
            // Find parent node (it should be processed already since commits are in order)
            const parentNode = nodes.find(n => n.commit.hash === parentHash);
            if (parentNode) {
              const isMainParent = parentIndex === 0;
              const isMergeCommit = commit.parents.length > 1;
              
              // Connection type and styling
              let connectionType: Connection['type'] = 'parent';
              if (isMergeCommit) {
                connectionType = parentIndex === 0 ? 'parent' : 'merge';
              }
              
              // Connection color - use target lane color for main connections
              const connectionColor = isMainParent 
                ? laneColors.get(assignedLane) || this.branchColors[0]
                : laneColors.get(parentNode.lane) || this.branchColors[1];
              
              // Create connection path
              const connection: Connection = {
                from: { 
                  x: parentNode.position.x, 
                  y: parentNode.position.y + this.config.nodeHeight / 2 
                },
                to: { 
                  x: x, 
                  y: y - this.config.nodeHeight / 2 
                },
                type: connectionType,
                color: connectionColor,
                lane: isMainParent ? assignedLane : parentNode.lane,
              };
              
              connections.push(connection);
            }
          }
        });
      }
      
      // Clear this commit from active lanes if it has no children coming up
      const hasChildrenAhead = commits.slice(index + 1).some(futureCommit => 
        futureCommit.parents && futureCommit.parents.includes(commit.hash)
      );
      
      if (!hasChildrenAhead) {
        activeLanes.delete(assignedLane);
      }
    });
    
    // Calculate bounds
    const maxLane = Math.max(0, ...Array.from(laneAssignments.values()));
    const totalWidth = this.config.laneWidth * (maxLane + 3);
    const totalHeight = commits.length * this.config.verticalSpacing + this.config.nodeHeight * 2;
    
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
      lanes: maxLane + 1,
    };
  }

  /**
   * Timeline layout - organizes commits chronologically with time grouping
   */
  private calculateTimelineLayout(commits: GitCommit[], selectedCommits: string[]): GraphLayout {
    if (commits.length === 0) {
      return {
        nodes: [],
        connections: [],
        bounds: { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 },
        lanes: 0,
      };
    }

    // Sort commits by date for timeline view
    const sortedCommits = [...commits].sort((a, b) => 
      a.author.date.getTime() - b.author.date.getTime()
    );

    const nodes: CommitNode[] = [];
    const connections: Connection[] = [];
    const commitMap = new Map<string, GitCommit>();
    commits.forEach(commit => commitMap.set(commit.hash, commit));

    // Group commits by time periods
    const timeGroups = this.groupCommitsByTimePeriod(sortedCommits);
    
    let currentY = this.config.nodeHeight * 2; // Start with some padding
    const laneWidth = this.config.laneWidth * 1.2; // Slightly wider lanes for timeline
    const groupSpacing = this.config.verticalSpacing * 3; // Extra space between time groups
    const nodeSpacing = this.config.verticalSpacing * 1.5; // Space between nodes in same group
    
    timeGroups.forEach((group, _groupIndex) => {
      // Process commits in this time group
      const groupCommits = group.commits;
      
      // Assign lanes within the group to handle concurrent commits
      const laneAssignments = this.assignTimelineLanes(groupCommits);
      
      groupCommits.forEach((commit, commitIndex) => {
        const assignedLane = laneAssignments.get(commit.hash) || 0;
        const x = laneWidth + (assignedLane * laneWidth);
        const y = currentY + (commitIndex * nodeSpacing);
        
        const node: CommitNode = {
          commit,
          position: { x, y },
          lane: assignedLane,
          connections: [],
          isSelected: selectedCommits.includes(commit.hash),
          isHighlighted: false,
        };
        
        nodes.push(node);
        
        // Create connections to actual Git parents (not just chronological)
        if (commit.parents && commit.parents.length > 0) {
          commit.parents.forEach((parentHash, parentIndex) => {
            const parentNode = nodes.find(n => n.commit.hash === parentHash);
            if (parentNode) {
              const isMainParent = parentIndex === 0;
              const isMergeCommit = commit.parents.length > 1;
              
              const connectionType = isMergeCommit && !isMainParent ? 'merge' : 'parent';
              const connectionColor = this.branchColors[assignedLane % this.branchColors.length];
              
              // Create connection with special timeline styling
              const connection: Connection = {
                from: { 
                  x: parentNode.position.x, 
                  y: parentNode.position.y + this.config.nodeHeight / 2 
                },
                to: { 
                  x: x, 
                  y: y - this.config.nodeHeight / 2 
                },
                type: connectionType,
                color: connectionColor,
                lane: assignedLane,
              };
              
              connections.push(connection);
            }
          });
        }
      });
      
      // Move to next group position
      currentY += (groupCommits.length * nodeSpacing) + groupSpacing;
    });
    
    // Calculate bounds
    const maxLane = Math.max(0, ...nodes.map(n => n.lane));
    const totalWidth = laneWidth * (maxLane + 4); // Extra width for timeline labels
    const totalHeight = currentY + this.config.nodeHeight * 2;
    
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
      lanes: maxLane + 1,
    };
  }

  /**
   * Group commits by time periods (day, week, or month depending on span)
   */
  private groupCommitsByTimePeriod(sortedCommits: GitCommit[]): Array<{
    period: string;
    startDate: Date;
    endDate: Date;
    commits: GitCommit[];
  }> {
    if (sortedCommits.length === 0) return [];
    
    const firstDate = sortedCommits[0].author.date;
    const lastDate = sortedCommits[sortedCommits.length - 1].author.date;
    const timeSpanDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Choose grouping strategy based on time span
    let groupingStrategy: 'day' | 'week' | 'month';
    if (timeSpanDays <= 7) {
      groupingStrategy = 'day';
    } else if (timeSpanDays <= 90) {
      groupingStrategy = 'week';
    } else {
      groupingStrategy = 'month';
    }
    
    const groups = new Map<string, GitCommit[]>();
    
    sortedCommits.forEach(commit => {
      const date = commit.author.date;
      let groupKey: string;
      
      switch (groupingStrategy) {
        case 'day':
          groupKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
          break;
        case 'week': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay()); // Start of week
          groupKey = weekStart.toISOString().split('T')[0];
          break;
        }
        case 'month':
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(commit);
    });
    
    // Convert to sorted array with period labels
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([_key, commits]) => {
        const firstCommit = commits[0];
        const lastCommit = commits[commits.length - 1];
        
        let periodLabel: string;
        switch (groupingStrategy) {
          case 'day':
            periodLabel = firstCommit.author.date.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });
            break;
          case 'week': {
            const weekEnd = new Date(firstCommit.author.date);
            weekEnd.setDate(weekEnd.getDate() + 6);
            periodLabel = `Week of ${firstCommit.author.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })} - ${weekEnd.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}`;
            break;
          }
          case 'month':
            periodLabel = firstCommit.author.date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            });
            break;
        }
        
        return {
          period: periodLabel,
          startDate: firstCommit.author.date,
          endDate: lastCommit.author.date,
          commits
        };
      });
  }

  /**
   * Assign lanes for commits within a time group to handle concurrent commits
   */
  private assignTimelineLanes(commits: GitCommit[]): Map<string, number> {
    const laneAssignments = new Map<string, number>();
    const authorLanes = new Map<string, number>();
    let nextLane = 0;
    
    // Group commits by author to keep same author in same lane when possible
    const commitsByAuthor = new Map<string, GitCommit[]>();
    commits.forEach(commit => {
      const authorEmail = commit.author.email;
      if (!commitsByAuthor.has(authorEmail)) {
        commitsByAuthor.set(authorEmail, []);
      }
      commitsByAuthor.get(authorEmail)!.push(commit);
    });
    
    // Assign lanes, trying to keep authors consistent
    commits.forEach(commit => {
      const authorEmail = commit.author.email;
      
      if (authorLanes.has(authorEmail)) {
        // Use existing lane for this author
        laneAssignments.set(commit.hash, authorLanes.get(authorEmail)!);
      } else {
        // Assign new lane for this author
        authorLanes.set(authorEmail, nextLane);
        laneAssignments.set(commit.hash, nextLane);
        nextLane++;
      }
    });
    
    return laneAssignments;
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
