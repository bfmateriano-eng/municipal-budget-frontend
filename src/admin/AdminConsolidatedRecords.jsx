import { useState, useEffect, Fragment } from 'react';

const MUNICIPAL_OFFICES = [
  "Bureau of Fire Protection (BFP)",
  "Civil Society Organization (CSO)",
  "Commission on Election (COMELEC)",
  "Department of Education (DepEd)",
  "Department of the Agrarian Reform (DAR)",
  "Department of the Interior and Local Government (DILG)",
  "Municipal Trial Court (MTC)",
  "Office of the Business Permit and Licensing Officer (BPLO)",
  "Office of the Command Center",
  "Office of the Community Affairs",
  "Office of the Cooperative Development Officer",
  "Office of the Culture and the Arts",
  "Office of the Gender And Development (GAD)",
  "Office of the General Services Officer (GSO)",
  "Office of the Human Resource and Management Officer (HRMO)",
  "Office of the Local Youth Development Officer (LYDO)",
  "Office of the Market",
  "Office of the Municipal Accountant",
  "Office of the Municipal Administrator",
  "Office of the Municipal Agricultural Officer (DA)",
  "Office of the Municipal Anti-Drug Abuse Council (MADAC)",
  "Office of the Municipal Assessor",
  "Office of the Municipal Budget Officer",
  "Office of the Municipal Civil Registrar",
  "Office of the Municipal Engineer/Building Official",
  "Office of the Municipal Environment and Natural Resources (MENRO)",
  "Office of the Municipal Health Officer (MHO)",
  "Office of the Municipal Information Officer",
  "Office of the Municipal Legal Officer",
  "Office of the Municipal Mayor",
  "Office of the Municipal Planning and Development Coordinator (MPDO)",
  "Office of the Municipal Risk Reduction Management Officer (MDRRMO)",
  "Office of the Municipal Social Welfare and Development Officer (MSWDO)",
  "Office of the Municipal Tourism",
  "Office of the Municipal Treasurer (MTO)",
  "Office of the Municipal Vice Mayor",
  "Office of the Persons with Disability Affairs Officer (PDAO)",
  "Office of the Public Employment Service Officer (PESO)",
  "Office of the Sangguniang Bayan Members",
  "Office of the Secretary to the Sangguniang Bayan",
  "Office of the Technical Education and Skills Development Authority (TESDA)",
  "Philippine National Police (PNP)",
  "Post Office (PO)"
];

