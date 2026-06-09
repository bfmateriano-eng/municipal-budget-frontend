import { useState, useEffect } from 'react';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = ["2026", "2027", "2028", "2029", "2030"];

const OFFICE_CODES = {
  "Bureau of Fire Protection (BFP)": "1000-000-3-3-17",
  "Civil Society Organization (CSO)": "1000-000-3-3-18",
  "Commission on Election (COMELEC)": "1000-000-3-3-19",
  "Department of Education (DepEd)": "3000-000-3-3-20",
  "Department of the Agrarian Reform (DAR)": "8000-000-3-3-21",
  "Department of the Interior and Local Government (DILG)": "1000-000-3-3-22",
  "Municipal Trial Court (MTC)": "1000-000-3-3-23",
  "Office of the Business Permit and Licensing Officer (BPLO)": "8000-000-3-3-01",
  "Office of the Command Center": "1000-000-3-3-02",
  "Office of the Community Affairs": "1000-000-3-3-03",
  "Office of the Cooperative Development Officer": "1000-000-3-3-04",
  "Office of the Culture and the Arts": "1000-000-3-3-05",
  "Office of the Gender And Development (GAD)": "3000-000-3-3-06",
  "Office of the General Services Officer (GSO)": "1000-000-3-3-07",
  "Office of the Human Resource and Management Officer (HRMO)": "1000-000-3-3-08",
  "Office of the Local Youth Development Officer (LYDO)": "3000-000-3-3-09",
  "Office of the Market": "8000-000-3-3-10",
  "Office of the Municipal Accountant": "1000-000-3-1-07",
  "Office of the Municipal Administrator": "1000-000-3-2-01",
  "Office of the Municipal Agricultural Officer (DA)": "8000-000-3-2-03",
  "Office of the Municipal Anti-Drug Abuse Council (MADAC)": "3000-000-3-3-11",
  "Office of the Municipal Assessor": "1000-000-3-1-06",
  "Office of the Municipal Budget Officer": "1000-000-3-1-08",
  "Office of the Municipal Civil Registrar": "1000-000-3-1-12",
  "Office of the Municipal Engineer/Building Official": "1000-000-3-1-10",
  "Office of the Municipal Environment and Natural Resources (MENRO)": "8000-000-3-2-04",
  "Office of the Municipal Health Officer (MHO)": "1000-000-3-1-11",
  "Office of the Municipal Information Officer": "1000-000-3-2-06",
  "Office of the Municipal Legal Officer": "1000-000-3-2-02",
  "Office of the Municipal Mayor": "1000-000-3-1-01",
  "Office of the Municipal Planning and Development Coordinator (MPDO)": "1000-000-3-1-09",
  "Office of the Municipal Risk Reduction Management Officer (MDRRMO)": "1000-000-3-3-12",
  "Office of the Municipal Social Welfare and Development Officer (MSWDO)": "3000-000-3-2-05",
  "Office of the Municipal Tourism": "8000-000-3-3-13",
  "Office of the Municipal Treasurer (MTO)": "1000-000-3-1-05",
  "Office of the Municipal Vice Mayor": "1000-000-3-1-02",
  "Office of the Persons with Disability Affairs Officer (PDAO)": "3000-000-3-3-14",
  "Office of the Public Employment Service Officer (PESO)": "8000-000-3-3-15",
  "Office of the Sangguniang Bayan Members": "1000-000-3-1-03",
  "Office of the Secretary to the Sangguniang Bayan": "1000-000-3-1-04",
  "Office of the Technical Education and Skills Development Authority (TESDA)": "8000-000-3-3-16",
  "Philippine National Police (PNP)": "1000-000-3-3-24",
  "Post Office (PO)": "1000-000-3-3-25"
};

