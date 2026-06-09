import { useState, useEffect } from 'react';

const MUNICIPAL_DEPARTMENTS = [
  "Office of the Municipal Mayor", "Office of the Municipal Vice Mayor", "Office of the Sangguniang Bayan Members",
  "Office of the Secretary to the Sangguniang Bayan", "Office of the Municipal Treasurer (MTO)",
  "Office of the Municipal Assessor", "Office of the Municipal Accountant", "Office of the Municipal Budget Officer",
  "Office of the Municipal Planning and Development Coordinator (MPDO)", "Office of the Municipal Health Officer (MHO)",
  "Office of the Municipal Civil Registrar", "Office of the Municipal Administrator", "Office of the Municipal Legal Officer",
  "Office of the Municipal Information Officer", "Office of the Command Center", "Office of the Community Affairs",
  "Office of the Cooperative Development Officer", "Office of the General Services Officer (GSO)",
  "Office of the Human Resource and Management Officer (HRMO)", "Office of the Municipal Risk Reduction Management Officer (MDRRMO)",
  "Bureau of Fire Protection (BFP)", "Civil Society Organization (CSO)", "Commission on Election (COMELEC)",
  "Department of the Interior and Local Government (DILG)", "Municipal Trial Court (MTC)",
  "Philippine National Police (PNP)", "Post Office (PO)", "Department of Education (DepEd)",
  "Office of the Culture and the Arts", "Office of the Gender And Development (GAD)", "Office of the Local Youth Development Officer (LYDO)",
  "Office of the Municipal Anti-Drug Abuse Council (MADAC)", "Office of the Municipal Social Welfare and Development Officer (MSWDO)",
  "Office of the Persons with Disability Affairs Officer (PDAO)", "Department of the Agrarian Reform (DAR)",
  "Office of the Business Permit and Licensing Officer (BPLO)", "Office of the Market", "Office of the Municipal Agricultural Officer (DA)",
  "Office of the Municipal Engineer/Building Official", "Office of the Municipal Environment and Natural Resources (MENRO)",
  "Office of the Municipal Tourism", "Office of the Public Employment Service Officer (PESO)",
  "Office of the Technical Education and Skills Development Authority (TESDA)"
];

