import {
  fetchDashboardRecords,
  fetchUserSessions,
  fetchUserSummary,
  getApiErrorMessage,
} from './api.js';
import { flattenSessionItems } from '../utils/dynamicTableUtils.js';

const FETCH_ALL_CHUNK = 100;

export async function loadDashboardRecordsPage(page = 0, size = 10) {
  let response;
  try {
    response = await fetchDashboardRecords(page, size);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
  const body = response?.body;
  const rows = (body?.data ?? []).map((row, index) => ({
    ...row,
    _rowKey: `${row.sessionId ?? 's'}-${row.attemptNumber ?? index}-${page}-${index}`,
  }));
  return {
    rows,
    totalElements: body?.totalElements ?? rows.length,
    totalPages: body?.totalPages ?? 1,
    page: body?.page ?? page,
    size: body?.size ?? size,
  };
}

export async function loadAllDashboardRecords() {
  const first = await loadDashboardRecordsPage(0, FETCH_ALL_CHUNK);
  let allRows = [...first.rows];
  let page = 1;
  while (page < first.totalPages) {
    const next = await loadDashboardRecordsPage(page, FETCH_ALL_CHUNK);
    allRows = allRows.concat(next.rows);
    page += 1;
  }
  return allRows;
}

/**
 * Build rows from `/dashboard/summary/session` per user (same shape as records endpoint).
 */
export async function loadDashboardRecordsFromSessions() {
  let summaryResponse;
  try {
    summaryResponse = await fetchUserSummary(0, FETCH_ALL_CHUNK);
  } catch (err) {
    throw new Error(getApiErrorMessage(err));
  }
  const users = summaryResponse?.body?.data ?? [];
  const records = [];

  for (const user of users) {
    const sessionResponse = await fetchUserSessions(user.id, 0, FETCH_ALL_CHUNK);
    const sessions = sessionResponse?.body?.data ?? [];
    records.push(...flattenSessionItems(sessions, user));
  }

  return records.map((row, index) => ({
    ...row,
    _rowKey: `${row.sessionId}-${row.attemptNumber}-${index}`,
  }));
}
