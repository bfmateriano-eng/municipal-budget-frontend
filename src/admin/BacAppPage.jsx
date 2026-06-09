import { useState, useEffect } from 'react';

const RA_12009_MODES = [
  "Competitive Bidding", "Limited Source Bidding", "Competitive Dialogue",
  "Unsolicited Offer with Bid Matching", "Direct Contracting", "Direct Acquisition",
  "Direct Sales / Direct Retail Purchase", "Repeat Order", "Small Value Procurement",
  "Direct Procurement for Science, Technology, and Innovation",
  "Negotiated Procurement (Two Failed Biddings)", "Negotiated Procurement (Emergency Cases)",
  "Negotiated Procurement (Take-over of Contracts)", "Negotiated Procurement (Adjacent or Contiguous)",
  "Negotiated Procurement (Agency-to-Agency)", "Negotiated Procurement (Scientific, Scholarly, or Artistic Work)",
  "Negotiated Procurement (Highly Technical Consultants)", "Negotiated Procurement (Defense Cooperation & Inventory-Based Items)",
  "Negotiated Procurement (Direct Retail Purchase)", "Negotiated Procurement (UN Agencies & International Organizations)",
  "Negotiated Procurement (Lease of Real Property and Venue)", "Negotiated Procurement (Community Participation)"
];

const CRITERIA_CHOICES = [
  "Lowest Responsive Quotation/Bid",
  "MARB",
  "MEARB"
];

const STRATEGY_CHOICES = [
  "Cost reduction", "Green purchasing", "Risk management",
  "Global sourcing", "Total quality management", "Supplier management and optimization"
];

