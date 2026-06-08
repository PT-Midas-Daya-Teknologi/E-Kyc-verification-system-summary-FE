import React, { useMemo, useState } from 'react';
import { FileJson, Download, AlertCircle } from 'lucide-react';
import { formatCellValue } from '../utils/dynamicTableUtils.js';
import { api, getApiErrorMessage } from '../services/api.js';
import VideoViewer from './VideoViewer.jsx';

export default function RowDetailsModal({ row, onSessionSelect, onClose }) {
  if (!row) return null;
  const sessionIds = Array.isArray(row.sessionIds) ? row.sessionIds : [];
  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [activeSessionId, setActiveSessionId] = useState(row.selectedSessionId ?? null);
  const [loadingSessionId, setLoadingSessionId] = useState(null);
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
//
  const showSessionDetailView = useMemo(
    () => Boolean(activeSessionId && String(row.selectedSessionId) === String(activeSessionId)),
    [activeSessionId, row.selectedSessionId]
  );

  const handleViewDetails = async (sessionId) => {
    setLoadingSessionId(sessionId);
    try {
      await onSessionSelect?.(sessionId);
      setActiveSessionId(sessionId);
    } finally {
      setLoadingSessionId(null);
    }
  };

  const handleBack = () => {
    setActiveSessionId(null);
  };

  const handleDownloadDocument = async (documentId, documentName) => {
    setDownloadingDocId(documentId);
    setDownloadError(null);
    try {
      const response = await api.post('/dashboard/document', { documentId }, {
        responseType: 'blob',
      });

      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName || `document-${documentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(getApiErrorMessage(error) || 'Failed to download document');
    } finally {
      setDownloadingDocId(null);
    }
  };
  const formattedAttempts = (() => {
    try {
      const data = row?.attempts;
      return typeof data === 'string'
        ? JSON.stringify(JSON.parse(data), null, 2)
        : JSON.stringify(data, null, 2);
    } catch {
      return row?.attempts || '-';
    }
  })();
  
  const formattedOcrData = (() => {
    try {
      const data =
        row?.userDocumentResponse?.ocrData ||
        row?.ocrData ||
        row?.ocr_data;
  
      return typeof data === 'string'
        ? JSON.stringify(JSON.parse(data), null, 2)
        : JSON.stringify(data, null, 2);
    } catch {
      return (
        row?.userDocumentResponse?.ocrData ||
        row?.ocrData ||
        row?.ocr_data ||
        '-'
      );
    }
  })();
  const renderDataCard = (title, value, isJsonLike = false) => (
    <div>
      <div
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          color: '#0369a1',
          letterSpacing: '0.04em',
          marginBottom: '0.4rem',
        }}
      >
        {title}
      </div>
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.1), rgba(37, 99, 235, 0.08))',
          border: '1px solid rgba(14, 165, 233, 0.28)',
          borderRadius: '0.65rem',
          padding: '0.75rem 0.85rem',
          color: '#0f172a',
          fontSize: '0.86rem',
          fontFamily: isJsonLike ? 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' : 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          lineHeight: 1.5,
        }}
      >
        {formatCellValue(value)}
      </div>
    </div>
  );

  const renderDocumentCard = () => {
    const document = row?.userDocumentResponse;
    if (!document || !document.documentId) return null;

    const isDownloading = downloadingDocId === document.documentId;

    return (
      <div>
        <div
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#0369a1',
            letterSpacing: '0.04em',
            marginBottom: '0.4rem',
          }}
        >
          Document
        </div>
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.1), rgba(37, 99, 235, 0.08))',
            border: '1px solid rgba(14, 165, 233, 0.28)',
            borderRadius: '0.65rem',
            padding: '0.75rem 0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
              fontSize: '0.86rem',
              color: '#0f172a',
              wordBreak: 'break-word',
            }}
          >
            {document.documentName || `Document ${document.documentId}`}
          </div>
          <button
            type="button"
            onClick={() => handleDownloadDocument(document.documentId, document.documentName)}
            disabled={isDownloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              border: '1px solid rgba(37, 99, 235, 0.45)',
              background: isDownloading ? 'rgba(37, 99, 235, 0.15)' : 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(37,99,235,0.22))',
              color: '#0f172a',
              borderRadius: '0.5rem',
              padding: '0.4rem 0.65rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: isDownloading ? 'wait' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
              opacity: isDownloading ? 0.7 : 1,
            }}
          >
            <Download size={14} />
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>
        </div>
        {downloadError && (
          <div
            style={{
              marginTop: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              padding: '0.5rem 0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.75rem',
              color: '#dc2626',
            }}
          >
            <AlertCircle size={14} />
            {downloadError}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
      role="presentation"
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
          borderRadius: '1.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          maxWidth: '640px',
          width: '90%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="row-details-title"
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FileJson size={22} color="white" />
            </div>
            <div>
              <h2 id="row-details-title" style={{ margin: 0, color: 'white', fontSize: '1.25rem' }}>
                Session Details
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              borderRadius: '0.5rem',
              fontSize: '1.25rem',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {!showSessionDetailView ? (
              <div>
                <div
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: '#0369a1',
                    letterSpacing: '0.04em',
                    marginBottom: '0.55rem',
                  }}
                >
                  Session IDs
                </div>
                {sessionIds.length === 0 ? (
                  <div
                    style={{
                      background: 'rgba(14, 165, 233, 0.08)',
                      border: '1.5px solid rgba(14, 165, 233, 0.25)',
                      borderRadius: '0.6rem',
                      padding: '0.75rem 0.85rem',
                      color: '#0f172a',
                      fontSize: '0.875rem',
                    }}
                  >
                    No sessions found
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '0.6rem' }}>
                    {sessionIds.map((sessionId) => {
                      const isHovered = hoveredSessionId === sessionId;
                      const isLoading = loadingSessionId === sessionId;
                      return (
                        <div
                          key={sessionId}
                          onMouseEnter={() => setHoveredSessionId(sessionId)}
                          onMouseLeave={() => setHoveredSessionId(null)}
                          style={{
                            width: '100%',
                            borderRadius: '0.65rem',
                            border: '1.5px solid rgba(14, 165, 233, 0.25)',
                            background: isHovered ? 'rgba(14, 165, 233, 0.12)' : 'rgba(14, 165, 233, 0.08)',
                            padding: '0.65rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              minWidth: 0,
                              fontSize: '0.82rem',
                              color: '#0f172a',
                              wordBreak: 'break-all',
                              lineHeight: 1.4,
                            }}
                          >
                            {sessionId}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleViewDetails(sessionId)}
                            style={{
                              opacity: isHovered || isLoading ? 1 : 0,
                              transform: isHovered || isLoading ? 'translateX(0)' : 'translateX(8px)',
                              pointerEvents: isHovered || isLoading ? 'auto' : 'none',
                              transition: 'all 0.2s ease',
                              border: '1px solid rgba(37, 99, 235, 0.45)',
                              background: 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(37,99,235,0.22))',
                              color: '#0f172a',
                              borderRadius: '0.5rem',
                              padding: '0.4rem 0.65rem',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: isLoading ? 'wait' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Loading...' : 'View Details'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    justifySelf: 'start',
                    border: '1px solid rgba(14, 165, 233, 0.35)',
                    background: 'rgba(14, 165, 233, 0.08)',
                    color: '#0369a1',
                    borderRadius: '0.5rem',
                    padding: '0.42rem 0.65rem',
                    fontWeight: 700,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    width: 'fit-content',
                  }}
                >
                  ← Back
                </button>
                {renderDataCard('Session ID', activeSessionId)}
                {renderDocumentCard()}
                {row?.userVideoResponse?.videoId && (
                  <VideoViewer 
                    videoId={row.userVideoResponse.videoId}
                    videoName={row.userVideoResponse.videoName || 'Session Video'}
                    onClose={() => {}}
                  />
                )}
                {renderDataCard('Attempts Data', formattedAttempts, true)}
                {renderDataCard('OCR Data', formattedOcrData, true)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
