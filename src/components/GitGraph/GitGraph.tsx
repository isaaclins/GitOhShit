import React from 'react';
import { GitGraphProps } from '../../types';

/**
 * GitGraph Component
 * Main visualization component for displaying Git commit history
 */
const GitGraph: React.FC<GitGraphProps> = ({
  commits,
  layout,
  viewMode,
  selectedCommits,
  onCommitSelect,
  onCommitEdit,
  _onCommitMove,
}) => {
  return (
    <div className="git-graph">
      <div className="git-graph__header">
        <h2>Git History ({viewMode} view)</h2>
        <div className="git-graph__stats">
          {commits.length} commits | {selectedCommits.length} selected
        </div>
      </div>
      
      <div className="git-graph__content">
        <svg 
          width={layout.bounds.maxX - layout.bounds.minX}
          height={layout.bounds.maxY - layout.bounds.minY}
          className="git-graph__svg"
        >
          {/* Commit nodes will be rendered here */}
          {layout.nodes.map((node) => (
            <circle
              key={node.commit.hash}
              cx={node.x}
              cy={node.y}
              r={node.radius}
              className={`commit-node ${node.selected ? 'selected' : ''}`}
              onClick={() => onCommitSelect(node.commit.hash)}
              onDoubleClick={() => onCommitEdit(node.commit)}
            />
          ))}
          
          {/* Connections will be rendered here */}
          {layout.connections.map((connection, index) => (
            <path
              key={`${connection.from}-${connection.to}-${index}`}
              d={`M ${connection.points.map(p => `${p.x},${p.y}`).join(' L ')}`}
              className={`commit-connection ${connection.type}`}
              stroke={layout.branches.find(b => b.name === connection.branch)?.color}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default GitGraph; 
