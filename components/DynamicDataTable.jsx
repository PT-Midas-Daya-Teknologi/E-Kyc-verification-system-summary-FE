import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import {
  analyzeTable,
  formatCellValue,
  formatColumnLabel,
} from '../utils/dynamicTableUtils.js';
import RowDetailsModal from './RowDetailsModal.jsx';
const thStyles = {
  padding: '0.75rem 1rem',
  textAlign: 'left',
  fontWeight: '700',
  color: '#0369a1',
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const tdStyles = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #f1f5f9',
  color: '#1e293b',
  fontSize: '0.875rem',
  verticalAlign: 'top',
};

export default function DynamicDataTable({
  rows,
  loading,
  loadError,
  emptyMessage = 'No records found',
}) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);

  const { commonColumns, getExtraColumns } = useMemo(() => analyzeTable(rows), [rows]);

  const openDetails = (row) => {
    setSelectedRow(row);
    setSelectedExtras(getExtraColumns(row));
  };

  const colSpan = commonColumns.length + 1;

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f0f9ff', borderBottom: '1.5px solid #e2e8f0' }}>
          <tr>
            {commonColumns.map((col) => (
              <th key={col} style={thStyles}>
                {formatColumnLabel(col)}
              </th>
            ))}
            <th style={{ ...thStyles, textAlign: 'center' }}>Details</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colSpan} style={{ ...tdStyles, textAlign: 'center', padding: '3rem' }}>
                Loading records…
              </td>
            </tr>
          ) : loadError ? (
            <tr>
              <td colSpan={colSpan} style={{ ...tdStyles, textAlign: 'center', padding: '3rem', color: '#dc2626' }}>
                {loadError}
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={colSpan} style={{ ...tdStyles, textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => {
              const extras = getExtraColumns(row);
              return (
                <tr
                  key={row._rowKey ?? `${row.sessionId}-${row.attemptNumber}-${idx}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(14, 165, 233, 0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {commonColumns.map((col) => (
                    <td key={col} style={tdStyles}>
                      {col === 'userName' && row.userName ? (
                        <div>
                          <div style={{ fontWeight: 600 }}>{formatCellValue(row.userName)}</div>
                          {!commonColumns.includes('userEmail') && row.userEmail && (
                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                              {formatCellValue(row.userEmail)}
                            </div>
                          )}
                        </div>
                      ) : (
                        formatCellValue(row[col])
                      )}
                    </td>
                  ))}
                  <td style={{ ...tdStyles, textAlign: 'center' }}>
                    <button
                      type="button"
                      title="View all fields"
                      onClick={() => openDetails(row)}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '0.5rem',
                        background: 'rgba(14, 165, 233, 0.15)',
                        color: '#0369a1',
                        border: '1px solid rgba(14, 165, 233, 0.3)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Eye size={20} />
                    </button>
                    {extras.length > 0 && (
                      <div style={{ fontSize: '0.65rem', color: '#b45309', marginTop: '0.25rem' }}>
                        +{extras.length} field{extras.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {selectedRow && (
        <RowDetailsModal
          row={selectedRow}
          extraColumns={selectedExtras}
          onClose={() => {
            setSelectedRow(null);
            setSelectedExtras([]);
          }}
        />
      )}
    </>
  );
}