export default function BacAppPage() {
  const [ppmpQueue, setPpmpQueue] = useState([]);
  const [appLedger, setAppLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  // State tracking trigger for the standalone Queue Popup Modal
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);

  // Configuration Target Tracking Node
  const [selectedPpmp, setSelectedPpmp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // APP Specific Field States
  const [modeOfProcurement, setModeOfProcurement] = useState('Competitive Bidding');
  const [earlyProcurementActivity, setEarlyProcurementActivity] = useState('No');
  const [criteriaForBidEvaluation, setCriteriaForBidEvaluation] = useState(CRITERIA_CHOICES[0]);
  const [procurementStrategyTools, setProcurementStrategyTools] = useState([]); 
  const [remarks, setRemarks] = useState('');
  const [changeableBudget, setChangeableBudget] = useState('');

  const loadAppConsolidationMatrix = async () => {
    setLoading(true);
    try {
      const appRes = await fetch('https://municipal-budget-backend.onrender.com/api/app');
      const appData = appRes.ok ? await appRes.json() : [];
      setAppLedger(appData);

      const ppmpRes = await fetch('https://municipal-budget-backend.onrender.com/api/ppmp/ALL');
      const ppmpData = ppmpRes.ok ? await ppmpRes.json() : [];

      const pendingConsolidation = ppmpData.filter(p => 
        p && p.startProcurementMonth !== '—' && !appData.some(a => a.aipRefCode === p.aipRefCode)
      );
      setPpmpQueue(pendingConsolidation);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { loadAppConsolidationMatrix(); }, []);

  const handleSelectFromQueue = (row) => {
    setIsQueueModalOpen(false);
    setSelectedPpmp(row);
    setChangeableBudget(row.estimatedBudget);
    setModeOfProcurement('Competitive Bidding');
    setEarlyProcurementActivity('No');
    setCriteriaForBidEvaluation(CRITERIA_CHOICES[0]);
    setProcurementStrategyTools([]); 
    setRemarks('');
    setIsModalOpen(true);
  };

  const handleCheckboxToggle = (strategyName) => {
    if (procurementStrategyTools.includes(strategyName)) {
      setProcurementStrategyTools(procurementStrategyTools.filter(item => item !== strategyName));
    } else {
      setProcurementStrategyTools([...procurementStrategyTools, strategyName]);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPpmp) return;

    if (procurementStrategyTools.length === 0) {
      alert("Validation Constraint: Please check at least one Procurement Strategy option path.");
      return;
    }

    const payload = {
      aipRefCode: selectedPpmp.aipRefCode,
      projectTitle: selectedPpmp.generalDescription,
      endUserUnit: selectedPpmp.office,
      modeOfProcurement,
      earlyProcurementActivity,
      criteriaForBidEvaluation,
      startProcurementMonth: selectedPpmp.startProcurementMonth,
      endProcurementMonth: selectedPpmp.endProcurementMonth,
      sourceOfFunds: selectedPpmp.sourceOfFunds,
      approvedBudget: parseFloat(changeableBudget) || 0,
      procurementStrategyTools: procurementStrategyTools.join(', '), 
      remarks
    };

    try {
      const res = await fetch('https://municipal-budget-backend.onrender.com/api/app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        loadAppConsolidationMatrix();
        alert("Success! PPMP project aggregated into the Annual Procurement Plan (APP) ledger lines.");
      }
    } catch (err) { alert("Failed to commit APP log row."); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* FULL-SCREEN CONTROL HEADER BAR WITH POPUP ACTION TOGGLE */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🏛️ Annual Procurement Plan (APP) Consolidation Desk</h2>
          <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>Bids and Awards Committee (BAC) workspace for legalizing municipal procurement plans under RA 12009 framework guidelines.</p>
        </div>
        <button 
          type="button" 
          className="btn-primary" 
          onClick={() => setIsQueueModalOpen(true)}
          style={{ backgroundColor: '#2563eb', fontWeight: '700', padding: '0.5rem 1.25rem', fontSize: '0.82rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          📥 Import PPMP 
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>{ppmpQueue.length}</span>
        </button>
      </div>

      {/* COMPACT FULL-WIDTH GRID WITH FIXED LAYOUT (NO HORIZONTAL SCROLLBAR) */}
      <div className="card" style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', margin: 0 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#334155', fontWeight: '700' }}>📋 Published Annual Procurement Plan (APP) Master Registry</h3>
        
        <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
          <table className="budget-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', position: 'sticky', top: 0, zIndex: 10 }}>
                {/* Fixed percentage mappings ensuring total matrix equals exactly 100% */}
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '6%' }}>AIP Code</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', width: '10%' }}>End-User Unit</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', width: '15%' }}>Project Title Description</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', width: '11%' }}>Procurement Mode</th>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '4%' }}>EPA</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', width: '9%' }}>Bid Evaluation</th>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '5%' }}>Start</th>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '5%' }}>End</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', width: '7%' }}>Fund Source</th>
                <th style={{ padding: '8px 4px', textAlign: 'right', width: '10%' }}>Approved Budget</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', width: '11%' }}>Strategies / Tools</th>
                <th style={{ padding: '8px 4px', textAlign: 'left', width: '7%' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="12" style={{ textAlign: 'center', padding: '3rem 0', color: '#64748b', fontStyle: 'italic' }}>Synchronizing master procurement registries...</td></tr>
              ) : appLedger.length === 0 ? (
                <tr><td colSpan="12" style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8', fontStyle: 'italic' }}>No master procurement plan records published to the central registry. Click "Import PPMP" to begin.</td></tr>
              ) : (
                appLedger.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                    
                    <td style={{ padding: '8px 4px', fontFamily: 'monospace', fontWeight: '700', color: '#0369a1', textAlign: 'center', wordBreak: 'break-all' }}>{row.aipRefCode}</td>
                    
                    <td style={{ padding: '8px 4px', fontWeight: '600', color: '#475569', whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden' }}>{row.endUserUnit?.replace("Office of the ", "")}</td>
                    
                    <td style={{ padding: '8px 4px', fontWeight: '700', color: '#1e293b', whiteSpace: 'normal', wordBreak: 'break-word' }}>{row.projectTitle}</td>
                    
                    <td style={{ padding: '8px 4px', fontWeight: '600', color: '#1e40af', whiteSpace: 'normal', wordBreak: 'break-word' }}>{row.modeOfProcurement}</td>
                    
                    <td style={{ padding: '8px 4px', textAlign: 'center', fontWeight: '800', color: row.earlyProcurementActivity === 'Yes' ? '#b45309' : '#64748b' }}>{row.earlyProcurementActivity}</td>
                    
                    <td style={{ padding: '8px 4px', color: '#15803d', fontWeight: '700', whiteSpace: 'normal', wordBreak: 'break-word' }}>🔬 {row.criteriaForBidEvaluation}</td>
                    
                    <td style={{ padding: '8px 4px', textAlign: 'center', color: '#334155' }}>{row.startProcurementMonth?.substring(0, 3)}</td>
                    
                    <td style={{ padding: '8px 4px', textAlign: 'center', color: '#334155' }}>{row.endProcurementMonth?.substring(0, 3)}</td>
                    
                    <td style={{ padding: '8px 4px', color: '#475569', fontWeight: '500', whiteSpace: 'normal', wordBreak: 'break-word' }}>{row.sourceOfFunds}</td>
                    
                    <td style={{ padding: '8px 4px', textAlign: 'right', fontWeight: '800', fontFamily: 'monospace', color: '#166534' }}>₱{row.approvedBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    
                    <td style={{ padding: '8px 4px', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {row.procurementStrategyTools?.split(', ').map(st => (
                          <span key={st} style={{ background: '#f3e8ff', color: '#6b21a8', padding: '1px 4px', borderRadius: '3px', fontSize: '0.68rem', fontWeight: '600', display: 'inline-block', width: 'fit-content' }}>⚡ {st}</span>
                        ))}
                      </div>
                    </td>
                    
                    <td style={{ padding: '8px 4px', color: row.remarks ? '#334155' : '#cbd5e1', fontStyle: row.remarks ? 'normal' : 'italic', whiteSpace: 'normal', wordBreak: 'break-word' }}>{row.remarks || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL 1: INTERACTIVE UNCONSOLIDATED PPMP IMPORT QUEUE */}
      {isQueueModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>📥 Pending Departmental PPMP Submissions Queue</h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>Select an incoming procurement project allocation component to map parameters.</p>
              </div>
              <button type="button" onClick={() => setIsQueueModalOpen(false)} style={{ background: '#f1f5f9', border: 'none', fontSize: '1.2rem', cursor: 'pointer', fontWeight: '700', borderRadius: '50%', width: '32px', height: '32px' }}>&times;</button>
            </div>

            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1rem 0' }}>
              {ppmpQueue.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem 0', fontStyle: 'italic', fontSize: '0.88rem' }}>No pending departmental PPMP records currently awaiting processing.</p>
              ) : (
                ppmpQueue.map(row => (
                  <div key={row.aipRefCode} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#0369a1', fontSize: '0.75rem', background: '#e0f2fe', padding: '1px 6px', borderRadius: '4px' }}>{row.aipRefCode}</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: '600', color: '#475569', background: '#e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>{row.office}</span>
                      </div>
                      <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '0.88rem', lineHeight: '1.4' }}>{row.generalDescription}</div>
                      <span style={{ display: 'inline-block', fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Timeline window: <strong>{row.startProcurementMonth} to {row.endProcurementMonth}</strong></span>
                    </div>
                    
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontWeight: '800', color: '#166534', fontSize: '0.95rem', marginBottom: '6px', fontFamily: 'monospace' }}>₱{row.estimatedBudget.toLocaleString()}</div>
                      <button type="button" className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700', borderRadius: '6px' }} onClick={() => handleSelectFromQueue(row)}>Compile Plan</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL 2: CONSOLIDATION PARAMETERS FINAL SETUP FORM */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header-section">
              <h2 style={{ margin: 0 }}>Configure Project into APP Ledger</h2>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>Target: {selectedPpmp?.generalDescription}</p>
            </div>
            <form onSubmit={handleFormSubmit}>
              
              <div className="form-field-group">
                <label>Legal Mode of Procurement (NGPA RA 12009)</label>
                <select value={modeOfProcurement} onChange={(e) => setModeOfProcurement(e.target.value)}>
                  {RA_12009_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.75rem' }}>
                <div className="form-field-group">
                  <label>Is Early Procurement (EPA)?</label>
                  <select value={earlyProcurementActivity} onChange={(e) => setEarlyProcurementActivity(e.target.value)}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="form-field-group">
                  <label>Approved Budget for Contract (ABC) - Changeable</label>
                  <input type="number" step="0.01" value={changeableBudget} onWheel={(e) => e.target.blur()} onChange={(e) => setChangeableBudget(e.target.value)} required />
                </div>
              </div>

              <div className="form-field-group">
                <label>Criteria for Bid Evaluation (Sustainability & Preference Parameters)</label>
                <select value={criteriaForBidEvaluation} onChange={(e) => setCriteriaForBidEvaluation(e.target.value)}>
                  {CRITERIA_CHOICES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-field-group">
                <label style={{ marginBottom: '4px', display: 'block' }}>Procurement Strategy Alignment or Tools Used (Check all that apply)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: '#f8fafc', padding: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {STRATEGY_CHOICES.map(strategy => (
                    <label key={strategy} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', fontWeight: '500', color: '#334155', cursor: 'pointer', userSelect: 'none' }}>
                      <input 
                        type="checkbox" 
                        checked={procurementStrategyTools.includes(strategy)} 
                        onChange={() => handleCheckboxToggle(strategy)}
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      />
                      {strategy}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-field-group">
                <label>BAC Consolidation Remarks</label>
                <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Add any operational descriptions or board resolutions links..." />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Approve & Publish to APP Ledger</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}