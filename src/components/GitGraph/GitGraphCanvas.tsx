import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react';
import './GitGraphCanvas.css';
import { GitCommit } from '../../types';
import { GraphEngine } from '../../lib/visualization/GraphEngine';
import { CommitNode, Connection } from '../../lib/visualization/GraphEngine';
import { formatCommitHash, formatCommitMessage, formatRelativeTime } from '../../utils/formatters';

interface GitGraphCanvasProps {
  commits: GitCommit[];
  selectedCommits: string[];
  onCommitSelect: (commitHash: string) => void;
  onCommitHover: (commitHash: string | null) => void;
  viewMode?: 'linear' | 'tree' | 'timeline';
  className?: string;
  branchFilter?: string | null;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const graphEngine = useMemo(() => new GraphEngine(), []);
  
  // Pan and zoom state
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, transformX: 0, transformY: 0 });

  // Update graph engine configuration when view mode changes
  useEffect(() => {
    graphEngine.updateConfig({ viewMode });
  }, [graphEngine, viewMode]);

  // Calculate layout
  const layout = useMemo(() => {
    return graphEngine.calculateLayout(commits, selectedCommits, branchFilter);
  }, [graphEngine, commits, selectedCommits, branchFilter]);

  // Reset transform when layout changes significantly
  useEffect(() => {
    if (layout.bounds.width > 0 && layout.bounds.height > 0) {
      setTransform({ x: 0, y: 0, scale: 1 });
    }
  }, [layout.bounds.width, layout.bounds.height, viewMode]);

  // Reset zoom and pan
  const resetView = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  // Fit content to view
  const fitToView = useCallback(() => {
    const container = containerRef.current;
    if (!container || layout.bounds.width === 0 || layout.bounds.height === 0) return;

    const containerRect = container.getBoundingClientRect();
    const padding = 40;
    
    const scaleX = (containerRect.width - padding * 2) / layout.bounds.width;
    const scaleY = (containerRect.height - padding * 2) / layout.bounds.height;
    const scale = Math.min(scaleX, scaleY, 1);
    
    const centerX = layout.bounds.minX + layout.bounds.width / 2;
    const centerY = layout.bounds.minY + layout.bounds.height / 2;
    
    setTransform({
      x: containerRect.width / 2 / scale - centerX,
      y: containerRect.height / 2 / scale - centerY,
      scale
    });
  }, [layout]);

  // Handle mouse wheel for zooming
  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault();
    
    const container = containerRef.current;
    const svg = svgRef.current;
    if (!container || !svg) return;

    const rect = svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // Convert mouse coordinates to SVG coordinates
    const svgPoint = svg.createSVGPoint();
    svgPoint.x = mouseX;
    svgPoint.y = mouseY;
    const svgCoords = svgPoint.matrixTransform(svg.getScreenCTM()?.inverse());
    
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, transform.scale * zoomFactor));
    
    // Zoom towards mouse position
    const newTransformX = svgCoords.x - (svgCoords.x - transform.x) * (newScale / transform.scale);
    const newTransformY = svgCoords.y - (svgCoords.y - transform.y) * (newScale / transform.scale);
    
    setTransform({
      x: newTransformX,
      y: newTransformY,
      scale: newScale
    });
  }, [transform]);

  // Handle mouse down for pan start
  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (event.button !== 0) return; // Only left mouse button
    
    event.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      transformX: transform.x,
      transformY: transform.y
    });
  }, [transform]);

  // Handle mouse move for panning
  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = (event.clientX - dragStart.x) / transform.scale;
    const deltaY = (event.clientY - dragStart.y) / transform.scale;
    
    setTransform(prev => ({
      ...prev,
      x: dragStart.transformX + deltaX,
      y: dragStart.transformY + deltaY
    }));
  }, [isDragging, dragStart, transform.scale]);

  // Handle mouse up for pan end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (event: MouseEvent) => {
        const deltaX = (event.clientX - dragStart.x) / transform.scale;
        const deltaY = (event.clientY - dragStart.y) / transform.scale;
        
        setTransform(prev => ({
          ...prev,
          x: dragStart.transformX + deltaX,
          y: dragStart.transformY + deltaY
        }));
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, dragStart, transform.scale]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target !== document.body && !(event.target as HTMLElement).closest('.git-graph-canvas')) {
        return;
      }

      const panStep = 50 / transform.scale;
      
      switch (event.key.toLowerCase()) {
        case 'r':
          event.preventDefault();
          resetView();
          break;
        case 'f':
          event.preventDefault();
          fitToView();
          break;
        case '+':
        case '=':
          event.preventDefault();
          setTransform(prev => ({ ...prev, scale: Math.min(5, prev.scale * 1.2) }));
          break;
        case '-':
          event.preventDefault();
          setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }));
          break;
        case 'arrowup':
          event.preventDefault();
          setTransform(prev => ({ ...prev, y: prev.y + panStep }));
          break;
        case 'arrowdown':
          event.preventDefault();
          setTransform(prev => ({ ...prev, y: prev.y - panStep }));
          break;
        case 'arrowleft':
          event.preventDefault();
          setTransform(prev => ({ ...prev, x: prev.x + panStep }));
          break;
        case 'arrowright':
          event.preventDefault();
          setTransform(prev => ({ ...prev, x: prev.x - panStep }));
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [transform.scale, resetView, fitToView]);

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
    const isTreeView = viewMode === 'tree';
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
        className={`git-commit-node ${isSelected ? 'git-commit-node--selected' : ''} ${isLinearView ? 'git-commit-node--linear' : ''} ${isTreeView ? 'git-commit-node--tree' : ''} ${viewMode === 'timeline' ? 'git-commit-node--timeline' : ''}`}
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

        {/* Tree view simplified metadata */}
        {isTreeView && (
          <g className="git-commit-metadata git-commit-metadata--tree">
            {/* Commit hash only */}
            <text
              x={position.x + nodeRadius + 12}
              y={position.y - 8}
              className="git-commit-hash"
              fontSize="10"
              fill="#6b7280"
              fontFamily="SF Mono, Monaco, Menlo, Ubuntu Mono, monospace"
              fontWeight="500"
            >
              {commitHash}
              {isMergeCommit && <tspan fill="#ef4444" fontWeight="700" fontSize="8"> M</tspan>}
              {isInitialCommit && <tspan fill="#06b6d4" fontWeight="700" fontSize="8"> I</tspan>}
            </text>
            
            {/* Shortened commit message */}
            <text
              x={position.x + nodeRadius + 12}
              y={position.y + 6}
              className="git-commit-message"
              fontSize="12"
              fill="#1f2937"
              fontWeight={isSelected ? '600' : '500'}
              fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Roboto, sans-serif"
            >
              {formatCommitMessage(commit.message, 25)}
            </text>
            
            {/* Tags indicator for tree view */}
            {isTaggedCommit && (
              <text
                x={position.x + nodeRadius + 12}
                y={position.y + 18}
                className="git-commit-tags"
                fontSize="9"
                fill="#f59e0b"
                fontWeight="600"
              >
                🏷️ {commit.tags.length > 1 ? `${commit.tags.length} tags` : commit.tags[0]}
              </text>
            )}
          </g>
        )}

        {/* Timeline view chronological metadata */}
        {viewMode === 'timeline' && (
          <g className="git-commit-metadata git-commit-metadata--timeline">
            {/* Time stamp */}
            <text
              x={position.x + nodeRadius + 15}
              y={position.y - 12}
              className="git-commit-timestamp"
              fontSize="10"
              fill="#6b7280"
              fontFamily="SF Mono, Monaco, Menlo, Ubuntu Mono, monospace"
              fontWeight="500"
            >
              {commit.author.date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              })}
              {isMergeCommit && <tspan fill="#ef4444" fontWeight="700" fontSize="8"> M</tspan>}
              {isInitialCommit && <tspan fill="#06b6d4" fontWeight="700" fontSize="8"> I</tspan>}
            </text>
            
            {/* Commit message with author */}
            <text
              x={position.x + nodeRadius + 15}
              y={position.y + 2}
              className="git-commit-message"
              fontSize="13"
              fill="#1f2937"
              fontWeight={isSelected ? '600' : '500'}
              fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Roboto, sans-serif"
            >
              {formatCommitMessage(commit.message, 35)}
            </text>
            
            {/* Author name and commit hash */}
            <text
              x={position.x + nodeRadius + 15}
              y={position.y + 16}
              className="git-commit-author"
              fontSize="11"
              fill="#6b7280"
              fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Roboto, sans-serif"
            >
              {commit.author.name} • {commitHash}
            </text>
            
            {/* Tags display for timeline */}
            {isTaggedCommit && (
              <text
                x={position.x + nodeRadius + 15}
                y={position.y + 28}
                className="git-commit-tags"
                fontSize="10"
                fill="#f59e0b"
                fontWeight="600"
              >
                🏷️ {commit.tags.slice(0, 2).join(', ')}
                {commit.tags.length > 2 && ` +${commit.tags.length - 2}`}
              </text>
            )}
          </g>
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

  // Function to render time period labels for timeline view - moved before early return to fix Rules of Hooks
  const renderTimeLabels = useCallback(() => {
    if (viewMode !== 'timeline' || commits.length === 0) return null;
    
    // Sort commits by date to group them
    const sortedCommits = [...commits].sort((a, b) => 
      a.author.date.getTime() - b.author.date.getTime()
    );
    
    const firstDate = sortedCommits[0].author.date;
    const lastDate = sortedCommits[sortedCommits.length - 1].author.date;
    const timeSpanDays = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Determine grouping strategy
    let groupingStrategy: 'day' | 'week' | 'month';
    if (timeSpanDays <= 7) {
      groupingStrategy = 'day';
    } else if (timeSpanDays <= 90) {
      groupingStrategy = 'week';
    } else {
      groupingStrategy = 'month';
    }
    
    // Group commits and create time labels
    const groups = new Map<string, { commits: typeof sortedCommits, y: number }>();
    const currentY = layout.bounds.minY + 40;
    const groupSpacing = graphEngine.getConfig().verticalSpacing * 3;
    const nodeSpacing = graphEngine.getConfig().verticalSpacing * 1.5;
    
    sortedCommits.forEach((commit, _index) => {
      const date = commit.author.date;
      let groupKey: string;
      
      switch (groupingStrategy) {
        case 'day':
          groupKey = date.toISOString().split('T')[0];
          break;
        case 'week': {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          groupKey = weekStart.toISOString().split('T')[0];
          break;
        }
        case 'month':
          groupKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, { commits: [], y: currentY });
      }
      groups.get(groupKey)!.commits.push(commit);
    });
    
    // Calculate Y positions for groups
    let yPos = layout.bounds.minY + 40;
    const groupEntries = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
    
    return groupEntries.map(([key, group]) => {
      const firstCommit = group.commits[0];
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
      
      const groupY = yPos;
      yPos += (group.commits.length * nodeSpacing) + groupSpacing;
      
      return (
        <g key={`time-label-${key}`} className="git-timeline-period">
          {/* Time period background */}
          <rect
            x={layout.bounds.minX}
            y={groupY - 25}
            width={layout.bounds.width}
            height="20"
            fill="rgba(59, 130, 246, 0.08)"
            className="git-timeline-period-bg"
          />
          {/* Time period label */}
          <text
            x={layout.bounds.minX + 15}
            y={groupY - 10}
            className="git-timeline-period-label"
            fontSize="12"
            fill="#374151"
            fontWeight="600"
            fontFamily="-apple-system, BlinkMacSystemFont, Segoe UI, Inter, Roboto, sans-serif"
          >
            {periodLabel}
          </text>
          {/* Separator line */}
          <line
            x1={layout.bounds.minX + 10}
            y1={groupY - 5}
            x2={layout.bounds.maxX - 10}
            y2={groupY - 5}
            stroke="#e5e7eb"
            strokeWidth="1"
            className="git-timeline-separator"
          />
        </g>
      );
    });
  }, [viewMode, commits, layout, graphEngine]);

  // Calculate viewport dimensions with transform applied
  const baseViewBox = layout.bounds.width > 0 && layout.bounds.height > 0
    ? `${layout.bounds.minX - 20} ${layout.bounds.minY - 20} ${layout.bounds.width + 40} ${layout.bounds.height + 40}`
    : '0 0 100 100';

  // Different scaling behavior for different view modes
  const isLinearView = viewMode === 'linear';
  const isTreeView = viewMode === 'tree';
  const isTimelineView = viewMode === 'timeline';
  
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
    <div
      ref={containerRef}
      className={`git-graph-canvas ${isLinearView ? 'git-graph-canvas--linear' : ''} ${isTreeView ? 'git-graph-canvas--tree' : ''} ${isTimelineView ? 'git-graph-canvas--timeline' : ''} ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      {/* Navigation Controls */}
      <div className="git-graph-controls">
        <button 
          onClick={resetView}
          className="git-graph-control-button"
          title="Reset View (R)"
        >
          🔄
        </button>
        <button 
          onClick={fitToView}
          className="git-graph-control-button"
          title="Fit to View (F)"
        >
          📐
        </button>
        <button 
          onClick={() => setTransform(prev => ({ ...prev, scale: prev.scale * 1.2 }))}
          className="git-graph-control-button"
          title="Zoom In (+)"
        >
          🔍+
        </button>
        <button 
          onClick={() => setTransform(prev => ({ ...prev, scale: Math.max(0.1, prev.scale * 0.8) }))}
          className="git-graph-control-button"
          title="Zoom Out (-)"
        >
          🔍-
        </button>
        <div className="git-graph-zoom-indicator">
          {Math.round(transform.scale * 100)}%
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={baseViewBox}
        width="100%"
        height="100%"
        className="git-graph-svg"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Render connections first (behind nodes) */}
        <g className="git-connections">
          {layout.connections.map(renderConnection)}
        </g>
        
        {/* Render commit nodes */}
        <g className="git-commit-nodes">
          {layout.nodes.map(renderCommitNode)}
        </g>

        {/* Render time labels for timeline view */}
        {renderTimeLabels()}
      </svg>
      
      {/* Optional: Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="git-graph-debug">
          <small>
            Nodes: {layout.nodes.length} | 
            Connections: {layout.connections.length} | 
            Lanes: {layout.lanes} |
            View: {viewMode} |
            Zoom: {Math.round(transform.scale * 100)}%
          </small>
        </div>
      )}
    </div>
  );
};

export default GitGraphCanvas; 
