import { useState, useEffect, Fragment } from 'react';

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const YEARS = ["2026", "2027", "2028", "2029", "2030"];

const OFFICE_CODES = {
  "Bureau of Fire Protection (BFP)": "1000-000-3-3-17",
  "Civil Society Organization (CSO)": "1000-000-3-3-18",
  "Commission on Election (COMELEC)": "1000-000-3-3-19",
  "Department of Education (DepEd)": "3000-000-3-3-20",
  "Department of the Agrarian Reform (DAR)": "8000-000-3-3-21",
  "Department of the Interior and Local Government (DILG)": "1000-000-3-3-22",
  "Municipal Trial Court (MTC)": "1000-000-3-3-23",
  "Office of the Business Permit and Licensing Officer (BPLO)": "8000-000-3-3-01",
  "Office of the Command Center": "1000-000-3-3-02",
  "Office of the Community Affairs": "1000-000-3-3-03",
  "Office of the Cooperative Development Officer": "1000-000-3-3-04",
  "Office of the Culture and the Arts": "1000-000-3-3-05",
  "Office of the Gender And Development (GAD)": "3000-000-3-3-06",
  "Office of the General Services Officer (GSO)": "1000-000-3-3-07",
  "Office of the Human Resource and Management Officer (HRMO)": "1000-000-3-3-08",
  "Office of the Local Youth Development Officer (LYDO)": "3000-000-3-3-09",
  "Office of the Market": "8000-000-3-3-10",
  "Office of the Municipal Accountant": "1000-000-3-1-07",
  "Office of the Municipal Administrator": "1000-000-3-2-02",
  "Office of the Municipal Agricultural Officer (DA)": "8000-000-3-2-03",
  "Office of the Municipal Anti-Drug Abuse Council (MADAC)": "3000-000-3-3-11",
  "Office of the Municipal Assessor": "1000-000-3-1-06",
  "Office of the Municipal Budget Officer": "1000-000-3-1-08",
  "Office of the Municipal Civil Registrar": "1000-000-3-1-12",
  "Office of the Municipal Engineer/Building Official": "1000-000-3-1-10",
  "Office of the Municipal Environment and Natural Resources (MENRO)": "8000-000-3-2-04",
  "Office of the Municipal Health Officer (MHO)": "1000-000-3-1-11",
  "Office of the Municipal Information Officer": "1000-000-3-2-06",
  "Office of the Municipal Legal Officer": "1000-000-3-2-02",
  "Office of the Municipal Mayor": "1000-000-3-1-01",
  "Office of the Municipal Planning and Development Coordinator (MPDO)": "1000-000-3-1-09",
  "Office of the Municipal Risk Reduction Management Officer (MDRRMO)": "1000-000-3-3-12",
  "Office of the Municipal Social Welfare and Development Officer (MSWDO)": "3000-000-3-2-05",
  "Office of the Municipal Tourism": "8000-000-3-3-13",
  "Office of the Municipal Treasurer (MTO)": "1000-000-3-1-05",
  "Office of the Municipal Vice Mayor": "1000-000-3-1-02",
  "Office of the Persons with Disability Affairs Officer (PDAO)": "3000-000-3-3-14",
  "Office of the Public Employment Service Officer (PESO)": "8000-000-3-3-15",
  "Office of the Sangguniang Bayan Members": "1000-000-3-1-03",
  "Office of the Secretary to the Sangguniang Bayan": "1000-000-3-1-04",
  "Office of the Technical Education and Skills Development Authority (TESDA)": "8000-000-3-3-16",
  "Philippine National Police (PNP)": "1000-000-3-3-24",
  "Post Office (PO)": "1000-000-3-3-25"
};

