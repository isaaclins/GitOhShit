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
      <div className="commit-metadata-panel-container">
        <div className="commit-metadata-panel-header">
          <h2 className="commit-metadata-panel-title">Commit Details</h2>
        </div>
        <div className="commit-metadata-panel-empty">
          <div className="commit-metadata-panel-empty-state">
            <div className="commit-metadata-panel-empty-icon">📄</div>
            <h3>No Commit Selected</h3>
            <p>Select a commit from the list to view its details</p>
          </div>
        </div>
      </div>
    );
  }

  const isMergeCommit = commit.parents && commit.parents.length > 1;
  const isInitialCommit = !commit.parents || commit.parents.length === 0;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(commit.hash);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(commit.message);
  };

  const handleExportCommit = () => {
    const commitData = {
      hash: commit.hash,
      message: commit.message,
      author: commit.author,
      committer: commit.committer,
      parents: commit.parents,
      branches: commit.branches,
      tags: commit.tags,

    };
    
    const blob = new Blob([JSON.stringify(commitData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commit-${formatCommitHash(commit.hash)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="commit-metadata-panel-container">
      <div className="commit-metadata-panel-header">
        <h2 className="commit-metadata-panel-title">
          Commit Details
        </h2>
        <div className="commit-metadata-panel-header-actions">
          <button 
            className="commit-metadata-panel-action-button"
            onClick={handleCopyHash}
            title="Copy commit hash"
          >
            📋
          </button>
          <button 
            className="commit-metadata-panel-action-button"
            onClick={handleExportCommit}
            title="Export commit data"
          >
            📤
          </button>
        </div>
      </div>

      <div className="commit-metadata-panel-scroll-container">
        <div className="commit-metadata-panel-content">
          {/* Basic Information Section */}
          <section className="commit-metadata-section">
            <h3 className="commit-metadata-section-title">Basic Information</h3>
            <div className="commit-metadata-grid">
              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Hash</label>
                <div className="commit-metadata-value commit-metadata-hash">
                  <span className="commit-metadata-hash-text">{commit.hash}</span>
                  <button 
                    className="commit-metadata-copy-button"
                    onClick={handleCopyHash}
                    title="Copy hash"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Short Hash</label>
                <div className="commit-metadata-value">
                  {formatCommitHash(commit.hash)}
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Type</label>
                <div className="commit-metadata-value">
                  <span className={`commit-metadata-type-badge ${
                    isMergeCommit ? 'commit-metadata-type-badge--merge' : 
                    isInitialCommit ? 'commit-metadata-type-badge--initial' : 
                    'commit-metadata-type-badge--regular'
                  }`}>
                    {isMergeCommit ? '🔀 Merge Commit' : 
                     isInitialCommit ? '🌱 Initial Commit' : 
                     '📝 Regular Commit'}
                  </span>
                </div>
              </div>

              <div className="commit-metadata-field commit-metadata-field--full">
                <label className="commit-metadata-label">Message</label>
                <div className="commit-metadata-value commit-metadata-message">
                  <pre className="commit-metadata-message-text">{commit.message}</pre>
                  <button 
                    className="commit-metadata-copy-button"
                    onClick={handleCopyMessage}
                    title="Copy message"
                  >
                    📋
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Author & Committer Section */}
          <section className="commit-metadata-section">
            <h3 className="commit-metadata-section-title">Author & Committer</h3>
            <div className="commit-metadata-grid">
              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Author</label>
                <div className="commit-metadata-value">
                  <div className="commit-metadata-person">
                    <span className="commit-metadata-person-name">{commit.author.name}</span>
                    {commit.author.email && (
                      <span className="commit-metadata-person-email">&lt;{commit.author.email}&gt;</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Author Date</label>
                <div className="commit-metadata-value">
                  <div className="commit-metadata-date">
                    <span className="commit-metadata-date-absolute">
                      {commit.author.date.toLocaleString()}
                    </span>
                    <span className="commit-metadata-date-relative">
                      ({formatRelativeTime(commit.author.date)})
                    </span>
                  </div>
                </div>
              </div>

              {commit.committer && (
                <>
                  <div className="commit-metadata-field">
                    <label className="commit-metadata-label">Committer</label>
                    <div className="commit-metadata-value">
                      <div className="commit-metadata-person">
                        <span className="commit-metadata-person-name">{commit.committer.name}</span>
                        {commit.committer.email && (
                          <span className="commit-metadata-person-email">&lt;{commit.committer.email}&gt;</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="commit-metadata-field">
                    <label className="commit-metadata-label">Committer Date</label>
                    <div className="commit-metadata-value">
                      <div className="commit-metadata-date">
                        <span className="commit-metadata-date-absolute">
                          {commit.committer.date.toLocaleString()}
                        </span>
                        <span className="commit-metadata-date-relative">
                          ({formatRelativeTime(commit.committer.date)})
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Relationships Section */}
          <section className="commit-metadata-section">
            <h3 className="commit-metadata-section-title">Relationships</h3>
            <div className="commit-metadata-grid">
              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Parents</label>
                <div className="commit-metadata-value">
                  {commit.parents && commit.parents.length > 0 ? (
                    <div className="commit-metadata-hash-list">
                      {commit.parents.map((parentHash, index) => (
                        <span key={parentHash} className="commit-metadata-hash-item">
                          {formatCommitHash(parentHash)}
                          {index < commit.parents!.length - 1 && ', '}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="commit-metadata-empty">No parents (initial commit)</span>
                  )}
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Branches</label>
                <div className="commit-metadata-value">
                  {commit.branches && commit.branches.length > 0 ? (
                    <div className="commit-metadata-branch-list">
                      {commit.branches.map((branch) => (
                        <span key={branch} className="commit-metadata-branch-item">
                          🌿 {branch}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="commit-metadata-empty">No branch information</span>
                  )}
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Tags</label>
                <div className="commit-metadata-value">
                  {commit.tags && commit.tags.length > 0 ? (
                    <div className="commit-metadata-tag-list">
                      {commit.tags.map((tag) => (
                        <span key={tag} className="commit-metadata-tag-item">
                          🏷️ {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="commit-metadata-empty">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Section */}
          <section className="commit-metadata-section">
            <h3 className="commit-metadata-section-title">Statistics</h3>
            <div className="commit-metadata-grid">
              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Files Changed</label>
                <div className="commit-metadata-value">
                  <span className="commit-metadata-stat">
                    {commit.stats ? commit.stats.files : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Insertions</label>
                <div className="commit-metadata-value">
                  <span className="commit-metadata-stat commit-metadata-stat--insertions">
                    +{commit.stats ? commit.stats.insertions : 0}
                  </span>
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Deletions</label>
                <div className="commit-metadata-value">
                  <span className="commit-metadata-stat commit-metadata-stat--deletions">
                    -{commit.stats ? commit.stats.deletions : 0}
                  </span>
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Parent Count</label>
                <div className="commit-metadata-value">
                  <span className="commit-metadata-stat">
                    {commit.parents ? commit.parents.length : 0}
                  </span>
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Branch Count</label>
                <div className="commit-metadata-value">
                  <span className="commit-metadata-stat">
                    {commit.branches ? commit.branches.length : 0}
                  </span>
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Tag Count</label>
                <div className="commit-metadata-value">
                  <span className="commit-metadata-stat">
                    {commit.tags ? commit.tags.length : 0}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Details Section */}
          <section className="commit-metadata-section">
            <h3 className="commit-metadata-section-title">Technical Details</h3>
            <div className="commit-metadata-grid">
              {commit.tree && (
                <div className="commit-metadata-field">
                  <label className="commit-metadata-label">Tree Hash</label>
                  <div className="commit-metadata-value">
                    <div className="commit-metadata-hash">
                      <span className="commit-metadata-hash-text">{commit.tree}</span>
                      <button 
                        className="commit-metadata-copy-button"
                        onClick={() => navigator.clipboard.writeText(commit.tree!)}
                        title="Copy tree hash"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {commit.encoding && (
                <div className="commit-metadata-field">
                  <label className="commit-metadata-label">Encoding</label>
                  <div className="commit-metadata-value">
                    {commit.encoding}
                  </div>
                </div>
              )}

              {commit.signature && (
                <div className="commit-metadata-field commit-metadata-field--full">
                  <label className="commit-metadata-label">GPG Signature</label>
                  <div className="commit-metadata-value">
                    <pre className="commit-metadata-signature">{commit.signature}</pre>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Enhanced Date Information */}
          <section className="commit-metadata-section">
            <h3 className="commit-metadata-section-title">Date Information</h3>
            <div className="commit-metadata-grid">
              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Author Date (Relative)</label>
                <div className="commit-metadata-value">
                  {commit.author.dateRelative || formatRelativeTime(commit.author.date)}
                </div>
              </div>

              <div className="commit-metadata-field">
                <label className="commit-metadata-label">Author Date (ISO)</label>
                <div className="commit-metadata-value">
                  <span className="commit-metadata-iso-date">
                    {commit.author.dateISO || commit.author.date.toISOString()}
                  </span>
                </div>
              </div>

              {commit.committer && (
                <>
                  <div className="commit-metadata-field">
                    <label className="commit-metadata-label">Committer Date (Relative)</label>
                    <div className="commit-metadata-value">
                      {commit.committer.dateRelative || formatRelativeTime(commit.committer.date)}
                    </div>
                  </div>

                  <div className="commit-metadata-field">
                    <label className="commit-metadata-label">Committer Date (ISO)</label>
                    <div className="commit-metadata-value">
                      <span className="commit-metadata-iso-date">
                        {commit.committer.dateISO || commit.committer.date.toISOString()}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Changed Files Section */}
          {commit.stats && commit.stats.changedFiles && commit.stats.changedFiles.length > 0 && (
            <section className="commit-metadata-section">
              <h3 className="commit-metadata-section-title">Changed Files</h3>
              <div className="commit-metadata-file-list">
                {commit.stats.changedFiles.map((file, index) => (
                  <div key={index} className="commit-metadata-file-item">
                    <span className="commit-metadata-file-path">📁 {file}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Raw Body Section */}
          {commit.rawBody && commit.rawBody !== commit.message && (
            <section className="commit-metadata-section">
              <h3 className="commit-metadata-section-title">Full Commit Message</h3>
              <div className="commit-metadata-raw-body">
                <pre className="commit-metadata-raw-body-text">{commit.rawBody}</pre>
                <button 
                  className="commit-metadata-copy-button"
                  onClick={() => navigator.clipboard.writeText(commit.rawBody!)}
                  title="Copy full message"
                >
                  📋
                </button>
              </div>
            </section>
          )}

          {/* Notes Section */}
          {commit.notes && (
            <section className="commit-metadata-section">
              <h3 className="commit-metadata-section-title">Git Notes</h3>
              <div className="commit-metadata-notes">
                <pre className="commit-metadata-notes-text">{commit.notes}</pre>
                <button 
                  className="commit-metadata-copy-button"
                  onClick={() => navigator.clipboard.writeText(commit.notes!)}
                  title="Copy notes"
                >
                  📋
                </button>
              </div>
            </section>
          )}

          {/* Actions Section */}
          <section className="commit-metadata-section">
            <h3 className="commit-metadata-section-title">Actions</h3>
            <div className="commit-metadata-actions">
              <button 
                className="commit-metadata-action-button commit-metadata-action-button--primary"
                onClick={handleCopyHash}
              >
                📋 Copy Hash
              </button>
              <button 
                className="commit-metadata-action-button commit-metadata-action-button--secondary"
                onClick={handleCopyMessage}
              >
                📝 Copy Message
              </button>
              <button 
                className="commit-metadata-action-button commit-metadata-action-button--secondary"
                onClick={handleExportCommit}
              >
                📤 Export Data
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CommitMetadataPanel; 
