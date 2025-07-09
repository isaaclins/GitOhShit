import React from 'react';
import { CommitNodeProps } from '../../types';

/**
 * CommitNode Component
 * Individual commit node in the Git graph visualization
 */
const CommitNode: React.FC<CommitNodeProps> = ({
  node,
  selected,
  highlighted,
  onClick,
  onDoubleClick,
  _onDragStart,
  _onDragEnd,
}) => {
  return (
    <g
      className={`commit-node ${selected ? 'selected' : ''} ${highlighted ? 'highlighted' : ''}`}
      transform={`translate(${node.x}, ${node.y})`}
      onClick={(e) => onClick(node.commit.hash, e.metaKey || e.ctrlKey)}
      onDoubleClick={() => onDoubleClick(node.commit)}
    >
      <circle
        r={node.radius}
        className="commit-node__circle"
        fill={selected ? '#007acc' : '#e1e4e8'}
      />
      
      <text
        x={node.radius + 8}
        y={4}
        className="commit-node__message"
        fontSize="12"
      >
        {node.commit.summary}
      </text>
      
      <text
        x={node.radius + 8}
        y={-8}
        className="commit-node__hash"
        fontSize="10"
        fill="#6a737d"
      >
        {node.commit.shortHash}
      </text>
    </g>
  );
};

export default CommitNode; 
