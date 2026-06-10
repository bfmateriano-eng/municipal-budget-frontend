import { useState, useEffect } from 'react';

export default function BudgetPage({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aipQueue, setAipQueue] = useState([]);
  const [budgetLedger, setBudgetLedger] = useState([]);
  const [allAipItems, setAllAipItems] = useState([]);

  // Selected Target Reference Tracking
  const [selectedAipRow, setSelectedAipRow] = useState(null);

  // SEARCH & PROGRESSIVE 4-STAGE WIZARD FLOW CONTROL STATES
  const [wizardStep, setWizardStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [progFilter, setProgFilter] = useState('');
  const [projFilter, setProjFilter] = useState('');

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
    setProgFilter(''); setProjFilter('');
    setPerformanceIndicator('');
    setTargetBudgetYear('');
    setAnnualPs(''); setAnnualMooe(''); setAnnualCo('');
    setWizardStep(1); // Reset wizard flow back to step 1
    setIsModalOpen(true);
  };

  // EXTRACT SYSTEM MATRIX PATHS DIRECTLY FROM DATABASE STATE LOGS
  const uniquePrograms = [...new Set(aipQueue.map(item => item.programTitle).filter(Boolean))];
  
  const uniqueProjects = [...new Set(
    aipQueue
      .filter(item => item && item.programTitle && progFilter && item.programTitle.trim().toLowerCase() === progFilter.trim().toLowerCase())
      .map(item => item.projectName)
      .filter(Boolean)
  )];

  // NARROW DOWN DYNAMIC ACTIVITY ROWS MATCHING STEPS 1 AND 2 CHOICES
  const filteredAipActivities = aipQueue.filter(item => {
    const matchesProg = item && item.programTitle && progFilter && item.programTitle.trim().toLowerCase() === progFilter.trim().toLowerCase();
    const matchesProj = item && item.projectName && projFilter && item.projectName.trim().toLowerCase() === projFilter.trim().toLowerCase();
    const textTarget = `${item.activityName} ${item.aipRefCode}`.toLowerCase();
    const matchesSearch = !searchQuery || textTarget.includes(searchQuery.toLowerCase());
    return matchesProg && matchesProj && matchesSearch;
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
          <div className="modal-content" style={{ width: '680px', maxWidth: '95vw', maxHeight: '95vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', right: '1.5rem', top: '1.25rem', background: '#f1f5f9', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', zIndex: '50' }}
            >
              &times;
            </button>

            <div className="modal-header-section" style={{ paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>Programmed Allocation Allocation Wizard</h2>
              <p className="label-helper" style={{ margin: '4px 0 0 0' }}>Guided sequential checkout flow mapping unallocated AIP records to LBF No. 4.</p>
            </div>

            {/* PROGRESS CHECKOUT TRACKING BAR GRID HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0.75rem 0', background: '#f8fafc', padding: '0.6rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep === 1 ? '#0284c7' : '#94a3b8' }}>🎯 Step 1: Program</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep === 2 ? '#0284c7' : '#94a3b8' }}>📁 Step 2: Project</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep === 3 ? '#0284c7' : '#94a3b8' }}>🌿 Step 3: Activity</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: wizardStep === 4 ? '#0284c7' : '#94a3b8' }}>₱ Step 4: Allotments</span>
            </div>
            
            <div style={{ overflowY: 'auto', paddingRight: '4px', flex: 1 }}>
              <form onSubmit={handleFormSubmit}>
                
                {/* =======================================================
                    STAGE WIZARD 1: MASTER PROGRAM SHOPPING TILE GRID
                    ======================================================= */}
                {wizardStep === 1 && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <label style={{ fontWeight: '700', display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#334155' }}>Select Parent Program Template Basket:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {uniquePrograms.map(prog => (
                        <div
                          key={prog}
                          style={{ border: progFilter === prog ? '2px solid #0284c7' : '1px solid #cbd5e1', backgroundColor: progFilter === prog ? '#f0f9ff' : '#ffffff', padding: '1rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.1s ease' }}
                          onClick={() => setProgFilter(prog)}
                        >
                          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' }}>🎯 {prog}</div>
                          {progFilter === prog && <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', display: 'block', marginTop: '4px' }}>✓ Selected Active</span>}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <button 
                        type="button" 
                        className="btn-primary" 
                        disabled={!progFilter}
                        onClick={() => setWizardStep(2)}
                      >
                        Proceed to Component Projects ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* =======================================================
                    STAGE WIZARD 2: SUB-PROJECT SHOPPING TILE GRID 
                    ======================================================= */}
                {wizardStep === 2 && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <label style={{ fontWeight: '700', display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#334155' }}>Select Component Project Target:</label>
                    <div className="label-helper" style={{ marginBottom: '12px' }}>Parent Filter Anchor: <strong>{progFilter}</strong></div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      {uniqueProjects.map(proj => (
                        <div
                          key={proj}
                          style={{ border: projFilter === proj ? '2px solid #0284c7' : '1px solid #cbd5e1', backgroundColor: projFilter === proj ? '#f0f9ff' : '#ffffff', padding: '1rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.1s ease' }}
                          onClick={() => setProjFilter(proj)}
                        >
                          <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' }}>📁 Project: {proj}</div>
                          {projFilter === proj && <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: '700', display: 'block', marginTop: '4px' }}>✓ Selected Active</span>}
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => setWizardStep(1)}>⬅ Back to Step 1</button>
                      <button 
                        type="button" 
                        className="btn-primary" 
                        disabled={!projFilter}
                        onClick={() => setWizardStep(3)}
                      >
                        Proceed to Activity Nodes ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* =======================================================
                    STAGE WIZARD 3: CORE ACTIVITY SHOPPING TILE GRID (NEW SPECIFICATION)
                    ======================================================= */}
                {wizardStep === 3 && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    <label style={{ fontWeight: '700', display: 'block', marginBottom: '4px', fontSize: '0.9rem', color: '#334155' }}>Select Granular Activity Node Card:</label>
                    <div className="label-helper" style={{ marginBottom: '12px' }}>Project Context: <strong style={{ color: '#0284c7' }}>{projFilter}</strong></div>

                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                      placeholder="Type phrase keywords to filter activity tiles below instantly..." 
                      style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', marginBottom: '12px', width: '100%', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {filteredAipActivities.map(item => {
                        const isSelected = selectedAipRow?.aipRefCode === item.aipRefCode;
                        return (
                          <div
                            key={item.aipRefCode}
                            style={{ border: isSelected ? '2px solid #10b981' : '1px solid #cbd5e1', backgroundColor: isSelected ? '#f0fdf4' : '#ffffff', padding: '0.85rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.1s ease' }}
                            onClick={() => handleSelectItemSelect(item)}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '700', marginBottom: '4px' }}>
                              <span style={{ color: '#0284c7', fontFamily: 'monospace' }}>{item.aipRefCode}</span>
                              <span style={{ color: '#64748b' }}>AIP: ₱{item.total.toLocaleString()}</span>
                            </div>
                            <div style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e293b', lineHeight: '1.3' }}>
                              🌿 {item.activityName || 'Standalone Project Allotment Component'}
                            </div>
                            {isSelected && <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: '700', display: 'block', marginTop: '6px' }}>✓ Active Selected</span>}
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => setWizardStep(2)}>⬅ Back to Step 2</button>
                      <button 
                        type="button" 
                        className="btn-primary" 
                        disabled={!selectedAipRow}
                        onClick={() => setWizardStep(4)}
                      >
                        Proceed to Allotment Forms ➔
                      </button>
                    </div>
                  </div>
                )}

                {/* =======================================================
                    STAGE WIZARD 4: ALLOTMENT DETAILS, CEILINGS & FINANCIAL MATRICES
                    ======================================================= */}
                {wizardStep === 4 && selectedAipRow && (
                  <div style={{ animation: 'fadeIn 0.2s ease' }}>
                    
                    <div style={{ background: '#f8fafc', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
                      <div>Selected Reference: <strong style={{ fontFamily: 'monospace', color: '#0284c7' }}>{selectedAipRow.aipRefCode}</strong></div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Selected Activity: <strong>{selectedAipRow.activityName}</strong></div>
                    </div>

                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.6rem 1rem', borderRadius: '6px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#166534', fontWeight: '700' }}>
                      <span>PS Ceiling: ₱{selectedAipRow.ps.toLocaleString()}</span>
                      <span>MOOE Ceiling: ₱{selectedAipRow.mooe.toLocaleString()}</span>
                      <span>CO Ceiling: ₱{selectedAipRow.co.toLocaleString()}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Performance Indicator / Output</label>
                        <input type="text" value={performanceIndicator} onChange={(e) => setPerformanceIndicator(e.target.value)} placeholder="Outputs metrics indicator" required />
                      </div>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Target for the Budget Year</label>
                        <input type="text" value={targetBudgetYear} onChange={(e) => setTargetBudgetYear(e.target.value)} placeholder="Target compliance rate" required />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Proposed PS Value</label>
                        <input type="number" step="0.01" value={annualPs} onWheel={(e) => e.target.blur()} onChange={(e) => setAnnualPs(e.target.value)} required />
                      </div>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Proposed MOOE Value</label>
                        <input type="number" step="0.01" value={annualMooe} onWheel={(e) => e.target.blur()} onChange={(e) => setAnnualMooe(e.target.value)} required />
                      </div>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.75rem' }}>Proposed CO Value</label>
                        <input type="number" step="0.01" value={annualCo} onWheel={(e) => e.target.blur()} onChange={(e) => setAnnualCo(e.target.value)} required />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                      <button type="button" className="btn-secondary" onClick={() => setWizardStep(3)}>⬅ Back to Step 3</button>
                      <button type="submit" className="btn-primary">Verify & Log Allotment</button>
                    </div>
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