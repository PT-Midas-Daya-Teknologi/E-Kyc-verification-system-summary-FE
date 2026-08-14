import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { api } from '../services/api.js';

export default function VideoViewer({ videoId, videoName, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);

  const handleViewVideo = async () => {
    if (isVisible) {
      setIsVisible(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/dashboard/video/file', { videoId }, { responseType: 'arraybuffer' });
      const contentType = response.headers?.['content-type'] || response.headers?.['Content-Type'] || 'video/mp4';
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      setVideoUrl(url);
      setIsVisible(true);
    } catch (err) {
      console.error('Error fetching video:', err);
      setError(err.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (videoUrl) {
        window.URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

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
        Video
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
          {videoName || `Video ${videoId?.substring(0, 8)}...`}
        </div>
        <button
          type="button"
          onClick={handleViewVideo}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
            border: '1px solid rgba(37, 99, 235, 0.45)',
            background: isVisible
              ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.22))'
              : 'linear-gradient(135deg, rgba(14,165,233,0.2), rgba(37,99,235,0.22))',
            color: '#0f172a',
            borderRadius: '0.5rem',
            padding: '0.4rem 0.65rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: loading ? 'wait' : 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? (
            <>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Loading...
            </>
          ) : isVisible ? (
            <>
              <EyeOff size={14} />
              Hide
            </>
          ) : (
            <>
              <Eye size={14} />
              View
            </>
          )}
        </button>
      </div>

      {error && (
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
          {error}
        </div>
      )}

      {isVisible && videoUrl && (
        <div
          style={{
            marginTop: '0.75rem',
            background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05), rgba(37, 99, 235, 0.05))',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            borderRadius: '0.65rem',
            overflow: 'hidden',
            padding: '0.5rem',
          }}
        >
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: '0.5rem',
              backgroundColor: '#000',
            }}
            controls
            autoPlay
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
