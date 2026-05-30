import React, { useState } from "react";
import { ShieldCheck, Search, CheckCircle2, XCircle, FileText, Video, FileJson, Eye, EyeOff, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    sessions: [
      {
        sessionId: "sess-123",
        createdAt: "2026-05-20 10:30 AM",
        attempts: [
          { liveness: "Passed", faceScore: 0.98, overall: "Success" },
          { liveness: "Failed", faceScore: 0.45, overall: "Fail" },
        ],
        ocrData: "{ name: John Doe, dob: 1990-01-01 }",
        uploadedDocs: ["doc1.pdf", "doc2.pdf"],
        video: "video1.mp4",
      },
      {
        sessionId: "sess-456",
        createdAt: "2026-05-21 02:15 PM",
        attempts: [
          { liveness: "Passed", faceScore: 0.93, overall: "Success" },
        ],
        ocrData: "{ name: John Doe, dob: 1990-01-01 }",
        uploadedDocs: ["doc3.pdf"],
        video: "video2.mp4",
      },
    ],
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    sessions: [
      {
        sessionId: "sess-789",
        createdAt: "2026-05-22 11:45 AM",
        attempts: [
          { liveness: "Passed", faceScore: 0.99, overall: "Success" },
        ],
        ocrData: "{ name: Jane Smith, dob: 1985-05-12 }",
        uploadedDocs: ["doc4.pdf"],
        video: "video3.mp4",
      },
    ],
  },
];

const allRecords = users.flatMap((user) =>
  user.sessions.flatMap((session) =>
    session.attempts.map((attempt, idx) => ({
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      sessionId: session.sessionId,
      createdAt: session.createdAt,
      attemptNumber: idx + 1,
      liveness: attempt.liveness,
      faceScore: attempt.faceScore,
      overall: attempt.overall,
      uploadedDocs: session.uploadedDocs.join(", "),
      video: session.video,
      ocrData: session.ocrData,
    }))
  )
);

// ===== COMPONENTS =====

const StatusBadge = ({ status, type = "liveness" }) => {
  const isSuccess = type === "liveness" ? status === "Passed" : status === "Success";
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.375rem 0.875rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "700",
      border: isSuccess ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(220, 38, 38, 0.3)",
      background: isSuccess ? "rgba(16, 185, 129, 0.12)" : "rgba(220, 38, 38, 0.12)",
      color: isSuccess ? "#047857" : "#991b1b",
    }}>
      {isSuccess ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
      {status}
    </span>
  );
};

const ScoreIndicator = ({ score }) => {
  const percentage = Math.round(score * 100);
  let color = "#0ea5e9";
  if (score >= 0.85) color = "#059669";
  else if (score >= 0.7) color = "#d97706";
  else color = "#dc2626";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <span style={{ fontSize: "0.875rem", fontWeight: "600", color: "#1e293b", minWidth: "40px" }}>{percentage}%</span>
      <div style={{ width: "100px", height: "6px", borderRadius: "9999px", background: "#e2e8f0", overflow: "hidden" }}>
        <div style={{ height: "100%", background: color, width: `${percentage}%`, transition: "width 0.3s ease" }}></div>
      </div>
    </div>
  );
};

