import { useState, useEffect } from 'react';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MEASUREMENTS = ["Piece", "Lot", "Kilo", "Box", "Pack", "Ream", "Set", "Roll", "Liter", "Gallon", "Meter"];
const PROJECT_TYPES = ["Goods", "Infrastructure", "Consulting Services"];

export default function PpmpPage({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ppmpLedger, setPpmpLedger] = useState([]);
  const [fullBudgetList, setFullBudgetList] = useState([]);
  const [allAipItems, setAllAipItems] = useState([]);

  // Selected Row Target Configuration Node Tracker
  const [activeEditingRow, setActiveEditingRow] = useState(null);

  // Form Field Configuration hooks
  const [typeOfProject, setTypeOfProject] = useState('Goods');
  const [preProcurementConference, setPreProcurementConference] = useState('No');
  const [startProcurementMonth, setStartProcurementMonth] = useState('January');
  const [endProcurementMonth, setEndProcurementMonth] = useState('December');
  const [expectedDeliveryMonth, setExpectedDeliveryMonth] = useState('December');
  const [estimatedBudget, setEstimatedBudget] = useState('');

  // Itemized Breakdown Nested List Array
  const [itemsList, setItemsList] = useState([]);

  const loadProcurementStreamMatrix = async () => {
    try {
      const dept = user?.department || '';

      const aipRes = await fetch(`https://municipal-budget-backend.onrender.com/api/aip/${encodeURIComponent(dept)}`);
      const aipData = aipRes.ok ? await aipRes.json() : [];
      setAllAipItems(Array.isArray(aipData) ? aipData.filter(x => x !== null) : []);

      const budgetRes = await fetch(`https://municipal-budget-backend.onrender.com/api/budget/${encodeURIComponent(dept)}`);
      const budgetData = budgetRes.ok ? await budgetRes.json() : [];
      setFullBudgetList(budgetData);

      const ppmpRes = await fetch(`https://municipal-budget-backend.onrender.com/api/ppmp/${encodeURIComponent(dept)}`);
      const ppmpData = ppmpRes.ok ? await ppmpRes.json() : [];
      setPpmpLedger(ppmpData);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadProcurementStreamMatrix(); }, [user?.department]);

  // AUTOMATED MASS IMPORT TRIGGER: Syncs ALL qualifying unprocured Form 4 allocations instantly as row shells
  const handleBatchImportAllShells = async () => {
    const qualifyingBudgetItems = fullBudgetList.filter(b => 
      b && 
      b.includesProcurement === 'Yes' &&
      !ppmpLedger.some(p => p.aipRefCode === b.aipRefCode)
    );

    if (qualifyingBudgetItems.length === 0) {
      alert("All eligible procurement PPAs from your Annual Budget have already been imported into your tracking layout.");
      return;
    }

    const batchEntriesArray = qualifyingBudgetItems.map(b => {
      const matchingAipRow = allAipItems.find(x => x.aipRefCode === b.aipRefCode);
      const resolvedSourceOfFunds = matchingAipRow?.fundingSource || 'General Fund';
      const isStandalone = b.activityName?.includes('N/A') || !b.activityName;
      const descriptionText = isStandalone ? b.projectName : `${b.projectName} — (Activity: ${b.activityName})`;

      return {
        aipRefCode: b.aipRefCode,
        office: user.department,
        generalDescription: descriptionText,
        typeOfProject: 'Goods',
        preProcurementConference: 'No',
        startProcurementMonth: '—', // Placeholder marking layout state as unconfigured shell
        endProcurementMonth: '—',
        expectedDeliveryMonth: '—',
        sourceOfFunds: resolvedSourceOfFunds,
        estimatedBudget: b.total, // Seeds default allocation cap limit
        items: []
      };
    });

    try {
      const res = await fetch('https://municipal-budget-backend.onrender.com/api/ppmp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: batchEntriesArray })
      });
      if (res.ok) {
        loadProcurementStreamMatrix();
        alert(`Success! Imported (${batchEntriesArray.length}) unconfigured procurement project shells cleanly.`);
      }
    } catch (err) { alert("Failed to execute batch sync."); }
  };

  const handleOpenConfiguringModal = (row) => {
    setActiveEditingRow(row);
    setTypeOfProject(row.typeOfProject || 'Goods');
    setPreProcurementConference(row.preProcurementConference || 'No');
    setStartProcurementMonth(row.startProcurementMonth === '—' ? 'January' : row.startProcurementMonth);
    setEndProcurementMonth(row.endProcurementMonth === '—' ? 'December' : row.endProcurementMonth);
    setExpectedDeliveryMonth(row.expectedDeliveryMonth === '—' ? 'December' : row.expectedDeliveryMonth);
    setEstimatedBudget(row.estimatedBudget);
    
    // Seed items tracking with unique identifiers or format list cleanly
    if (Array.isArray(row.items) && row.items.length > 0) {
      setItemsList(row.items.map(x => ({ ...x, id: Math.random() })));
    } else {
      setItemsList([]);
    }
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItemsList([...itemsList, {
      id: Date.now() + Math.random(),
      description: '',
      unitOfMeasurement: 'Piece',
      quantity: 1
    }]);
  };

  const handleUpdateItemField = (id, field, value) => {
    setItemsList(itemsList.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleRemoveItemRow = (id) => {
    setItemsList(itemsList.filter(item => item.id !== id));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!activeEditingRow) return;

    // Find the original Form 4 allocation limit ceiling block to prevent unauthorized updates
    const originalBudgetLine = fullBudgetList.find(b => b.aipRefCode === activeEditingRow.aipRefCode);
    const maximumCapAllowed = originalBudgetLine ? originalBudgetLine.total : activeEditingRow.estimatedBudget;

    const parsedBudget = parseFloat(estimatedBudget) || 0;
    if (parsedBudget > maximumCapAllowed) {
      alert(`Validation Failure: Estimated PPMP budget cannot exceed your Authorized Budgetary Allocation ceiling of ₱${maximumCapAllowed.toLocaleString()}.`);
      return;
    }
    if (itemsList.length === 0) {
      alert("Please append at least one inventory line-item breakdown product row measure requirement.");
      return;
    }

    const updatedPlanBody = {
      office: user.department,
      generalDescription: activeEditingRow.generalDescription,
      typeOfProject,
      preProcurementConference,
      startProcurementMonth,
      endProcurementMonth,
      expectedDeliveryMonth,
      sourceOfFunds: activeEditingRow.sourceOfFunds,
      estimatedBudget: parsedBudget,
      items: itemsList.map(x => ({ description: x.description, unitOfMeasurement: x.unitOfMeasurement, quantity: parseInt(x.quantity) || 1 }))
    };

    try {
      const response = await fetch('https://municipal-budget-backend.onrender.com/api/ppmp/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aipRefCode: activeEditingRow.aipRefCode, updatedPlan: updatedPlanBody })
      });
      if (response.ok) {
        setIsModalOpen(false);
        loadProcurementStreamMatrix();
        alert("Success! Procurement specs logged flawlessly inside database column records.");
      }
    } catch (err) { alert("Failed to save parameter updates."); }
  };

  return (
    <div className="main-content-stream" style={{ width: '100%' }}>
      
      {/* HEADER OPERATIONS BAR CONTROL INTERACTION PANEL */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Project Procurement Management Plan (PPMP) Workspace</h2>
          <p style={{ margin: 0, color: '#64748b' }}>Consolidating tactical object item breakdowns, procurement tracking schedules, and inventory measures.</p>
        </div>
        <button className="btn-primary" onClick={handleBatchImportAllShells} style={{ backgroundColor: '#2563eb' }}>
          ⚡ Import ALL PPAs with Procurement
        </button>
      </div>

      {/* CORE PROCUREMENT MASTER LIST DISPLAY CONTAINER VIEW GRID */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <h3>Finalized Procurement Master Registry</h3>
        {ppmpLedger.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2.5rem 0', fontStyle: 'italic' }}>No active project procurement rows found. Tap the button above to import your Annual Budget items instantly.</p>
        ) : (
          <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: '700' }}>AIP Ref Code</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '700' }}>Procurement Target Description / Title</th>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: '700' }}>Classification Type</th>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: '700' }}>Pre-Procure Conf</th>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: '700' }}>Procurement Activity Window</th>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: '700' }}>Delivery Timeline</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '700' }}>Source of Funds</th>
                <th style={{ padding: '10px', textAlign: 'right', fontWeight: '700' }}>Estimated Budget</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: '700', width: '200px' }}>Item Breakdown Matrix</th>
                <th style={{ padding: '10px', textAlign: 'center', fontWeight: '700' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ppmpLedger.map((row, i) => {
                const isShell = row.startProcurementMonth === '—';
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: isShell ? '#fefce8' : 'transparent' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: '700', color: isShell ? '#94a3b8' : '#0369a1', textAlign: 'center' }}>
                      {row.aipRefCode}
                    </td>
                    <td style={{ padding: '10px', fontWeight: '600', color: '#1e293b' }}>
                      {row.generalDescription}
                      {isShell && <span style={{ display: 'block', fontSize: '0.75rem', color: '#b45309', fontWeight: '700', marginTop: '2px' }}>⚠️ Awaiting Specification Log</span>}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>{row.typeOfProject}</span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', color: row.preProcurementConference === 'Yes' ? '#b45309' : '#64748b', fontWeight: '700' }}>
                      {row.preProcurementConference}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: isShell ? '#cbd5e1' : '#0f172a' }}>
                      {isShell ? '—' : `📅 ${row.startProcurementMonth} ➔ ${row.endProcurementMonth}`}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center', fontWeight: '600', color: isShell ? '#cbd5e1' : '#166534' }}>
                      {isShell ? '—' : `⚡ ${row.expectedDeliveryMonth}`}
                    </td>
                    <td style={{ padding: '10px', color: '#475569', fontSize: '0.8rem' }}>{row.sourceOfFunds}</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', fontFamily: 'monospace', color: '#0f172a' }}>
                      ₱{row.estimatedBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {Array.isArray(row.items) && row.items.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {row.items.map((it, idx) => (
                            <div key={idx} style={{ fontSize: '0.72rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 4px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: '#334155' }}>📦 {it.description}</span>
                              <span style={{ color: '#64748b', fontWeight: '600' }}>{it.quantity}({it.unitOfMeasurement?.charAt(0)})</span>
                            </div>
                          ))}
                        </div>
                      ) : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>No item lists logged</span>}
                    </td>
                    <td style={{ padding: '10px', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ padding: '4px 10px', fontSize: '0.8rem', backgroundColor: isShell ? '#d97706' : '#e2e8f0', color: isShell ? '#ffffff' : '#475569', border: 'none' }}
                        onClick={() => handleOpenConfiguringModal(row)}
                      >
                        {isShell ? '⚙️ Configure' : 'Edit Plan'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* CORE SPECIFICATIONS AND ITEMIZATION EDITING DIALOG MODAL PANEL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              style={{ position: 'absolute', right: '1.5rem', top: '1.25rem', background: '#f1f5f9', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#475569', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', zIndex: '50' }}
            >
              &times;
            </button>

            <div className="modal-header-section" style={{ paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <h2>Configure Project Procurement Plan Layout Parameters</h2>
              <p className="label-helper" style={{ margin: '2px 0 0 0' }}>Target: <strong>{activeEditingRow?.generalDescription}</strong></p>
            </div>

            <div style={{ overflowY: 'auto', paddingRight: '4px' }}>
              <form onSubmit={handleFormSubmit}>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-field-group">
                    <label>Type of the Project to be Procured</label>
                    <select value={typeOfProject} onChange={(e) => setTypeOfProject(e.target.value)}>
                      {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>Pre-Procurement Conference Applicable?</label>
                    <select value={preProcurementConference} onChange={(e) => setPreProcurementConference(e.target.value)}>
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <div className="form-field-group">
                    <label>Start Procurement Activity</label>
                    <select value={startProcurementMonth} onChange={(e) => setStartProcurementMonth(e.target.value)}>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>End Procurement Activity</label>
                    <select value={endProcurementMonth} onChange={(e) => setEndProcurementMonth(e.target.value)}>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>Expected Delivery Period</label>
                    <select value={expectedDeliveryMonth} onChange={(e) => setExpectedDeliveryMonth(e.target.value)}>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-field-group" style={{ marginTop: '0.5rem' }}>
                  <label>Estimated Budget Allocation (PhP)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={estimatedBudget} 
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) => setEstimatedBudget(e.target.value)} 
                    required 
                  />
                </div>

                {/* ITEM BREAKDOWN TRACKING ON A PER-ITEM BASIS */}
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', marginTop: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ color: '#0369a1', fontWeight: '700', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                      📦 Detailed Itemized Inventory Breakdown Splits (Per-Item Basis)
                    </span>
                    <button type="button" className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.8rem', background: '#0369a1' }} onClick={handleAddItemRow}>
                      ➕ Add Item
                    </button>
                  </div>

                  {itemsList.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#94a3b8', padding: '1rem', border: '1px dashed #cbd5e1', borderRadius: '6px', background: '#fafafa' }}>
                      No item lines recorded. Tap "+ Add Item" to input specifications on a per-item basis.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {itemsList.map((it, idx) => (
                        <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr auto', gap: '0.5rem', alignItems: 'center', background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          <div className="form-field-group" style={{ margin: 0 }}>
                            <input 
                              type="text" 
                              value={it.description} 
                              onChange={(e) => handleUpdateItemField(it.id, 'description', e.target.value)} 
                              placeholder="Product Item description (e.g., Black Ballpoint Pens, A4 Reams)" 
                              required 
                            />
                          </div>

                          <div className="form-field-group" style={{ margin: 0 }}>
                            <select value={it.unitOfMeasurement} onChange={(e) => handleUpdateItemField(it.id, 'unitOfMeasurement', e.target.value)}>
                              {MEASUREMENTS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>

                          <div className="form-field-group" style={{ margin: 0 }}>
                            <input 
                              type="number" 
                              min="1" 
                              value={it.quantity} 
                              onChange={(e) => handleUpdateItemField(it.id, 'quantity', e.target.value)} 
                              required 
                            />
                          </div>

                          <button type="button" className="btn-danger" style={{ padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} onClick={() => handleRemoveItemRow(it.id)}>
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Save Plan Specifications</button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}