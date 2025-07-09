import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import GraphEngine, { 
  CommitNode, 
  Connection
} from '../../lib/visualization/GraphEngine';
import { GitCommit } from '../../types';
import './GitGraphCanvas.css';

interface GitGraphCanvasProps {
  commits: GitCommit[];
  selectedCommits: string[];
  onCommitSelect: (commitHash: string) => void;
  onCommitHover: (commitHash: string | null) => void;
  viewMode?: 'linear' | 'tree' | 'timeline';
  className?: string;
}

const GitGraphCanvas: React.FC<GitGraphCanvasProps> = ({
  commits,
  selectedCommits,
  onCommitSelect,
  onCommitHover,
  viewMode = 'linear',
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const graphEngine = useMemo(() => new GraphEngine(), []);

  // Update graph engine configuration when view mode changes
  useEffect(() => {
    graphEngine.updateConfig({ viewMode });
  }, [graphEngine, viewMode]);

  // Calculate layout
  const layout = useMemo(() => {
    return graphEngine.calculateLayout(commits, selectedCommits);
  }, [graphEngine, commits, selectedCommits]);

  // Handle commit click
  const handleCommitClick = useCallback((commitNode: CommitNode) => {
    onCommitSelect(commitNode.commit.hash);
  }, [onCommitSelect]);

  // Handle commit hover
  const handleCommitMouseEnter = useCallback((commitNode: CommitNode) => {
    onCommitHover(commitNode.commit.hash);
  }, [onCommitHover]);

  const handleCommitMouseLeave = useCallback(() => {
    onCommitHover(null);
  }, [onCommitHover]);

  // Render a connection line between commits
  const renderConnection = useCallback((connection: Connection, index: number) => {
    const { from, to, type, color } = connection;
    
    // Create smooth curves for merge connections
    if (type === 'merge' && Math.abs(from.x - to.x) > 10) {
      const controlPoint1 = { x: from.x, y: from.y + 10 };
      const controlPoint2 = { x: to.x, y: to.y - 10 };
      
      const pathData = `M ${from.x} ${from.y} C ${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${to.x} ${to.y}`;
      
      return (
        <path
          key={`connection-${index}`}
          d={pathData}
          stroke={color}
          strokeWidth={type === 'merge' ? 2 : 1.5}
          fill="none"
          className={`git-connection git-connection--${type}`}
        />
      );
    }
    
    // Simple straight line for parent connections
    return (
      <line
        key={`connection-${index}`}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={type === 'merge' ? 2 : 1.5}
        className={`git-connection git-connection--${type}`}
      />
    );
  }, []);

  // Render a commit node
  const renderCommitNode = useCallback((commitNode: CommitNode, _index: number) => {
    const { commit, position, isSelected, lane } = commitNode;
    const nodeRadius = graphEngine.getConfig().nodeWidth / 2;
    const branchColors = graphEngine.getBranchColors();
    const laneColor = branchColors[lane % branchColors.length];
    
    return (
      <g
        key={`commit-${commit.hash}`}
        className={`git-commit-node ${isSelected ? 'git-commit-node--selected' : ''}`}
        transform={`translate(${position.x}, ${position.y})`}
        onClick={() => handleCommitClick(commitNode)}
        onMouseEnter={() => handleCommitMouseEnter(commitNode)}
        onMouseLeave={handleCommitMouseLeave}
        style={{ cursor: 'pointer' }}
      >
        {/* Commit node circle */}
        <circle
          r={nodeRadius}
          fill={isSelected ? '#ffffff' : laneColor}
          stroke={isSelected ? laneColor : '#333333'}
          strokeWidth={isSelected ? 2 : 1}
          className="git-commit-circle"
        />
        
        {/* Commit hash tooltip (short version) */}
        <title>{`${commit.hash.substring(0, 8)} - ${commit.message}`}</title>
        
        {/* Optional: Small dot in center for selected commits */}
        {isSelected && (
          <circle
            r={2}
            fill={laneColor}
            className="git-commit-selected-dot"
          />
        )}
      </g>
    );
  }, [graphEngine, handleCommitClick, handleCommitMouseEnter, handleCommitMouseLeave]);

  // Calculate viewport dimensions
  const viewBox = layout.bounds.width > 0 && layout.bounds.height > 0
    ? `${layout.bounds.minX - 20} ${layout.bounds.minY - 20} ${layout.bounds.width + 40} ${layout.bounds.height + 40}`
    : '0 0 100 100';

  if (commits.length === 0) {
    return (
      <div className={`git-graph-canvas git-graph-canvas--empty ${className}`}>
        <div className="git-graph-empty-state">
          <p>No commits to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`git-graph-canvas ${className}`}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className="git-graph-svg"
        preserveAspectRatio="xMidYMin meet"
      >
        {/* Render connections first (behind nodes) */}
        <g className="git-connections">
          {layout.connections.map(renderConnection)}
        </g>
        
        {/* Render commit nodes */}
        <g className="git-commit-nodes">
          {layout.nodes.map(renderCommitNode)}
        </g>
      </svg>
      
      {/* Optional: Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="git-graph-debug">
          <small>
            Nodes: {layout.nodes.length} | 
            Connections: {layout.connections.length} | 
            Lanes: {layout.lanes} |
            View: {viewMode}
          </small>
        </div>
      )}
    </div>
  );
};

export default GitGraphCanvas; 
