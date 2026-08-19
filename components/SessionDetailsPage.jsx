import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, AlertCircle, Download, Loader } from 'lucide-react';
import { api, getApiErrorMessage } from '../services/api.js';

const containerStyles = {
  minHeight: '100vh',
  background: '#ffffff',
  padding: '0',
  display: 'flex',
  flexDirection: 'column',
};

const mainStyles = {
  maxWidth: '960px',
  width: '100%',
  margin: '0 auto',
  padding: '1.5rem 1.25rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const headerStyles = {
  background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
  borderRadius: '1rem',
  padding: '1.25rem 1.5rem',
  color: 'white',
  boxShadow: '0 10px 30px rgba(14, 165, 233, 0.2)',
};

const buttonStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.6rem 0.9rem',
  borderRadius: '0.7rem',
  background: 'rgba(255, 255, 255, 0.2)',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  color: 'white',
  fontWeight: '700',
  fontSize: '0.85rem',
  cursor: 'pointer',
  width: 'fit-content',
};

const cardStyles = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: '1rem',
  padding: '1rem 1.1rem',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
};

const sectionTitleStyles = {
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: '#0369a1',
  letterSpacing: '0.04em',
  marginBottom: '0.55rem',
};

const valueBoxStyles = {
  background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.1), rgba(37, 99, 235, 0.08))',
  border: '1px solid rgba(14, 165, 233, 0.28)',
  borderRadius: '0.65rem',
  padding: '0.75rem 0.85rem',
  color: '#0f172a',
  fontSize: '0.87rem',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  lineHeight: 1.5,
};

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

function formatSessionTimestamp(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return formatValue(value);
  const parts = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value: partValue }) => [type, partValue]));
  return `${values.day} ${values.month} ${values.year} ${values.hour}:${values.minute}`;
}

function getDisplayValue(session, key) {
  if (key === 'status') {
    if (session?.status != null && session.status !== '') return formatValue(session.status);
    if (typeof session?.isActive === 'boolean') return session.isActive ? 'Active' : 'Inactive';
    return '—';
  }
  if (key === 'createdAt' || key === 'updatedAt') return formatSessionTimestamp(session?.[key]);
  return formatValue(session?.[key]);
}

