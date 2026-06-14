import { useState } from 'react';

const DEPARTMENTS = [
  "Bureau of Fire Protection (BFP)", "Civil Society Organization (CSO)", "Commission on Election (COMELEC)", 
  "Department of Education (DepEd)", "Department of the Agrarian Reform (DAR)", "Department of the Interior and Local Government (DILG)", 
  "Municipal Trial Court (MTC)", "Office of the Business Permit and Licensing Officer (BPLO)", "Office of the Command Center", 
  "Office of the Community Affairs", "Office of the Cooperative Development Officer", "Office of the Culture and the Arts", 
  "Office of the Gender And Development (GAD)", "Office of the General Services Officer (GSO)", "Office of the Human Resource and Management Officer (HRMO)", 
  "Office of the Local Youth Development Officer (LYDO)", "Office of the Market", "Office of the Municipal Accountant", 
  "Office of the Municipal Administrator", "Office of the Municipal Agricultural Officer (DA)", "Office of the Municipal Anti-Drug Abuse Council (MADAC)", 
  "Office of the Municipal Assessor", "Office of the Municipal Budget Officer", "Office of the Municipal Civil Registrar", 
  "Office of the Municipal Engineer/Building Official", "Office of the Municipal Environment and Natural Resources (MENRO)", 
  "Office of the Municipal Health Officer (MHO)", "Office of the Municipal Information Officer", "Office of the Municipal Legal Officer", 
  "Office of the Municipal Mayor", "Office of the Municipal Planning and Development Coordinator (MPDO)", "Office of the Municipal Risk Reduction Management Officer (MDRRMO)", 
  "Office of the Municipal Social Welfare and Development Officer (MSWDO)", "Office of the Municipal Tourism", "Office of the Municipal Treasurer (MTO)", 
  "Office of the Municipal Vice Mayor", "Office of the Persons with Disability Affairs Officer (PDAO)", "Office of the Public Employment Service Officer (PESO)", 
  "Office of the Sangguniang Bayan Members", "Office of the Secretary to the Sangguniang Bayan", "Office of the Technical Education and Skills Development Authority (TESDA)", 
  "Philippine National Police (PNP)", "Post Office (PO)"
];

