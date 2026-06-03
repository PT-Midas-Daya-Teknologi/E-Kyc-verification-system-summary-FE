import React, { useEffect, useState } from "react";
import { ShieldCheck, Search, User, LogOut } from "lucide-react";
import DynamicDataTable from "./components/DynamicDataTable.jsx";
import { rowMatchesSearch } from "./utils/dynamicTableUtils.js";
import {
  applyAccessTokenToClient,
  fetchSessionDetailBySessionId,
  fetchUserSessions,
  fetchUserSummary,
  getApiErrorMessage,
  logout as logoutApi,
} from "./services/api.js";
import { clearSession } from "./services/authStorage.js";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
const TABLE_VISIBLE_COLUMNS = ["fullName", "username", "userEmail"];

const containerStyles = {
  height: "100vh",
  background: "#ffffff",
  padding: "0",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

const mainStyles = {
  maxWidth: "100%",
  margin: "0 auto",
  position: "relative",
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minHeight: 0,
};

const navbarStyles = {
  background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 50%, #1e40af 100%)",
  padding: "1rem 2rem",
  display: "flex",
  alignItems: "center",
  gap: "1rem",
  boxShadow: "0 4px 12px rgba(14, 165, 233, 0.2)",
  position: "relative",
  overflow: "hidden",
};

// Decorative gradient overlay
const navbarDecorativeStyles = {
  position: "absolute",
  top: 0,
  right: 0,
  width: "300px",
  height: "100%",
  background: "radial-gradient(circle at 100% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 70%)",
  pointerEvents: "none",
};

const navLogoStyles = {
  width: "40px",
  height: "40px",
  borderRadius: "0.75rem",
  background: "rgba(255, 255, 255, 0.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid rgba(255, 255, 255, 0.4)",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
  transition: "all 0.3s ease",
  flexShrink: 0,
};

const navTitleStyles = {
  flex: 1,
  position: "relative",
  zIndex: 10,
};

const navTitleMain = {
  fontSize: "1.25rem",
  fontWeight: "800",
  color: "white",
  margin: "0",
  lineHeight: "1.2",
  textShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
};

const navTitleSub = {
  fontSize: "0.7rem",
  color: "rgba(255, 255, 255, 0.9)",
  margin: "0.2rem 0 0 0",
  fontWeight: "500",
  textShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
};

const contentWrapperStyles = {
  padding: "1rem 0",
  paddingBottom: "0.5rem",
  maxWidth: "100%",
  width: "100%",
  margin: "0",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  overflow: "hidden",
  minHeight: 0,
};

const headerStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "2.5rem",
};

const titleSectionStyles = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
};

const logoStyles = {
  width: "80px",
  height: "80px",
  borderRadius: "1rem",
  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 10px 25px rgba(14, 165, 233, 0.3)",
  border: "4px solid rgba(255, 255, 255, 0.9)",
};

const statsContainerStyles = {
  display: "none",
};

const statCardStyles = {
  display: "none",
};

const searchBoxStyles = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
  background: "#f8fafc",
  border: "1.5px solid #e2e8f0",
  borderRadius: "0.75rem",
  padding: "0.65rem 1rem",
  marginBottom: "0.5rem",
  transition: "all 0.3s ease",
};

const searchInputStyles = {
  flex: 1,
  background: "transparent",
  color: "#1e293b",
  fontSize: "1rem",
  border: "none",
  outline: "none",
};

const tableContainerStyles = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "1rem",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  margin: "0",
  flex: 1,
  minHeight: 0,
};

const tableStyles = {
  width: "100%",
  borderCollapse: "collapse",
};

const theadStyles = {
  background: "#f0f9ff",
  borderBottom: "1.5px solid #e2e8f0",
};

const thStyles = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  fontWeight: "700",
  color: "#0369a1",
  fontSize: "0.7rem",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const tdStyles = {
  padding: "0.75rem 1rem",
  borderBottom: "1px solid #f1f5f9",
  color: "#1e293b",
};

const trHoverStyles = {
  background: "#f9fafb",
  transition: "all 0.2s ease",
};