export default function SessionDetailsPage({ session, onBack }) {
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState(null);
  const [audioPath, setAudioPath] = useState(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
  const [documentPreviewLoading, setDocumentPreviewLoading] = useState(false);
  const [documentPreviewError, setDocumentPreviewError] = useState(null);
  const [downloadingDocId, setDownloadingDocId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);

  const details = useMemo(() => {
    return [
      ['Session Name', 'sessionName'],
      ['Status', 'status'],
      ['Reason', 'reason'],
      ['Created At', 'createdAt'],
      ['Updated At', 'updatedAt'],
    ];
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        window.URL.revokeObjectURL(videoUrl);
      }
      if (documentPreviewUrl) {
        window.URL.revokeObjectURL(documentPreviewUrl);
      }
    };
  }, [videoUrl, documentPreviewUrl]);

  useEffect(() => {
    const documentId = session?.userDocumentResponse?.documentId;
    if (!documentId) {
      setDocumentPreviewUrl(null);
      setDocumentPreviewError(null);
      setDocumentPreviewLoading(false);
      return undefined;
    }

    let cancelled = false;
    let objectUrl = null;

    const loadDocumentPreview = async () => {
      setDocumentPreviewLoading(true);
      setDocumentPreviewError(null);
      try {
        const response = await api.post('/dashboard/document', { documentId }, { responseType: 'blob' });
        const blob = response?.data;
        if (!blob || blob.size === 0) {
          throw new Error('No document content returned');
        }
        objectUrl = window.URL.createObjectURL(blob);
        if (!cancelled) {
          setDocumentPreviewUrl(objectUrl);
        }
      } catch {
        if (!cancelled) {
          setDocumentPreviewError('Document unavailable');
          setDocumentPreviewUrl(null);
        }
      } finally {
        if (!cancelled) {
          setDocumentPreviewLoading(false);
        }
      }
    };

    loadDocumentPreview();

    return () => {
      cancelled = true;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [session?.userDocumentResponse?.documentId]);

  const handleDownloadDocument = async (documentId, documentName) => {
    if (!documentId) return;
    setDownloadingDocId(documentId);
    setDownloadError(null);
    try {
      const response = await api.post('/dashboard/document', { documentId }, { responseType: 'blob' });
      const blob = response?.data;
      if (!blob || blob.size === 0) {
        throw new Error('No document content returned');
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName || `document-${documentId}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      setDownloadError(getApiErrorMessage(error) || 'Failed to download document');
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleViewVideo = async () => {
    const videoId = session?.userVideoResponse?.videoId ?? session?.videoId;
    if (!videoId) {
      setVideoError('No video is available for this session.');
      return;
    }

    setVideoLoading(true);
    setVideoError(null);
    try {
      const response = await api.post('/dashboard/video/file', { videoId }, { responseType: 'arraybuffer' });
      const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'] || 'video/mp4';
      const blob = new Blob([response.data], { type: contentType });
      const nextUrl = window.URL.createObjectURL(blob);
      setVideoUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return nextUrl;
      });
    } catch (error) {
      setVideoError(error.message || 'Failed to load video');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleLoadAudio = async () => {
    const videoId = session?.userVideoResponse?.videoId ?? session?.videoId;
    if (!videoId) {
      setAudioError('No audio is available for this session.');
      return;
    }

    setAudioLoading(true);
    setAudioError(null);
    try {
      const response = await api.post('/dashboard/audio', { videoId });
      const nextAudioPath = response?.data?.body?.audioPath ?? response?.data?.audioPath ?? null;
      if (!nextAudioPath) {
        throw new Error('Audio path not found');
      }

      const fileResponse = await api.post('/dashboard/audio/file', { videoId }, { responseType: 'arraybuffer' });
      const contentType = fileResponse.headers?.['content-type'] || fileResponse.headers?.['Content-Type'] || 'audio/ogg';
      const blob = new Blob([fileResponse.data], { type: contentType });
      const nextUrl = window.URL.createObjectURL(blob);
      setAudioPath(nextUrl);
    } catch (error) {
      setAudioError(getApiErrorMessage(error) || 'Failed to load audio');
    } finally {
      setAudioLoading(false);
    }
  };

  const documentData = session?.userDocumentResponse ?? null;
  const documentName = documentData?.documentName || 'Document';
  const documentExtension = (documentName || '').split('.').pop()?.toLowerCase();
  const canPreviewInline = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'].includes(documentExtension || '');

  return (
    <div style={containerStyles}>
      <div style={mainStyles}>
        <div style={headerStyles}>
          <button type="button" onClick={onBack} style={buttonStyles}>
            <ArrowLeft size={16} />
            Back to Sessions
          </button>
          <div style={{ marginTop: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.35rem' }}>Session Details</h2>
            <p style={{ margin: '0.3rem 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem' }}>
              Review the selected session information
            </p>
          </div>
        </div>

        <div style={cardStyles}>
          <div style={{ display: 'grid', gap: '0.85rem' }}>
            {details.map(([label, key]) => (
              <div key={key}>
                <div style={sectionTitleStyles}>{label}</div>
                <div style={valueBoxStyles}>{getDisplayValue(session, key)}</div>
              </div>
            ))}

            <div>
              <div style={sectionTitleStyles}>User Image</div>
              <div style={{ ...valueBoxStyles, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ color: '#0f172a', fontSize: '0.88rem' }}>
                    {documentName}
                  </div>
                  {documentData?.documentId ? (
                    <button
                      type="button"
                      onClick={() => handleDownloadDocument(documentData.documentId, documentName)}
                      disabled={downloadingDocId === documentData.documentId}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '0.6rem',
                        background: 'linear-gradient(135deg, rgba(14,165,233,0.16), rgba(37,99,235,0.18))',
                        border: '1px solid rgba(14, 165, 233, 0.28)',
                        color: '#0369a1',
                        fontWeight: '700',
                        cursor: downloadingDocId === documentData.documentId ? 'wait' : 'pointer',
                        fontSize: '0.8rem',
                      }}
                    >
                      {downloadingDocId === documentData.documentId ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={14} />}
                      {downloadingDocId === documentData.documentId ? 'Downloading...' : 'Download'}
                    </button>
                  ) : null}
                </div>
                {downloadError ? (
                  <div style={{ color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={14} />
                    {downloadError}
                  </div>
                ) : null}
                {documentPreviewLoading ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading document…</div>
                ) : documentPreviewError || !documentPreviewUrl ? (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>User hasn't performed align face challenge</div>
                ) : canPreviewInline && documentExtension !== 'pdf' ? (
                  <img
                    src={documentPreviewUrl}
                    alt="Document preview"
                    style={{ width: '100%', maxWidth: '320px', height: 'auto', borderRadius: '0.65rem', display: 'block', objectFit: 'contain', border: '1px solid rgba(14,165,233,0.2)' }}
                  />
                ) : canPreviewInline && documentExtension === 'pdf' ? (
                  <iframe
                    src={documentPreviewUrl}
                    title="Document preview"
                    style={{ width: '100%', minHeight: '280px', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '0.65rem' }}
                  />
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Preview not available for this file type.</div>
                )}
              </div>
            </div>

            <div>
              <div style={sectionTitleStyles}>Session Video</div>
              <div style={{ ...valueBoxStyles, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ color: '#0f172a', fontSize: '0.88rem' }}>
                    {session?.userVideoResponse?.videoName || 'Session Video'}
                  </div>
                  <button
                    type="button"
                    onClick={handleViewVideo}
                    disabled={videoLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '0.6rem',
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.16), rgba(37,99,235,0.18))',
                      border: '1px solid rgba(14, 165, 233, 0.28)',
                      color: '#0369a1',
                      fontWeight: '700',
                      cursor: videoLoading ? 'wait' : 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    {videoLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {videoLoading ? 'Loading...' : 'Load Video'}
                  </button>
                </div>
                {videoError ? (
                  <div style={{ color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={14} />
                    {videoError}
                  </div>
                ) : null}
                {videoUrl ? (
                  <video controls style={{ width: '100%', maxWidth: '100%', borderRadius: '0.6rem', background: '#000' }}>
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    No video preview loaded yet.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={sectionTitleStyles}>Session Audio</div>
              <div style={{ ...valueBoxStyles, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ color: '#0f172a', fontSize: '0.88rem' }}>
                    {session?.userVideoResponse?.videoName || 'Session Audio'}
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadAudio}
                    disabled={audioLoading}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.75rem',
                      borderRadius: '0.6rem',
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.16), rgba(37,99,235,0.18))',
                      border: '1px solid rgba(14, 165, 233, 0.28)',
                      color: '#0369a1',
                      fontWeight: '700',
                      cursor: audioLoading ? 'wait' : 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    {audioLoading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                    {audioLoading ? 'Loading...' : 'Load Audio'}
                  </button>
                </div>
                {audioError ? (
                  <div style={{ color: '#dc2626', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <AlertCircle size={14} />
                    {audioError}
                  </div>
                ) : null}
                {audioPath ? (
                  <audio controls style={{ width: '100%', maxWidth: '100%' }} src={audioPath}>
                    Your browser does not support the audio tag.
                  </audio>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                    No audio loaded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
