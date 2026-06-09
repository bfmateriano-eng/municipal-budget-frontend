import { useState, useEffect, Fragment } from 'react';

const SECTOR_MAPPING = {
  "Office of the Municipal Mayor": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Vice Mayor": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Sangguniang Bayan Members": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Secretary to the Sangguniang Bayan": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Treasurer (MTO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Assessor": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Accountant": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Budget Officer": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Planning and Development Coordinator (MPDO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Health Officer (MHO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Civil Registrar": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Administrator": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Legal Officer": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Information Officer": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Command Center": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Community Affairs": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Cooperative Development Officer": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the General Services Officer (GSO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Human Resource and Management Officer (HRMO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Office of the Municipal Risk Reduction Management Officer (MDRRMO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Bureau of Fire Protection (BFP)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Civil Society Organization (CSO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Commission on Election (COMELEC)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Department of the Interior and Local Government (DILG)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Municipal Trial Court (MTC)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Philippine National Police (PNP)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },
  "Post Office (PO)": { name: "GENERAL PUBLIC SERVICES", code: "1000" },

  "Department of Education (DepEd)": { name: "SOCIAL SERVICES", code: "8000" },
  "Office of the Culture and the Arts": { name: "SOCIAL SERVICES", code: "8000" },
  "Office of the Gender And Development (GAD)": { name: "SOCIAL SERVICES", code: "8000" },
  "Office of the Local Youth Development Officer (LYDO)": { name: "SOCIAL SERVICES", code: "8000" },
  "Office of the Municipal Anti-Drug Abuse Council (MADAC)": { name: "SOCIAL SERVICES", code: "8000" },
  "Office of the Municipal Social Welfare and Development Officer (MSWDO)": { name: "SOCIAL SERVICES", code: "8000" },
  "Office of the Persons with Disability Affairs Officer (PDAO)": { name: "SOCIAL SERVICES", code: "8000" },

  "Department of the Agrarian Reform (DAR)": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Business Permit and Licensing Officer (BPLO)": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Market": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Municipal Agricultural Officer (DA)": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Municipal Engineer/Building Official": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Municipal Environment and Natural Resources (MENRO)": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Municipal Tourism": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Public Employment Service Officer (PESO)": { name: "ECONOMIC SERVICES", code: "3000" },
  "Office of the Technical Education and Skills Development Authority (TESDA)": { name: "ECONOMIC SERVICES", code: "3000" }
};

export default function LdipPage({ user }) {
  const [baseSeasonYear, setBaseSeasonYear] = useState(() => {
    return Number(localStorage.getItem('ldip_base_season')) || 2026;
  });

  const year1 = baseSeasonYear + 1;
  const year2 = baseSeasonYear + 2;
  const year3 = baseSeasonYear + 3;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ldipEntries, setLdipEntries] = useState([]);

  // NEW: State arrays for collapsible rows tracking
  const [aipEntries, setAipEntries] = useState([]);
  const [budgetEntries, setBudgetEntries] = useState([]);
  const [expandedPrograms, setExpandedPrograms] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState([]);

  // State identifiers for Edit tracking modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeEditingEntry, setActiveEditingEntry] = useState(null);

  // Form Field Tracking States
  const [programTitle, setProgramTitle] = useState('');
  const [programDescription, setProgramDescription] = useState('');
  const [targetY1, setTargetY1] = useState(false);
  const [targetY2, setTargetY2] = useState(false);
  const [targetY3, setTargetY3] = useState(false);
  const [requiredBudget, setRequiredBudget] = useState('');

  const assignedSector = SECTOR_MAPPING[user.department] || { name: "UNASSIGNED", code: "0000" };

  // Extracted Loader: Fetches the primary LDIP entries and cross-references them with AIP and Budget databases
  const fetchCloudEntries = async () => {
    try {
      const dept = user?.department || '';
      
      const response = await fetch(`http://localhost:5000/api/ldip/${encodeURIComponent(dept)}`);
      if (response.ok) {
        const data = await response.json();
        setLdipEntries(data);
      } else {
        console.error("Server responded with an entry lookup failure code.");
      }

      const aipRes = await fetch(`http://localhost:5000/api/aip/${encodeURIComponent(dept)}`);
      if (aipRes.ok) {
        const data = await aipRes.json();
        setAipEntries(Array.isArray(data) ? data.filter(x => x !== null) : []);
      }

      const budgetRes = await fetch(`http://localhost:5000/api/budget/${encodeURIComponent(dept)}`);
      if (budgetRes.ok) {
        const data = await budgetRes.json();
        setBudgetEntries(Array.isArray(data) ? data.filter(x => x !== null) : []);
      }
    } catch (error) {
      console.error("Failed to load live spreadsheet rows from backend connection:", error);
    }
  };

  useEffect(() => {
    fetchCloudEntries();
  }, [user.department]);

  const toggleProgramCollapse = (programTitle) => {
    if (expandedPrograms.includes(programTitle)) {
      setExpandedPrograms(expandedPrograms.filter(t => t !== programTitle));
    } else {
      setExpandedPrograms([...expandedPrograms, programTitle]);
    }
  };

  const toggleProjectCollapse = (programTitle, projectName) => {
    const key = `${programTitle}|||${projectName}`;
    if (expandedProjects.includes(key)) {
      setExpandedProjects(expandedProjects.filter(k => k !== key));
    } else {
      setExpandedProjects([...expandedProjects, key]);
    }
  };

  const handleActivateNewSeason = () => {
    const currentCalendarYear = 2026;
    localStorage.setItem('ldip_base_season', currentCalendarYear.toString());
    setBaseSeasonYear(currentCalendarYear);
    alert(`LDIP Planning Cycle activated! Targeted window configured for: ${currentCalendarYear + 1}, ${currentCalendarYear + 2}, and ${currentCalendarYear + 3}.`);
  };

  // Setup layout for creating a clean entry
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setActiveEditingEntry(null);
    setProgramTitle('');
    setProgramDescription('');
    setTargetY1(false);
    setTargetY2(false);
    setTargetY3(false);
    setRequiredBudget('');
    setIsModalOpen(true);
  };

  // Initialize form inputs using existing row parameters to enable Edit Mode
  const handleOpenEditModal = (entry) => {
    setIsEditMode(true);
    setActiveEditingEntry(entry);
    setProgramTitle(entry.title);
    setProgramDescription(entry.description);
    setTargetY1(entry.targets.includes(year1.toString()));
    setTargetY2(entry.targets.includes(year2.toString()));
    setTargetY3(entry.targets.includes(year3.toString()));
    setRequiredBudget(entry.budget);
    setIsModalOpen(true);
  };

  // Triggers verify alert prompt, removing matching index from database log safely
  const handleDeleteEntry = async (entry) => {
    const confirmation = window.confirm(`Are you sure you want to permanently delete: "${entry.title}"?`);
    if (!confirmation) return;

    try {
      const response = await fetch('http://localhost:5000/api/ldip/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office: entry.office,
          title: entry.title,
          timestamp: entry.timestamp
        })
      });

      if (response.ok) {
        alert("Entry successfully dropped from cloud ledger.");
        fetchCloudEntries(); // Force data redraw
      } else {
        alert("Failed to delete target entry.");
      }
    } catch (error) {
      alert("Error reaching backend server during delete request.");
    }
  };

  // Unified controller running either Create or safe Edit dispatch overrides
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!targetY1 && !targetY2 && !targetY3) {
      alert("Please choose at least one Target Implementation Year from the options panel.");
      return;
    }

    const implementationYears = [];
    if (targetY1) implementationYears.push(year1.toString());
    if (targetY2) implementationYears.push(year2.toString());
    if (targetY3) implementationYears.push(year3.toString());

    if (isEditMode && activeEditingEntry) {
      // === ROUTE OPTION A: DISPATCH EDIT MODIFICATIONS ===
      const payload = {
        originalOffice: activeEditingEntry.office,
        originalTitle: activeEditingEntry.title,
        originalTimestamp: activeEditingEntry.timestamp,
        updatedEntry: {
          office: activeEditingEntry.office,
          sectorCode: activeEditingEntry.sectorCode,
          sectorName: activeEditingEntry.sectorName,
          title: programTitle,
          description: programDescription,
          targets: implementationYears,
          budget: parseFloat(requiredBudget) || 0
        }
      };

      try {
        const response = await fetch('http://localhost:5000/api/ldip/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setIsModalOpen(false);
          fetchCloudEntries(); // Sync UI with fresh cloud values
          alert("Success! Entry updated directly inside Google Sheets.");
        } else {
          alert("Failed to update database entry.");
        }
      } catch (error) {
        alert("Server connection dropped during data update.");
      }

    } else {
      // === ROUTE OPTION B: DISPATCH CHRONOLOGICAL NEW CREATION ===
      const newEntry = {
        office: user.department,
        sectorCode: assignedSector.code,
        sectorName: assignedSector.name,
        title: programTitle,
        description: programDescription,
        targets: implementationYears,
        budget: parseFloat(requiredBudget) || 0,
        timestamp: new Date().toLocaleString()
      };

      try {
        const response = await fetch('http://localhost:5000/api/ldip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEntry)
        });

        if (response.ok) {
          setProgramTitle('');
          setProgramDescription('');
          setTargetY1(false);
          setTargetY2(false);
          setTargetY3(false);
          setRequiredBudget('');
          setIsModalOpen(false);
          
          fetchCloudEntries(); // Force structural updates live
          alert("Success! Entry posted and saved directly to Google Sheets.");
        } else {
          const data = await response.json();
          alert(`Cloud Connection Error: ${data.message}`);
        }
      } catch (error) {
        console.error("LDIP server connection dropped:", error);
        alert("Failed to synchronize with backend server ledger.");
      }
    }
  };

  const getBadgeClass = (code) => {
    if (code === "1000") return "badge badge-general";
    if (code === "8000") return "badge badge-social";
    return "badge badge-economic";
  };

  return (
    <div className="main-content-stream" style={{ width: '100%' }}>
      
      {user.userType === 'Administrator' && (
        <div className="admin-season-box">
          <div>
            <h3 style={{ margin: 0, color: '#92400e' }}>🛡️ Administrator Global Controls</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#b45309' }}>
              Cycle Configuration Rule: Baseline year set to <strong>{baseSeasonYear}</strong>. Target window maps to: {year1} - {year3}.
            </p>
          </div>
          <button className="btn-primary" style={{ backgroundColor: '#d97706' }} onClick={handleActivateNewSeason}>
            Activate New LDIP Cycle ({baseSeasonYear})
          </button>
        </div>
      )}

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Local Development Investment Plan (LDIP) Ledger</h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            Office Segment: <strong>{user.department}</strong> | Sector Grouping: <span className={getBadgeClass(assignedSector.code)}>{assignedSector.name} ({assignedSector.code})</span>
          </p>
        </div>
        <button className="btn-primary" onClick={handleOpenCreateModal}>+ Add LDIP Entry</button>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <h3>Current Submissions for Cycle ({year1} - {year3})</h3>
        {ldipEntries.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2.5rem 0' }}>No investment records posted yet for this cycle window.</p>
        ) : (
          <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Program/Project Title & Description</th>
                <th>Classification Sector</th>
                <th>Target Implementation Timeline</th>
                <th>Required Budget Baseline</th>
                <th>AIP Budget Requirement</th>
                <th>Annual Budget</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ldipEntries.map(entry => {
                // filter arrays to find active items mapped beneath this parent program name context matching
                const matchingAip = aipEntries.filter(a => a && a.programTitle === entry.title);
                const matchingBudget = budgetEntries.filter(b => b && b.programTitle === entry.title);

                const aipRequirementTotal = matchingAip.reduce((sum, item) => sum + (item.total || 0), 0);
                const annualBudgetTotal = matchingBudget.reduce((sum, item) => sum + (item.total || 0), 0);

                // Build secondary dynamic structure groupings maps
                const projectMap = {};
                matchingAip.forEach(aipItem => {
                  const pName = aipItem.projectName;
                  if (!projectMap[pName]) {
                    projectMap[pName] = {
                      projectName: pName,
                      aipTotal: 0,
                      budgetTotal: 0,
                      activities: []
                    };
                  }
                  if (aipItem.activityName !== 'PENDING_CONFIG') {
                    projectMap[pName].aipTotal += aipItem.total || 0;
                  }
                  const associatedBudgets = matchingBudget.filter(b => b.projectName === pName && b.activityName === aipItem.activityName);
                  associatedBudgets.forEach(b => {
                    projectMap[pName].budgetTotal += b.total || 0;
                  });

                  const hasRealActivity = aipItem.activityName && !aipItem.activityName.includes('N/A') && aipItem.activityName !== 'PENDING_CONFIG';
                  if (hasRealActivity) {
                    const specificBudget = matchingBudget.find(b => b.projectName === pName && b.activityName === aipItem.activityName);
                    if (!projectMap[pName].activities.some(act => act.activityName === aipItem.activityName)) {
                      projectMap[pName].activities.push({
                        activityName: aipItem.activityName,
                        aipTotal: aipItem.total || 0,
                        budgetTotal: specificBudget ? specificBudget.total : 0
                      });
                    }
                  }
                });

                const projectsList = Object.values(projectMap);
                const isProgExpanded = expandedPrograms.includes(entry.title);
                const hasProjects = projectsList.length > 0;

                return (
                  <Fragment key={entry.id || entry.title || Math.random()}>
                    {/* LEVEL 1: MASTER PROGRAM ROW ELEMENT */}
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ maxWidth: '300px' }}>
                        <div 
                          style={{ fontWeight: '600', fontSize: '0.95rem', cursor: hasProjects ? 'pointer' : 'default', userSelect: 'none' }}
                          onClick={() => hasProjects && toggleProgramCollapse(entry.title)}
                        >
                          {hasProjects && (
                            <span style={{ marginRight: '6px', color: '#94a3b8', display: 'inline-block', width: '12px' }}>
                              {isProgExpanded ? '▼' : '▶'}
                            </span>
                          )}
                          🎯 {entry.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{entry.description}</div>
                      </td>
                      <td>
                        <span className={getBadgeClass(entry.sectorCode)}>{entry.sectorCode} - {entry.sectorName}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {entry.targets.map(t => (
                            <span key={t} style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '1rem' }}>
                        ₱{entry.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontWeight: '700', color: '#b45309', fontSize: '1rem' }}>
                        ₱{aipRequirementTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontWeight: '700', color: '#166534', fontSize: '1rem' }}>
                        ₱{annualBudgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', minWidth: '55px' }} 
                            onClick={() => handleOpenEditModal(entry)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-danger" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', minWidth: '65px' }} 
                            onClick={() => handleDeleteEntry(entry)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* LEVEL 2: COMPONENT PROJECT ROWS SECTION */}
                    {isProgExpanded && projectsList.map(proj => {
                      const projKey = `${entry.title}|||${proj.projectName}`;
                      const isProjExpanded = expandedProjects.includes(projKey);
                      const hasActivities = proj.activities.length > 0;

                      return (
                        <Fragment key={projKey}>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ paddingLeft: '24px' }}>
                              <div 
                                style={{ fontWeight: '600', fontSize: '0.88rem', color: '#334155', cursor: hasActivities ? 'pointer' : 'default', userSelect: 'none' }}
                                onClick={() => hasActivities && toggleProjectCollapse(entry.title, proj.projectName)}
                              >
                                {hasActivities && (
                                  <span style={{ marginRight: '6px', color: '#cbd5e1', display: 'inline-block', width: '10px' }}>
                                    {isProjExpanded ? '▼' : '▶'}
                                  </span>
                                )}
                                📁 Project: {proj.projectName}
                              </div>
                            </td>
                            <td style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>Component</td>
                            <td>—</td>
                            <td>—</td>
                            <td style={{ color: '#d97706', fontWeight: '600' }}>
                              ₱{proj.aipTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ color: '#10b981', fontWeight: '600' }}>
                              ₱{proj.budgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td>—</td>
                          </tr>

                          {/* LEVEL 3: DYNAMIC ACCORDION ACTIVITY TASKS ROWS */}
                          {isProjExpanded && proj.activities.map(act => (
                            <tr key={`${projKey}|||${act.activityName}`} style={{ backgroundColor: '#fffdfa', borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ paddingLeft: '48px', color: '#475569', fontSize: '0.82rem' }}>
                                🌿 Activity: {act.activityName}
                              </td>
                              <td style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.75rem' }}>Task Node</td>
                              <td>—</td>
                              <td>—</td>
                              <td style={{ color: '#f59e0b', fontSize: '0.8rem' }}>
                                ₱{act.aipTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td style={{ color: '#34d399', fontSize: '0.8rem' }}>
                                ₱{act.budgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td>—</td>
                            </tr>
                          ))}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            
            <div className="modal-header-section">
              <h2 style={{ margin: 0 }}>{isEditMode ? 'Modify Investment Entry' : 'New Local Investment Entry'}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                {isEditMode ? `Modifying database attributes for: ${programTitle}` : `Formulating infrastructure allocation for ${user.department}`}
              </p>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              
              <div className="form-field-group">
                <label>Program / Project Title</label>
                <div className="label-helper">Provide a concise, formal name of the development project or public procurement proposal.</div>
                <input 
                  type="text" 
                  value={programTitle} 
                  onChange={(e) => setProgramTitle(e.target.value)} 
                  placeholder="e.g., Procurement of High-Capacity Medical Response Assets" 
                  required 
                />
              </div>

              <div className="form-field-group">
                <label>Program Description Scope</label>
                <div className="label-helper">Outline specific targets, equipment counts, target implementation areas, or necessary operational background details.</div>
                <textarea 
                  value={programDescription} 
                  onChange={(e) => setProgramDescription(e.target.value)} 
                  placeholder="e.g., Acquisition of 3 fully equipped municipal ambulances to be distributed strategically among critical triage hubs..." 
                  required 
                />
              </div>

              <div className="form-field-group">
                <label>Target Implementation Timeline</label>
                <div className="label-helper">Select the projected fiscal funding slots. You can select multiple boxes depending on program roll-out.</div>
                
                <div className="year-selector-grid">
                  <label className={`year-selection-card ${targetY1 ? 'active-selected' : ''}`}>
                    <input type="checkbox" checked={targetY1} onChange={(e) => setTargetY1(e.target.checked)} />
                    <div className="card-year-title">{year1}</div>
                    <div className="card-year-sub">Year 1 Slot</div>
                  </label>

                  <label className={`year-selection-card ${targetY2 ? 'active-selected' : ''}`}>
                    <input type="checkbox" checked={targetY2} onChange={(e) => setTargetY2(e.target.checked)} />
                    <div className="card-year-title">{year2}</div>
                    <div className="card-year-sub">Year 2 Slot</div>
                  </label>

                  <label className={`year-selection-card ${targetY3 ? 'active-selected' : ''}`}>
                    <input type="checkbox" checked={targetY3} onChange={(e) => setTargetY3(e.target.checked)} />
                    <div className="card-year-title">{year3}</div>
                    <div className="card-year-sub">Year 3 Slot</div>
                  </label>
                </div>
              </div>

              <div className="form-field-group">
                <label>Required Funding Capital Allotment</label>
                <div className="label-helper">State the global financial baseline required to execute this entry project.</div>
                <div className="currency-wrapper">
                  <span className="currency-symbol">₱</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={requiredBudget} 
                    onChange={(e) => setRequiredBudget(e.target.value)} 
                    placeholder="0.00" 
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{isEditMode ? 'Save Modifications' : 'Submit To Ledger'}</button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}