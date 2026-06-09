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
        const response = await fetch('http://localhost:5000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
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
      const registrationData = { email, password, nameOfUser, userType, department, nameOfEndUser: nameOfUser, contactNumber };
      try {
        const response = await fetch('http://localhost:5000/api/register', {
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
    <div className="auth-container">
      <h1 style={{ textAlign: 'center' }}>{isLogin ? 'Login' : 'Registration'}</h1>
      <form onSubmit={handleSubmit} className="card">
        {errorMessage && <div className="alert alert-error">{errorMessage}</div>}
        {successMessage && <div className="alert alert-success">{successMessage}</div>}

        <div>
          <label>Email Address:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        {!isLogin && (
          <>
            <div>
              <label>Confirm Password:</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <div>
              <label>Name of User:</label>
              <input type="text" value={nameOfUser} onChange={(e) => setNameOfUser(e.target.value)} required />
            </div>
            <div>
              <label>User Type:</label>
              <select value={userType} onChange={(e) => setUserType(e.target.value)} required>
                <option value="" disabled>Select User Type</option>
                <option value="End User">End User</option>
                <option value="Administrator">Administrator</option>
                <option value="Functionary">Functionary</option>
              </select>
            </div>
            <div>
              <label>Office/Department/Unit:</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
                <option value="" disabled>Select Department</option>
                {DEPARTMENTS.map((dept, index) => <option key={index} value={dept}>{dept}</option>)}
              </select>
            </div>
            <div>
              <label>Contact Number:</label>
              <input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required />
            </div>
          </>
        )}
        <button type="submit">{isLogin ? 'Sign In' : 'Register Account'}</button>
      </form>
      <div className="toggle-container">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); setSuccessMessage(''); }} className="toggle-btn">
          {isLogin ? 'Register here' : 'Login here'}
        </button>
      </div>
    </div>
  );
}