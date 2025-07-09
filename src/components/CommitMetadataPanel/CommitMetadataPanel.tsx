import React from 'react';
import './CommitMetadataPanel.css';
import { GitCommit } from '../../types';
import { formatCommitHash, formatRelativeTime } from '../../utils/formatters';

interface CommitMetadataPanelProps {
  commit: GitCommit | null;
}

const CommitMetadataPanel: React.FC<CommitMetadataPanelProps> = ({ commit }) => {
  if (!commit) {
    return (
      <div className="commit-metadata-panel commit-metadata-panel--empty">
        <div className="commit-metadata-panel__empty-state">
          <div className="commit-metadata-panel__empty-icon">📋</div>
          <h3>No Commit Selected</h3>
          <p>Select a commit from the list to view its detailed metadata</p>
        </div>
      </div>
    );
  }

  const isMergeCommit = commit.parents && commit.parents.length > 1;
  const isInitialCommit = !commit.parents || commit.parents.length === 0;
  const hasMultipleBranches = commit.branches && commit.branches.length > 1;

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <div className="commit-metadata-panel">
      <div className="commit-metadata-panel__header">
        <div className="commit-metadata-panel__title-row">
          <h2 className="commit-metadata-panel__title">
            Commit Details
          </h2>
          <div className="commit-metadata-panel__badges">
            {isMergeCommit && (
              <span className="commit-metadata-panel__badge commit-metadata-panel__badge--merge">
                Merge Commit
              </span>
            )}
            {isInitialCommit && (
              <span className="commit-metadata-panel__badge commit-metadata-panel__badge--initial">
                Initial Commit
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="commit-metadata-panel__content">
        {/* Basic Information */}
        <section className="commit-metadata-panel__section">
          <h3 className="commit-metadata-panel__section-title">Basic Information</h3>
          
          <div className="commit-metadata-panel__field-group">
            <div className="commit-metadata-panel__field">
              <label className="commit-metadata-panel__label">Hash</label>
              <div className="commit-metadata-panel__value commit-metadata-panel__value--code">
                <span className="commit-metadata-panel__hash-full">{commit.hash}</span>
                <span className="commit-metadata-panel__hash-short">
                  ({formatCommitHash(commit.hash)})
                </span>
              </div>
            </div>

            <div className="commit-metadata-panel__field">
              <label className="commit-metadata-panel__label">Message</label>
              <div className="commit-metadata-panel__value commit-metadata-panel__value--message">
                {commit.message}
              </div>
            </div>

            {commit.body && (
              <div className="commit-metadata-panel__field">
                <label className="commit-metadata-panel__label">Description</label>
                <div className="commit-metadata-panel__value commit-metadata-panel__value--body">
                  {commit.body}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Author Information */}
        <section className="commit-metadata-panel__section">
          <h3 className="commit-metadata-panel__section-title">Author</h3>
          
          <div className="commit-metadata-panel__field-group">
            <div className="commit-metadata-panel__field">
              <label className="commit-metadata-panel__label">Name</label>
              <div className="commit-metadata-panel__value">
                {commit.author.name}
              </div>
            </div>

            {commit.author.email && (
              <div className="commit-metadata-panel__field">
                <label className="commit-metadata-panel__label">Email</label>
                <div className="commit-metadata-panel__value commit-metadata-panel__value--email">
                  <a href={`mailto:${commit.author.email}`}>
                    {commit.author.email}
                  </a>
                </div>
              </div>
            )}

            <div className="commit-metadata-panel__field">
              <label className="commit-metadata-panel__label">Date</label>
              <div className="commit-metadata-panel__value">
                <div className="commit-metadata-panel__date">
                  <span className="commit-metadata-panel__date-full">
                    {formatDate(commit.author.date)}
                  </span>
                  <span className="commit-metadata-panel__date-relative">
                    ({formatRelativeTime(commit.author.date)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commit Relationships */}
        <section className="commit-metadata-panel__section">
          <h3 className="commit-metadata-panel__section-title">Relationships</h3>
          
          <div className="commit-metadata-panel__field-group">
            {commit.parents && commit.parents.length > 0 && (
              <div className="commit-metadata-panel__field">
                <label className="commit-metadata-panel__label">
                  Parent{commit.parents.length > 1 ? 's' : ''} ({commit.parents.length})
                </label>
                <div className="commit-metadata-panel__value">
                  <div className="commit-metadata-panel__hashes">
                    {commit.parents.map((parent, index) => (
                      <span key={parent} className="commit-metadata-panel__hash-item">
                        <span className="commit-metadata-panel__hash-short-inline">
                          {formatCommitHash(parent)}
                        </span>
                        <span className="commit-metadata-panel__hash-full-inline">
                          {parent}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {commit.branches && commit.branches.length > 0 && (
              <div className="commit-metadata-panel__field">
                <label className="commit-metadata-panel__label">
                  Branch{commit.branches.length > 1 ? 'es' : ''} ({commit.branches.length})
                </label>
                <div className="commit-metadata-panel__value">
                  <div className="commit-metadata-panel__branches">
                    {commit.branches.map((branch, index) => (
                      <span 
                        key={branch} 
                        className="commit-metadata-panel__branch"
                        style={{
                          backgroundColor: getBranchColor(index),
                          color: '#ffffff'
                        }}
                      >
                        {branch}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {commit.tags && commit.tags.length > 0 && (
              <div className="commit-metadata-panel__field">
                <label className="commit-metadata-panel__label">
                  Tag{commit.tags.length > 1 ? 's' : ''} ({commit.tags.length})
                </label>
                <div className="commit-metadata-panel__value">
                  <div className="commit-metadata-panel__tags">
                    {commit.tags.map((tag) => (
                      <span key={tag} className="commit-metadata-panel__tag">
                        🏷️ {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Statistics */}
        <section className="commit-metadata-panel__section">
          <h3 className="commit-metadata-panel__section-title">Statistics</h3>
          
          <div className="commit-metadata-panel__field-group">
            <div className="commit-metadata-panel__stats-grid">
              <div className="commit-metadata-panel__stat">
                <div className="commit-metadata-panel__stat-value">
                  {commit.parents?.length || 0}
                </div>
                <div className="commit-metadata-panel__stat-label">Parents</div>
              </div>

              <div className="commit-metadata-panel__stat">
                <div className="commit-metadata-panel__stat-value">
                  {commit.branches?.length || 0}
                </div>
                <div className="commit-metadata-panel__stat-label">Branches</div>
              </div>

              <div className="commit-metadata-panel__stat">
                <div className="commit-metadata-panel__stat-value">
                  {commit.tags?.length || 0}
                </div>
                <div className="commit-metadata-panel__stat-label">Tags</div>
              </div>

              <div className="commit-metadata-panel__stat">
                <div className="commit-metadata-panel__stat-value">
                  {commit.message.split('\n')[0].length}
                </div>
                <div className="commit-metadata-panel__stat-label">Title Length</div>
              </div>
            </div>
          </div>
        </section>

        {/* Actions */}
        <section className="commit-metadata-panel__section">
          <h3 className="commit-metadata-panel__section-title">Actions</h3>
          
          <div className="commit-metadata-panel__actions">
            <button className="commit-metadata-panel__action-button commit-metadata-panel__action-button--primary">
              📋 Copy Hash
            </button>
            <button className="commit-metadata-panel__action-button">
              🔗 Copy Message
            </button>
            <button className="commit-metadata-panel__action-button">
              📤 Export Details
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

// Helper function to get branch colors
const getBranchColor = (index: number): string => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[index % colors.length];
};

export default CommitMetadataPanel; 