export default function AdminConsolidatedRecords() {
  // Global View Controls
  const [selectedOffice, setSelectedOffice] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState('ldip'); // 'ldip', 'aip', 'budget', 'ppmp'

  // Master Raw Ledger Storage Data States
  const [ldipList, setLdipList] = useState([]);
  const [aipList, setAipList] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [ppmpList, setPpmpList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Accordion Toggle States for LDIP Tree roll-up visualization
  const [expandedPrograms, setExpandedPrograms] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState([]);

  const loadMasterLedgerData = async () => {
    setLoading(true);
    try {
      const token = encodeURIComponent(selectedOffice);
      
      // Concurrently query matching records from the server based on the active Office selection
      const [ldipRes, aipRes, budgetRes, ppmpRes] = await Promise.all([
        fetch(`https://municipal-budget-backend.onrender.com/api/ldip/${token}`),
        fetch(`https://municipal-budget-backend.onrender.com/api/aip/${token}`),
        fetch(`https://municipal-budget-backend.onrender.com/api/budget/${token}`),
        fetch(`https://municipal-budget-backend.onrender.com/api/ppmp/${token}`)
      ]);

      setLdipList(ldipRes.ok ? await ldipRes.json() : []);
      setAipList(aipRes.ok ? await aipRes.json() : []);
      setBudgetList(budgetRes.ok ? await budgetRes.json() : []);
      setPpmpList(ppmpRes.ok ? await ppmpRes.json() : []);
    } catch (e) {
      console.error("Failed to load operational matrices:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasterLedgerData();
    // Reset structural collapse configurations when shifting office filter contexts
    setExpandedPrograms([]);
    setExpandedProjects([]);
  }, [selectedOffice]);

  // Collapsible Row Handlers
  const toggleProgramCollapse = (title) => {
    setExpandedPrograms(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };
  const toggleProjectCollapse = (progTitle, projName) => {
    const key = `${progTitle}|||${projName}`;
    setExpandedProjects(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  // ===================================================================
  // RECURSIVE COMPILER: REBUILD LDIP PROGRESSIVE VALUES LIVE IN RAM
  // ===================================================================
  const compiledLdipTree = ldipList.map((prog, index) => {
    const matchingAip = aipList.filter(a => a && a.programTitle === prog.title);
    const matchingBudget = budgetList.filter(b => b && b.programTitle === prog.title);

    const aipSum = matchingAip.reduce((s, c) => s + (c.total || 0), 0);
    const budgetSum = matchingBudget.reduce((s, c) => s + (c.total || 0), 0);

    const projectMap = {};
    matchingAip.forEach(item => {
      const pName = item.projectName;
      if (!projectMap[pName]) {
        projectMap[pName] = { projectName: pName, aipRefCode: item.aipRefCode, aipTotal: 0, budgetTotal: 0, activities: [] };
      }
      if (item.activityName !== 'PENDING_CONFIG') projectMap[pName].aipTotal += item.total || 0;
      
      const assocBudget = matchingBudget.filter(b => b.projectName === pName && b.activityName === item.activityName);
      assocBudget.forEach(b => { projectMap[pName].budgetTotal += b.total || 0; });

      if (item.activityName && !item.activityName.includes('N/A') && item.activityName !== 'PENDING_CONFIG') {
        const specificBudget = matchingBudget.find(b => b.projectName === pName && b.activityName === item.activityName);
        projectMap[pName].activities.push({
          activityName: item.activityName,
          aipRefCode: item.aipRefCode,
          aipTotal: item.total || 0,
          budgetTotal: specificBudget ? specificBudget.total : 0
        });
      }
    });

    return { ...prog, id: index, aipBudgetRequirement: aipSum, annualBudget: budgetSum, projectsList: Object.values(projectMap) };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* GLOBAL ADMINISTRATIVE TOP BAR CONTROLLERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', gap: '0.35rem', background: '#f1f5f9', padding: '4px', borderRadius: '6px' }}>
          <button className={`sub-tab ${activeSubTab === 'ldip' ? 'active' : ''}`} onClick={() => setActiveSubTab('ldip')} style={subTabStyle(activeSubTab === 'ldip')}>1. Consolidated LDIP</button>
          <button className={`sub-tab ${activeSubTab === 'aip' ? 'active' : ''}`} onClick={() => setActiveSubTab('aip')} style={subTabStyle(activeSubTab === 'aip')}>2. Consolidated AIP</button>
          <button className={`sub-tab ${activeSubTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveSubTab('budget')} style={subTabStyle(activeSubTab === 'budget')}>3. Annual Budget (Form 4)</button>
          <button className={`sub-tab ${activeSubTab === 'ppmp' ? 'active' : ''}`} onClick={() => setActiveSubTab('ppmp')} style={subTabStyle(activeSubTab === 'ppmp')}>4. PPMP Procurement</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155', whiteSpace: 'nowrap' }}>📍 Global Office Filter:</label>
          <select value={selectedOffice} onChange={(e) => setSelectedOffice(e.target.value)} style={{ padding: '0.45rem 1.5rem 0.45rem 0.75rem', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: '600', color: '#1e3a8a', cursor: 'pointer' }}>
            <option value="ALL">🏢 — All Consolidated Offices —</option>
            {MUNICIPAL_OFFICES.map(off => <option key={off} value={off}>{off}</option>)}
          </select>
        </div>
      </div>

      {/* CORE DISPLAY WINDOW FRAME */}
      <div className="card" style={{ flexGrow: 1, overflowY: 'auto', padding: '1.25rem', border: '1px solid #cbd5e1', background: '#ffffff' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#64748b', fontStyle: 'italic' }}>Synchronizing cloud records dataset...</div>
        ) : (
          <>
            {/* DOCUMENT SUB-VIEW FRAME A: COLLAPSIBLE TREE LDIP GRID */}
            {activeSubTab === 'ldip' && (
              <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '10px', textAlign: 'center', width: '100px' }}>Sector Code</th>
                    <th style={{ padding: '10px', textAlign: 'left', width: '180px' }}>Office Domain</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>PPA Investment Lifecycle Architecture</th>
                    <th style={{ padding: '10px', textAlign: 'right', width: '130px' }}>Plan Baseline</th>
                    <th style={{ padding: '10px', textAlign: 'right', width: '130px', color: '#b45309', backgroundColor: '#fffbeb' }}>AIP Requirement</th>
                    <th style={{ padding: '10px', textAlign: 'right', width: '130px', color: '#166534', backgroundColor: '#f0fdf4' }}>Annual Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {compiledLdipTree.length === 0 ? <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>No LDIP records returned under this filter profile.</td></tr> :
                    compiledLdipTree.map(prog => {
                      const isOpen = expandedPrograms.includes(prog.title);
                      const hasChildren = prog.projectsList.length > 0;
                      return (
                        <Fragment key={prog.id}>
                          <tr style={{ borderBottom: '1px solid #cbd5e1', fontWeight: '700' }}>
                            <td style={{ padding: '10px', fontFamily: 'monospace', textAlign: 'center', color: '#64748b' }}>{prog.sectorCode}</td>
                            <td style={{ padding: '10px', color: '#0284c7', fontSize: '0.78rem' }}>{prog.office}</td>
                            <td style={{ padding: '10px', color: '#1e3a8a', cursor: hasChildren ? 'pointer' : 'default', userSelect: 'none' }} onClick={() => hasChildren && toggleProgramCollapse(prog.title)}>
                              {hasChildren && <span style={{ marginRight: '6px', color: '#94a3b8' }}>{isOpen ? '▼' : '▶'}</span>} 🎯 {prog.title}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right' }}>₱{prog.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '10px', textAlign: 'right', backgroundColor: '#fffbeb', color: '#b45309' }}>₱{prog.aipBudgetRequirement.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '10px', textAlign: 'right', backgroundColor: '#f0fdf4', color: '#166534' }}>₱{prog.annualBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                          </tr>
                          {isOpen && prog.projectsList.map(proj => {
                            const pKey = `${prog.title}|||${proj.projectName}`;
                            const isProjOpen = expandedProjects.includes(pKey);
                            return (
                              <Fragment key={pKey}>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontWeight: '600' }}>
                                  <td colSpan="2" style={{ color: '#cbd5e1', fontSize: '0.75rem', textAlign: 'right', paddingRight: '15px' }}>Component row ➔</td>
                                  <td style={{ paddingLeft: '30px', color: '#334155', cursor: proj.activities.length > 0 ? 'pointer' : 'default' }} onClick={() => proj.activities.length > 0 && toggleProjectCollapse(prog.title, proj.projectName)}>
                                    {proj.activities.length > 0 && <span style={{ marginRight: '6px', color: '#cbd5e1' }}>{isProjOpen ? '▼' : '▶'}</span>} 📁 {proj.projectName}
                                  </td>
                                  <td style={{ textAlign: 'right', color: '#cbd5e1' }}>—</td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#d97706' }}>₱{proj.aipTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  <td style={{ padding: '8px 10px', textAlign: 'right', color: '#10b981' }}>₱{proj.budgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                </tr>
                                {isProjOpen && proj.activities.map((act, aIdx) => (
                                  <tr key={aIdx} style={{ backgroundColor: '#fffdfa', borderBottom: '1px solid #f1f5f9', color: '#475569', fontSize: '0.8rem' }}>
                                    <td colSpan="2" style={{ color: '#cbd5e1', fontSize: '0.72rem', textAlign: 'right', paddingRight: '15px' }}>Task node ➔</td>
                                    <td style={{ paddingLeft: '60px' }}>🌿 {act.activityName}</td>
                                    <td style={{ textAlign: 'right', color: '#cbd5e1' }}>—</td>
                                    <td style={{ padding: '6px 10px', textAlign: 'right', color: '#f59e0b' }}>₱{act.aipTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td style={{ padding: '6px 10px', textAlign: 'right', color: '#34d399' }}>₱{act.budgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                ))}
                              </Fragment>
                            );
                          })}
                        </Fragment>
                      );
                    })
                  }
                </tbody>
              </table>
            )}

            {/* DOCUMENT SUB-VIEW FRAME B: CONSOLIDATED AIP MASTER REGISTRY */}
            {activeSubTab === 'aip' && (
              <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th>Reference Code</th>
                    <th>Originating Office</th>
                    <th>Project Component</th>
                    <th>Activity Node Description Scope</th>
                    <th>Execution Window</th>
                    <th>Funding Source</th>
                    <th style={{ textAlign: 'right' }}>Total Proposed Allotment</th>
                  </tr>
                </thead>
                <tbody>
                  {aipList.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>No AIP program requirements matched.</td></tr> :
                    aipList.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1e3a8a' }}>{row.aipRefCode}</td>
                        <td style={{ fontWeight: '600', color: '#475569' }}>{row.office}</td>
                        <td style={{ fontWeight: '700' }}>{row.projectName}</td>
                        <td>{row.activityName}</td>
                        <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>⚡ {row.startDate} ➔ {row.completionDate}</td>
                        <td style={{ color: '#475569' }}>{row.fundingSource}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>₱{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}

            {/* DOCUMENT SUB-VIEW FRAME C: LOCAL BUDGET FORM NO. 4 APPROPRIATIONS */}
            {activeSubTab === 'budget' && (
              <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #0f172a' }}>
                    <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'center' }}>AIP Code</th>
                    <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Office Section Context</th>
                    <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Program Description Scope</th>
                    <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Manually Encoded Indicators</th>
                    <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'left' }}>Target Budget Year</th>
                    <th colSpan="4" style={{ border: '1px solid #cbd5e1', padding: '4px', textAlign: 'center', backgroundColor: '#e0f2fe' }}>Approved Appropriations (PhP)</th>
                  </tr>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>PS</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>MOOE</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right' }}>CO</th>
                    <th style={{ border: '1px solid #cbd5e1', padding: '6px', textAlign: 'right', backgroundColor: '#f0fdf4', fontWeight: '700' }}>Total Allotment</th>
                  </tr>
                </thead>
                <tbody>
                  {budgetList.length === 0 ? <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No programmed Form 4 allocations confirmed.</td></tr> :
                    budgetList.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: '700', textAlign: 'center' }}>{row.aipRefCode}</td>
                        <td style={{ border: '1px solid #cbd5e1', fontWeight: '600', color: '#475569' }}>{row.office}</td>
                        <td style={{ border: '1px solid #cbd5e1', lineHeight: '1.3' }}><strong>{row.projectName}</strong> {row.activityName && !row.activityName.includes('N/A') && <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>➔ {row.activityName}</span>}</td>
                        <td style={{ border: '1px solid #cbd5e1', fontStyle: 'italic' }}>{row.performanceIndicator || '—'}</td>
                        <td style={{ border: '1px solid #cbd5e1', fontWeight: '600' }}>{row.targetBudgetYear || '—'}</td>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontFamily: 'monospace' }}>₱{row.ps.toLocaleString()}</td>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontFamily: 'monospace' }}>₱{row.mooe.toLocaleString()}</td>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontFamily: 'monospace' }}>₱{row.co.toLocaleString()}</td>
                        <td style={{ border: '1px solid #cbd5e1', textAlign: 'right', fontFamily: 'monospace', fontWeight: '700', color: '#166534', backgroundColor: '#f0fdf4' }}>₱{row.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}

            {/* DOCUMENT SUB-VIEW FRAME D: MASTER PPMP PROCUREMENT MATRIX */}
            {activeSubTab === 'ppmp' && (
              <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th>AIP Ref Code</th>
                    <th>Originating Office</th>
                    <th>Procurement Target Title Description</th>
                    <th>Classification Type</th>
                    <th>Pre-Procure</th>
                    <th>Procurement Activity Window</th>
                    <th>Delivery Schedule</th>
                    <th style={{ textAlign: 'right' }}>Estimated Budget</th>
                    <th style={{ width: '220px' }}>Item Breakdown Matrix Split (Per-Item Basis)</th>
                  </tr>
                </thead>
                <tbody>
                  {ppmpList.length === 0 ? <tr><td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>No project procurement plans generated.</td></tr> :
                    ppmpList.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0369a1' }}>{row.aipRefCode}</td>
                        <td style={{ fontWeight: '600', color: '#475569' }}>{row.office}</td>
                        <td style={{ fontWeight: '700', color: '#1e293b' }}>{row.generalDescription}</td>
                        <td style={{ textAlign: 'center' }}><span style={{ fontSize: '0.72rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{row.typeOfProject}</span></td>
                        <td style={{ textAlign: 'center', fontWeight: '700', color: row.preProcurementConference === 'Yes' ? '#b45309' : '#94a3b8' }}>{row.preProcurementConference}</td>
                        <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>📅 {row.startProcurementMonth} ➔ {row.endProcurementMonth}</td>
                        <td style={{ fontWeight: '600', color: '#166534' }}>⚡ {row.expectedDeliveryMonth}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', fontFamily: 'monospace' }}>₱{row.estimatedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td>
                          {Array.isArray(row.items) && row.items.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              {row.items.map((it, iIdx) => (
                                <div key={iIdx} style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 4px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                                  <span>📦 {it.description}</span>
                                  <span style={{ fontWeight: '600', color: '#64748b' }}>{it.quantity}x ({it.unitOfMeasurement})</span>
                                </div>
                              ))}
                            </div>
                          ) : <span style={{ fontStyle: 'italic', color: '#cbd5e1' }}>No item splits registered</span>}
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

    </div>
  );
}

// Inline CSS Configuration utility helper functions
function subTabStyle(isActive) {
  return {
    padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: '700', borderRadius: '4px', cursor: 'pointer', border: 'none', transition: 'all 0.15s ease-in-out',
    backgroundColor: isActive ? '#ffffff' : 'transparent',
    color: isActive ? '#1e3a8a' : '#64748b',
    boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
  };
}