import { useState, useEffect, Fragment } from 'react';
import * as XLSX from 'xlsx'; // NEW: Excel Parser Utility Package

// GLOBAL SOURCE OF TRUTH: RECONFIGURED VIA THE OFFICIAL MUNICIPAL OFFICE DIRECTORY REGISTRY
const SECTOR_MAPPING = {
  "Office of the Municipal Mayor": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-01" },
  "Office of the Municipal Vice Mayor": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-02" },
  "Office of the Sangguniang Bayan Members": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-03" },
  "Office of the Secretary to the Sangguniang Bayan": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-04" },
  "Office of the Municipal Treasurer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-05" },
  "Office of the Municipal Treasurer (MTO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-05" },
  "Office of the Municipal Assessor": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-06" },
  "Office of the Municipal Accountant": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-07" },
  "Office of the Municipal Budget Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-08" },
  "Office of the Municipal Planning and Development Coordinator": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-09" },
  "Office of the Municipal Planning and Development Coordinator (MPDO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-09" },
  "Office of the Municipal Engineer/Building Official": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-10" },
  "Office of the Municipal Health Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-11" },
  "Office of the Municipal Health Officer (MHO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-11" },
  "Office of the Municipal Civil Registrar": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-1-12" },
  "Office of the Municipal Administrator": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-2-01" },
  "Office of the Municipal Legal Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-2-02" },
  "Office of the Municipal Information Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-2-06" },
  "Office of the Command Center": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-02" },
  "Office of the Community Affairs": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-03" },
  "Office of the Cooperative Development Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-04" },
  "Office of the Culture and the Arts": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-05" },
  "Office of the General Services Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-07" },
  "Office of the General Services Officer (GSO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-07" },
  "Office of the Human Resource and Management Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-08" },
  "Office of the Human Resource and Management Officer (HRMO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-08" },
  "Office of the Municipal Risk Reduction Management Officer": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-12" },
  "Office of the Municipal Risk Reduction Management Officer (MDRRMO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-12" },
  "Bureau of Fire Protection (BFP)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-17" },
  "Civil Society Organization (CSO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-18" },
  "Commission on Election (COMELEC)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-19" },
  "Department of the Interior and Local Government (DILG)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-22" },
  "Municipal Trial Court (MTC)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-23" },
  "Philippine National Police (PNP)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-24" },
  "Post Office (PO)": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-25" },
  "Sports and Recreation": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-21" },
  "PROVISION FOR OTHER GEN. PUBLIC SERVICES": { sectorName: "General Services Sector", sectorCode: "1000", officeCode: "1000-000-3-3-24" },

  // === SOCIAL SERVICES SECTOR (3000) ===
  "Office of the Municipal Social Welfare and Development Officer": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-2-05" },
  "Office of the Municipal Social Welfare and Development Officer (MSWDO)": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-2-05" },
  "Office of the Gender And Development": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-06" },
  "Office of the Gender And Development (GAD)": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-06" },
  "Office of the Local Youth Development Officer": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-09" },
  "Office of the Local Youth Development Officer (LYDO)": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-09" },
  "Office of the Municipal Anti-Drug Abuse Council": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-11" },
  "Office of the Municipal Anti-Drug Abuse Council (MADAC)": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-11" },
  "Office of the Persons with Disability Affairs Officer": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-14" },
  "Office of the Persons with Disability Affairs Officer (PDAO)": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-14" },
  "Department of Education (DepEd)": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-20" },
  "SPORTS AND RECREATION": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-23" },
  "PROVISION FOR OTHER SOCIAL DEVELOPMENT": { sectorName: "Social Services Sector", sectorCode: "3000", officeCode: "3000-000-3-3-25" },

  // === ECONOMIC SERVICES SECTOR (8000) ===
  "Office of the Municipal Agricultural Officer": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-2-03" },
  "Office of the Municipal Agricultural Officer (DA)": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-2-03" },
  "Office of the Municipal Environment and Natural Resources": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-2-04" },
  "Office of the Municipal Environment and Natural Resources (MENRO)": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-2-04" },
  "Office of the Business Permit and Licensing Officer": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-01" },
  "Office of the Business Permit and Licensing Officer (BPLO)": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-01" },
  "Office of the Market": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-10" },
  "Office of the Municipal Tourism": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-13" },
  "Office of the Public Employment Service Officer": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-15" },
  "Office of the Public Employment Service Officer (PESO)": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-15" },
  "Office of the Technical Education and Skills Development Authority": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-16" },
  "Office of the Technical Education and Skills Development Authority (TESDA)": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-16" },
  "Department of the Agrarian Reform (DAR)": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-21" },
  "PROVISION FOR OTHER ECONOMIC DEVELOPMENT": { sectorName: "Economic Services Sector", sectorCode: "8000", officeCode: "8000-000-3-3-26" },

  // === OTHER SERVICES (9000) ===
  "SPECIAL PURPOSE APPROPRIATION": { sectorName: "Other Services", sectorCode: "9000", officeCode: "9000-000-3-3-01" }
};

