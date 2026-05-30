import { fetchUserSessions, fetchUserSummary } from './api.js';

function parseAttempts(attemptsRaw) {
  if (!attemptsRaw) {
    return [{ liveness: 'Unknown', faceScore: 0, overall: 'Unknown' }];
  }
  try {
    const parsed = typeof attemptsRaw === 'string' ? JSON.parse(attemptsRaw) : attemptsRaw;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.map((attempt) => ({
      liveness: attempt.liveness ?? attempt.Liveness ?? 'Unknown',
      faceScore: Number(attempt.faceScore ?? attempt.face_score ?? attempt.score ?? 0),
      overall: attempt.overall ?? attempt.status ?? 'Unknown',
    }));
  } catch {
    return [{ liveness: 'Unknown', faceScore: 0, overall: 'Unknown' }];
  }
}

function formatSessionDate(sessionExpiry) {
  if (!sessionExpiry) return '—';
  const d = new Date(sessionExpiry);
  if (Number.isNaN(d.getTime())) return String(sessionExpiry);
  return d.toLocaleString();
}

function mapSessionToRecords(user, session) {
  const attempts = parseAttempts(session.attempts);
  const sessionId = session.sessionId ?? session.id ?? '—';
  const createdAt = formatSessionDate(session.sessionExpiry);
  const ocrData =
    typeof session.ocrData === 'string'
      ? session.ocrData
      : JSON.stringify(session.ocrData ?? {});
  const uploadedDocs = session.documentId ? String(session.documentId) : '—';
  const video = session.videoId ? String(session.videoId) : '—';

  return attempts.map((attempt, idx) => ({
    userId: user.id,
    userName: user.name ?? user.username,
    userEmail: user.username,
    sessionId: String(sessionId),
    createdAt,
    attemptNumber: idx + 1,
    liveness: attempt.liveness,
    faceScore: attempt.faceScore,
    overall: attempt.overall,
    uploadedDocs,
    video,
    ocrData,
  }));
}

export async function loadDashboardRecords() {
  const summaryResponse = await fetchUserSummary(0, 100);
  const paginatedBody = summaryResponse?.body;
  const users = paginatedBody?.data ?? [];

  const records = [];
  for (const user of users) {
    const sessionResponse = await fetchUserSessions(user.id, 0, 100);
    const sessions = sessionResponse?.body?.data ?? [];
    for (const session of sessions) {
      records.push(...mapSessionToRecords(user, session));
    }
  }
  return records;
}
