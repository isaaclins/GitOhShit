import React from 'react';
import './CommitTabList.css';
import { GitCommit } from '../../types';
import { formatCommitHash, formatCommitMessage, formatRelativeTime } from '../../utils/formatters';

interface CommitTabListProps {
  commits: GitCommit[];
  selectedCommit: string | null;
  onCommitSelect: (commitHash: string) => void;
  branchFilter?: string | null;
}

const CommitTabList: React.FC<CommitTabListProps> = ({
  commits,
  selectedCommit,
  onCommitSelect,
  branchFilter,
}) => {
  // Filter commits by branch if filter is set
  const filteredCommits = branchFilter 
    ? commits.filter(commit => 
        commit.branches && commit.branches.includes(branchFilter)
      )
    : commits;

  // Sort commits by date (newest first)
  const sortedCommits = [...filteredCommits].sort((a, b) => 
    b.author.date.getTime() - a.author.date.getTime()
  );

  const handleTabClick = (commitHash: string) => {
    onCommitSelect(commitHash);
  };

  const getBranchColors = (branches: string[] | undefined): string[] => {
    if (!branches) return ['#6b7280'];
    
    const colors = [
      '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
      '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
      '#ec4899', '#f43f5e'
    ];
    
    return branches.map((_, index) => colors[index % colors.length]);
  };

  if (sortedCommits.length === 0) {
    return (
      <div className="commit-tab-list-container">
        <div className="commit-tab-list-header">
          <h3 className="commit-tab-list-title">
            Commits (0)
          </h3>
          {branchFilter && (
            <span className="commit-tab-list-filter">
              📍 {branchFilter}
            </span>
          )}
        </div>
        <div className="commit-tab-list-empty">
          <div className="commit-tab-list-empty-state">
            <p>No commits to display</p>
            {branchFilter && (
              <p className="commit-tab-list-empty-filter">
                No commits found in branch: <strong>{branchFilter}</strong>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="commit-tab-list-container">
      <div className="commit-tab-list-header">
        <h3 className="commit-tab-list-title">
          Commits ({sortedCommits.length})
        </h3>
        {branchFilter && (
          <span className="commit-tab-list-filter">
            📍 {branchFilter}
          </span>
        )}
      </div>

      <div className="commit-tab-list-scroll-container">
        <div className="commit-tab-list-content">
          {sortedCommits.map((commit, index) => {
            const isSelected = selectedCommit === commit.hash;
                const isMergeCommit = commit.parents && commit.parents.length > 1;
    const isInitialCommit = !commit.parents || commit.parents.length === 0;
            const branchColors = getBranchColors(commit.branches);

            return (
              <div
                key={commit.hash}
                className={`commit-tab ${isSelected ? 'commit-tab--selected' : ''} ${isMergeCommit ? 'commit-tab--merge' : ''} ${isInitialCommit ? 'commit-tab--initial' : ''}`}
                onClick={() => handleTabClick(commit.hash)}
                role="tab"
                tabIndex={0}
                aria-selected={isSelected}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleTabClick(commit.hash);
                  }
                }}
              >
                {/* Commit indicator line */}
                <div className="commit-tab__indicator">
                  <div 
                    className="commit-tab__dot"
                    style={{ backgroundColor: branchColors[0] }}
                  >
                    {isMergeCommit && <span className="commit-tab__merge-icon">M</span>}
                    {isInitialCommit && <span className="commit-tab__initial-icon">●</span>}
                  </div>
                  {index < sortedCommits.length - 1 && (
                    <div 
                      className="commit-tab__line"
                      style={{ backgroundColor: branchColors[0] }}
                    />
                  )}
                </div>

                {/* Commit content */}
                <div className="commit-tab__content">
                  <div className="commit-tab__header">
                    <span className="commit-tab__hash">
                      {formatCommitHash(commit.hash)}
                    </span>
                    <span className="commit-tab__time">
                      {formatRelativeTime(commit.author.date)}
                    </span>
                  </div>

                  <div className="commit-tab__message">
                    {formatCommitMessage(commit.message, 50)}
                  </div>

                  <div className="commit-tab__author">
                    <span className="commit-tab__author-name">
                      {commit.author.name}
                    </span>
                    {commit.author.email && (
                      <span className="commit-tab__author-email">
                        ({commit.author.email})
                      </span>
                    )}
                  </div>

                  {/* Branch indicators */}
                  {commit.branches && commit.branches.length > 0 && (
                    <div className="commit-tab__branches">
                      {commit.branches.slice(0, 3).map((branch, branchIndex) => (
                        <span
                          key={branch}
                          className="commit-tab__branch"
                          style={{ 
                            backgroundColor: branchColors[branchIndex],
                            color: '#ffffff'
                          }}
                        >
                          {branch}
                        </span>
                      ))}
                      {commit.branches.length > 3 && (
                        <span className="commit-tab__branch-more">
                          +{commit.branches.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tags */}
                  {commit.tags && commit.tags.length > 0 && (
                    <div className="commit-tab__tags">
                      {commit.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="commit-tab__tag">
                          🏷️ {tag}
                        </span>
                      ))}
                      {commit.tags.length > 2 && (
                        <span className="commit-tab__tag-more">
                          +{commit.tags.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CommitTabList; 
