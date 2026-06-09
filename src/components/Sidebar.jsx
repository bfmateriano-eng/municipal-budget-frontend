export default function Sidebar({ user }) {
  return (
    <div className="main-content-stream">
      <div className="card">
        <h3>User Context Identity</h3>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1rem 0' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          <p><strong>Active User:</strong> {user.nameOfUser}</p>
          <p><strong>Authorization:</strong> {user.userType}</p>
          <p><strong>Email Handle:</strong> {user.email}</p>
          <p><strong>Hotline Link:</strong> {user.contactNumber}</p>
        </div>
      </div>
    </div>
  );
}