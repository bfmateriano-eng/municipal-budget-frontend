import { useState, useEffect } from 'react';
import './App.css';

// Component layout frameworks
import AuthForm from './components/AuthForm';
import Sidebar from './components/Sidebar';
import BudgetStats from './components/BudgetStats';
import OfficeProfile from './components/OfficeProfile';
import OrgChart from './components/OrgChart';
import LdipPage from './components/LdipPage';
import AipPage from './components/AipPage';
import BudgetPage from './components/BudgetPage';
import PpmpPage from './components/PpmpPage'; 

// Import Admin Folders view models
import AdminDashboard from './admin/AdminDashboard';
import AdminConsolidatedRecords from './admin/AdminConsolidatedRecords';
import AdminAccounts from './admin/AdminAccounts';
import BacAppPage from './admin/BacAppPage'; // 👈 NEW: Mapped the BAC Secretary workspace

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [currentTab, setCurrentTab] = useState('profile');

  const [headOfOffice, setHeadOfOffice] = useState('');
  const [vision, setVision] = useState('');
  const [mission, setMission] = useState('');
  const [goals, setGoals] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('userSession');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setLoggedInUser(parsedUser);
      loadOfficeData(parsedUser.department);
      
      // Chronological routing checks running during baseline mount cycles
      if (parsedUser.userType === 'Administrator') {
        setCurrentTab('admin_dashboard');
      } else if (parsedUser.userType === 'BAC Secretary') {
        setCurrentTab('bac_app_workspace');
      }
    }
  }, []);

  const loadOfficeData = (deptName) => {
    setHeadOfOffice(localStorage.getItem(`${deptName}_head`) || '');
    setVision(localStorage.getItem(`${deptName}_vision`) || '');
    setMission(localStorage.getItem(`${deptName}_mission`) || '');
    setGoals(localStorage.getItem(`${deptName}_goals`) || '');
  };

  const handleLoginSuccess = (user) => {
    setLoggedInUser(user);
    localStorage.setItem('userSession', JSON.stringify(user));
    loadOfficeData(user.department);
    if (user.userType === 'Administrator') {
      setCurrentTab('admin_dashboard');
    } else if (user.userType === 'BAC Secretary') {
      setCurrentTab('bac_app_workspace');
    } else {
      setCurrentTab('profile');
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem('userSession');
    setLoggedInUser(null);
    setCurrentTab('profile');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!loggedInUser) return;
    localStorage.setItem(`${loggedInUser.department}_head`, headOfOffice);
    localStorage.setItem(`${loggedInUser.department}_vision`, vision);
    localStorage.setItem(`${loggedInUser.department}_mission`, mission);
    localStorage.setItem(`${loggedInUser.department}_goals`, goals);
    alert("Office profile metrics updated locally.");
  };

  if (!loggedInUser) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = loggedInUser.userType === 'Administrator';
  const isBacSecretary = loggedInUser.userType === 'BAC Secretary';

  return (
    <div className="dashboard-wrapper" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <div className="dashboard-header" style={{ padding: '0.75rem 1.5rem', flexShrink: 0 }}>
        <div>
          <h1>
            {isAdmin ? 'MUNICIPAL EXECUTIVE ADMINISTRATIVE ROOM' : 
             isBacSecretary ? 'BIDS AND AWARDS COMMITTEE CENTRAL ROOM' : 
             loggedInUser.department}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
            {isAdmin ? 'LGU Consolidated Oversight Analytical Control Panel' : 
             isBacSecretary ? 'Consolidated Annual Procurement Plan (APP) Lifecycle Compiler' : 
             'Operational Management Workspace Hub'}
          </p>
        </div>
        <button className="btn-danger" onClick={handleLogOut} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Sign Out</button>
      </div>

      <div className="navbar-tabs" style={{ flexShrink: 0, padding: '0 1.5rem', margin: 0 }}>
        {isAdmin ? (
          <>
            <button className={`nav-tab ${currentTab === 'admin_dashboard' ? 'active' : ''}`} onClick={() => setCurrentTab('admin_dashboard')}>🏛️ Executive Control Room UI</button>
            <button className={`nav-tab ${currentTab === 'admin_records' ? 'active' : ''}`} onClick={() => setCurrentTab('admin_records')}>📂 Consolidated Records Master</button>
            <button className={`nav-tab ${currentTab === 'admin_accounts' ? 'active' : ''}`} onClick={() => setCurrentTab('admin_accounts')}>👥 Manage User Accounts</button>
          </>
        ) : isBacSecretary ? (
          /* BAC SECRETARY ACCESS PANEL DESK WORKSPACE LINKS ONLY */
          <button className={`nav-tab ${currentTab === 'bac_app_workspace' ? 'active' : ''}`} onClick={() => setCurrentTab('bac_app_workspace')}>
            📜 Consolidated APP Master Workspace Panel
          </button>
        ) : (
          <>
            <button className={`nav-tab ${currentTab === 'profile' ? 'active' : ''}`} onClick={() => setCurrentTab('profile')}>Office Information Profile</button>
            <button className={`nav-tab ${currentTab === 'ldip' ? 'active' : ''}`} onClick={() => setCurrentTab('ldip')}>Local Development Investment Plan (LDIP)</button>
            <button className={`nav-tab ${currentTab === 'aip' ? 'active' : ''}`} onClick={() => setCurrentTab('aip')}>Annual Investment Program (AIP)</button>
            <button className={`nav-tab ${currentTab === 'budget' ? 'active' : ''}`} onClick={() => setCurrentTab('budget')}>Annual Budgeting Allotment (LBF No. 4)</button>
            <button className={`nav-tab ${currentTab === 'ppmp' ? 'active' : ''}`} onClick={() => setCurrentTab('ppmp')}>Procurement Plan Matrix (PPMP)</button>
          </>
        )}
      </div>

      <div style={{ flexGrow: 1, overflowY: currentTab === 'profile' || currentTab === 'admin_dashboard' || currentTab === 'admin_records' || currentTab === 'admin_accounts' || currentTab === 'bac_app_workspace' ? 'hidden' : 'auto', padding: '1rem 1.5rem', boxSizing: 'border-box' }}>
        
        {currentTab === 'admin_dashboard' && <AdminDashboard />}
        {currentTab === 'admin_records' && <AdminConsolidatedRecords />}
        {currentTab === 'admin_accounts' && <AdminAccounts />}
        
        {/* Render BAC Secretary compilation view layout block frame */}
        {currentTab === 'bac_app_workspace' && <BacAppPage />}

        {currentTab === 'profile' && !isAdmin && !isBacSecretary && (
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1rem', height: '100%', boxSizing: 'border-box' }}>
            <Sidebar user={loggedInUser} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', height: '100%', overflow: 'hidden' }}>
              <BudgetStats />
              <div style={{ display: 'grid', gridTemplateColumns: '6fr 4fr', gap: '0.75rem', flexGrow: 1, overflow: 'hidden', minHeight: 0 }}>
                <div style={{ overflow: 'hidden', height: '100%' }}>
                  <OfficeProfile 
                    headOfOffice={headOfOffice} setHeadOfOffice={setHeadOfOffice}
                    vision={vision} setVision={setVision} mission={mission} setMission={setMission}
                    goals={goals} setGoals={setGoals} onSave={handleSaveProfile}
                  />
                </div>
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', padding: '1rem', overflowY: 'auto', boxSizing: 'border-box', height: '100%' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: '700', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
                    🌲 Office Structural Hierarchy Chart
                  </h3>
                  <OrgChart headOfOffice={headOfOffice} />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'ldip' && <LdipPage user={loggedInUser} />}
        {currentTab === 'aip' && <AipPage user={loggedInUser} />}
        {currentTab === 'budget' && <BudgetPage user={loggedInUser} />}
        {currentTab === 'ppmp' && <PpmpPage user={loggedInUser} />}

      </div>
    </div>
  );
}

export default App;