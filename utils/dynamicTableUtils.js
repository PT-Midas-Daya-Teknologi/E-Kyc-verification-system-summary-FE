const META_ONLY_KEYS = new Set(['userId']);

const PREFERRED_COLUMN_ORDER = [
  'userName',
  'userEmail',
  'sessionId',
  'createdAt',
  'attemptNumber',
  'liveness',
  'faceScore',
  'face_score',
  'overall',
  'status',
  'documentId',
  'videoId',
];
function preferredIndex(key) {
  const idx = PREFERRED_COLUMN_ORDER.indexOf(key);
  return idx === -1 ? PREFERRED_COLUMN_ORDER.length + key.charCodeAt(0) : idx;
}

export function getRowKeys(row) {
  if (!row || typeof row !== 'object') return [];
  return Object.keys(row).filter((key) => !key.startsWith('_') && !META_ONLY_KEYS.has(key));
}

/**
 * Columns present on every row (intersection of keys).
 */
export function getCommonColumns(rows) {
  if (!rows?.length) return [];

  const keySets = rows.map((row) => new Set(getRowKeys(row)));
  const [first, ...rest] = keySets;
  const common = [...first].filter((key) => rest.every((set) => set.has(key)));

  return common.sort((a, b) => {
    const diff = preferredIndex(a) - preferredIndex(b);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}



export function getExtraColumns(row, commonColumns) {
  const common = new Set(commonColumns);
  return getRowKeys(row)
    .filter((key) => !common.has(key))
    .sort((a, b) => a.localeCompare(b));
}

export function formatColumnLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatCellValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  if (typeof value === 'number' && value > 0 && value <= 1) {
    return `${Math.round(value * 100)}%`;
  }
  return String(value);
}

export function analyzeTable(rows) {
  const commonColumns = getCommonColumns(rows);
  return {
    commonColumns,
    getExtraColumns: (row) => getExtraColumns(row, commonColumns),
  };
}

function parseAttempts(attemptsRaw) {
  if (!attemptsRaw) return [{}];
  try {
    const parsed = typeof attemptsRaw === 'string' ? JSON.parse(attemptsRaw) : attemptsRaw;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.length ? list : [{}];
  } catch {
    return [{}];
  }
}

function formatSessionDate(sessionExpiry) {
  if (!sessionExpiry) return null;
  const d = new Date(sessionExpiry);
  if (Number.isNaN(d.getTime())) return String(sessionExpiry);
  return d.toLocaleString();
}

/**
 * Flatten `/dashboard/summary/session` items into table rows (one row per attempt).
 */
export function flattenSessionItems(sessions, user = {}) {
  const rows = [];
  for (const session of sessions ?? []) {
    const attempts = parseAttempts(session.attempts);
    const sessionId = session.sessionId ?? session.id ?? null;
    const base = {
      userId: user.id,
      userName: user.name ?? user.username,
      userEmail: user.username,
      sessionId: sessionId != null ? String(sessionId) : null,
      documentId: session.documentId != null ? String(session.documentId) : null,
      videoId: session.videoId != null ? String(session.videoId) : null,
      ocrData:
        typeof session.ocrData === 'string'
          ? session.ocrData
          : JSON.stringify(session.ocrData ?? {}),
      createdAt: formatSessionDate(session.sessionExpiry),
    };

    attempts.forEach((attempt, idx) => {
      rows.push({
        ...base,
        attemptNumber: idx + 1,
        ...attempt,
      });
    });
  }
  return rows;
}

export function rowMatchesSearch(row, searchTerm) {
  if (!searchTerm?.trim()) return true;
  const q = searchTerm.trim().toLowerCase();
  return getRowKeys(row).some((key) =>
    formatCellValue(row[key]).toLowerCase().includes(q)
  );
}
