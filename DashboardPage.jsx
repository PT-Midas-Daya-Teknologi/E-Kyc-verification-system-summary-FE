import React, { useEffect, useState } from "react";
import { ShieldCheck, Search, CheckCircle2, XCircle, FileText, Video, FileJson, Eye, EyeOff, TrendingUp, Users, Zap, Award, ArrowUpRight, ArrowDownRight, Clock, BarChart3, User, LogOut } from "lucide-react";
import { loadDashboardRecords } from "./services/dashboardData.js";
import { logout as logoutApi } from "./services/api.js";
import { clearSession } from "./services/authStorage.js";

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

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <div style={statCardStyles} onMouseEnter={(e) => {
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.boxShadow = "0 10px 30px rgba(14, 165, 233, 0.25)";
  }} onMouseLeave={(e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow = "0 4px 20px rgba(14, 165, 233, 0.1)";
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
      <div style={{
        padding: "0.75rem",
        borderRadius: "0.75rem",
        background: "rgba(14, 165, 233, 0.15)",
      }}>
        <Icon size={24} color="#0369a1" />
      </div>
      {trend && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
          {trend > 0 ? (
            <>
              <ArrowUpRight size={18} color="#059669" />
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#059669" }}>+{trend}%</span>
            </>
          ) : (
            <>
              <ArrowDownRight size={18} color="#dc2626" />
              <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#dc2626" }}>{trend}%</span>
            </>
          )}
        </div>
      )}
    </div>
    <p style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "500", marginBottom: "0.5rem" }}>{label}</p>
    <p style={{ fontSize: "2.25rem", fontWeight: "bold", color: "#1e293b" }}>{value}</p>
  </div>
);

const StatusBadge = ({ status, type = "liveness" }) => {
  const isSuccess = type === "liveness" ? status === "Passed" : status === "Success";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 1rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "bold",
      border: isSuccess ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(220, 38, 38, 0.3)",
      background: isSuccess ? "rgba(16, 185, 129, 0.15)" : "rgba(220, 38, 38, 0.15)",
      color: isSuccess ? "#047857" : "#991b1b",
    }}>
      {isSuccess ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      {status}
    </span>
  );
};