export default function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameOfUser, setNameOfUser] = useState('');
  const [userType, setUserType] = useState('');
  const [department, setDepartment] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');   
    setSuccessMessage('');
    
    if (!isLogin && password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (isLogin) {
      try {
        const response = await fetch('https://municipal-budget-backend.onrender.com/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          onLoginSuccess(data.user);
        } else {
          setErrorMessage(data.message || "Login failed.");
        }
      } catch (error) {
        setErrorMessage("Failed to reach the server.");
      }
    } else {
      const registrationData = { username: email, email, password, nameOfUser, userType, department, nameOfEndUser: nameOfUser, contactNumber };
      try {
        const response = await fetch('https://municipal-budget-backend.onrender.com/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData),
        });
        const data = await response.json();
        if (response.ok) {
          setSuccessMessage("Account registered successfully!");
          setTimeout(() => {
            setIsLogin(true);
            setPassword('');
            setSuccessMessage('');
          }, 2000);
        } else {
          setErrorMessage(data.message || "Failed to register.");
        }
      } catch (error) {
        setErrorMessage("Failed to reach the backend server.");
      }
    }
  };

  return (
    <div className="auth-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '85vh', padding: '1rem', margin: '0 auto', width: '100%' }}>
      
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.5rem 2rem', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
        
        {/* CENTERED BRAND LOGO INSIGNIA PAIR WING */}
        <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem', boxSizing: 'border-box' }}>
          <img src="/lgu-logo.png" alt="Pililla Seal" style={{ height: '75px', width: 'auto', display: 'block', objectFit: 'contain' }} />
          <div style={{ height: '45px', width: '1px', backgroundColor: '#cbd5e1' }}></div>
          
          {/* INSTITUTIONAL BLUE BACKDROP BOX TO SHOW RAW WHITE PNG ASSETS */}
          <div style={{ backgroundColor: '#1e3a8a', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '75px', boxSizing: 'border-box' }}>
            <img src="/better-pililla.png" alt="Better Pililla" style={{ height: '52px', width: 'auto', display: 'block', objectFit: 'contain' }} />
          </div>
        </div>

        {/* RE-DESIGNED FORM OFFICE PORTAL TITLE TYPOGRAPHY */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', width: '100%' }}>
          <h2 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.02em', textTransform: 'uppercase', textAlign: 'center' }}>
            Municipality of Pililla
          </h2>
          <p style={{ margin: 0, fontSize: '0.92rem', fontWeight: '600', color: '#1e3a8a', letterSpacing: '-0.01em', textAlign: 'center' }}>
            Fiscal Planning and Management Portal
          </p>
          <div style={{ width: '40px', height: '3px', backgroundColor: '#2563eb', margin: '0.75rem auto 0 auto', borderRadius: '20px' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
          
          {errorMessage && <div className="alert alert-error" style={{ margin: 0, borderLeft: '4px solid #dc2626', fontWeight: '600' }}>{errorMessage}</div>}
          {successMessage && <div className="alert alert-success" style={{ margin: 0, borderLeft: '4px solid #166534', fontWeight: '600' }}>{successMessage}</div>}

          <div className="form-field-group" style={{ margin: 0, width: '100%' }}>
            <label htmlFor="auth-email" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Email Address:</label>
            <input 
              id="auth-email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="username@pililla.gov.ph"
              title="Email Address"
              aria-label="Email Address"
              style={{ boxSizing: 'border-box' }} 
            />
          </div>
          
          <div className="form-field-group" style={{ margin: 0, width: '100%' }}>
            <label htmlFor="auth-password" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Password:</label>
            <input 
              id="auth-password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              title="Password"
              aria-label="Password"
              style={{ boxSizing: 'border-box' }} 
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-field-group" style={{ margin: 0, width: '100%' }}>
                <label htmlFor="auth-confirm" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Confirm Password:</label>
                <input 
                  id="auth-confirm" 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                  placeholder="••••••••"
                  title="Confirm Password"
                  aria-label="Confirm Password"
                  style={{ boxSizing: 'border-box' }} 
                />
              </div>
              
              <div className="form-field-group" style={{ margin: 0, width: '100%' }}>
                <label htmlFor="auth-name" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Name of User:</label>
                <input 
                  id="auth-name" 
                  type="text" 
                  value={nameOfUser} 
                  onChange={(e) => setNameOfUser(e.target.value)} 
                  required 
                  placeholder="e.g., Juan Dela Cruz"
                  title="Name of User"
                  aria-label="Name of User"
                  style={{ boxSizing: 'border-box' }} 
                />
              </div>
              
              <div className="form-field-group" style={{ margin: 0, width: '100%' }}>
                <label htmlFor="auth-type" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>User Type:</label>
                <select 
                  id="auth-type" 
                  value={userType} 
                  onChange={(e) => setUserType(e.target.value)} 
                  required 
                  title="User Type"
                  aria-label="User Type"
                  style={{ boxSizing: 'border-box', width: '100%' }}
                >
                  <option value="" disabled>Select User Type</option>
                  <option value="End User">End User</option>
                  <option value="Administrator">Administrator</option>
                  <option value="Functionary">Functionary</option>
                </select>
              </div>
              
              <div className="form-field-group" style={{ margin: 0, width: '100%' }}>
                <label htmlFor="auth-dept" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Office/Department/Unit:</label>
                <select 
                  id="auth-dept" 
                  value={department} 
                  onChange={(e) => setDepartment(e.target.value)} 
                  required 
                  title="Office or Department"
                  aria-label="Office or Department"
                  style={{ boxSizing: 'border-box', width: '100%' }}
                >
                  <option value="" disabled>Select Department</option>
                  {DEPARTMENTS.map((dept, index) => <option key={index} value={dept}>{dept}</option>)}
                </select>
              </div>
              
              <div className="form-field-group" style={{ margin: 0, width: '100%' }}>
                <label htmlFor="auth-contact" style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', color: '#475569', marginBottom: '0.35rem' }}>Contact Number:</label>
                <input 
                  id="auth-contact" 
                  type="tel" 
                  value={contactNumber} 
                  onChange={(e) => setContactNumber(e.target.value)} 
                  required 
                  placeholder="e.g., 0917XXXXXXX"
                  title="Contact Number"
                  aria-label="Contact Number"
                  style={{ boxSizing: 'border-box' }} 
                />
              </div>
            </>
          )}
          
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '0.75rem', fontSize: '0.9rem', fontWeight: '700', borderRadius: '6px', marginTop: '0.5rem', backgroundColor: '#1e3a8a', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
            {isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div className="toggle-container" style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '500', textAlign: 'center', width: '100%' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); setSuccessMessage(''); }} className="toggle-btn" style={{ fontWeight: '700', color: '#2563eb', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', paddingLeft: '4px', fontSize: '0.85rem' }}>
            {isLogin ? 'Register here' : 'Login here'}
          </button>
        </div>

      </div>
    </div>
  );
}