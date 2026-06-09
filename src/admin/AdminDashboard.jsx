import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    ldipCount: 0, ldipTotal: 0,
    aipCount: 0, aipTotal: 0,
    budgetTotal: 0, budgetPs: 0, budgetMooe: 0, budgetCo: 0,
    ppmpTotal: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsolidatedMunicipalStats = async () => {
      try {
        // Query the master endpoint using 'ALL' to bypass departmental walls
        const res = await fetch(`https://municipal-budget-backend.onrender.com/api/dashboard/stats/ALL`);
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (e) {
        console.error("Failed to load aggregate municipal matrices:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchConsolidatedMunicipalStats();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Compiling consolidated municipal data rows...</div>;
  }

  // Calculate quick analytic metric percentages
  const budgetUtilizationRate = stats.aipTotal > 0 ? ((stats.budgetTotal / stats.aipTotal) * 100).toFixed(1) : 0;
  const procurementIntensity = stats.budgetTotal > 0 ? ((stats.ppmpTotal / stats.budgetTotal) * 100).toFixed(1) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* SECTION 1: MACRO-LEVEL SUMMARY METRIC CHIPS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem' }}>
        
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total LDIP Programs</span>
          <h2 style={{ margin: '4px 0 2px 0', fontSize: '1.6rem', color: '#1e3a8a', fontWeight: '800' }}>{stats.ldipCount}</h2>
          <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>Estimated Value: ₱{stats.ldipTotal.toLocaleString()}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consolidated AIP Actions</span>
          <h2 style={{ margin: '4px 0 2px 0', fontSize: '1.6rem', color: '#b45309', fontWeight: '800' }}>{stats.aipCount}</h2>
          <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '500' }}>Proposed Baseline: ₱{stats.aipTotal.toLocaleString()}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.7------', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LBF No. 4 Appropriations</span>
          <h2 style={{ margin: '4px 0 2px 0', fontSize: '1.6rem', color: '#115e59', fontWeight: '800' }}>₱{stats.budgetTotal.toLocaleString()}</h2>
          <div style={{ fontSize: '0.8rem', color: '#0f766e', fontWeight: '600' }}>{budgetUtilizationRate}% Capture Rate from AIP</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PPMP Procurement Pipeline</span>
          <h2 style={{ margin: '4px 0 2px 0', fontSize: '1.6rem', color: '#6d28d9', fontWeight: '800' }}>₱{stats.ppmpTotal.toLocaleString()}</h2>
          <div style={{ fontSize: '0.8rem', color: '#5b21b6', fontWeight: '600' }}>{procurementIntensity}% Material Exposure</div>
        </div>

      </div>

      {/* SECTION 2: SIDE-BY-SIDE SPLIT GRAPH AND METRIC PANELS */}
      <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '0.75rem', flexGrow: 1, minHeight: 0 }}>
        
        {/* LEFT COLUMN: VISUAL APPROPRIATIONS APPORTIONMENT GRAPH */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            📊 Municipal-Wide Expense Class Apportionment
          </h3>
          
          <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
            
            {/* PERSONAL SERVICES CARD */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                <span style={{ color: '#1e40af' }}>Personal Services (PS) Allotments</span>
                <span>₱{stats.budgetPs.toLocaleString()} ({stats.budgetTotal > 0 ? ((stats.budgetPs/stats.budgetTotal)*100).toFixed(1) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.budgetTotal > 0 ? (stats.budgetPs/stats.budgetTotal)*100 : 0}%`, height: '100%', background: '#3b82f6', borderRadius: '99px' }} />
              </div>
            </div>

            {/* MOOE CARD */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                <span style={{ color: '#b45309' }}>Maintenance & Operating Expenses (MOOE)</span>
                <span>₱{stats.budgetMooe.toLocaleString()} ({stats.budgetTotal > 0 ? ((stats.budgetMooe/stats.budgetTotal)*100).toFixed(1) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.budgetTotal > 0 ? (stats.budgetMooe/stats.budgetTotal)*100 : 0}%`, height: '100%', background: '#f59e0b', borderRadius: '99px' }} />
              </div>
            </div>

            {/* CAPITAL OUTLAY CARD */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '4px' }}>
                <span style={{ color: '#166534' }}>Capital Outlay (CO) Infrastructure Investments</span>
                <span>₱{stats.budgetCo.toLocaleString()} ({stats.budgetTotal > 0 ? ((stats.budgetCo/stats.budgetTotal)*100).toFixed(1) : 0}%)</span>
              </div>
              <div style={{ width: '100%', height: '14px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ width: `${stats.budgetTotal > 0 ? (stats.budgetCo/stats.budgetTotal)*100 : 0}%`, height: '100%', background: '#10b981', borderRadius: '99px' }} />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: ADMINISTRATIVE ADVISORY PANEL */}
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            🛡️ Administrative Control Directives
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: '1.5' }}>
            Welcome to the LGU Executive oversight matrix panel. These metrics show live calculations combined across all decentralized departmental sheets.
          </p>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '0.85rem', borderRadius: '6px', fontSize: '0.8rem', color: '#1e40af', fontWeight: '500', lineHeight: '1.4' }}>
            💡 <strong>Oversight Alert:</strong> The current fiscal data funnel indicates that <strong>{budgetUtilizationRate}%</strong> of proposed investment program operations have been authorized under LBF Form 4 ledger lines.
          </div>
        </div>

      </div>

    </div>
  );
}