export default function AipPage({ user }) {
  const [aipLedger, setAipLedger] = useState([]);
  const [ldipPrograms, setLdipPrograms] = useState([]);

  // Accordion Expand/Collapse State Trackers
  const [expandedPrograms, setExpandedPrograms] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState([]);

  // Modal Visibility Control States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activeTargetRow, setActiveTargetRow] = useState(null);
  const [modalContextMode, setModalContextMode] = useState(''); 

  // Step 1 Form Inputs: Basic Shell Creation
  const [programTitle, setProgramTitle] = useState('');
  const [projectName, setProjectName] = useState('');

  // Context Detail Form Inputs
  const [activityNameInput, setActivityNameInput] = useState('');
  const [implOffice, setImplOffice] = useState(user?.department || '');
  const [startMonth, setStartMonth] = useState('January');
  const [startYear, setStartYear] = useState('2026');
  const [endMonth, setEndMonth] = useState('December');
  const [endYear, setEndYear] = useState('2026');
  const [expectedOutput, setExpectedOutput] = useState('');
  const [fundingSource, setFundingSource] = useState('');
  const [ps, setPs] = useState('');
  const [mooe, setMooe] = useState('');
  const [co, setCo] = useState('');
  const [ccAdaptation, setCcAdaptation] = useState('');
  const [ccMitigation, setCcMitigation] = useState('');
  const [ccTypology, setCcTypology] = useState('');

  const loadDependencies = async () => {
    try {
      const targetDept = user?.department || '';
      // LOCALIZATION WORKSPACE: Pulling natively from your local Node port 5000
      const ldipRes = await fetch(`https://municipal-budget-backend.onrender.com/api/ldip/${encodeURIComponent(targetDept)}`);
      if (ldipRes.ok) setLdipPrograms(await ldipRes.json());
      
      const aipRes = await fetch(`https://municipal-budget-backend.onrender.com/api/aip/${encodeURIComponent(targetDept)}`);
      if (aipRes.ok) {
        const rawData = await aipRes.json();
        // Defensive Guard: Filter out any null or malformed array structures coming from the server
        setAipLedger(Array.isArray(rawData) ? rawData.filter(item => item !== null) : []);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { loadDependencies(); }, [user?.department]);

  const toggleProgramAccordion = (title) => {
    setExpandedPrograms(prev => prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]);
  };

  const toggleProjectAccordion = (pName) => {
    setExpandedProjects(prev => prev.includes(pName) ? prev.filter(n => n !== pName) : [...prev, pName]);
  };

  const handleOpenCreateModal = () => {
    if (ldipPrograms.length === 0) {
      alert("No baseline LDIP registry target references discovered for your office framework.");
      return;
    }
    setProgramTitle('');
    setProjectName('');
    setIsProjectModalOpen(true);
  };

  const handleCreateProjectShell = async (e) => {
    e.preventDefault();
    const cleanP = ldipPrograms.find(x => x && x.title === programTitle);
    if (!cleanP) return alert("Target LDIP linkage track context lost.");

    const baseOfficeCode = OFFICE_CODES[user?.department] || "3000-000-3-3-11";
    const ab = String(cleanP.sectorCode || "0000").substring(0, 2);
    const cd = String(cleanP.id || "0").padStart(2, '0');
    const combinedShellRefCode = `${baseOfficeCode}-${ab}.${cd}.0`;

    const shellPayload = {
      aipRefCode: combinedShellRefCode, office: user?.department || 'Unknown', programTitle, projectName,
      activityName: 'PENDING_CONFIG', implementingOffice: 'PENDING', startDate: 'PENDING', completionDate: 'PENDING',
      expectedOutput: 'PENDING', fundingSource: 'PENDING', ps: 0, mooe: 0, co: 0, total: 0
    };

    try {
      const res = await fetch('https://municipal-budget-backend.onrender.com/api/aip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shellPayload)
      });
      if (res.ok) {
        setIsProjectModalOpen(false);
        loadDependencies();
        alert("PPA shell component line index established!");
      }
    } catch (err) { alert("Server network rejection creating shell framework."); }
  };

  const handleConfigureMetricsAction = (projItem, contextString) => {
    setActiveTargetRow(projItem);
    setModalContextMode(contextString);

    if (contextString === 'EDIT') {
      setActivityNameInput(projItem.activityName || '');
      setImplOffice(projItem.implementingOffice || user?.department || '');
      const sParts = String(projItem.startDate || 'January 2026').split(' ');
      setStartMonth(sParts[0] || 'January'); setStartYear(sParts[1] || '2026');
      const eParts = String(projItem.completionDate || 'December 2026').split(' ');
      setEndMonth(eParts[0] || 'December'); setEndYear(eParts[1] || '2026');
      setExpectedOutput(projItem.expectedOutput || '');
      setFundingSource(projItem.fundingSource || '');
      setPs(projItem.ps || ''); setMooe(projItem.mooe || ''); setCo(projItem.co || '');
      setCcAdaptation(projItem.ccAdaptation || ''); setCcMitigation(projItem.ccMitigation || '');
      setCcTypology(projItem.ccTypology || '');
    } else {
      setActivityNameInput('');
      setImplOffice(user?.department || '');
      setStartMonth('January'); setStartYear('2026');
      setEndMonth('December'); setEndYear('2026');
      setExpectedOutput(''); setFundingSource('');
      setPs(''); setMooe(''); setCo('');
      setCcAdaptation(''); setCcMitigation(''); setCcTypology('');
    }
    setIsDetailsModalOpen(true);
  };

  const handleCommitDetailsForm = async (e) => {
    e.preventDefault();
    if (!activeTargetRow) return;

    const baseOfficeCode = OFFICE_CODES[user?.department] || "3000-000-3-3-11";
    const cleanP = ldipPrograms.find(x => x && x.title === activeTargetRow.programTitle);
    const ab = cleanP ? String(cleanP.sectorCode || "0000").substring(0, 2) : "00";
    const cd = cleanP ? String(cleanP.id || "0").padStart(2, '0') : "00";

    const psVal = parseFloat(ps) || 0;
    const mooeVal = parseFloat(mooe) || 0;
    const coVal = parseFloat(co) || 0;

    const matches = aipLedger.filter(item => item && item.projectName === activeTargetRow.projectName && item.programTitle === activeTargetRow.programTitle);

    if (modalContextMode === 'EDIT') {
      const updatedEntry = {
        office: activeTargetRow.office, programTitle: activeTargetRow.programTitle, projectName: activeTargetRow.projectName,
        activityName: activityNameInput, implementingOffice: implOffice, startDate: `${startMonth} ${startYear}`,
        completionDate: `${endMonth} ${endYear}`, expectedOutput, fundingSource, ps: psVal, mooe: mooeVal, co: coVal, total: psVal + mooeVal + coVal,
        ccAdaptation: parseFloat(ccAdaptation) || 0, ccMitigation: parseFloat(ccMitigation) || 0, ccTypology
      };

      try {
        const res = await fetch('https://municipal-budget-backend.onrender.com/api/aip/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ originalRefCode: activeTargetRow.aipRefCode, updatedEntry })
        });
        if (res.ok) {
          setIsDetailsModalOpen(false);
          loadDependencies();
          alert("AIP configuration profile updated!");
        }
      } catch (err) { alert("Failed to modify database parameter cells."); }

    } else {
      if (modalContextMode === 'STANDALONE') {
        const codeValueString = `${baseOfficeCode}-${ab}.${cd}.1`;
        const updatedEntry = {
          office: activeTargetRow.office, programTitle: activeTargetRow.programTitle, projectName: activeTargetRow.projectName,
          activityName: 'N/A (Standalone Project Allotment Component)', implementingOffice: implOffice, startDate: `${startMonth} ${startYear}`,
          completionDate: `${endMonth} ${endYear}`, expectedOutput, fundingSource, ps: psVal, mooe: mooeVal, co: coVal, total: psVal + mooeVal + coVal,
          ccAdaptation: parseFloat(ccAdaptation) || 0, ccMitigation: parseFloat(ccMitigation) || 0, ccTypology
        };

        try {
          const res = await fetch('https://municipal-budget-backend.onrender.com/api/aip/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ originalRefCode: activeTargetRow.aipRefCode, updatedEntry: { ...updatedEntry, aipRefCode: codeValueString } })
          });
          if (res.ok) {
            setIsDetailsModalOpen(false);
            loadDependencies();
            alert("Activity #1 logged successfully!");
          }
        } catch (err) { alert("Error writing row parameter updates."); }

      } else {
        const nextEfIndex = matches.filter(m => m && m.activityName !== 'PENDING_CONFIG').length + 1;
        const codeValueString = `${baseOfficeCode}-${ab}.${cd}-${nextEfIndex}`;

        const appendPayload = [{
          aipRefCode: codeValueString, office: user?.department || 'Unknown', programTitle: activeTargetRow.programTitle, projectName: activeTargetRow.projectName,
          activityName: activityNameInput, implementingOffice: implOffice, startDate: `${startMonth} ${startYear}`,
          completionDate: `${endMonth} ${endYear}`, expectedOutput, fundingSource, ps: psVal, mooe: mooeVal, co: coVal, total: psVal + mooeVal + coVal,
          ccAdaptation: parseFloat(ccAdaptation) || 0, ccMitigation: parseFloat(ccMitigation) || 0, ccTypology
        }];

        try {
          const response = await fetch('https://municipal-budget-backend.onrender.com/api/aip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ entries: appendPayload })
          });
          if (response.ok) {
            setIsDetailsModalOpen(false);
            loadDependencies();
            alert(`Activity #${nextEfIndex} appended successfully!`);
          }
        } catch (err) { alert("Failed to append activity element line."); }
      }
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!entry || !entry.aipRefCode) return;
    const confirmation = window.confirm(`Permanently delete entry: "${entry.aipRefCode}"?`);
    if (!confirmation) return;
    try {
      const res = await fetch('https://municipal-budget-backend.onrender.com/api/aip/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aipRefCode: entry.aipRefCode })
      });
      if (res.ok) {
        alert("Entry successfully dropped from spreadsheet.");
        loadDependencies();
      }
    } catch (err) { alert("Deletion failure."); }
  };

  const getProjectTrackingStatus = (pName, progTitle) => {
    if (!pName || !progTitle) return 'PENDING';
    const cluster = aipLedger.filter(item => item && item.projectName === pName && item.programTitle === progTitle);
    if (cluster.length === 0) return 'PENDING';
    if (cluster.some(item => item?.activityName === 'PENDING_CONFIG')) return 'PENDING';
    if (cluster.some(item => item?.activityName && item.activityName.includes('N/A (Standalone Project)'))) return 'STANDALONE';
    return 'ACTIVITIES';
  };

  const exportToExcel = () => {
    let tableHtml = `
      <table border="1" style="border-collapse:collapse; font-family:'Segoe UI',system-ui,sans-serif; font-size:13px; color:#1e293b;">
        <thead>
          <tr>
            <th colspan="8" style="text-align:center; font-size:16px; font-weight:700; border:none; padding:3px 0;">Republic of the Philippines</th>
          </tr>
          <tr>
            <th colspan="8" style="text-align:center; font-size:14px; font-weight:600; border:none; padding:2px 0;">Province of Rizal</th>
          </tr>
          <tr>
            <th colspan="8" style="text-align:center; font-size:16px; font-weight:800; color:#1e3a8a; border:none; padding:3px 0;">MUNICIPALITY OF PILILLA</th>
          </tr>
          <tr><th colspan="8" style="border:none;">&nbsp;</th></tr>
          <tr>
            <th colspan="8" style="text-align:center; font-size:15px; font-weight:800; border:none; padding:4px 0;">CY 2027 ANNUAL INVESTMENT PROGRAM</th>
          </tr>
          <tr>
            <th colspan="8" style="text-align:center; font-size:13px; font-weight:700; border:none; color:#475569; padding:2px 0;">DETAILS OF PROGRAM/PROJECT/ACTIVITY BY SECTOR</th>
          </tr>
          <tr>
            <th colspan="8" style="text-align:center; font-size:14px; font-weight:700; border:none; padding:3px 0;">Budget Year 2027</th>
          </tr>
          <tr><th colspan="8" style="border:none;">&nbsp;</th></tr>
          <tr>
            <th colspan="8" style="text-align:left; font-size:13px; font-weight:700; border:none; padding:4px 0;">SECTOR: ___________________________</th>
          </tr>
          <tr><th colspan="8" style="border:none;">&nbsp;</th></tr>
          <tr style="background-color:#f1f5f9; font-weight:700; text-align:center; border:1px solid #cbd5e1;">
            <th style="padding:10px 6px; border:1px solid #cbd5e1;">AIP Reference Code</th>
            <th style="padding:10px 6px; border:1px solid #cbd5e1; text-align:left;">PPA Description Node Target</th>
            <th style="padding:10px 6px; border:1px solid #cbd5e1; text-align:left;">Expected Output Scope</th>
            <th style="padding:10px 6px; border:1px solid #cbd5e1; text-align:left;">Funding Source</th>
            <th style="padding:10px 6px; border:1px solid #cbd5e1; text-align:right;">PS Allotment</th>
            <th style="padding:10px 6px; border:1px solid #cbd5e1; text-align:right;">MOOE Allotment</th>
            <th style="padding:10px 6px; border:1px solid #cbd5e1; text-align:right;">CO Allotment</th>
            <th style="padding:10px 6px; border:1px solid #cbd5e1; text-align:right;">Total Cost Ceiling</th>
          </tr>
        </thead>
        <tbody>
    `;

    const uniqueProgs = [...new Set(aipLedger.map(item => item?.programTitle).filter(Boolean))];
    uniqueProgs.forEach(prog => {
      tableHtml += `
        <tr style="background-color:#e0f2fe; font-weight:800; font-size:14px;">
          <td colspan="8" style="padding:10px 8px; color:#1e3a8a; border:1px solid #cbd5e1;">🎯 PROGRAM: ${prog.toUpperCase()}</td>
        </tr>
      `;

      const progItems = aipLedger.filter(item => item && item.programTitle === prog);
      const uniqueProjs = [...new Set(progItems.map(item => item?.projectName).filter(Boolean))];

      uniqueProjs.forEach(proj => {
        tableHtml += `
          <tr style="background-color:#f8fafc; font-weight:700; font-size:13px;">
            <td colspan="8" style="padding:8px 8px 8px 24px; color:#334155; border:1px solid #cbd5e1;">📁 PROJECT: ${proj}</td>
          </tr>
        `;

        const actItems = progItems.filter(item => item && item.projectName === proj && item.activityName !== 'PENDING_CONFIG');
        actItems.forEach(act => {
          tableHtml += `
            <tr>
              <td style="padding:6px; border:1px solid #e2e8f0; text-align:center; font-family:monospace; font-weight:700; color:#0369a1;">${act.aipRefCode}</td>
              <td style="padding:6px; border:1px solid #e2e8f0; padding-left:40px; font-weight:600; color:#1e293b;">🌿 ${act.activityName}</td>
              <td style="padding:6px; border:1px solid #e2e8f0; color:#475569;">${act.expectedOutput || '—'}</td>
              <td style="padding:6px; border:1px solid #e2e8f0; color:#475569;">${act.fundingSource || '—'}</td>
              <td style="padding:6px; border:1px solid #e2e8f0; text-align:right; font-family:monospace;">₱${act.ps.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
              <td style="padding:6px; border:1px solid #e2e8f0; text-align:right; font-family:monospace;">₱${act.mooe.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
              <td style="padding:6px; border:1px solid #e2e8f0; text-align:right; font-family:monospace;">₱${act.co.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
              <td style="padding:6px; border:1px solid #e2e8f0; text-align:right; font-family:monospace; font-weight:700; color:#166534; background-color:#f0fdf4;">₱${act.total.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            </tr>
          `;
        });
      });
    });

    tableHtml += `</tbody></table>`;
    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIP_Grouped_Report_2027.xls`;
    a.click();
  };

  const triggerPdfPrintLayout = () => {
    window.print();
  };

  const uniqueProgramsInAip = [...new Set(aipLedger.map(item => item?.programTitle).filter(Boolean))];

  return (
    <div className="main-content-stream" style={{ width: '100vw', maxWidth: '100%', padding: '0 1rem', fontFamily: '"Inter", sans-serif', color: '#1e293b', boxSizing: 'border-box' }}>
      
      {/* FULL-WIDTH TOP ACTION BAR HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Annual Investment Program (AIP) Workspace</h2>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>Formulating yearly activity actions and micro-allotment funding frameworks.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '6px' }} onClick={exportToExcel}>📥 Export Excel (.xlsx)</button>
          <button className="btn-secondary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '6px', backgroundColor: '#475569', color: '#fff' }} onClick={triggerPdfPrintLayout}>🖨️ Print / Save PDF</button>
          <button className="btn-primary" style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', fontWeight: '600', borderRadius: '6px' }} onClick={handleOpenCreateModal}>+ Add Project / Activity</button>
        </div>
      </div>

      {/* STRETCHED COMPACT ACCORDION TABULAR MATRIX */}
      <div style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '1.5rem', boxSizing: 'border-box', overflowX: 'auto' }}>
        {uniqueProgramsInAip.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '3rem 0', fontStyle: 'italic' }}>No Annual Investment records found for this office.</p>
        ) : (
          <table className="budget-table" style={{ width: '100%', tableLayout: 'auto', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '800', color: '#334155' }}>AIP Reference Key / PPA Description Node</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '700', color: '#334155', width: '140px' }}>Timeline Schedule</th>
                <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: '700', color: '#334155', width: '150px' }}>Funding Source</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600', width: '90px' }}>PS</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600', width: '90px' }}>MOOE</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '600', width: '90px' }}>CO</th>
                <th style={{ padding: '12px 10px', textAlign: 'right', fontWeight: '700', color: '#166534', width: '120px' }}>Total Ceiling</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', width: '100px' }}>Climate Marker</th>
                <th style={{ padding: '12px 10px', textAlign: 'center', fontWeight: '700', width: '170px' }}>Action Actions</th>
              </tr>
            </thead>
            <tbody>
              {uniqueProgramsInAip.map((progTitle, pIdx) => {
                const isProgExpanded = expandedPrograms.includes(progTitle);
                const progItems = aipLedger.filter(item => item && item.programTitle === progTitle);
                const uniqueProjectsInProg = [...new Set(progItems.map(item => item?.projectName).filter(Boolean))];

                return (
                  <Fragment key={pIdx}>
                    {/* MASTER LEVEL 1 ACCORDION BANNER ROW: PROGRAMS */}
                    <tr style={{ cursor: 'pointer', background: '#e0f2fe', transition: 'background 0.15s ease' }} onClick={() => toggleProgramAccordion(progTitle)}>
                      <td colSpan="9" style={{ padding: '12px 10px', fontWeight: '800', color: '#0369a1', borderBottom: '1px solid #cbd5e1' }}>
                        <span style={{ marginRight: '8px', fontSize: '0.9rem' }}>{isProgExpanded ? '▼' : '▶'}</span>
                        🎯 PROGRAM LINKAGE TRACK: {progTitle.toUpperCase()}
                      </td>
                    </tr>

                    {isProgExpanded && uniqueProjectsInProg.map((pName, projIdx) => {
                      const isProjExpanded = expandedProjects.includes(pName);
                      const projectRows = progItems.filter(item => item && item.projectName === pName);
                      const trackingStatus = getProjectTrackingStatus(pName, progTitle);

                      return (
                        <Fragment key={projIdx}>
                          {/* SUB-LEVEL 2 ACCORDION BANNER ROW: COMPONENT PROJECTS */}
                          <tr style={{ cursor: 'pointer', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }} onClick={() => toggleProjectAccordion(pName)}>
                            <td colSpan="7" style={{ padding: '10px 10px 10px 2.5rem', fontWeight: '700', color: '#334155' }}>
                              <span style={{ marginRight: '6px', fontSize: '0.8rem', color: '#64748b' }}>{isProjExpanded ? '▼' : '▶'}</span>
                              📁 COMPONENT: {pName}
                            </td>
                            <td colSpan="2" style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                              {trackingStatus === 'PENDING' && (
                                <button className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem', background: '#fffbeb', border: '1px solid #fde68a', color: '#b45309', fontWeight: '700', borderRadius: '4px' }} onClick={(e) => { e.stopPropagation(); handleConfigureMetricsAction(projectRows[0], 'STANDALONE'); }}>
                                  ⚙️ Configure Specs
                                </button>
                              )}
                              {trackingStatus === 'STANDALONE' && (
                                <button className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '4px' }} onClick={(e) => { e.stopPropagation(); handleConfigureMetricsAction(projectRows[0], 'ACTIVITY'); }}>
                                  ➕ Split Sub-Activity
                                </button>
                              )}
                              {trackingStatus === 'ACTIVITIES' && (
                                <button className="btn-primary" style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: '700', borderRadius: '4px' }} onClick={(e) => { e.stopPropagation(); handleConfigureMetricsAction(projectRows[0], 'ACTIVITY'); }}>
                                  ➕ Append Activity
                                </button>
                              )}
                            </td>
                          </tr>

                          {/* SUB-LEVEL 3 GRANULAR DATA RECORDS LOOP */}
                          {isProjExpanded && projectRows.map((row, rIdx) => {
                            if (row.activityName === 'PENDING_CONFIG') {
                              return (
                                <tr key={rIdx} style={{ background: '#fffdf5' }}>
                                  <td colSpan="9" style={{ padding: '1rem 0 1rem 4.5rem', color: '#b45309', fontStyle: 'italic', fontWeight: '500' }}>
                                    ⚠️ Awaiting architectural specifications loop log config. Press "Configure Specs" above to establish parameters.
                                  </td>
                                </tr>
                              );
                            }

                            const isStandaloneMode = row.activityName.includes('N/A (Standalone Project)');
                            return (
                              <tr key={rIdx} style={{ borderBottom: '1px solid #cbd5e1', hover: { background: '#f8fafc' } }}>
                                <td style={{ padding: '10px 10px 10px 4.5rem', verticalAlign: 'middle' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#0284c7', fontSize: '0.78rem' }}>{row.aipRefCode}</span>
                                    <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.85rem' }}>
                                      {isStandaloneMode ? '📦 STANDALONE COMPONENT OBJECT' : `🌿 Act: ${row.activityName}`}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                      Outputs: <span style={{ fontWeight: '500', color: '#475569' }}>{row.expectedOutput || '—'}</span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', marginTop: '2px' }}>
                                      Impl: {row.implementingOffice || '—'}
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '10px', verticalAlign: 'middle', color: '#475569', fontWeight: '500', fontSize: '0.8rem' }}>
                                  📅 {row.startDate || '—'} <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '1px' }}>until {row.completionDate || '—'}</div>
                                </td>
                                <td style={{ padding: '10px', verticalAlign: 'middle', color: '#334155', fontWeight: '600', fontSize: '0.8rem' }}>
                                  {row.fundingSource || '—'}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '500', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                                  ₱{(row.ps || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '500', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                                  ₱{(row.mooe || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '500', fontFamily: 'monospace', verticalAlign: 'middle' }}>
                                  ₱{(row.co || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'right', fontWeight: '700', color: '#166534', fontFamily: 'monospace', backgroundColor: '#f0fdf4', verticalAlign: 'middle', fontSize: '0.88rem' }}>
                                  ₱{(row.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                                  {row.ccTypology ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 5px', borderRadius: '4px', fontWeight: '700', fontFamily: 'monospace' }}>
                                        {row.ccTypology}
                                      </span>
                                      <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: '600' }}>
                                        ₱{((row.ccAdaptation || 0) + (row.ccMitigation || 0)).toLocaleString()}
                                      </span>
                                    </div>
                                  ) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>—</span>}
                                </td>
                                <td style={{ padding: '10px', textAlign: 'center', verticalAlign: 'middle' }}>
                                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                                    <button className="btn-secondary" style={{ padding: '3px 6px', fontSize: '0.75rem', fontWeight: '700', border: 'none', borderRadius: '4px' }} onClick={() => handleConfigureMetricsAction(row, 'EDIT')}>Edit</button>
                                    <button className="btn-danger" style={{ padding: '3px 6px', fontSize: '0.75rem', fontWeight: '700', border: 'none', borderRadius: '4px' }} onClick={() => handleDeleteEntry(row)}>Del</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      );
                    })}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL WINDOW 1: COMPONENT SHELL STEP 1 INITIAL GENERATOR */}
      {isProjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', borderRadius: '10px', padding: '1.7rem' }}>
            <div className="modal-header-section" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>Create Baseline PPA Project Frame</h2>
              <p className="label-helper" style={{ marginTop: '4px' }}>Linkage tracking shell mapping investment plans down into yearly budgets.</p>
            </div>
            <form onSubmit={handleCreateProjectShell}>
              <div className="form-field-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Select Parent LDIP Linkage Track</label>
                <select value={programTitle} onChange={(e) => setProgramTitle(e.target.value)} required style={{ padding: '0.6rem', fontSize: '0.9rem' }}>
                  <option value="" disabled>Choose authorized LDIP ledger baseline track entry...</option>
                  {ldipPrograms.filter(p => p !== null).map(p => <option key={p.id || Math.random()} value={p.title}>🎯 {p.title}</option>)}
                </select>
              </div>
              <div className="form-field-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Project Component Name Title</label>
                <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="e.g., Expansion of Local Command Hub Facilities" required style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }} onClick={() => setIsProjectModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>Generate Project Row</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL WINDOW 2: GRANULAR METRICS AND EXPENDITURES ASSIGNMENT DIALOG */}
      {isDetailsModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', borderRadius: '10px', padding: '1.75rem', overflowY: 'auto' }}>
            <div className="modal-header-section" style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', margin: 0 }}>
                {modalContextMode === 'STANDALONE' && 'Configure Standalone Project Metrics'}
                {modalContextMode === 'ACTIVITY' && 'Log New Project Activity Node'}
                {modalContextMode === 'EDIT' && 'Modify AIP Configuration Details'}
              </h2>
              <p className="label-helper" style={{ marginTop: '4px' }}>Target Context Component: <strong style={{ color: '#2563eb' }}>{activeTargetRow?.projectName || 'Unassigned'}</strong></p>
            </div>
            <form onSubmit={handleCommitDetailsForm}>
              
              {(modalContextMode === 'ACTIVITY' || modalContextMode === 'EDIT') && (
                <div className="form-field-group">
                  <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Activity Action Node Title Description</label>
                  <input type="text" value={activityNameInput} onChange={(e) => setActivityNameInput(e.target.value)} placeholder="e.g., Phase 1 Triage Area Structural Retrofitting Operations" required style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <div className="form-field-group">
                  <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Estimated Execution Start Date</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <select value={startMonth} onChange={(e) => setStartMonth(e.target.value)} style={{ padding: '0.5rem' }}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <select value={startYear} onChange={(e) => setStartYear(e.target.value)} style={{ padding: '0.5rem' }}>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                </div>
                <div className="form-field-group">
                  <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Projected Operational Completion Date</label>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <select value={endMonth} onChange={(e) => setEndMonth(e.target.value)} style={{ padding: '0.5rem' }}>{MONTHS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    <select value={endYear} onChange={(e) => setEndYear(e.target.value)} style={{ padding: '0.5rem' }}>{YEARS.map(y => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                </div>
              </div>

              <div className="form-field-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Expected Target Output / Deliverable Scope</label>
                <input type="text" value={expectedOutput} onChange={(e) => setExpectedOutput(e.target.value)} placeholder="e.g., 1 fully localized structural asset operational" required style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
              </div>

              <div className="form-field-group">
                <label style={{ fontWeight: '700', fontSize: '0.85rem' }}>Primary Allotted Funding Source</label>
                <input type="text" value={fundingSource} onChange={(e) => setFundingSource(e.target.value)} placeholder="e.g., 20% Municipal Development Fund, Revenue Share" required style={{ padding: '0.6rem', fontSize: '0.9rem' }} />
              </div>

              <label style={{ color: '#2563eb', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', display: 'block', fontWeight: '800', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                FINANCIAL CAPITAL ALLOTMENTS (IN PESOS)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-field-group"><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>PS Allotment</label><input type="number" placeholder="0.00" value={ps} onWheel={(e) => e.target.blur()} onChange={(e) => setPs(e.target.value)} style={{ padding: '0.5rem' }} /></div>
                <div className="form-field-group"><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>MOOE Allotment</label><input type="number" placeholder="0.00" value={mooe} onWheel={(e) => e.target.blur()} onChange={(e) => setMooe(e.target.value)} style={{ padding: '0.5rem' }} /></div>
                <div className="form-field-group"><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>CO Allotment</label><input type="number" placeholder="0.00" value={co} onWheel={(e) => e.target.blur()} onChange={(e) => setCo(e.target.value)} style={{ padding: '0.5rem' }} /></div>
              </div>

              <label style={{ color: '#166534', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', display: 'block', fontWeight: '800', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.03em', marginTop: '1.5rem', marginBottom: '0.75rem' }}>CLIMATE RESPONSE ALLOCATIONS (IN PESOS)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                <div className="form-field-group"><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Adaptation Funding</label><input type="number" placeholder="0.00" value={ccAdaptation} onWheel={(e) => e.target.blur()} onChange={(e) => setCcAdaptation(e.target.value)} style={{ padding: '0.5rem' }} /></div>
                <div className="form-field-group"><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Mitigation Funding</label><input type="number" placeholder="0.00" value={ccMitigation} onWheel={(e) => e.target.blur()} onChange={(e) => setCcMitigation(e.target.value)} style={{ padding: '0.5rem' }} /></div>
                <div className="form-field-group"><label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Typology Code Symbol</label><input type="text" placeholder="e.g., 2.3.1.2" value={ccTypology} onChange={(e) => setCcTypology(e.target.value)} style={{ padding: '0.5rem' }} /></div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button type="button" className="btn-secondary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.88rem' }} onClick={() => setIsDetailsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ padding: '0.55rem 1.5rem', fontSize: '0.88rem' }}>Commit Specifications</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}