const ScoreIndicator = ({ score }) => {
  const percentage = Math.round(score * 100);
  let gradientColor = "#0ea5e9";
  if (score >= 0.85) gradientColor = "#059669";
  else if (score >= 0.7) gradientColor = "#d97706";
  else gradientColor = "#dc2626";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{
        width: "40px",
        height: "40px",
        borderRadius: "9999px",
        background: "rgba(14, 165, 233, 0.1)",
        border: "1px solid rgba(14, 165, 233, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#0369a1" }}>{percentage}%</span>
      </div>
      <div style={{ flex: 1, minWidth: "80px" }}>
        <div style={{
          height: "6px",
          borderRadius: "9999px",
          background: "rgba(14, 165, 233, 0.1)",
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            borderRadius: "9999px",
            background: gradientColor,
            width: `${percentage}%`,
            transition: "width 0.5s ease",
          }}></div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage({ user, onLogout }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const RECORDS_PER_PAGE = 10;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError("");
      try {
        const records = await loadDashboardRecords();
        if (!cancelled) setAllRecords(records);
      } catch (err) {
        if (!cancelled) {
          setLoadError(err?.message || "Failed to load dashboard data");
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
    onLogout?.();
  };

  const filteredRecords = allRecords.filter(
    (rec) =>
      rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE);

  const successCount = allRecords.filter(r => r.overall === "Success").length;
  const failCount = allRecords.filter(r => r.overall === "Fail").length;
  const successRate = allRecords.length ? Math.round((successCount / allRecords.length) * 100) : 0;

  const toggleRowExpand = (idx) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedRows(newExpanded);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
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
              <table style={tableStyles}>
                <thead style={theadStyles}>
                  <tr>
                    <th style={thStyles}>User</th>
                    <th style={thStyles}>Session ID</th>
                    <th style={thStyles}>Date</th>
                    <th style={thStyles}>Attempt</th>
                    <th style={thStyles}>Liveness</th>
                    <th style={thStyles}>Face Score</th>
                    <th style={thStyles}>Overall</th>
                    <th style={{...thStyles, textAlign: "center"}}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={{...tdStyles, textAlign: "center", padding: "4rem 2rem"}}>
                        <p style={{ color: "#64748b", fontSize: "1.125rem", fontWeight: "500" }}>Loading records…</p>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan="8" style={{...tdStyles, textAlign: "center", padding: "4rem 2rem"}}>
                        <p style={{ color: "#dc2626", fontSize: "1rem", fontWeight: "500" }}>{loadError}</p>
                      </td>
                    </tr>
                  ) : paginatedRecords.length > 0 ? (
                    paginatedRecords.map((rec, idx) => {
                      const globalIdx = startIndex + idx;
                      return (
                        <React.Fragment key={globalIdx}>
                          <tr style={{...tdStyles, borderBottom: "1px solid rgba(14, 165, 233, 0.1)"}} onMouseEnter={(e) => {
                            e.currentTarget.style.background = "rgba(14, 165, 233, 0.08)";
                          }} onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}>
                            <td style={tdStyles}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <div style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "9999px",
                                  background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "white",
                                  fontWeight: "bold",
                                  fontSize: "1rem",
                                  boxShadow: "0 3px 10px rgba(14, 165, 233, 0.2)",
                                  transition: "all 0.3s ease",
                                }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.08)";
                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(14, 165, 233, 0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "0 3px 10px rgba(14, 165, 233, 0.2)";
                                  }}
                                >
                                  {rec.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>{rec.userName}</div>
                                  <div style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.1rem" }}>{rec.userEmail}</div>
                                </div>
                              </div>
                            </td>
                            <td style={tdStyles}>
                              <span style={{
                                padding: "0.5rem 1rem",
                                borderRadius: "0.5rem",
                                background: "rgba(14, 165, 233, 0.15)",
                                color: "#0369a1",
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
                                fontWeight: "600",
                                border: "1px solid rgba(14, 165, 233, 0.3)",
                              }}>{rec.sessionId}</span>
                            </td>
                            <td style={tdStyles}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#1e293b", fontSize: "0.9rem" }}>
                                <Clock size={16} color="#64748b" />
                                {rec.createdAt}
                              </div>
                            </td>
                            <td style={{...tdStyles, textAlign: "center"}}>
                              <span style={{
                                padding: "0.5rem 0.75rem",
                                borderRadius: "9999px",
                                background: "rgba(37, 99, 235, 0.15)",
                                color: "#1e40af",
                                fontWeight: "bold",
                                fontSize: "0.875rem",
                                border: "1px solid rgba(37, 99, 235, 0.3)",
                              }}>#{rec.attemptNumber}</span>
                            </td>
                            <td style={tdStyles}>
                              <StatusBadge status={rec.liveness} type="liveness" />
                            </td>
                            <td style={tdStyles}>
                              <ScoreIndicator score={rec.faceScore} />
                            </td>
                            <td style={tdStyles}>
                              <StatusBadge status={rec.overall} type="overall" />
                            </td>
                            <td style={{...tdStyles, textAlign: "center"}}>
                              <button
                                onClick={() => {
                                  setSelectedRecord(rec);
                                  setModalOpen(true);
                                }}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  borderRadius: "0.5rem",
                                  background: "rgba(14, 165, 233, 0.15)",
                                  color: "#0369a1",
                                  border: "1px solid rgba(14, 165, 233, 0.3)",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "rgba(14, 165, 233, 0.25)";
                                  e.currentTarget.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)";
                                  e.currentTarget.style.transform = "scale(1)";
                                }}
                              >
                                <Eye size={20} />
                              </button>
                            </td>
                          </tr>
                          {expandedRows.has(globalIdx) && (
                            <tr style={{...tdStyles, background: "rgba(14, 165, 233, 0.08)", borderTop: "1px solid rgba(14, 165, 233, 0.1)"}}>
                              <td colSpan="8" style={{...tdStyles, padding: "1.25rem"}}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                                  <div style={{
                                    backdropFilter: "blur(20px)",
                                    background: "rgba(255, 255, 255, 0.7)",
                                    borderRadius: "1rem",
                                    padding: "1rem",
                                    border: "1px solid rgba(14, 165, 233, 0.3)",
                                  }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                      <div style={{
                                        padding: "0.5rem",
                                        borderRadius: "0.5rem",
                                        background: "rgba(14, 165, 233, 0.15)",
                                        border: "1px solid rgba(14, 165, 233, 0.3)",
                                      }}>
                                        <FileText size={18} color="#0369a1" />
                                      </div>
                                      <h4 style={{ fontWeight: "bold", color: "#1e293b", fontSize: "1rem", margin: 0 }}>Documents</h4>
                                    </div>
                                    <div style={{
                                      color: "#0369a1",
                                      fontSize: "0.875rem",
                                      fontFamily: "monospace",
                                      background: "rgba(14, 165, 233, 0.08)",
                                      padding: "0.75rem",
                                      borderRadius: "0.5rem",
                                      border: "1px solid rgba(14, 165, 233, 0.2)",
                                    }}>{rec.uploadedDocs}</div>
                                  </div>
                                  <div style={{
                                    backdropFilter: "blur(20px)",
                                    background: "rgba(255, 255, 255, 0.7)",
                                    borderRadius: "1rem",
                                    padding: "1rem",
                                    border: "1px solid rgba(14, 165, 233, 0.3)",
                                  }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                      <div style={{
                                        padding: "0.5rem",
                                        borderRadius: "0.5rem",
                                        background: "rgba(14, 165, 233, 0.15)",
                                        border: "1px solid rgba(14, 165, 233, 0.3)",
                                      }}>
                                        <Video size={18} color="#0369a1" />
                                      </div>
                                      <h4 style={{ fontWeight: "bold", color: "#1e293b", fontSize: "1rem", margin: 0 }}>Video</h4>
                                    </div>
                                    <div style={{
                                      color: "#0369a1",
                                      fontSize: "0.875rem",
                                      fontFamily: "monospace",
                                      background: "rgba(14, 165, 233, 0.08)",
                                      padding: "0.75rem",
                                      borderRadius: "0.5rem",
                                      border: "1px solid rgba(14, 165, 233, 0.2)",
                                    }}>{rec.video}</div>
                                  </div>
                                  <div style={{
                                    backdropFilter: "blur(20px)",
                                    background: "rgba(255, 255, 255, 0.7)",
                                    borderRadius: "1rem",
                                    padding: "1rem",
                                    border: "1px solid rgba(14, 165, 233, 0.3)",
                                  }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                      <div style={{
                                        padding: "0.5rem",
                                        borderRadius: "0.5rem",
                                        background: "rgba(14, 165, 233, 0.15)",
                                        border: "1px solid rgba(14, 165, 233, 0.3)",
                                      }}>
                                        <FileJson size={18} color="#0369a1" />
                                      </div>
                                      <h4 style={{ fontWeight: "bold", color: "#1e293b", fontSize: "1rem", margin: 0 }}>OCR Data</h4>
                                    </div>
                                    <div style={{
                                      color: "#0369a1",
                                      fontSize: "0.75rem",
                                      fontFamily: "monospace",
                                      background: "rgba(14, 165, 233, 0.08)",
                                      padding: "0.75rem",
                                      borderRadius: "0.5rem",
                                      border: "1px solid rgba(14, 165, 233, 0.2)",
                                      maxHeight: "128px",
                                      overflowY: "auto",
                                      overflowX: "auto",
                                    }}>{rec.ocrData}</div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" style={{...tdStyles, textAlign: "center", padding: "4rem 2rem"}}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                          <div style={{ fontSize: "3rem" }}>🔍</div>
                          <p style={{ color: "#64748b", fontSize: "1.125rem", fontWeight: "500" }}>No records found matching your search</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Enhanced Pagination Footer */}
          <div style={{ marginTop: "0.4rem", marginLeft: "0", marginRight: "0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
            <div style={{ color: "#0369a1", fontSize: "0.9rem", fontWeight: "500" }}>
              <span style={{ color: "#1e293b", fontWeight: "700" }}>
                {paginatedRecords.length > 0 ? startIndex + 1 : 0}
              </span>
              {" - "}
              <span style={{ color: "#1e293b", fontWeight: "700" }}>
                {Math.min(startIndex + RECORDS_PER_PAGE, filteredRecords.length)}
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

            {/* Pagination Controls */}
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
                disabled={currentPage === totalPages}
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

      {/* Modern Modal */}
      {modalOpen && selectedRecord && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease-out",
        }}>
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)",
            borderRadius: "1.5rem",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(14, 165, 233, 0.5)",
            border: "1px solid rgba(14, 165, 233, 0.2)",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "85vh",
            overflowY: "hidden",
            overflowX: "hidden",
            position: "relative",
            animation: "slideUp 0.3s ease-out",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Modal Header */}
            <div style={{
              background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
              padding: "1.25rem 1.5rem",
              borderRadius: "1.5rem 1.5rem 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(14, 165, 233, 0.2)",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flex: 1 }}>
                <div style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid rgba(255, 255, 255, 0.3)",
                }}>
                  <FileJson size={22} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, color: "white", fontSize: "1.25rem", fontWeight: "bold" }}>
                    {selectedRecord.userName}
                  </h2>
                  <p style={{ margin: "0.15rem 0 0 0", color: "rgba(255, 255, 255, 0.9)", fontSize: "0.75rem" }}>
                    Session ID: {selectedRecord.sessionId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedRecord(null);
                }}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  width: "40px",
                  height: "40px",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s ease",
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ 
              padding: "1.25rem 1.5rem", 
              overflowY: "auto",
              overflowX: "hidden",
              flex: 1,
              minHeight: 0,
              scrollBehavior: "smooth",
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}>
              {/* Hide scrollbar for all browsers */}
              <style>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              {/* Documents Section */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <FileText size={20} color="white" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                    Documents
                  </h3>
                </div>
                <div style={{
                  background: "rgba(14, 165, 233, 0.08)",
                  border: "1.5px solid rgba(14, 165, 233, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  color: "#0369a1",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  lineHeight: "1.4",
                  wordBreak: "break-word",
                }}>
                  {selectedRecord.uploadedDocs}
                </div>
              </div>

              {/* Video Section */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <Video size={20} color="white" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                    Video
                  </h3>
                </div>
                <div style={{
                  background: "rgba(14, 165, 233, 0.08)",
                  border: "1.5px solid rgba(14, 165, 233, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  color: "#0369a1",
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  wordBreak: "break-word",
                }}>
                  {selectedRecord.video}
                </div>
              </div>

              {/* OCR Data Section */}
              <div style={{ marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                  <div style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "0.75rem",
                    background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    <FileJson size={20} color="white" />
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "700", color: "#1e293b" }}>
                    OCR Data
                  </h3>
                </div>
                <div style={{
                  background: "rgba(14, 165, 233, 0.08)",
                  border: "1.5px solid rgba(14, 165, 233, 0.3)",
                  borderRadius: "0.75rem",
                  padding: "0.75rem",
                  color: "#0369a1",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  lineHeight: "1.4",
                  wordBreak: "break-all",
                  maxHeight: "150px",
                  overflowY: "auto",
                }}>
                  {selectedRecord.ocrData}
                </div>
              </div>


            </div>

            <style>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              @keyframes slideUp {
                from {
                  transform: translateY(30px);
                  opacity: 0;
                }
                to {
                  transform: translateY(0);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        </div>
      )}
    </div>
  );
}