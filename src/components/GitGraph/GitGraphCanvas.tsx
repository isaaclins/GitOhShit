import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import GraphEngine, { 
  CommitNode, 
  Connection
} from '../../lib/visualization/GraphEngine';
import { GitCommit } from '../../types';
import { formatCommitHash, formatCommitMessage, formatRelativeTime } from '../../utils/formatters';
import './GitGraphCanvas.css';

interface GitGraphCanvasProps {
  commits: GitCommit[];
  selectedCommits: string[];
  onCommitSelect: (commitHash: string) => void;
  onCommitHover: (commitHash: string | null) => void;
  viewMode?: 'linear' | 'tree' | 'timeline';
  className?: string;
  branchFilter?: string | null;
}

const GitGraphCanvas: React.FC<GitGraphCanvasProps> = ({
  commits,
  selectedCommits,
  onCommitSelect,
  onCommitHover,
  viewMode = 'linear',
  className = '',
  branchFilter,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const graphEngine = useMemo(() => new GraphEngine(), []);

  // Update graph engine configuration when view mode changes
  useEffect(() => {
    graphEngine.updateConfig({ viewMode });
  }, [graphEngine, viewMode]);

  // Calculate layout
  const layout = useMemo(() => {
    return graphEngine.calculateLayout(commits, selectedCommits, branchFilter);
  }, [graphEngine, commits, selectedCommits, branchFilter]);

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
    
    // Enhanced metadata for linear view
    const isLinearView = viewMode === 'linear';
    const commitHash = formatCommitHash(commit.hash);
    const commitMessage = formatCommitMessage(commit.message, isLinearView ? 50 : 30);
    const relativeTime = formatRelativeTime(commit.author.date);
    
    // Identify special commit types
    const isMergeCommit = commit.parents && commit.parents.length > 1;
    const isInitialCommit = !commit.parents || commit.parents.length === 0;
    const isTaggedCommit = commit.tags && commit.tags.length > 0;
    const hasMultipleBranches = commit.branches && commit.branches.length > 1;
    
    return (
      <g
        key={`commit-${commit.hash}`}
        className={`git-commit-node ${isSelected ? 'git-commit-node--selected' : ''} ${isLinearView ? 'git-commit-node--linear' : ''}`}
        onClick={() => handleCommitClick(commitNode)}
        onMouseEnter={() => handleCommitMouseEnter(commitNode)}
        onMouseLeave={handleCommitMouseLeave}
        style={{ cursor: 'pointer' }}
      >
        {/* Special commit background indicator */}
        {(isMergeCommit || isInitialCommit || isTaggedCommit) && (
          <circle
            cx={position.x}
            cy={position.y}
            r={nodeRadius + 4}
            fill="none"
            stroke={isMergeCommit ? '#ff6b6b' : isInitialCommit ? '#4ecdc4' : '#f39c12'}
            strokeWidth={2}
            strokeDasharray={isMergeCommit ? '4 2' : isInitialCommit ? 'none' : '2 2'}
            className="git-commit-special-indicator"
            opacity={0.6}
          />
        )}
        
        {/* Main commit node circle */}
        <circle
          cx={position.x}
          cy={position.y}
          r={nodeRadius}
          fill={isSelected ? '#ffffff' : laneColor}
          stroke={isSelected ? laneColor : '#333333'}
          strokeWidth={isSelected ? 2 : 1}
          className="git-commit-circle"
        />
        
        {/* Special commit type indicators */}
        {isMergeCommit && (
          <text
            x={position.x}
            y={position.y + 2}
            textAnchor="middle"
            fontSize="8"
            fill={isSelected ? laneColor : '#fff'}
            fontWeight="bold"
            className="git-commit-type-indicator"
          >
            M
          </text>
        )}
        
        {isInitialCommit && (
          <circle
            cx={position.x}
            cy={position.y}
            r={3}
            fill={isSelected ? laneColor : '#4ecdc4'}
            className="git-commit-initial-dot"
          />
        )}
        
        {/* Enhanced metadata display for linear view */}
        {isLinearView && (
          <g className="git-commit-metadata">
            {/* Commit hash with special commit indicators */}
            <text
              x={position.x + nodeRadius + 20}
              y={position.y - 20}
              className="git-commit-hash"
              fontSize="11"
              fill="#6b7280"
              fontFamily="SF Mono, Monaco, Menlo, Ubuntu Mono, monospace"
              fontWeight="500"
            >
              {commitHash}
              {isMergeCommit && <tspan fill="#ef4444" fontWeight="700"> [MERGE]</tspan>}
              {isInitialCommit && <tspan fill="#06b6d4" fontWeight="700"> [INITIAL]</tspan>}
            </text>
            
            {/* Commit message */}
            <text
              x={position.x + nodeRadius + 20}
              y={position.y - 2}
              className="git-commit-message"
              fontSize="15"
              fill="#1f2937"
              fontWeight={isSelected ? '600' : '500'}
              fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Roboto, sans-serif"
            >
              {commitMessage}
            </text>
            
            {/* Author and date */}
            <text
              x={position.x + nodeRadius + 20}
              y={position.y + 16}
              className="git-commit-author-date"
              fontSize="12"
              fill="#6b7280"
              fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Roboto, sans-serif"
            >
              {commit.author.name} • {relativeTime}
            </text>
            
            {/* Tags display */}
            {isTaggedCommit && (
              <text
                x={position.x + nodeRadius + 20}
                y={position.y + 32}
                className="git-commit-tags"
                fontSize="10"
                fill="#f59e0b"
                fontWeight="600"
              >
                🏷️ {commit.tags.slice(0, 2).join(', ')}
                {commit.tags.length > 2 && ` +${commit.tags.length - 2}`}
              </text>
            )}
            
            {/* Branch indicators - avoid duplicates and limit display */}
            {hasMultipleBranches && (
              <text
                x={position.x + nodeRadius + 20}
                y={position.y + (isTaggedCommit ? 48 : 32)}
                className="git-commit-branches"
                fontSize="10"
                fill={laneColor}
                fontWeight="600"
              >
                📍 {[...new Set(commit.branches)].slice(0, 2).join(', ')}
                {commit.branches.length > 2 && ` +${commit.branches.length - 2}`}
              </text>
            )}
          </g>
        )}
        
        {/* Enhanced tooltip for all views */}
        <title>
          {`${commitHash} - ${commit.message}\nAuthor: ${commit.author.name}\nDate: ${relativeTime}`}
          {isMergeCommit && '\nType: Merge Commit'}
          {isInitialCommit && '\nType: Initial Commit'}
          {isTaggedCommit && `\nTags: ${commit.tags.join(', ')}`}
          {hasMultipleBranches && `\nBranches: ${[...new Set(commit.branches)].join(', ')}`}
        </title>
        
        {/* Selection indicator */}
        {isSelected && (
          <circle
            cx={position.x}
            cy={position.y}
            r={3}
            fill={laneColor}
            className="git-commit-selected-dot"
          />
        )}
      </g>
    );
  }, [graphEngine, handleCommitClick, handleCommitMouseEnter, handleCommitMouseLeave, viewMode]);

  // Calculate viewport dimensions
  const viewBox = layout.bounds.width > 0 && layout.bounds.height > 0
    ? `${layout.bounds.minX - 20} ${layout.bounds.minY - 20} ${layout.bounds.width + 40} ${layout.bounds.height + 40}`
    : '0 0 100 100';

  // For linear view, we want scrolling instead of scaling
  const isLinearView = viewMode === 'linear';
  const svgHeight = isLinearView ? layout.bounds.height + 40 : '100%';
  const preserveAspectRatio = isLinearView ? 'xMidYMin slice' : 'xMidYMin meet';

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
    <div className={`git-graph-canvas ${isLinearView ? 'git-graph-canvas--linear' : ''} ${className}`}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        height={svgHeight}
        className="git-graph-svg"
        preserveAspectRatio={preserveAspectRatio}
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
