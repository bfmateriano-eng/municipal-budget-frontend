import { useState, useEffect } from 'react';

export default function BudgetPage({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aipQueue, setAipQueue] = useState([]);
  const [budgetLedger, setBudgetLedger] = useState([]);
  const [allAipItems, setAllAipItems] = useState([]);

  // Selected Target Reference Tracking
  const [selectedAipRow, setSelectedAipRow] = useState(null);

  // Search & Tiered Filtering Control States
  const [searchQuery, setSearchQuery] = useState('');
  const [progFilter, setProgFilter] = useState('');
  const [projFilter, setProjFilter] = useState('');
  const [actFilter, setActFilter] = useState('');

  // Manual Encoding Form Tracking Fields
  const [performanceIndicator, setPerformanceIndicator] = useState('');
  const [targetBudgetYear, setTargetBudgetYear] = useState('');

  // Form Value Allotment Controllers
  const [annualPs, setAnnualPs] = useState('');
  const [annualMooe, setAnnualMooe] = useState('');
  const [annualCo, setAnnualCo] = useState('');

  // Procurement Prompt Modal Toggle & Content Payload Holder
  const [showProcurementPrompt, setShowProcurementPrompt] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);

  const loadBudgetMatrix = async () => {
    try {
      const dept = user?.department || '';
      
      const aipRes = await fetch(`http://localhost:5000/api/aip/${encodeURIComponent(dept)}`);
      const aipData = aipRes.ok ? await aipRes.json() : [];
      setAllAipItems(Array.isArray(aipData) ? aipData.filter(item => item !== null) : []);

      const budgetRes = await fetch(`http://localhost:5000/api/budget/${encodeURIComponent(dept)}`);
      const budgetData = budgetRes.ok ? await budgetRes.json() : [];
      setBudgetLedger(budgetData);

      const cleanAipItems = aipData.filter(item => 
        item && 
        item.activityName !== 'PENDING_CONFIG' &&
        !budgetData.some(b => b.aipRefCode === item.aipRefCode)
      );
      setAipQueue(cleanAipItems);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadBudgetMatrix(); }, [user?.department]);

  const handleOpenImportModal = () => {
    if (aipQueue.length === 0) {
      alert("No pending unbudgeted elements found in your office AIP stream.");
      return;
    }
    setSelectedAipRow(null);
    setSearchQuery('');
    setProgFilter(''); setProjFilter(''); setActFilter('');
    setPerformanceIndicator('');
    setTargetBudgetYear('');
    setAnnualPs(''); setAnnualMooe(''); setAnnualCo('');
    setIsModalOpen(true);
  };

  const uniquePrograms = [...new Set(aipQueue.map(item => item.programTitle))];
  const uniqueProjects = [...new Set(
    aipQueue
      .filter(item => !progFilter || item.programTitle === progFilter)
      .map(item => item.projectName)
  )];
  const uniqueActivities = [...new Set(
    aipQueue
      .filter(item => (!progFilter || item.programTitle === progFilter) && (!projFilter || item.projectName === projFilter))
      .map(item => item.activityName)
  )];

  const filteredAipResults = aipQueue.filter(item => {
    const matchesProg = !progFilter || item.programTitle === progFilter;
    const matchesProj = !projFilter || item.projectName === projFilter;
    const matchesAct = !actFilter || item.activityName === actFilter;
    const textTarget = `${item.projectName} ${item.activityName}`.toLowerCase();
    const matchesSearch = !searchQuery || textTarget.includes(searchQuery.toLowerCase());
    return matchesProg && matchesProj && matchesAct && matchesSearch;
  });

  const handleSelectItemSelect = (item) => {
    setSelectedAipRow(item);
    setPerformanceIndicator('');
    setTargetBudgetYear('');
    setAnnualPs(item.ps);
    setAnnualMooe(item.mooe);
    setAnnualCo(item.co);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!selectedAipRow) return alert("Please specify an active target AIP item reference.");

    const parsedPs = parseFloat(annualPs) || 0;
    const parsedMooe = parseFloat(annualMooe) || 0;
    const parsedCo = parseFloat(annualCo) || 0;

    if (parsedPs > selectedAipRow.ps) {
      alert(`Validation Failure: Annual Personal Services (PS) budget cannot exceed proposed AIP ceiling of ₱${selectedAipRow.ps.toLocaleString()}.`);
      return;
    }
    if (parsedMooe > selectedAipRow.mooe) {
      alert(`Validation Failure: Annual MOOE budget cannot exceed proposed AIP ceiling of ₱${selectedAipRow.mooe.toLocaleString()}.`);
      return;
    }
    if (parsedCo > selectedAipRow.co) {
      alert(`Validation Failure: Annual Capital Outlay (CO) budget cannot exceed proposed AIP ceiling of ₱${selectedAipRow.co.toLocaleString()}.`);
      return;
    }

    // Set holding state payload parameters
    setPendingPayload({
      aipRefCode: selectedAipRow.aipRefCode,
      office: user.department,
      programTitle: selectedAipRow.programTitle,
      projectName: selectedAipRow.projectName,
      activityName: selectedAipRow.activityName,
      implementingOffice: selectedAipRow.implementingOffice,
      performanceIndicator: performanceIndicator,
      targetBudgetYear: targetBudgetYear,
      ps: parsedPs,
      mooe: parsedMooe,
      co: parsedCo,
      total: parsedPs + parsedMooe + parsedCo
    });

    // FIXED: Removed the invalid setActiveTargetRow reference to prevent runtime thread crash execution
    setShowProcurementPrompt(true);
  };

  const handleFinalizeWithProcurement = async (choiceString) => {
    if (!pendingPayload) return;

    const finalSubmissionBody = {
      ...pendingPayload,
      includesProcurement: choiceString 
    };

    try {
      const response = await fetch('http://localhost:5000/api/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalSubmissionBody)
      });

      if (response.ok) {
        setShowProcurementPrompt(false);
        setIsModalOpen(false);
        setPendingPayload(null);
        loadBudgetMatrix(); 
        alert(`Success! Allocation approved and saved into the Form No. 4 ledger with Procurement: "${choiceString}".`);
      }
    } catch (err) { alert("Failed to commit allocation data."); }
  };

  return (
    <div className="main-content-stream" style={{ width: '100%' }}>
      
      {/* MANDATED FORM CONTROL WORKSPACE HEADER SECTION */}
      <div className="card" style={{ padding: '2rem', border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ textAlign: 'center', position: 'relative', borderBottom: '2px solid #0f172a', paddingBottom: '1.25rem', marginBottom: '1rem' }}>
          <span style={{ position: 'absolute', right: 0, top: 0, fontFamily: 'monospace', fontWeight: '700', fontSize: '0.85rem', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px' }}>
            Local Budget Form No. 4
          </span>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em' }}>
            PROGRAMMED APPROPRIATION AND OBLIGATION BY OBJECT OF EXPENDITURE
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Municipality of Pililla, Rizal
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontWeight: '600', fontSize: '0.95rem', color: '#334155' }}>
            <div>Office / Department: <span style={{ textDecoration: 'underline', color: '#1e3a8a', marginLeft: '4px' }}>{user?.department}</span></div>
            <div>Fund: <span style={{ textDecoration: 'underline', marginLeft: '4px' }}>General Fund</span></div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button className="btn-primary" onClick={handleOpenImportModal}>+ Add PPA from AIP</button>
        </div>
      </div>

      {/* CORE FORM 4 LEDGER DATA TABLE DISPLAY WITH MANDATED REPORTING COLUMNS */}
      <div className="card" style={{ overflowX: 'auto', padding: '1.5rem', border: '1px solid #cbd5e1' }}>
        {budgetLedger.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem 0', fontStyle: 'italic' }}>No programmed appropriations recorded for this section track.</p>
        ) : (
          <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '2px solid #0f172a' }}>
                <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '10px', verticalAlign: 'middle', textAlign: 'center', fontWeight: '700', width: '140px' }}>
                  AIP Reference Code
                </th>
                <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '10px', verticalAlign: 'middle', textAlign: 'left', fontWeight: '700', minWidth: '180px' }}>
                  Program / Project / Activity (PPA) Description
                </th>
                
                <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '10px', verticalAlign: 'middle', textAlign: 'left', fontWeight: '700', minWidth: '130px', backgroundColor: '#fdf2f8' }}>
                  Major Final Output (MFO)
                </th>
                <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '10px', verticalAlign: 'middle', textAlign: 'left', fontWeight: '700', minWidth: '140px', backgroundColor: '#fdf2f8' }}>
                  Performance Indicator / Output
                </th>
                <th rowSpan="2" style={{ border: '1px solid #cbd5e1', padding: '10px', verticalAlign: 'middle', textAlign: 'left', fontWeight: '700', minWidth: '130px', backgroundColor: '#fdf2f8' }}>
                  Target for the Budget Year
                </th>

                <th colSpan="4" style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'center', fontWeight: '700', color: '#1e3a8a', backgroundColor: '#e0f2fe' }}>
                  Budget Year Allotment (Proposed)
                </th>
              </tr>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: '600', width: '110px' }}>Personal Services (PS)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: '600', width: '110px' }}>Maintenance (MOOE)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: '600', width: '110px' }}>Capital Outlay (CO)</th>
                <th style={{ border: '1px solid #cbd5e1', padding: '8px', textAlign: 'right', fontWeight: '700', color: '#15803d', width: '120px', backgroundColor: '#f0fdf4' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {budgetLedger.map((row, i) => {
                const matchingAip = allAipItems.find(a => a.aipRefCode === row.aipRefCode);
                const hasSubActivity = row.activityName && !row.activityName.includes('N/A (Standalone Project)');

                return (
                  <tr key={i} style={{ borderBottom: '1px solid #cbd5e1' }}>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', fontFamily: 'monospace', fontWeight: '700', fontSize: '0.8rem', color: '#0369a1', textAlign: 'center' }}>
                      {row.aipRefCode}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', lineHeight: '1.4' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>
                        Prog: {row.programTitle}
                      </span>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                        Proj: {row.projectName}
                      </div>
                      {hasSubActivity && (
                        <div style={{ fontSize: '0.8rem', color: '#475569', paddingLeft: '6px', borderLeft: '2px solid #3b82f6', marginTop: '2px' }}>
                          Act: {row.activityName}
                        </div>
                      )}
                    </td>

                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155', fontWeight: '500', backgroundColor: '#fffdfa' }}>
                      {matchingAip?.expectedOutput || '—'}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#334155', fontStyle: 'italic', backgroundColor: '#fffdfa' }}>
                      {row.performanceIndicator || '—'}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', color: '#0f172a', fontWeight: '600', backgroundColor: '#fffdfa' }}>
                      {row.targetBudgetYear || '—'}
                    </td>

                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: '600', fontFamily: 'monospace' }}>
                      ₱{row.ps.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: '600', fontFamily: 'monospace' }}>
                      ₱{row.mooe.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: '600', fontFamily: 'monospace' }}>
                      ₱{row.co.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '1px solid #cbd5e1', padding: '10px', textAlign: 'right', fontWeight: '700', color: '#166534', fontFamily: 'monospace', fontSize: '0.9rem', backgroundColor: '#f0fdf4' }}>
                      ₱{row.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* SEARCH AND ASSIGNMENT MODAL OVERLAY PORTAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', right: '1.5rem', top: '1.25rem', background: '#f1f5f9', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', zIndex: '50', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
            >
              &times;
            </button>

            <div className="modal-header-section" style={{ paddingBottom: '0.75rem', marginBottom: '0.75rem', paddingRight: '40px' }}>
              <h2 style={{ margin: 0 }}>Import PPA Asset From AIP Log Tracking</h2>
              <p className="label-helper" style={{ margin: '4px 0 0 0' }}>Search and select an authorized PPA. Allotments are strictly capped by original AIP targets.</p>
            </div>
            
            <div style={{ overflowY: 'auto', paddingRight: '4px' }}>
              <form onSubmit={handleFormSubmit}>
                
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    🔍 Advanced PPA Locator Panel
                  </span>
                  
                  <div className="form-field-group" style={{ marginBottom: '0.75rem' }}>
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Type keywords to search Project Name or Activity Title text dynamically..."
                      style={{ padding: '0.6rem 1rem', width: '100%', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div className="form-field-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>1. Filter by Program</label>
                      <select value={progFilter} onChange={(e) => { setProgFilter(e.target.value); setProjFilter(''); setActFilter(''); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                        <option value="">— All Programs —</option>
                        {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div className="form-field-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>2. Filter by Project</label>
                      <select value={projFilter} onChange={(e) => { setProjFilter(e.target.value); setActFilter(''); }} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                        <option value="">— All Projects —</option>
                        {uniqueProjects.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div className="form-field-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: '600' }}>3. Filter by Activity</label>
                      <select value={actFilter} onChange={(e) => setActFilter(e.target.value)} style={{ padding: '0.4rem', fontSize: '0.8rem' }}>
                        <option value="">— All Activities —</option>
                        {uniqueActivities.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                    Matching Unbudgeted AIP Targets ({filteredAipResults.length})
                  </label>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#ffffff' }}>
                    {filteredAipResults.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', margin: '2rem 0' }}>No unbudgeted items match your locator parameters.</p>
                    ) : (
                      filteredAipResults.map(item => {
                        const isSelected = selectedAipRow?.aipRefCode === item.aipRefCode;
                        return (
                          <div 
                            key={item.aipRefCode}
                            onClick={() => handleSelectItemSelect(item)}
                            style={{
                              padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                              backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                              borderLeft: isSelected ? '4px solid #3b82f6' : '4px solid transparent',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.8rem', color: '#0284c7' }}>{item.aipRefCode}</span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>AIP Total: ₱{item.total.toLocaleString()}</span>
                            </div>
                            <div style={{ fontWeight: '600', fontSize: '0.85rem', color: '#1e293b', marginTop: '2px' }}>{item.projectName}</div>
                            {item.activityName && !item.activityName.includes('N/A') && (
                              <div style={{ fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>🌿 Node: {item.activityName}</div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {selectedAipRow ? (
                  <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#166534', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
                        Locked Target Caps Checklist: ({selectedAipRow.aipRefCode})
                      </span>
                      <div style={{ display: 'flex', gap: '1.25rem', marginTop: '4px', fontSize: '0.85rem', color: '#14532d', fontWeight: '600' }}>
                        <div>PS Max: ₱{selectedAipRow.ps.toLocaleString()}</div>
                        <div>MOOE Max: ₱{selectedAipRow.mooe.toLocaleString()}</div>
                        <div>CO Max: ₱{selectedAipRow.co.toLocaleString()}</div>
                      </div>
                    </div>

                    <label style={{ color: '#d97706', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', display: 'block', fontWeight: '600', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      MANUAL REPORTING MEASURES CONFIGURATION
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div className="form-field-group">
                        <label>Performance Indicator / Output Measure</label>
                        <input type="text" value={performanceIndicator} onChange={(e) => setPerformanceIndicator(e.target.value)} placeholder="e.g., Number of emergency facilities upgraded" required />
                      </div>
                      <div className="form-field-group">
                        <label>Target for the Budget Year</label>
                        <input type="text" value={targetBudgetYear} onChange={(e) => setTargetBudgetYear(e.target.value)} placeholder="e.g., 100% compliance within 12 months" required />
                      </div>
                    </div>

                    <label style={{ color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', display: 'block', fontWeight: '600', fontSize: '0.85rem' }}>
                      DEFINITIVE ANNUAL BUDGET ALLOCATIONS (PESOS)
                    </label>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <div className="form-field-group">
                        <label>Annual PS Allotment</label>
                        <input type="number" step="0.01" value={annualPs} onWheel={(e) => e.target.blur()} onChange={(e) => setAnnualPs(e.target.value)} required />
                      </div>
                      <div className="form-field-group">
                        <label>Annual MOOE Allotment</label>
                        <input type="number" step="0.01" value={annualMooe} onWheel={(e) => e.target.blur()} onChange={(e) => setAnnualMooe(e.target.value)} required />
                      </div>
                      <div className="form-field-group">
                        <label>Annual CO Allotment</label>
                        <input type="number" step="0.01" value={annualCo} onWheel={(e) => e.target.blur()} onChange={(e) => setAnnualCo(e.target.value)} required />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                      <button type="submit" className="btn-primary">Approve & Log Allotment</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1.5rem', border: '1px dashed #cbd5e1', borderRadius: '6px', background: '#fafafa', color: '#64748b', fontSize: '0.9rem' }}>
                    💡 Please filter and click on a target AIP item row above to launch allocation input fields.
                  </div>
                )}

              </form>
            </div>
          </div>
        </div>
      )}

      {/* DUAL INTERACTIVE SECONDARY POP-UP QUESTION OVERLAY DIALOG CARD */}
      {showProcurementPrompt && (
        <div className="modal-overlay" style={{ zIndex: '9999' }}>
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'center', padding: '2rem' }}>
            <div style={{ background: '#fef3c7', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto', color: '#d97706', fontSize: '1.5rem', fontWeight: '700' }}>
              ❓
            </div>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.2rem' }}>Procurement Requirement Verification</h3>
            <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Does this programmed appropriation include an explicit **procurement requirement item** action task layout? (PPMP Mapping link).
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ backgroundColor: '#10b981', minWidth: '100px', border: 'none' }}
                onClick={() => handleFinalizeWithProcurement('Yes')}
              >
                Yes
              </button>
              <button 
                type="button" 
                className="btn-danger" 
                style={{ minWidth: '100px', border: 'none' }}
                onClick={() => handleFinalizeWithProcurement('No')}
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}