export default function AipPage({ user }) {
  const [aipLedger, setAipLedger] = useState([]);
  const [ldipPrograms, setLdipPrograms] = useState([]);

  // Modal Visibility Control States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTargetRow, setActiveTargetRow] = useState(null);
  const [modalContextMode, setModalContextMode] = useState(''); 

  // Step 1 Form Inputs: Basic Shell Creation
  const [programTitle, setProgramTitle] = useState('');
  const [projectName, setProjectName] = useState('');

  // Context Detail Form Inputs
  const [activityNameInput, setActivityNameInput] = useState('');
  const [implOffice, setImplOffice] = useState(user?.department || '');
  const [startMonth, setStartMonth] = useState('January');
  const [startYear, setStartYear] = useState('2026');
  const [endMonth, setEndMonth] = useState('December');
  const [endYear, setEndYear] = useState('2026');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [fundingSource, setFundingSource] = useState('');
  const [ps, setPs] = useState('');
  const [mooe, setMooe] = useState('');
  const [co, setCo] = useState('');
  const [ccAdaptation, setCcAdaptation] = useState('');
  const [ccMitigation, setCcMitigation] = useState('');
  const [ccTypology, setCcTypology] = useState('');

  const loadDependencies = async () => {
    try {
      const targetDept = user?.department || '';
      const ldipRes = await fetch(`http://localhost:5000/api/ldip/${encodeURIComponent(targetDept)}`);
      if (ldipRes.ok) setLdipPrograms(await ldipRes.json());
      
      const aipRes = await fetch(`http://localhost:5000/api/aip/${encodeURIComponent(targetDept)}`);
      if (aipRes.ok) {
        const rawData = await aipRes.json();
        // Defensive Guard: Filter out any null or malformed array structures coming from the server
        setAipLedger(Array.isArray(rawData) ? rawData.filter(item => item !== null) : []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadDependencies(); }, [user?.department]);

  const handleOpenCreateModal = () => {
    setProgramTitle('');
    setProjectName('');
    setIsProjectModalOpen(true);
  };

  const handleCreateProjectShell = async (e) => {
    e.preventDefault();
    if (!programTitle) return alert("Please map a baseline LDIP program linkage.");

    const chronologicalLedger = [...aipLedger].reverse();
    const historicalPrograms = [];
    const historicalProjectsByProg = {};

    chronologicalLedger.forEach(item => {
      if (item && item.programTitle) {
        if (!historicalPrograms.includes(item.programTitle)) historicalPrograms.push(item.programTitle);
        if (!historicalProjectsByProg[item.programTitle]) historicalProjectsByProg[item.programTitle] = [];
        if (item.projectName && !historicalProjectsByProg[item.programTitle].includes(item.projectName)) {
          historicalProjectsByProg[item.programTitle].push(item.projectName);
        }
      }
    });

    let programIdx = historicalPrograms.indexOf(programTitle) + 1;
    if (programIdx === 0) programIdx = historicalPrograms.length + 1;
    const ab = programIdx.toString();

    if (!historicalProjectsByProg[programTitle]) historicalProjectsByProg[programTitle] = [];
    const cd = (historicalProjectsByProg[programTitle].length + 1).toString();

    const baseOfficeCode = OFFICE_CODES[user?.department] || "0000-000-0-0-00";
    const initialRefCode = `${baseOfficeCode}-${ab}.${cd}.0`;

    const shellEntry = [{
      aipRefCode: initialRefCode, office: user?.department || 'Unknown', programTitle, projectName,
      activityName: 'PENDING_CONFIG', implementingOffice: user?.department || 'Unknown', startDate: '—', completionDate: '—',
      expectedOutput: '—', fundingSource: '—', ps: 0, mooe: 0, co: 0, total: 0, ccAdaptation: 0, ccMitigation: 0, ccTypology: '—'
    }];

    try {
      const response = await fetch('http://localhost:5000/api/aip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: shellEntry })
      });
      if (response.ok) {
        setIsProjectModalOpen(false);
        setProjectName('');
        loadDependencies();
      }
    } catch (err) { alert("Failed to save project shell."); }
  };

  const handleOpenDetailsForm = (row, mode) => {
    setActiveTargetRow(row);
    setModalContextMode(mode);
    setActivityNameInput('');
    setExpectedOutput('');
    setFundingSource('');
    setPs(''); setMooe(''); setCo('');
    setCcAdaptation(''); setCcMitigation(''); setCcTypology('');
    setIsDetailsModalOpen(true);
  };

  const handleCommitDetailsForm = async (e) => {
    e.preventDefault();
    if (!activeTargetRow) return alert("Target context row reference error.");

    const psVal = parseFloat(ps) || 0;
    const mooeVal = parseFloat(mooe) || 0;
    const coVal = parseFloat(co) || 0;

    if (modalContextMode === 'STANDALONE') {
      const updatedEntry = {
        office: activeTargetRow.office, programTitle: activeTargetRow.programTitle, projectName: activeTargetRow.projectName,
        activityName: 'N/A (Standalone Project)', implementingOffice: implOffice, startDate: `${startMonth} ${startYear}`,
        completionDate: `${endMonth} ${endYear}`, expectedOutput, fundingSource, ps: psVal, mooe: mooeVal, co: coVal, total: psVal + mooeVal + coVal,
        ccAdaptation: parseFloat(ccAdaptation) || 0, ccMitigation: parseFloat(ccMitigation) || 0, ccTypology
      };

      try {
        const res = await fetch('http://localhost:5000/api/aip/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalRefCode: activeTargetRow.aipRefCode, updatedEntry })
        });
        if (res.ok) {
          setIsDetailsModalOpen(false);
          loadDependencies();
          alert("Standalone parameters mapped successfully!");
        }
      } catch (err) { alert("Failed to commit parameters."); }

    } else {
      // MODE: ADD DYNAMIC ACTIVITY
      const matches = aipLedger.filter(item => item && item.projectName === activeTargetRow.projectName && item.programTitle === activeTargetRow.programTitle);
      if (matches.length === 0) return alert("Error fetching structural parent indexes.");
      
      const firstMatch = matches[matches.length - 1]; 
      if (!firstMatch || !firstMatch.aipRefCode) return alert("Parent Reference Code tracking missing.");

      const refParts = firstMatch.aipRefCode.split('-');
      const suffixParts = refParts[refParts.length - 1].split('.');
      const ab = suffixParts[0];
      const cd = suffixParts[1];

      const baseOfficeCode = OFFICE_CODES[user?.department] || "0000-000-0-0-00";

      if (matches.length === 1 && firstMatch.activityName === 'PENDING_CONFIG') {
        const codeValueString = `${baseOfficeCode}-${ab}.${cd}.1`;
        const updatedEntry = {
          office: activeTargetRow.office, programTitle: activeTargetRow.programTitle, projectName: activeTargetRow.projectName,
          activityName: activityNameInput, implementingOffice: implOffice, startDate: `${startMonth} ${startYear}`,
          completionDate: `${endMonth} ${endYear}`, expectedOutput, fundingSource, ps: psVal, mooe: mooeVal, co: coVal, total: psVal + mooeVal + coVal,
          ccAdaptation: parseFloat(ccAdaptation) || 0, ccMitigation: parseFloat(ccMitigation) || 0, ccTypology
        };

        try {
          const res = await fetch('http://localhost:5000/api/aip/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalRefCode: activeTargetRow.aipRefCode, updatedEntry: { ...updatedEntry, aipRefCode: codeValueString } })
          });
          if (res.ok) {
            setIsDetailsModalOpen(false);
            loadDependencies();
            alert("Activity #1 logged successfully!");
          }
        } catch (err) { alert("Error writing row parameter updates."); }

      } else {
        const nextEfIndex = matches.filter(m => m && m.activityName !== 'PENDING_CONFIG').length + 1;
        const codeValueString = `${baseOfficeCode}-${ab}.${cd}.${nextEfIndex}`;

        const appendPayload = [{
          aipRefCode: codeValueString, office: user?.department || 'Unknown', programTitle: activeTargetRow.programTitle, projectName: activeTargetRow.projectName,
          activityName: activityNameInput, implementingOffice: implOffice, startDate: `${startMonth} ${startYear}`,
          completionDate: `${endMonth} ${endYear}`, expectedOutput, fundingSource, ps: psVal, mooe: mooeVal, co: coVal, total: psVal + mooeVal + coVal,
          ccAdaptation: parseFloat(ccAdaptation) || 0, ccMitigation: parseFloat(ccMitigation) || 0, ccTypology
        }];

        try {
          const response = await fetch('http://localhost:5000/api/aip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entries: appendPayload })
          });
          if (response.ok) {
            setIsDetailsModalOpen(false);
            loadDependencies();
            alert(`Activity #${nextEfIndex} appended successfully!`);
          }
        } catch (err) { alert("Failed to append activity element line."); }
      }
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!entry || !entry.aipRefCode) return;
    const confirmation = window.confirm(`Permanently delete entry: "${entry.aipRefCode}"?`);
    if (!confirmation) return;
    try {
      const res = await fetch('http://localhost:5000/api/aip/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aipRefCode: entry.aipRefCode })
      });
      if (res.ok) loadDependencies();
    } catch (err) { alert("Deletion failure."); }
  };

  // Defensive Guard: Added safe checking routines to prevent object resolution failures
  const getProjectTrackingStatus = (pName, progTitle) => {
    if (!pName || !progTitle) return 'PENDING';
    const cluster = aipLedger.filter(item => item && item.projectName === pName && item.programTitle === progTitle);
    if (cluster.length === 0) return 'PENDING';
    if (cluster.some(item => item?.activityName === 'PENDING_CONFIG')) return 'PENDING';
    if (cluster.some(item => item?.activityName && item.activityName.includes('N/A (Standalone Project)'))) return 'STANDALONE';
    return 'ACTIVITIES';
  };

  return (
    <div className="main-content-stream" style={{ width: '100%' }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Annual Investment Program (AIP) Workspace</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Formulating yearly activity actions and micro-allotment funding frameworks.</p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreateModal}>+ Add Project / Activity</button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <h3>Current AIP Implementation Schedule</h3>
        {aipLedger.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2.5rem 0' }}>No Annual Investment records found for this office.</p>
        ) : (
          <table className="budget-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>AIP Reference Code</th>
                <th>Parent Program (LDIP)</th>
                <th>Project Component Architecture</th>
                <th>Activity Node Scope</th>
                <th>Timeline Span</th>
                <th>Funding Target (PS / MOOE / CO)</th>
                <th>Total Allotment</th>
                <th>Climate Code</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Defensive Filter: Excludes any corrupted null data frames on render mapping blocks */}
              {aipLedger.filter(row => row !== null && row !== undefined).map((row, i) => {
                const status = getProjectTrackingStatus(row?.projectName, row?.programTitle);
                const isPendingShell = row?.activityName === 'PENDING_CONFIG';

                return (
                  <tr key={i} style={{ backgroundColor: isPendingShell ? '#f8fafc' : 'transparent' }}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.85rem', color: isPendingShell ? '#94a3b8' : '#1e3a8a', whiteSpace: 'nowrap' }}>
                      {isPendingShell ? 'PENDING ASSIGNMENT' : row?.aipRefCode}
                    </td>
                    <td style={{ fontWeight: '500', fontSize: '0.85rem', color: isPendingShell ? '#94a3b8' : '#334155' }}>{row?.programTitle}</td>
                    <td>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{row?.projectName}</div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '6px' }}>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: status === 'PENDING' ? '#3b82f6' : '#e2e8f0', color: status === 'PENDING' ? '#ffffff' : '#94a3b8', border: 'none', cursor: status === 'PENDING' ? 'pointer' : 'default' }}
                          disabled={status !== 'PENDING'} 
                          onClick={() => handleOpenDetailsForm(row, 'STANDALONE')}
                        >
                          📋 Add Details (Standalone)
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          style={{ padding: '2px 8px', fontSize: '0.75rem', backgroundColor: status === 'PENDING' || status === 'ACTIVITIES' ? '#10b981' : '#e2e8f0', color: status === 'PENDING' || status === 'ACTIVITIES' ? '#ffffff' : '#94a3b8', border: 'none', cursor: status === 'PENDING' || status === 'ACTIVITIES' ? 'pointer' : 'default' }}
                          disabled={status === 'STANDALONE'} 
                          onClick={() => handleOpenDetailsForm(row, 'ACTIVITY')}
                        >
                          🌿 Add Activity {status === 'ACTIVITIES' ? '(Append New)' : '(Sub-tasks)'}
                        </button>
                      </div>
                    </td>
                    <td style={{ color: isPendingShell ? '#cbd5e1' : '#475569', fontStyle: isPendingShell ? 'italic' : 'normal' }}>
                      {isPendingShell ? 'Awaiting assignment parameters' : row?.activityName}
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>
                      {isPendingShell ? <span style={{ color: '#cbd5e1' }}>—</span> : (
                        <>
                          <span style={{ display: 'block', color: '#166534' }}>⚡ {row?.startDate}</span>
                          <span style={{ display: 'block', color: '#991b1b' }}>🏁 {row?.completionDate}</span>
                        </>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: isPendingShell ? '#cbd5e1' : '#64748b', whiteSpace: 'nowrap' }}>
                      {isPendingShell ? '—' : `PS: ₱${(row?.ps || 0).toLocaleString()} | MOOE: ₱${(row?.mooe || 0).toLocaleString()} | CO: ₱${(row?.co || 0).toLocaleString()}`}
                    </td>
                    <td style={{ fontWeight: '700', color: isPendingShell ? '#cbd5e1' : '#0f172a' }}>
                      {isPendingShell ? '—' : `₱${(row?.total || 0).toLocaleString()}`}
                    </td>
                    <td>
                      {isPendingShell ? <span style={{ color: '#cbd5e1' }}>—</span> : (
                        <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', display: 'block' }}>
                          🔑 {row?.ccTypology || 'None'}
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                        <button className="btn-danger" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => handleDeleteEntry(row)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL WINDOW 1: ADD BASIC PROJECT Shell INPUT WINDOW */}
      {isProjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header-section">
              <h2>Add New Project Component Shell</h2>
              <p className="label-helper">Establish structural target definitions before assigning granular line-item activity parameters.</p>
            </div>
            <form onSubmit={handleCreateProjectShell}>
              <div className="form-field-group">
                <label>Select Parent LDIP Linkage Track</label>
                <select value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} required>
                  <option value="" disabled>Choose authorized LDIP ledger baseline track entry...</option>
                  {ldipPrograms.filter(p => p !== null).map(p => <option key={p.id || Math.random()} value={p.title}>{p.title}</option>)}
                </select>
              </div>
              <div className="form-field-group">
                <label>Project Component Name Title</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g., Expansion of Local Command Hub Facilities" required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsProjectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Generate Project Row</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: GRANULAR METRICS AND EXPENDITURES ASSIGNMENT DIALOG */}
      {isDetailsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh' }}>
            <div className="modal-header-section">
              <h2>{modalContextMode === 'STANDALONE' ? 'Configure Standalone Project Metrics' : 'Log New Project Activity Node'}</h2>
              <p className="label-helper">Target Context: <strong>{activeTargetRow?.projectName || 'Unassigned'}</strong></p>
            </div>
            <form onSubmit={handleCommitDetailsForm}>
              
              {modalContextMode === 'ACTIVITY' && (
                <div className="form-field-group">
                  <label>Activity Action Node Title Description</label>
                  <input type="text" value={activityNameInput} onChange={(e) => setActivityNameInput(e.target.value)} placeholder="e.g., Phase 1 Triage Area Structural Retrofitting Operations" required />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-field-group">
                  <label>Estimated Execution Start Date</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <select value={startYear} onChange={(e) => setStartYear(e.target.value)}>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                </div>
                <div className="form-field-group">
                  <label>Projected Operational Completion Date</label>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <select value={endYear} onChange={(e) => setEndYear(e.target.value)}>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                </div>
              </div>

              <div className="form-field-group">
                <label>Expected Target Output / Deliverable Scope</label>
                <input type="text" value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} placeholder="e.g., 1 fully localized structural asset operational" required />
              </div>

              <div className="form-field-group">
                <label>Primary Allotted Funding Source</label>
                <input type="text" value={fundingSource} onChange={(e) => setFundingSource(e.target.value)} placeholder="e.g., 20% Municipal Development Fund, Revenue Share" required />
              </div>

              <label style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', display: 'block', fontWeight: '600', fontSize: '0.9rem' }}>FINANCIAL CAPITAL ALLOTMENTS (IN PESOS)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div className="form-field-group"><label>PS Allotment</label><input type="number" placeholder="0.00" value={ps} onWheel={(e) => e.target.blur()} onChange={(e) => setPs(e.target.value)} /></div>
                <div className="form-field-group"><label>MOOE Allotment</label><input type="number" placeholder="0.00" value={mooe} onWheel={(e) => e.target.blur()} onChange={(e) => setMooe(e.target.value)} /></div>
                <div className="form-field-group"><label>CO Allotment</label><input type="number" placeholder="0.00" value={co} onWheel={(e) => e.target.blur()} onChange={(e) => setCo(e.target.value)} /></div>
              </div>

              <label style={{ color: '#166534', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', display: 'block', marginTop: '1rem', fontWeight: '600', fontSize: '0.9rem' }}>CLIMATE RESPONSE ALLOCATIONS (IN PESOS)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div className="form-field-group"><label>Adaptation Funding</label><input type="number" placeholder="0.00" value={ccAdaptation} onWheel={(e) => e.target.blur()} onChange={(e) => setCcAdaptation(e.target.value)} /></div>
                <div className="form-field-group"><label>Mitigation Funding</label><input type="number" placeholder="0.00" value={ccMitigation} onWheel={(e) => e.target.blur()} onChange={(e) => setCcMitigation(e.target.value)} /></div>
                <div className="form-field-group"><label>Typology Code Symbol</label><input type="text" placeholder="e.g., 2.3.1.2" value={ccTypology} onChange={(e) => setCcTypology(e.target.value)} /></div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsDetailsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Commit Target Layout Specifications</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}