export default function LdipPage({ user }) {
  const [baseSeasonYear, setBaseSeasonYear] = useState(() => {
    return Number(localStorage.getItem('ldip_base_season')) || 2026;
  });

  const year1 = baseSeasonYear + 1;
  const year2 = baseSeasonYear + 2;
  const year3 = baseSeasonYear + 3;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ldipEntries, setLdipEntries] = useState([]);

  // State arrays for collapsible rows tracking
  const [aipEntries, setAipEntries] = useState([]);
  const [budgetEntries, setBudgetEntries] = useState([]);
  const [expandedPrograms, setExpandedPrograms] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState([]);

  // State identifiers for Edit tracking modes
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeEditingEntry, setActiveEditingEntry] = useState(null);

  // Form Field Tracking States
  const [programTitle, setProgramTitle] = useState('');
  const [projectName, setProjectName] = useState(''); 
  const [activityName, setActivityName] = useState(''); 
  const [programDescription, setProgramDescription] = useState('');
  const [targetY1, setTargetY1] = useState(false);
  const [targetY2, setTargetY2] = useState(false);
  const [targetY3, setTargetY3] = useState(false);
  const [requiredBudget, setRequiredBudget] = useState('');

  // OPTIMIZATION FLOW STATES: Handles Step-by-Step Checkout Flow & Selection Card Flags
  const [wizardStep, setWizardStep] = useState(1);
  const [isNewProgram, setIsNewProgram] = useState(false);
  const [isNewProject, setIsNewProject] = useState(false);
  const [isNewActivity, setIsNewActivity] = useState(false);

  const assignedSector = SECTOR_MAPPING[user.department] || { sectorName: "UNASSIGNED", sectorCode: "0000", officeCode: "0000-000-0-0-00" };

  // Extracted Loader: Fetches the primary LDIP entries and cross-references them with AIP and Budget databases
  const fetchCloudEntries = async () => {
    try {
      const dept = user?.department || '';
      
      const response = await fetch(`https://municipal-budget-backend.onrender.com/api/ldip/${encodeURIComponent(dept)}`);
      if (response.ok) {
        const data = await response.json();
        setLdipEntries(data);
      } else {
        console.error("Server responded with an entry lookup failure code.");
      }

      const aipRes = await fetch(`https://municipal-budget-backend.onrender.com/api/aip/${encodeURIComponent(dept)}`);
      if (aipRes.ok) {
        const data = await aipRes.json();
        setAipEntries(Array.isArray(data) ? data.filter(x => x !== null) : []);
      }

      const budgetRes = await fetch(`https://municipal-budget-backend.onrender.com/api/budget/${encodeURIComponent(dept)}`);
      if (budgetRes.ok) {
        const data = await budgetRes.json();
        setBudgetEntries(Array.isArray(data) ? data.filter(x => x !== null) : []);
      }
    } catch (error) {
      console.error("Failed to load live spreadsheet rows from backend connection:", error);
    }
  };

  useEffect(() => {
    fetchCloudEntries();
  }, [user.department]);

  const toggleProgramCollapse = (programTitle) => {
    if (expandedPrograms.includes(programTitle)) {
      setExpandedPrograms(expandedPrograms.filter(t => t !== programTitle));
    } else {
      setExpandedPrograms([...expandedPrograms, programTitle]);
    }
  };

  const toggleProjectCollapse = (programTitle, projectName) => {
    const key = `${programTitle}|||${projectName}`;
    if (expandedProjects.includes(key)) {
      setExpandedProjects(expandedProjects.filter(k => k !== key));
    } else {
      setExpandedProjects([...expandedProjects, key]);
    }
  };

  const handleActivateNewSeason = () => {
    const currentCalendarYear = 2026;
    localStorage.setItem('ldip_base_season', currentCalendarYear.toString());
    setBaseSeasonYear(currentCalendarYear);
    alert(`LDIP Planning Cycle activated! Targeted window configured for: ${currentCalendarYear + 1}, ${currentCalendarYear + 2}, and ${currentCalendarYear + 3}.`);
  };

  // Setup layout for creating a clean entry
  const handleOpenCreateModal = () => {
    setIsEditMode(false);
    setActiveEditingEntry(null);
    setProgramTitle('');
    setProjectName('');
    setActivityName('');
    setProgramDescription('');
    setTargetY1(false);
    setTargetY2(false);
    setTargetY3(false);
    setRequiredBudget('');
    setWizardStep(1); 
    setIsNewProgram(false);
    setIsNewProject(false);
    setIsNewActivity(false);
    setIsModalOpen(true);
  };

  // Initialize form inputs using existing row parameters to enable Edit Mode
  const handleOpenEditModal = (entry) => {
    setIsEditMode(true);
    setActiveEditingEntry(entry);
    setProgramTitle(entry.title);
    setProjectName('N/A (Editing Master Row Container)');
    setActivityName('N/A (Editing Master Row Container)');
    setProgramDescription(entry.description);
    setTargetY1(entry.targets.includes(year1.toString()));
    setTargetY2(entry.targets.includes(year2.toString()));
    setTargetY3(entry.targets.includes(year3.toString()));
    setRequiredBudget(entry.budget);
    setWizardStep(3); 
    setIsModalOpen(true);
  };

  // Triggers verify alert prompt, removing matching index from database log safely
  const handleDeleteEntry = async (entry) => {
    const confirmation = window.confirm(`Are you sure you want to permanently delete: "${entry.title}"?`);
    if (!confirmation) return;

    try {
      const response = await fetch('https://municipal-budget-backend.onrender.com/api/ldip/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          office: entry.office,
          title: entry.title,
          timestamp: entry.timestamp
        })
      });

      if (response.ok) {
        alert("Entry successfully dropped from cloud ledger.");
        fetchCloudEntries(); // Force data redraw
      } else {
        alert("Failed to delete target entry.");
      }
    } catch (error) {
      alert("Error reaching backend server during delete request.");
    }
  };

  // Unified controller running either Create or safe Edit dispatch overrides
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!targetY1 && !targetY2 && !targetY3) {
      alert("Please choose at least one Target Implementation Year from the options panel.");
      return;
    }

    const implementationYears = [];
    if (targetY1) implementationYears.push(year1.toString());
    if (targetY2) implementationYears.push(year2.toString());
    if (targetY3) implementationYears.push(year3.toString());

    if (isEditMode && activeEditingEntry) {
      const payload = {
        originalOffice: activeEditingEntry.office,
        originalTitle: activeEditingEntry.title,
        originalTimestamp: activeEditingEntry.timestamp,
        updatedEntry: {
          office: activeEditingEntry.office,
          sectorCode: activeEditingEntry.sectorCode,
          sectorName: activeEditingEntry.sectorName,
          title: programTitle,
          description: programDescription,
          targets: implementationYears,
          budget: parseFloat(requiredBudget) || 0
        }
      };

      try {
        const response = await fetch('https://municipal-budget-backend.onrender.com/api/ldip/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          setIsModalOpen(false);
          fetchCloudEntries(); 
          alert("Success! Entry updated directly inside Google Sheets.");
        } else {
          alert("Failed to update database entry.");
        }
      } catch (error) {
        alert("Server connection dropped during data update.");
      }

    } else {
      const singleManualRow = {
        programId: "M", 
        program: programTitle,
        projectId: "1",
        project: projectName || "General Project Allotment Component",
        activityId: "1",
        activities: activityName || "General Administrative Operation Node",
        office: user.department,
        startingDate: `${year1}-01-01`, 
        completionDate: `${year3}-12-31`, 
        expectedOutputs: "Manually submitted baseline form target allocation.",
        fundingSource: "General Municipal Fund Allotment Allocation",
        ps: 0,
        mooe: 0,
        co: parseFloat(requiredBudget) || 0,
        total: parseFloat(requiredBudget) || 0,
        climateAdaptation: 0,
        climateMitigation: 0,
        ccTypologyCode: "",
        sectorCode: assignedSector.sectorCode,
        sectorName: assignedSector.sectorName,
        officeCode: assignedSector.officeCode,
        timestamp: new Date().toLocaleString()
      };

      try {
        const response = await fetch('https://municipal-budget-backend.onrender.com/api/ldip/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            office: user.department,
            rows: [singleManualRow]
          })
        });

        if (response.ok) {
          setIsModalOpen(false);
          fetchCloudEntries(); 
          alert("Success! Manual form wizard has auto-populated both LDIP and AIP worksheet ledgers.");
        } else {
          const data = await response.json();
          alert(`Cloud Connection Error: ${data.message}`);
        }
      } catch (error) {
        console.error("LDIP server connection dropped:", error);
        alert("Failed to synchronize with backend server ledger.");
      }
    }
  };

  // Processes the strict 18-column flat spreadsheet uploader matrix
  const handleExcelImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const binaryString = evt.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJsonData = XLSX.utils.sheet_to_json(worksheet);

        if (rawJsonData.length === 0) {
          alert("The uploaded spreadsheet file appears to be completely empty.");
          return;
        }

        const anchorKeys = Object.keys(rawJsonData[0]);
        const validationBlueprint = ["Program", "Project", "Activities", "TOTAL"];
        const structuralFlaws = validationBlueprint.filter(header => !anchorKeys.includes(header));

        if (structuralFlaws.length > 0) {
          alert(`Structural Format Mismatch! The imported file is missing required blueprint titles: ${structuralFlaws.join(', ')}. Please confirm headers match exactly.`);
          return;
        }

        const parseExcelDate = (val) => {
          if (!val) return '';
          if (typeof val === 'number') {
            const dateObj = new Date(Math.round((val - 25569) * 86400 * 1000));
            const yyyy = dateObj.getUTCFullYear();
            const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getUTCDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}`;
          }
          return String(val);
        };

        // Extract Clean File Name to use as the true registered Office matching parameter
        let parsedOfficeName = file.name.replace(/\.[^/.]+$/, "").replace(/\s*-\s*Sheet.*$/, "").trim();

        // FORWARD-FILL ACCORDION TRACKING LOGIC
        let currentProgramId = '';
        let currentProgram = '';
        let currentProjectId = '';
        let currentProject = '';
        let currentActivityId = '';
        let currentActivities = '';
        let currentOfficeCode = '';

        const synchronizedPayload = [];

        for (let i = 0; i < rawJsonData.length; i++) {
          const row = rawJsonData[i];

          if (row['Program'] !== undefined && row['Program'] !== null && String(row['Program']).trim() !== '') {
            currentProgram = String(row['Program']).trim();
          }
          if (row['Program ID'] !== undefined && row['Program ID'] !== null && String(row['Program ID']).trim() !== '') {
            currentProgramId = String(row['Program ID']).trim();
          }

          if (row['Project'] !== undefined && row['Project'] !== null && String(row['Project']).trim() !== '') {
            currentProject = String(row['Project']).trim();
          }
          if (row['Project ID'] !== undefined && row['Project ID'] !== null && String(row['Project ID']).trim() !== '') {
            currentProjectId = String(row['Project ID']).trim();
          }

          if (row['Activities'] !== undefined && row['Activities'] !== null && String(row['Activities']).trim() !== '') {
            currentActivities = String(row['Activities']).trim();
          }
          if (row['Activity ID'] !== undefined && row['Activity ID'] !== null && String(row['Activity ID']).trim() !== '') {
            currentActivityId = String(row['Activity ID']).trim();
          }

          if (!currentProgram && !currentProject) continue;
          if (currentProgram.toLowerCase() === 'program' || currentProject.toLowerCase() === 'project') continue;

          // EXPLICIT INSTRUCTION 1: ONLY use the Office Code in the Excel column rows or forward-fill group blocks
          const rawOfficeCode = row['Office Code'] || row['Office CODE'] || row['OFFICE CODE'] || row['Office code'] || '';
          if (rawOfficeCode !== undefined && rawOfficeCode !== null && String(rawOfficeCode).trim() !== '') {
            currentOfficeCode = String(rawOfficeCode).trim();
          }

          const officeCode = currentOfficeCode || '3000-000-3-3-11';

          // EXPLICIT INSTRUCTION 3: Extract Sector specifications strictly based on the first 4 numerical digits
          let rowSectorCode = "3000";
          let rowSectorName = "Social Services Sector";
          if (officeCode && officeCode.length >= 4) {
            const prefix = officeCode.split('-')[0];
            if (prefix === "1000") {
              rowSectorCode = "1000";
              rowSectorName = "General Services Sector";
            } else if (prefix === "3000") {
              rowSectorCode = "3000";
              rowSectorName = "Social Services Sector";
            } else if (prefix === "8000") {
              rowSectorCode = "8000";
              rowSectorName = "Economic Services Sector";
            } else if (prefix === "9000") {
              rowSectorCode = "9000";
              rowSectorName = "Other Services";
            }
          }

          synchronizedPayload.push({
            programId: currentProgramId,
            program: currentProgram,
            projectId: currentProjectId,
            project: currentProject,
            activityId: currentActivityId,
            activities: currentActivities,
            office: parsedOfficeName, 
            startingDate: parseExcelDate(row['Starting Date']), 
            completionDate: parseExcelDate(row['Completion Date']), 
            expectedOutputs: row['Expected Outputs'] || '',
            fundingSource: row['Funding Source'] || '',
            ps: parseFloat(row['Personal Services (PS)']) || 0,
            mooe: parseFloat(row['Maintenance & Other Operating Expenses (MOOE)']) || 0,
            co: parseFloat(row['Capital Outlay (CO)']) || 0,
            total: parseFloat(row['TOTAL']) || 0,
            climateAdaptation: parseFloat(row['Climate Change and Adaptation']) || 0,
            climateMitigation: parseFloat(row['Climate Change Mitigation']) || 0,
            ccTypologyCode: row['CC TYPOLOGY CODE'] || '',
            sectorCode: rowSectorCode,
            sectorName: rowSectorName,
            officeCode: officeCode, 
            timestamp: new Date().toLocaleString()
          });
        }

        const response = await fetch('https://municipal-budget-backend.onrender.com/api/ldip/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            office: parsedOfficeName,
            rows: synchronizedPayload
          })
        });

        if (response.ok) {
          alert(`Success! Auto-populated and registered ${synchronizedPayload.length} nested matrix records directly into the live LDIP and AIP ledgers.`);
          fetchCloudEntries(); 
        } else {
          const errResponse = await response.json();
          alert(`Database Ledger Import Rejection: ${errResponse.message || 'Server structural verification error.'}`);
        }
      } catch (err) {
        console.error("Excel mapping breakdown loop intercept failure:", err);
        alert("An error occurred trying to parse data inside this spreadsheet. Check for workbook corruption.");
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; 
  };

  const getBadgeClass = (code) => {
    if (code === "1000") return "badge badge-general";
    if (code === "3000") return "badge badge-social"; 
    return "badge badge-economic";
  };

  // DYNAMIC COMPILERS: Pulls existing unique parameters directly from active database state logs to feed shopping tile cards
  const uniqueMasterPrograms = Array.from(new Set(ldipEntries.map(e => e.title).filter(Boolean)));
  
  const filteredProjectOptions = Array.from(new Set(
    aipEntries
      .filter(a => a && a.programTitle && programTitle && a.programTitle.trim().toLowerCase() === programTitle.trim().toLowerCase())
      .map(a => a.projectName)
      .filter(Boolean)
  ));

  const filteredActivityOptions = Array.from(new Set(
    aipEntries
      .filter(a => a && a.projectName && projectName && a.projectName.trim().toLowerCase() === projectName.trim().toLowerCase())
      .map(a => a.activityName)
      .filter(name => name && name !== 'PENDING_CONFIG' && !name.includes('N/A'))
  ));

  return (
    <div className="main-content-stream" style={{ width: '100%' }}>
      
      {user.userType === 'Administrator' && (
        <div className="admin-season-box">
          <div>
            <h3 style={{ margin: 0, color: '#92400e' }}>🛡️ Administrator Global Controls</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#b45309' }}>
              Cycle Configuration Rule: Baseline year set to <strong>{baseSeasonYear}</strong>. Target window maps to: {year1} - {year3}.
            </p>
          </div>
          <button className="btn-primary" style={{ backgroundColor: '#d97706' }} onClick={handleActivateNewSeason}>
            Activate New LDIP Cycle ({baseSeasonYear})
          </button>
        </div>
      )}

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Local Development Investment Plan (LDIP) Ledger</h2>
          <p style={{ margin: 0, color: '#64748b' }}>
            Office Segment: <strong>{user.department}</strong> | Sector Grouping: <span className={getBadgeClass(assignedSector.sectorCode)}>{assignedSector.sectorName} ({assignedSector.sectorCode})</span>
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '0.55rem 1rem' }}>
            📁 Import Excel
            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={handleExcelImport} 
              style={{ display: 'none' }} 
            />
          </label>
          <button className="btn-primary" onClick={handleOpenCreateModal}>+ Add LDIP Entry</button>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto' }}>
        <h3>Current Submissions for Cycle ({year1} - {year3})</h3>
        {ldipEntries.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2.5rem 0' }}>No investment records posted yet for this cycle window.</p>
        ) : (
          <table className="budget-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Program/Project Title & Description</th>
                <th>Classification Sector</th>
                <th>Target Implementation Timeline</th>
                <th>Required Budget Baseline</th>
                <th>AIP Budget Requirement</th>
                <th>Annual Budget</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ldipEntries.map(entry => {
                const matchingAip = aipEntries.filter(a => a && a.programTitle && entry.title && a.programTitle.trim().toLowerCase() === entry.title.trim().toLowerCase());
                const matchingBudget = budgetEntries.filter(b => b && b.programTitle && entry.title && b.programTitle.trim().toLowerCase() === entry.title.trim().toLowerCase());

                const aipRequirementTotal = matchingAip.reduce((sum, item) => sum + (item.total || 0), 0);
                const annualBudgetTotal = matchingBudget.reduce((sum, item) => sum + (item.total || 0), 0);

                const projectMap = {};
                matchingAip.forEach(aipItem => {
                  const pName = aipItem.projectName ? aipItem.projectName.trim() : 'Untitled Project';
                  if (!projectMap[pName]) {
                    projectMap[pName] = {
                      projectName: pName,
                      aipTotal: 0,
                      budgetTotal: 0,
                      activities: []
                    };
                  }
                  if (aipItem.activityName !== 'PENDING_CONFIG') {
                    projectMap[pName].aipTotal += aipItem.total || 0;
                  }
                  
                  const associatedBudgets = matchingBudget.filter(b => 
                    b.projectName && aipItem.projectName && b.projectName.trim().toLowerCase() === aipItem.projectName.trim().toLowerCase() && 
                    b.activityName && aipItem.activityName && b.activityName.trim().toLowerCase() === aipItem.activityName.trim().toLowerCase()
                  );
                  associatedBudgets.forEach(b => {
                    projectMap[pName].budgetTotal += b.total || 0;
                  });

                  const hasRealActivity = aipItem.activityName && !aipItem.activityName.includes('N/A') && aipItem.activityName !== 'PENDING_CONFIG';
                  if (hasRealActivity) {
                    const specificBudget = matchingBudget.find(b => 
                      b.projectName && aipItem.projectName && b.projectName.trim().toLowerCase() === aipItem.projectName.trim().toLowerCase() && 
                      b.activityName && aipItem.activityName && b.activityName.trim().toLowerCase() === aipItem.activityName.trim().toLowerCase()
                    );
                    if (!projectMap[pName].activities.some(act => act.activityName && aipItem.activityName && act.activityName.trim().toLowerCase() === aipItem.activityName.trim().toLowerCase())) {
                      projectMap[pName].activities.push({
                        activityName: aipItem.activityName,
                        aipTotal: aipItem.total || 0,
                        budgetTotal: specificBudget ? specificBudget.total : 0
                      });
                    }
                  }
                });

                const projectsList = Object.values(projectMap);
                const isProgExpanded = expandedPrograms.includes(entry.title);
                const hasProjects = projectsList.length > 0;

                return (
                  <Fragment key={entry.id || entry.title || Math.random()}>
                    <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ maxWidth: '300px' }}>
                        <div 
                          style={{ fontWeight: '600', fontSize: '0.95rem', cursor: hasProjects ? 'pointer' : 'default', userSelect: 'none' }}
                          onClick={() => hasProjects && toggleProgramCollapse(entry.title)}
                        >
                          {hasProjects && (
                            <span style={{ marginRight: '6px', color: '#94a3b8', display: 'inline-block', width: '12px' }}>
                              {isProgExpanded ? '▼' : '▶'}
                            </span>
                          )}
                          🎯 {entry.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>{entry.description}</div>
                      </td>
                      <td>
                        <span className={getBadgeClass(entry.sectorCode)}>{entry.sectorCode} - {entry.sectorName}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {entry.targets.map(t => (
                            <span key={t} style={{ backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600', color: '#475569' }}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: '#1e3a8a', fontSize: '1rem' }}>
                        ₱{entry.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontWeight: '700', color: '#b45309', fontSize: '1rem' }}>
                        ₱{aipRequirementTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontWeight: '700', color: '#166534', fontSize: '1rem' }}>
                        ₱{annualBudgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', minWidth: '55px' }} 
                            onClick={() => handleOpenEditModal(entry)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-danger" 
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', minWidth: '65px' }} 
                            onClick={() => handleDeleteEntry(entry)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isProgExpanded && projectsList.map(proj => {
                      const projKey = `${entry.title}|||${proj.projectName}`;
                      const isProjExpanded = expandedProjects.includes(projKey);
                      const hasActivities = proj.activities.length > 0;

                      return (
                        <Fragment key={projKey}>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ paddingLeft: '24px' }}>
                              <div 
                                style={{ fontWeight: '600', fontSize: '0.88rem', color: '#334155', cursor: hasActivities ? 'pointer' : 'default', userSelect: 'none' }}
                                onClick={() => hasActivities && toggleProjectCollapse(entry.title, proj.projectName)}
                              >
                                {hasActivities && (
                                  <span style={{ marginRight: '6px', color: '#cbd5e1', display: 'inline-block', width: '10px' }}>
                                    {isProjExpanded ? '▼' : '▶'}
                                  </span>
                                )}
                                📁 Project: {proj.projectName}
                              </div>
                            </td>
                            <td style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>Component</td>
                            <td>—</td>
                            <td>—</td>
                            <td style={{ color: '#d97706', fontWeight: '600' }}>
                              ₱{proj.aipTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td style={{ color: '#10b981', fontWeight: '600' }}>
                              ₱{proj.budgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td>—</td>
                          </tr>

                          {isProjExpanded && proj.activities.map(act => (
                            <tr key={`${projKey}|||${act.activityName}`} style={{ backgroundColor: '#fffdfa', borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ paddingLeft: '48px', color: '#475569', fontSize: '0.82rem' }}>
                                🌿 Activity: {act.activityName}
                              </td>
                              <td style={{ color: '#cbd5e1', fontStyle: 'italic', fontSize: '0.75rem' }}>Task Node</td>
                              <td>—</td>
                              <td>—</td>
                              <td style={{ color: '#f59e0b', fontSize: '0.8rem' }}>
                                ₱{act.aipTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td style={{ color: '#34d399', fontSize: '0.8rem' }}>
                                ₱{act.budgetTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td>—</td>
                            </tr>
                          ))}
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

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '650px', maxWidth: '95vw' }}>
            
            <div className="modal-header-section">
              <h2 style={{ margin: 0 }}>{isEditMode ? 'Modify Investment Entry' : 'Guided Investment Form Wizard'}</h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                {isEditMode ? `Modifying structural values for: ${programTitle}` : `Step-by-Step guided ledger formatting window`}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1.25rem 0', background: '#f8fafc', padding: '0.75rem 1.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: wizardStep === 1 ? '#1e3a8a' : '#94a3b8' }}>🎯 Step 1: Program</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: wizardStep === 2 ? '#1e3a8a' : '#94a3b8' }}>📁 Step 2: Project</span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: wizardStep === 3 ? '#1e3a8a' : '#94a3b8' }}>🌿 Step 3: Capital details</span>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              
              {wizardStep === 1 && (
                <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Select Parent Program Container</label>
                  <div className="label-helper" style={{ marginBottom: '12px' }}>Choose an existing master program category from the active database or create a brand new one.</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                    {uniqueMasterPrograms.map(prog => (
                      <div 
                        key={prog}
                        style={{ border: (programTitle === prog && !isNewProgram) ? '2px solid #10b981' : '1px solid #cbd5e1', backgroundColor: (programTitle === prog && !isNewProgram) ? '#f0fdf4' : '#ffffff', padding: '0.85rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onClick={() => { setProgramTitle(prog); setIsNewProgram(false); }}
                      >
                        <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' }}>🎯 {prog}</div>
                        {(programTitle === prog && !isNewProgram) && <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>✓ Active Selected</span>}
                      </div>
                    ))}
                    <div 
                      style={{ border: isNewProgram ? '2px solid #10b981' : '1px dashed #94a3b8', backgroundColor: isNewProgram ? '#f0fdf4' : '#f8fafc', padding: '0.85rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                      onClick={() => { setProgramTitle(''); setIsNewProgram(true); }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#475569' }}>➕ Add Brand New Program</div>
                    </div>
                  </div>

                  {isNewProgram && (
                    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.15s ease' }} className="form-field-group">
                      <label style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>Type New Program Name</label>
                      <input 
                        type="text"
                        value={programTitle}
                        onChange={(e) => setProgramTitle(e.target.value)}
                        placeholder="e.g., Municipal Anti-Drug Abuse Action Plan Framework"
                        required
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      disabled={!programTitle.trim()} 
                      onClick={() => setWizardStep(2)}
                    >
                      Proceed to Projects ➔
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  <label style={{ fontWeight: '600', display: 'block', marginBottom: '4px' }}>Select Component Project Segment</label>
                  <div className="label-helper" style={{ marginBottom: '12px' }}>Parent Context: <strong style={{ color: '#1e3a8a' }}>{programTitle}</strong></div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
                    {filteredProjectOptions.map(proj => (
                      <div 
                        key={proj}
                        style={{ border: (projectName === proj && !isNewProject) ? '2px solid #10b981' : '1px solid #cbd5e1', backgroundColor: (projectName === proj && !isNewProject) ? '#f0fdf4' : '#ffffff', padding: '0.85rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onClick={() => { setProjectName(proj); setIsNewProject(false); }}
                      >
                        <div style={{ fontSize: '0.88rem', fontWeight: '600', color: '#1e293b' }}>📁 Project: {proj}</div>
                        {(projectName === proj && !isNewProject) && <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '700' }}>✓ Active Selected</span>}
                      </div>
                    ))}
                    <div 
                      style={{ border: isNewProject ? '2px solid #10b981' : '1px dashed #94a3b8', backgroundColor: isNewProject ? '#f0fdf4' : '#f8fafc', padding: '0.85rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                      onClick={() => { setProjectName(''); setIsNewProject(true); }}
                    >
                      <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#475569' }}>➕ Add Brand New Project</div>
                    </div>
                  </div>

                  {isNewProject && (
                    <div style={{ marginTop: '1rem', animation: 'fadeIn 0.15s ease' }} className="form-field-group">
                      <label style={{ fontSize: '0.8rem', color: '#1e3a8a' }}>Type New Project Name</label>
                      <input 
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="e.g., Implementation of Drug Clearing Operations"
                        required
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                    <button type="button" className="btn-secondary" onClick={() => setWizardStep(1)}>⬅ Back to Step 1</button>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      disabled={!projectName.trim()} 
                      onClick={() => setWizardStep(3)}
                    >
                      Proceed to Details ➔
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                  
                  {!isEditMode && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem' }}>Selected Program Container</label>
                        <input type="text" value={programTitle} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                      </div>
                      <div className="form-field-group" style={{ margin: 0 }}>
                        <label style={{ fontSize: '0.8rem' }}>Selected Project Container</label>
                        <input type="text" value={projectName} disabled style={{ backgroundColor: '#f1f5f9', color: '#64748b', cursor: 'not-allowed' }} />
                      </div>
                    </div>
                  )}

                  {!isEditMode && (
                    <div className="form-field-group">
                      <label>Core Activity Description Node</label>
                      <div className="label-helper">State the operation task. Select from suggestions below or type a brand new node string.</div>
                      <input 
                        type="text" 
                        value={activityName}
                        onChange={(e) => setActivityName(e.target.value)}
                        placeholder="e.g., Conduction of Symposia for High School Students"
                        required
                      />
                      {filteredActivityOptions.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                          {filteredActivityOptions.map(opt => (
                            <span 
                              key={opt} 
                              style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '12px', cursor: 'pointer', border: activityName === opt ? '1px solid #10b981' : '1px solid transparent', color: activityName === opt ? '#166534' : '#475569', fontWeight: activityName === opt ? '700' : '400' }}
                              onClick={() => setActivityName(opt)}
                            >
                              🌿 {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="form-field-group">
                    <label>Program Objective Scope / Expected Outputs</label>
                    <textarea 
                      value={programDescription} 
                      onChange={(e) => setProgramDescription(e.target.value)} 
                      placeholder="e.g., Procurement of 30 informational triage brochures and localized data monitoring grids..." 
                      required 
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Target Implementation Timeline</label>
                    <div className="year-selector-grid">
                      <label className={`year-selection-card ${targetY1 ? 'active-selected' : ''}`}>
                        <input type="checkbox" checked={targetY1} onChange={(e) => setTargetY1(e.target.checked)} />
                        <div className="card-year-title">{year1}</div>
                        <div className="card-year-sub">Year 1 Allotment</div>
                      </label>
                      <label className={`year-selection-card ${targetY2 ? 'active-selected' : ''}`}>
                        <input type="checkbox" checked={targetY2} onChange={(e) => setTargetY2(e.target.checked)} />
                        <div className="card-year-title">{year2}</div>
                        <div className="card-year-sub">Year 2 Allotment</div>
                      </label>
                      <label className={`year-selection-card ${targetY3 ? 'active-selected' : ''}`}>
                        <input type="checkbox" checked={targetY3} onChange={(e) => setTargetY3(e.target.checked)} />
                        <div className="card-year-title">{year3}</div>
                        <div className="card-year-sub">Year 3 Allotment</div>
                      </label>
                    </div>
                  </div>

                  <div className="form-field-group" style={{ margin: 0 }}>
                    <label>Required Funding Capital Allotment Baseline</label>
                    <div className="currency-wrapper">
                      <span className="currency-symbol">₱</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={requiredBudget} 
                        onChange={(e) => setRequiredBudget(e.target.value)} 
                        placeholder="0.00" 
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                    {isEditMode ? (
                      <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    ) : (
                      <button type="button" className="btn-secondary" onClick={() => setWizardStep(2)}>⬅ Back to Step 2</button>
                    )}
                    <button type="submit" className="btn-primary">{isEditMode ? 'Save Modifications' : 'Submit To Ledgers'}</button>
                  </div>
                </div>
              )}

            </form>

          </div>
        </div>
      )}

    </div>
  );
}