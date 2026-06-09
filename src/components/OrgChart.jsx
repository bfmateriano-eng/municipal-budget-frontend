export default function OrgChart({ headOfOffice }) {
  return (
    <div className="card">
      <h2>Office Organizational Hierarchy</h2>
      <div className="org-chart-wrapper">
        <div className="org-node level-1">
          <div className="node-title">Head of Office</div>
          <div className="node-name">{headOfOffice || 'Unassigned / Vacant'}</div>
        </div>
        
        <div style={{ height: '20px', width: '2px', backgroundColor: '#cbd5e1' }}></div>
        
        <div className="org-row">
          <div className="org-node">
            <div className="node-title">Administrative Division</div>
            <div className="node-name">Processing Unit</div>
          </div>
          <div className="org-node">
            <div className="node-title">Technical Operations</div>
            <div className="node-name">Field Execution Support</div>
          </div>
          <div className="org-node">
            <div className="node-title">Planning & Budgeting</div>
            <div className="node-name">Financial Oversight Unit</div>
          </div>
        </div>
      </div>
    </div>
  );
}