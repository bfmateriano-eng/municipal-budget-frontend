export default function OfficeProfile({ headOfOffice, setHeadOfOffice, vision, setVision, mission, setMission, goals, setGoals, onSave }) {
  return (
    <form onSubmit={onSave} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxSizing: 'border-box', height: '100%' }}>
      <h3 style={{ margin: '0 0 4px 0', color: '#0f172a', fontSize: '1rem', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
        📋 Office Core Information & Mandate Profile
      </h3>

      <div className="form-field-group" style={{ marginBottom: 0 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>Assigned Head of Office / Department Chief</label>
        <input type="text" value={headOfOffice} onChange={(e) => setHeadOfOffice(e.target.value)} placeholder="e.g., Director Maria Santos, DPA" required style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="form-field-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>Strategic Vision Directive</label>
          <textarea value={vision} onChange={(e) => setVision(e.target.value)} placeholder="Type office vision framework..." required style={{ padding: '0.4rem', fontSize: '0.8rem', height: '70px', resize: 'none' }} />
        </div>
        <div className="form-field-group" style={{ margin: 0 }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>Operational Mission Objectives</label>
          <textarea value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Type office core mission task rules..." required style={{ padding: '0.4rem', fontSize: '0.8rem', height: '70px', resize: 'none' }} />
        </div>
      </div>

      <div className="form-field-group" style={{ marginBottom: 0 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: '700', marginBottom: '2px' }}>Localized Department Performance Goals</label>
        <textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="List core institutional goals..." required style={{ padding: '0.4rem', fontSize: '0.8rem', height: '55px', resize: 'none' }} />
      </div>

      <button type="submit" className="btn-primary" style={{ padding: '0.5rem', fontSize: '0.85rem', width: '100%', marginTop: '4px' }}>
        💾 Save Office Baseline Directives
      </button>
    </form>
  );
}