export default function AdminAccounts() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUserDirectory = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error("Failed to load global accounts roster:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUserDirectory(); }, []);

  const handleUpdateUserRole = async (email, currentType, currentDept, currentStatus, fieldToChange, targetValue) => {
    const updatedBody = {
      email,
      userType: fieldToChange === 'userType' ? targetValue : currentType,
      department: fieldToChange === 'department' ? targetValue : currentDept,
      status: fieldToChange === 'status' ? targetValue : currentStatus
    };

    try {
      const res = await fetch('http://localhost:5000/api/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBody)
      });
      if (res.ok) {
        loadUserDirectory();
      } else {
        alert("Failed to modify user profile attributes.");
      }
    } catch (err) { alert("Network exception occurred updating credentials."); }
  };

  const handleEraseAccount = async (email) => {
    const confirmErase = window.confirm(`Are you absolutely certain you want to revoke system privileges and permanently truncate account profile: ${email}?`);
    if (!confirmErase) return;

    try {
      const res = await fetch('http://localhost:5000/api/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        alert("Success! Account securely purged from cloud spreadsheet database rows.");
        loadUserDirectory();
      }
    } catch (err) { alert("Truncation network process error."); }
  };

  const filteredUsers = users.filter(u => {
    const searchTarget = `${u.nameOfUser} ${u.email} ${u.department} ${u.status}`.toLowerCase();
    return searchTarget.includes(searchQuery.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* OPERATIONS HEADER CONTROLLER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>👥 Decentralized User Accounts Matrix Directory</h2>
          <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>Audit active logins, grant operational authorization gates, and filter system registries.</p>
        </div>
        
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="🔍 Search users by name, login email, status state..."
          style={{ width: '320px', padding: '0.45rem 0.85rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
        />
      </div>

      {/* CORE REGISTRY ACCOUNTS DATA GRID */}
      <div className="card" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem', border: '1px solid #cbd5e1', background: '#ffffff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontStyle: 'italic' }}>Synchronizing central credential ledgers...</div>
        ) : (
          <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>System User Profile</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Login Email Address</th>
                <th style={{ padding: '10px', textAlign: 'center', width: '120px' }}>Approval Gate</th>
                <th style={{ padding: '10px', textAlign: 'left', width: '220px' }}>Access Permission Role</th>
                <th style={{ padding: '10px', textAlign: 'left', width: '250px' }}>Bound Department Office Space Domain</th>
                <th style={{ padding: '10px', textAlign: 'center', width: '150px' }}>Gating Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontStyle: 'italic' }}>No active accounts directory entries map to your query values.</td></tr>
              ) : (
                filteredUsers.map((u, i) => {
                  const standardizedStatus = (u.status || 'pending').trim().toLowerCase();

                  let statusBg = '#fef3c7'; let statusColor = '#b45309'; 
                  if (standardizedStatus === 'approved') { statusBg = '#dcfce7'; statusColor = '#15803d'; }
                  if (standardizedStatus === 'rejected') { statusBg = '#fee2e2'; statusColor = '#b91c1c'; }

                  // Dynamic tracking color backgrounds based on selected roles
                  let rowBg = 'transparent';
                  if (u.userType === 'Administrator') rowBg = '#f0fdf4';
                  if (u.userType === 'BAC Secretary') rowBg = '#f5f3ff';
                  if (standardizedStatus === 'pending') rowBg = '#fffbeb';

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: rowBg }}>
                      
                      <td style={{ padding: '10px', fontWeight: '700', color: '#0f172a' }}>
                        👤 {u.nameOfUser}
                        <span style={{ display: 'block', fontSize: '0.72rem', color: '#64748b', fontWeight: '400', marginTop: '2px' }}>Created: {u.timestamp}</span>
                      </td>
                      
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#334155' }}>{u.email}</td>
                      
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', background: statusBg, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                          {u.status || 'Pending'}
                        </span>
                      </td>

                      <td style={{ padding: '10px' }}>
                        <select 
                          value={u.userType} 
                          disabled={standardizedStatus !== 'approved'} 
                          onChange={(e) => handleUpdateUserRole(u.email, u.userType, u.department, u.status, 'userType', e.target.value)}
                          style={{ padding: '3px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontWeight: '600', color: u.userType === 'Administrator' ? '#166534' : u.userType === 'BAC Secretary' ? '#6d28d9' : '#475569' }}
                        >
                          <option value="Regular User">Regular User</option>
                          <option value="BAC Secretary">BAC Secretary</option> {/* 👈 FIXED: Mapped here cleanly inside dropdown options */}
                          <option value="Administrator">Administrator</option>
                        </select>
                      </td>

                      <td style={{ padding: '10px' }}>
                        <select 
                          value={u.department} 
                          disabled={standardizedStatus !== 'approved'} 
                          onChange={(e) => handleUpdateUserRole(u.email, u.userType, u.department, u.status, 'department', e.target.value)}
                          style={{ padding: '3px 6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #cbd5e1', width: '100%', fontWeight: '500' }}
                        >
                          {MUNICIPAL_DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                          {standardizedStatus === 'pending' ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <button 
                                type="button" 
                                style={{ flexGrow: 1, padding: '3px 6px', fontSize: '0.75rem', background: '#10b981', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                                onClick={() => handleUpdateUserRole(u.email, u.userType, u.department, u.status, 'status', 'Approved')}
                              >
                                Approve
                              </button>
                              <button 
                                type="button" 
                                style={{ flexGrow: 1, padding: '3px 6px', fontSize: '0.75rem', background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}
                                onClick={() => handleUpdateUserRole(u.email, u.userType, u.department, u.status, 'status', 'Rejected')}
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              className="btn-danger" 
                              style={{ padding: '3px 6px', fontSize: '0.75rem', border: 'none', width: '100%' }}
                              onClick={() => handleEraseAccount(u.email)}
                            >
                              Erase Account
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}