import { forwardRef } from 'react';

const PreviewSection = forwardRef(function PreviewSection(
  { name, siteId, className = '' },
  ref,
) {
  const previewUrl = `/api/site/${siteId}`;

  return (
    <div className={`website-preview ${className}`}>
      <div className="preview-header">
        <h2>Preview</h2>
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="website-name"
        >
          {name} ↗
        </a>
      </div>
      <div className="preview-frame">
        {siteId ? (
          <iframe
            ref={ref}
            src={previewUrl}
            title={name}
            className="website-iframe"
          />
        ) : (
          <div className="no-preview">
            <span>No preview available</span>
          </div>
        )}
      </div>
    </div>
  );
});

export default PreviewSection;