// ===== MAIN COMPONENT =====

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());

  const RECORDS_PER_PAGE = 10;

  const filteredRecords = allRecords.filter(
    (rec) =>
      rec.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredRecords.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + RECORDS_PER_PAGE);

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
    setCurrentPage(1);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* ===== NAVBAR ===== */}
      <div style={{
        background: "linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)",
        padding: "1.25rem 2rem",
        boxShadow: "0 4px 12px rgba(14, 165, 233, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}>
        <div style={{
          width: "44px",
          height: "44px",
          borderRadius: "0.625rem",
          background: "rgba(255, 255, 255, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1.5px solid rgba(255, 255, 255, 0.25)",
        }}>
          <ShieldCheck size={28} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "1.375rem", fontWeight: "800", color: "white", margin: "0 0 0.25rem 0", letterSpacing: "-0.01em" }}>
            KYC Dashboard
          </h1>
          <p style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.95)", margin: 0, fontWeight: "500" }}>
            Liveness Detection & Verification Records
          </p>
        </div>
      </div>

      {/* ===== CONTENT AREA ===== */}
      <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Search Bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: "#f8fafc",
          border: "1.5px solid #e2e8f0",
          borderRadius: "0.75rem",
          padding: "0.75rem 1.25rem",
          marginBottom: "2rem",
          transition: "all 0.2s ease",
        }} onFocus={(e) => {
          e.currentTarget.style.borderColor = "#0ea5e9";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(14, 165, 233, 0.1)";
        }} onBlur={(e) => {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.boxShadow = "none";
        }}>
          <Search size={18} color="#0369a1" />
          <input
            type="text"
            placeholder="Search by name, email, or session ID..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#1e293b",
              fontSize: "0.95rem",
              fontFamily: "inherit",
            }}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange("")}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "1.25rem",
                padding: "0",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => e.target.style.color = "#1e293b"}
              onMouseLeave={(e) => e.target.style.color = "#94a3b8"}
            >
              ✕
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "0.875rem",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9375rem",
            }}>
              <thead>
                <tr style={{
                  background: "#f0f9ff",
                  borderBottom: "1.5px solid #e2e8f0",
                }}>
                  <th style={{
                    padding: "1rem 1.5rem",
                    textAlign: "left",
                    fontWeight: "700",
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>User</th>
                  <th style={{
                    padding: "1rem 1.5rem",
                    textAlign: "left",
                    fontWeight: "700",
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Session ID</th>
                  <th style={{
                    padding: "1rem 1.5rem",
                    textAlign: "left",
                    fontWeight: "700",
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Date</th>
                  <th style={{
                    padding: "1rem 1.5rem",
                    textAlign: "left",
                    fontWeight: "700",
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Liveness</th>
                  <th style={{
                    padding: "1rem 1.5rem",
                    textAlign: "left",
                    fontWeight: "700",
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Score</th>
                  <th style={{
                    padding: "1rem 1.5rem",
                    textAlign: "left",
                    fontWeight: "700",
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Overall</th>
                  <th style={{
                    padding: "1rem 1.5rem",
                    textAlign: "center",
                    fontWeight: "700",
                    color: "#0369a1",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length > 0 ? (
                  paginatedRecords.map((rec, idx) => (
                    <React.Fragment key={idx}>
                      <tr
                        style={{
                          borderBottom: "1px solid #f1f5f9",
                          background: "transparent",
                          transition: "background 0.2s ease",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "1rem 1.5rem", color: "#1e293b" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "9999px",
                              background: "linear-gradient(135deg, #0ea5e9, #2563eb)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "700",
                              fontSize: "0.875rem",
                              boxShadow: "0 2px 4px rgba(14, 165, 233, 0.15)",
                            }}>
                              {rec.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9375rem" }}>{rec.userName}</div>
                              <div style={{ color: "#64748b", fontSize: "0.8125rem" }}>{rec.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "1rem 1.5rem", color: "#1e293b" }}>
                          <code style={{
                            background: "#f0f9ff",
                            color: "#0369a1",
                            padding: "0.375rem 0.75rem",
                            borderRadius: "0.5rem",
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                            fontWeight: "600",
                          }}>{rec.sessionId}</code>
                        </td>
                        <td style={{ padding: "1rem 1.5rem", color: "#1e293b" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem" }}>
                            <Clock size={14} color="#64748b" />
                            {rec.createdAt}
                          </div>
                        </td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <StatusBadge status={rec.liveness} type="liveness" />
                        </td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <ScoreIndicator score={rec.faceScore} />
                        </td>
                        <td style={{ padding: "1rem 1.5rem" }}>
                          <StatusBadge status={rec.overall} type="overall" />
                        </td>
                        <td style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
                          <button
                            onClick={() => toggleRowExpand(idx + startIndex)}
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "0.5rem",
                              background: "#f0f9ff",
                              color: "#0369a1",
                              border: "1px solid #bfdbfe",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              transition: "all 0.2s ease",
                              fontSize: "0",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#bfdbfe";
                              e.currentTarget.style.transform = "scale(1.08)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "#f0f9ff";
                              e.currentTarget.style.transform = "scale(1)";
                            }}
                          >
                            {expandedRows.has(idx + startIndex) ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </td>
                      </tr>
                      {expandedRows.has(idx + startIndex) && (
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #f1f5f9" }}>
                          <td colSpan="7" style={{ padding: "1.5rem" }}>
                            <div style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                              gap: "1rem",
                            }}>
                              <div style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.75rem",
                                padding: "1rem",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                  <FileText size={16} color="#0369a1" />
                                  <h4 style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.875rem", margin: 0 }}>Documents</h4>
                                </div>
                                <div style={{
                                  background: "#f0f9ff",
                                  color: "#0369a1",
                                  padding: "0.75rem",
                                  borderRadius: "0.5rem",
                                  fontFamily: "monospace",
                                  fontSize: "0.8125rem",
                                }}>{rec.uploadedDocs}</div>
                              </div>
                              <div style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.75rem",
                                padding: "1rem",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                  <Video size={16} color="#0369a1" />
                                  <h4 style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.875rem", margin: 0 }}>Video</h4>
                                </div>
                                <div style={{
                                  background: "#f0f9ff",
                                  color: "#0369a1",
                                  padding: "0.75rem",
                                  borderRadius: "0.5rem",
                                  fontFamily: "monospace",
                                  fontSize: "0.8125rem",
                                }}>{rec.video}</div>
                              </div>
                              <div style={{
                                background: "#ffffff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "0.75rem",
                                padding: "1rem",
                              }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                  <FileJson size={16} color="#0369a1" />
                                  <h4 style={{ fontWeight: "700", color: "#1e293b", fontSize: "0.875rem", margin: 0 }}>OCR Data</h4>
                                </div>
                                <div style={{
                                  background: "#f0f9ff",
                                  color: "#0369a1",
                                  padding: "0.75rem",
                                  borderRadius: "0.5rem",
                                  fontFamily: "monospace",
                                  fontSize: "0.75rem",
                                  maxHeight: "100px",
                                  overflowY: "auto",
                                }}>{rec.ocrData}</div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
                      <p style={{ color: "#64748b", fontSize: "1rem" }}>🔍 No records found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "1.5rem",
          padding: "1rem",
          background: "#f8fafc",
          borderRadius: "0.75rem",
          border: "1px solid #e2e8f0",
        }}>
          <div style={{ color: "#64748b", fontSize: "0.875rem", fontWeight: "500" }}>
            Showing <span style={{ color: "#1e293b", fontWeight: "700" }}>{startIndex + 1}</span> to{" "}
            <span style={{ color: "#1e293b", fontWeight: "700" }}>
              {Math.min(startIndex + RECORDS_PER_PAGE, filteredRecords.length)}
            </span>{" "}
            of <span style={{ color: "#1e293b", fontWeight: "700" }}>{filteredRecords.length}</span> records
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "0.5rem",
                background: currentPage === 1 ? "#f1f5f9" : "#ffffff",
                border: "1px solid #e2e8f0",
                color: currentPage === 1 ? "#cbd5e1" : "#0369a1",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.background = "#f0f9ff";
                  e.currentTarget.style.borderColor = "#bfdbfe";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <ChevronLeft size={18} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "0.5rem",
                  background: page === currentPage ? "#0ea5e9" : "#ffffff",
                  border: page === currentPage ? "1px solid #0ea5e9" : "1px solid #e2e8f0",
                  color: page === currentPage ? "#ffffff" : "#0369a1",
                  fontWeight: page === currentPage ? "700" : "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  fontSize: "0.875rem",
                }}
                onMouseEnter={(e) => {
                  if (page !== currentPage) {
                    e.currentTarget.style.background = "#f0f9ff";
                    e.currentTarget.style.borderColor = "#bfdbfe";
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== currentPage) {
                    e.currentTarget.style.background = "#ffffff";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "0.5rem",
                background: currentPage === totalPages ? "#f1f5f9" : "#ffffff",
                border: "1px solid #e2e8f0",
                color: currentPage === totalPages ? "#cbd5e1" : "#0369a1",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.background = "#f0f9ff";
                  e.currentTarget.style.borderColor = "#bfdbfe";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#ffffff";
                e.currentTarget.style.borderColor = "#e2e8f0";
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