export default function DashboardPage({ user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadAllUsers = async () => {
    const size = 100;
    const allUsers = [];
    const first = await fetchUserSummary(0, size);
    const firstBody = first?.body ?? {};
    allUsers.push(...(firstBody?.data ?? []));

    const totalPages = Number(firstBody?.totalPages ?? 1);
    for (let page = 1; page < totalPages; page += 1) {
      const next = await fetchUserSummary(page, size);
      allUsers.push(...(next?.body?.data ?? []));
    }

    return allUsers.map((userItem, index) => ({
      _rowKey: `user-${userItem?.id ?? index}-${index}`,
      userId: userItem?.id ?? null,
      fullName: userItem?.name ?? userItem?.fullName ?? userItem?.username ?? "Unknown User",
      username: userItem?.username ?? "",
      userEmail: userItem?.email ?? userItem?.username ?? "",
      ...userItem,
    }));
  };

  const loadAllSessionsForUser = async (userId) => {
    const size = 100;
    const allSessions = [];
    const first = await fetchUserSessions(userId, 0, size);
    const firstBody = first?.body ?? {};
    allSessions.push(...(firstBody?.data ?? []));

    const totalPages = Number(firstBody?.totalPages ?? 1);
    for (let page = 1; page < totalPages; page += 1) {
      const next = await fetchUserSessions(userId, page, size);
      allSessions.push(...(next?.body?.data ?? []));
    }
    return allSessions;
  };

  const handleViewDetails = async (row) => {
    const userId = row?.userId ?? row?.id;
    if (!userId) return row;

    try {
      console.log("[Dashboard] Eye clicked for userId:", userId);
      const sessions = await loadAllSessionsForUser(userId);
      console.log("[Dashboard] POST /dashboard/summary/session response:", sessions);
      const sessionIds = sessions
        .map((session) => session?.sessionId)
        .filter(Boolean)
        .map((sessionId) => String(sessionId));
      return {
        ...row,
        sessionIds,
        selectedSessionId: null,
        attempts: null,
        orc_data: null,
      };
    } catch (err) {
      console.error("[Dashboard] /dashboard/summary/session error:", err);
      return {
        ...row,
        sessionsError: getApiErrorMessage(err),
      };
    }
  };

  const handleSessionSelect = async (row, sessionId) => {
    const userId = row?.userId ?? row?.id;
    if (!userId) return row;
    if (!sessionId || String(row?.selectedSessionId) === String(sessionId)) {
      return {
        ...row,
        selectedSessionId: null,
        attempts: null,
        orc_data: null,
      };
    }
    try {
      console.log("[Dashboard] Session clicked:", sessionId, "for user:", userId);
      const selectedSession = await fetchSessionDetailBySessionId(userId, sessionId);
      if (!selectedSession) {
        return {
          ...row,
          selectedSessionId: sessionId,
          attempts: "—",
          orc_data: "—",
        };
      }
      return {
        ...row,
        selectedSessionId: sessionId,
        attempts: selectedSession?.attempts ?? "—",
        ocrData:
          selectedSession?.ocrData ??
          selectedSession?.ocr_data ??
          "—",
        userDocumentResponse:
          selectedSession?.userDocumentResponse ?? null,
      };
    } catch (err) {
      console.error("[Dashboard] Session detail error:", err);
      return {
        ...row,
        selectedSessionId: sessionId,
        attempts: "—",
        orc_data: "—",
      };
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const users = await loadAllUsers();
        if (!cancelled) setAllRecords(users);
      } catch (err) {
        if (!cancelled) {
          setLoadError(getApiErrorMessage(err));
          setAllRecords([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // Clear local session even if backend logout fails
    }
    clearSession();
    applyAccessTokenToClient();
    onLogout?.();
  };

  const filteredRecords = allRecords.filter((rec) => rowMatchesSearch(rec, searchTerm));

  const totalPages =
    filteredRecords.length === 0 ? 0 : Math.ceil(filteredRecords.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div style={containerStyles}>
      {/* Enhanced Navbar */}
      <div style={navbarStyles}>
        <div style={navbarDecorativeStyles}></div>
        <div 
          style={navLogoStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.35)";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 28px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0, 0, 0, 0.15)";
          }}
        >
          <ShieldCheck size={32} color="white" strokeWidth={2.5} />
        </div>
        <div style={navTitleStyles}>
          <h1 style={navTitleMain}>KYC Dashboard</h1>
          <p style={navTitleSub}>Liveness Detection & Verification Records</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          title="Logout"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.75rem",
            background: "rgba(255, 255, 255, 0.2)",
            border: "1.5px solid rgba(255, 255, 255, 0.4)",
            color: "white",
            fontWeight: "600",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: "relative",
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <LogOut size={18} color="white" strokeWidth={2} />
          Logout
        </button>
        <div
          title={user?.email || user?.username || "User"}
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "9999px",
            background: "rgba(255, 255, 255, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1.5px solid rgba(255, 255, 255, 0.4)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <User size={24} color="white" strokeWidth={2} />
        </div>
      </div>

      {/* Content */}
      <div style={contentWrapperStyles}>
        <div style={mainStyles}>
          {/* Search Bar - Enhanced */}
          <div style={{...searchBoxStyles, marginBottom: "0.5rem", background: "#f0f9ff", border: "1.5px solid #7dd3fc", marginLeft: "0", marginRight: "0"}}>
            <Search size={20} color="#0369a1" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by name, email or session ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={(e) => {
                e.currentTarget.style.background = "rgba(14, 165, 233, 0.05)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              style={{...searchInputStyles, color: "#1e293b", fontSize: "0.95rem", fontWeight: "500"}}
            />
            {searchTerm && (
              <button
                onClick={() => handleSearchChange("")}
                style={{
                  color: "rgba(30, 41, 59, 0.6)",
                  background: "rgba(14, 165, 233, 0.1)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.5rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(14, 165, 233, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(14, 165, 233, 0.1)";
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Table Container */}
          <div style={tableContainerStyles}>
            <div style={{ overflowY: "auto", overflowX: "auto", flex: 1 }}>
              <DynamicDataTable
                rows={paginatedRecords}
                loading={loading}
                loadError={loadError}
                emptyMessage={searchTerm ? "No records found matching your search" : "No records found"}
                onViewDetails={handleViewDetails}
                onSessionSelect={handleSessionSelect}
                visibleColumns={TABLE_VISIBLE_COLUMNS}
              />
            </div>
          </div>

          {/* Enhanced Pagination Footer */}
          <div style={{ marginTop: "0.4rem", marginLeft: "0", marginRight: "0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ color: "#0369a1", fontSize: "0.9rem", fontWeight: "500" }}>
                <span style={{ color: "#1e293b", fontWeight: "700" }}>
                  {paginatedRecords.length > 0 ? startIndex + 1 : 0}
                </span>
                {" - "}
                <span style={{ color: "#1e293b", fontWeight: "700" }}>
                  {Math.min(startIndex + pageSize, filteredRecords.length)}
                </span>
                {" of "}
                <span style={{ color: "#1e293b", fontWeight: "700" }}>
                  {filteredRecords.length}
                </span>
                {" records"}
                {searchTerm && (
                  <span style={{ color: "#64748b", fontSize: "0.85rem" }}> (filtered from {allRecords.length} total)</span>
                )}
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#0369a1" }}>
                Rows per page
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(e.target.value)}
                  style={{
                    padding: "0.35rem 0.5rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(14, 165, 233, 0.35)",
                    background: "#f0f9ff",
                    color: "#0369a1",
                    fontWeight: "600",
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "0.6rem",
                  background: currentPage === 1 ? "rgba(14, 165, 233, 0.1)" : "rgba(14, 165, 233, 0.2)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  color: currentPage === 1 ? "#94a3b8" : "#0369a1",
                  fontWeight: "600",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.background = "rgba(14, 165, 233, 0.3)";
                    e.currentTarget.style.transform = "translateX(-2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = currentPage === 1 ? "rgba(14, 165, 233, 0.1)" : "rgba(14, 165, 233, 0.2)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                ← Previous
              </button>

              {/* Page Numbers */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const isActive = page === currentPage;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "0.5rem",
                        background: isActive ? "linear-gradient(135deg, #0ea5e9, #2563eb)" : "rgba(14, 165, 233, 0.1)",
                        border: isActive ? "1px solid rgba(14, 165, 233, 0.5)" : "1px solid rgba(14, 165, 233, 0.2)",
                        color: isActive ? "white" : "#0369a1",
                        fontWeight: isActive ? "700" : "600",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        transition: "all 0.2s ease",
                        boxShadow: isActive ? "0 4px 12px rgba(14, 165, 233, 0.3)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "rgba(14, 165, 233, 0.2)";
                          e.currentTarget.style.transform = "scale(1.05)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isActive ? "linear-gradient(135deg, #0ea5e9, #2563eb)" : "rgba(14, 165, 233, 0.1)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{
                  padding: "0.6rem 1rem",
                  borderRadius: "0.6rem",
                  background: currentPage === totalPages ? "rgba(14, 165, 233, 0.1)" : "rgba(14, 165, 233, 0.2)",
                  border: "1px solid rgba(14, 165, 233, 0.3)",
                  color: currentPage === totalPages ? "#94a3b8" : "#0369a1",
                  fontWeight: "600",
                  cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.background = "rgba(14, 165, 233, 0.3)";
                    e.currentTarget.style.transform = "translateX(2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = currentPage === totalPages ? "rgba(14, 165, 233, 0.1)" : "rgba(14, 165, 233, 0.2)";
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}