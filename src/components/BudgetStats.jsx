import { useState, useEffect } from 'react';

export default function BudgetStats() {
  const [stats, setStats] = useState({
    ldipCount: 0, ldipTotal: 0,
    aipCount: 0, aipTotal: 0,
    budgetTotal: 0, budgetPs: 0, budgetMooe: 0, budgetCo: 0,
    ppmpTotal: 0
  });

  useEffect(() => {
    const fetchDashboardNumbers = async () => {
      try {
        const savedUser = localStorage.getItem('userSession');
        if (!savedUser) return;
        const parsed = JSON.parse(savedUser);
        const dept = parsed.department || '';

        const res = await fetch(`https://municipal-budget-backend.onrender.com/api/dashboard/stats/${encodeURIComponent(dept)}`);
        if (res.ok) setStats(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchDashboardNumbers();
  }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem', width: '100%' }}>
      
      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.85rem 1.25rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>1. LDIP Programs</span>
        <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.4rem', color: '#1e3a8a', fontWeight: '800' }}>{stats.ldipCount} Active</h3>
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>Targeted: ₱{stats.ldipTotal.toLocaleString()}</span>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.85rem 1.25rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>2. AIP Action Nodes</span>
        <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.4rem', color: '#d97706', fontWeight: '800' }}>{stats.aipCount} Mapped</h3>
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>Proposed: ₱{stats.aipTotal.toLocaleString()}</span>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.85rem 1.25rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>3. Form 4 Appropriation</span>
        <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.4rem', color: '#166534', fontWeight: '800' }}>₱{stats.budgetTotal.toLocaleString()}</h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', whiteSpace: 'nowrap' }}>
          PS: ₱{stats.budgetPs.toLocaleString()} | MOOE: ₱{stats.budgetMooe.toLocaleString()} | CO: ₱{stats.budgetCo.toLocaleString()}
        </span>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '0.85rem 1.25rem', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>4. Procurement Pipeline</span>
        <h3 style={{ margin: '4px 0 2px 0', fontSize: '1.4rem', color: '#7c3aed', fontWeight: '800' }}>₱{stats.ppmpTotal.toLocaleString()}</h3>
        <span style={{ fontSize: '0.8rem', color: '#475569' }}>PPMP Exposure: {stats.budgetTotal > 0 ? ((stats.ppmpTotal/stats.budgetTotal)*100).toFixed(1) : 0}%</span>
      </div>

    </div>
  );
}