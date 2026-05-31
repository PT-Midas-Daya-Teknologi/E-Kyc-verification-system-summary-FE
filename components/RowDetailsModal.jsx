import React from 'react';
import { FileJson } from 'lucide-react';
import { formatCellValue, formatColumnLabel, getRowKeys } from '../utils/dynamicTableUtils.js';

export default function RowDetailsModal({ row, extraColumns, onClose }) {
  if (!row) return null;

  const allKeys = getRowKeys(row);
  const extraSet = new Set(extraColumns ?? []);
  const orderedKeys = [
    ...allKeys.filter((k) => !extraSet.has(k)),
    ...allKeys.filter((k) => extraSet.has(k)),
  ];

  const title = row.userName ?? row.sessionId ?? 'Record details';

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
                {title}
              </h2>
              {row.sessionId && (
                <p style={{ margin: '0.15rem 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '0.75rem' }}>
                  Session: {row.sessionId}
                </p>
              )}
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
          {extraColumns?.length > 0 && (
            <p
              style={{
                margin: '0 0 1rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '0.5rem',
                color: '#92400e',
                fontSize: '0.85rem',
              }}
            >
              Row-specific fields: {extraColumns.map(formatColumnLabel).join(', ')}
            </p>
          )}

          <div style={{ display: 'grid', gap: '0.75rem' }}>
            {orderedKeys.map((key) => (
              <div key={key}>
                <div
                  style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: extraSet.has(key) ? '#b45309' : '#0369a1',
                    letterSpacing: '0.04em',
                    marginBottom: '0.25rem',
                  }}
                >
                  {formatColumnLabel(key)}
                  {extraSet.has(key) ? ' (row-specific)' : ''}
                </div>
                <div
                  style={{
                    background: 'rgba(14, 165, 233, 0.08)',
                    border: '1.5px solid rgba(14, 165, 233, 0.25)',
                    borderRadius: '0.5rem',
                    padding: '0.65rem 0.75rem',
                    color: '#0f172a',
                    fontFamily: key === 'ocrData' ? 'monospace' : 'inherit',
                    fontSize: '0.875rem',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {formatCellValue(row[key])}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
