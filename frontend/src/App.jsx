import React, { useState, useEffect, useRef } from "react";

const API = "http://localhost:5000/api";

const SAMPLE_JOBS = [
  { id: "j1", title: "Senior React Developer", company: "Zoho Corporation", skills: ["React","TypeScript","Redux","REST API","Node.js","Git"], description: "Senior React Developer role requiring React, TypeScript, Redux, REST API, Node.js, Git, Agile, 3+ years experience building scalable frontend applications." },
  { id: "j2", title: "Data Scientist", company: "Flipkart", skills: ["Python","Machine Learning","TensorFlow","Pandas","SQL"], description: "Data Scientist role requiring Python, Machine Learning, TensorFlow, Pandas, NumPy, SQL, Statistics, Scikit-learn, 2+ years experience." },
  { id: "j3", title: "DevOps Engineer", company: "Infosys", skills: ["Docker","Kubernetes","AWS","Jenkins","Terraform"], description: "DevOps Engineer requiring Docker, Kubernetes, AWS, Jenkins, Terraform, Linux, CI/CD, Bash scripting, 3+ years experience." },
  { id: "j4", title: "Full Stack Developer", company: "Freshworks", skills: ["Node.js","React","MongoDB","REST API","Docker"], description: "Full Stack Developer requiring Node.js, React, MongoDB, REST API, Docker, AWS, Express, 2+ years building SaaS products." },
  { id: "j5", title: "Mobile Developer", company: "PhonePe", skills: ["Flutter","Dart","Firebase","Android","iOS"], description: "Mobile Developer requiring Flutter, Dart, Firebase, REST API, Android, iOS, Git, 2+ years cross-platform mobile development." },
  { id: "j6", title: "Data Engineer", company: "TCS", skills: ["Apache Spark","Python","SQL","Airflow","Kafka"], description: "Data Engineer requiring Apache Spark, Python, SQL, Airflow, AWS S3, Kafka, ETL pipelines, 3+ years experience." },
];

//  Styles 
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0f1e;
    --surface: #111827;
    --surface2: #1a2235;
    --border: #1f2d45;
    --accent: #00d4aa;
    --accent2: #ff6b6b;
    --accent3: #ffd93d;
    --text: #e8edf5;
    --muted: #64748b;
    --success: #00d4aa;
    --warning: #ffd93d;
    --danger: #ff6b6b;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    background-image: radial-gradient(ellipse at 20% 20%, rgba(0,212,170,0.04) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 80%, rgba(255,107,107,0.04) 0%, transparent 60%);
  }

  .app { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: 220px; min-height: 100vh; background: var(--surface);
    border-right: 1px solid var(--border); padding: 24px 0;
    display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0;
  }
  .logo { padding: 0 20px 28px; border-bottom: 1px solid var(--border); }
  .logo h1 { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--accent); letter-spacing: -0.5px; }
  .logo span { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; }
  .nav { padding: 16px 0; flex: 1; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 11px 20px;
    cursor: pointer; font-size: 14px; font-weight: 500; color: var(--muted);
    transition: all 0.2s; border-left: 3px solid transparent;
  }
  .nav-item:hover { color: var(--text); background: var(--surface2); }
  .nav-item.active { color: var(--accent); border-left-color: var(--accent); background: rgba(0,212,170,0.06); }
  .nav-icon { font-size: 18px; }
  .sidebar-status { padding: 16px 20px; border-top: 1px solid var(--border); }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); display: inline-block; margin-right: 8px; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  /* Main */
  .main { margin-left: 220px; flex: 1; padding: 32px; max-width: calc(100vw - 220px); }
  .page-header { margin-bottom: 28px; }
  .page-header h2 { font-family: 'DM Serif Display', serif; font-size: 28px; color: var(--text); }
  .page-header p { color: var(--muted); font-size: 14px; margin-top: 4px; }

  /* Cards */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 12px; padding: 24px;
  }
  .card-sm { padding: 16px; }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 16px; }

  /* Upload area */
  .upload-area {
    border: 2px dashed var(--border); border-radius: 12px; padding: 40px;
    text-align: center; cursor: pointer; transition: all 0.2s;
    background: var(--surface2);
  }
  .upload-area:hover, .upload-area.drag { border-color: var(--accent); background: rgba(0,212,170,0.04); }
  .upload-icon { font-size: 40px; margin-bottom: 12px; }
  .upload-area h3 { font-size: 16px; color: var(--text); margin-bottom: 6px; }
  .upload-area p { font-size: 13px; color: var(--muted); }

  /* Textarea */
  textarea {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 8px; padding: 14px; color: var(--text); font-family: 'DM Sans', sans-serif;
    font-size: 13px; resize: vertical; outline: none; transition: border 0.2s;
  }
  textarea:focus { border-color: var(--accent); }

  /* Buttons */
  .btn {
    padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500;
    transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary { background: var(--accent); color: #0a0f1e; }
  .btn-primary:hover { background: #00bfa0; transform: translateY(-1px); }
  .btn-secondary { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
  .btn-secondary:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background: rgba(255,107,107,0.1); color: var(--danger); border: 1px solid rgba(255,107,107,0.2); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
  .btn-full { width: 100%; justify-content: center; }

  /* Score ring */
  .score-ring-wrap { text-align: center; }
  .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-ring-val { position: absolute; font-family: 'DM Serif Display', serif; font-size: 26px; color: var(--text); }
  .score-ring-label { font-size: 12px; color: var(--muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; }

  /* Skill tags */
  .tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .tag {
    padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
    background: rgba(0,212,170,0.1); color: var(--accent); border: 1px solid rgba(0,212,170,0.2);
  }
  .tag.missing { background: rgba(255,107,107,0.1); color: var(--danger); border-color: rgba(255,107,107,0.2); }
  .tag.neutral { background: var(--surface2); color: var(--muted); border-color: var(--border); }

  /* Progress bar */
  .progress-bar { height: 6px; background: var(--border); border-radius: 4px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 4px; transition: width 0.8s ease; background: var(--accent); }

  /* Stat card */
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
  .stat-val { font-family: 'DM Serif Display', serif; font-size: 32px; color: var(--text); }
  .stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
  .stat-accent { color: var(--accent); }

  /* Badge */
  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .badge-green { background: rgba(0,212,170,0.15); color: var(--accent); }
  .badge-yellow { background: rgba(255,217,61,0.15); color: var(--warning); }
  .badge-red { background: rgba(255,107,107,0.15); color: var(--danger); }

  /* Table */
  .table { width: 100%; border-collapse: collapse; }
  .table th { text-align: left; padding: 10px 14px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); border-bottom: 1px solid var(--border); }
  .table td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: var(--surface2); }

  /* Spinner */
  .spinner { width: 20px; height: 20px; border: 2px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Alert */
  .alert { padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
  .alert-error { background: rgba(255,107,107,0.1); color: var(--danger); border: 1px solid rgba(255,107,107,0.2); }
  .alert-success { background: rgba(0,212,170,0.1); color: var(--accent); border: 1px solid rgba(0,212,170,0.2); }

  /* Tabs */
  .tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--surface2); padding: 4px; border-radius: 10px; width: fit-content; }
  .tab { padding: 8px 18px; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--muted); transition: all 0.2s; }
  .tab.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }

  /* Job card */
  .job-card { border: 1px solid var(--border); border-radius: 10px; padding: 16px; cursor: pointer; transition: all 0.2s; background: var(--surface2); }
  .job-card:hover, .job-card.selected { border-color: var(--accent); background: rgba(0,212,170,0.04); }
  .job-title { font-weight: 600; font-size: 14px; margin-bottom: 4px; }
  .job-company { font-size: 12px; color: var(--muted); }

  /* Section heading */
  .section-title { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 12px; font-weight: 600; }

  .divider { height: 1px; background: var(--border); margin: 20px 0; }
  .mt-4 { margin-top: 16px; }
  .mt-6 { margin-top: 24px; }
  .mb-4 { margin-bottom: 16px; }
  .flex { display: flex; }
  .flex-between { display: flex; justify-content: space-between; align-items: center; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 12px; }
  .text-muted { color: var(--muted); }
  .text-accent { color: var(--accent); }
  .font-serif { font-family: 'DM Serif Display', serif; }
`;

//  Score Ring Component 
function ScoreRing({ score, size = 90, label, color }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const fill = ((score || 0) / 100) * circ;
  const c = color || (score >= 70 ? "#00d4aa" : score >= 50 ? "#ffd93d" : "#ff6b6b");
  return (
    <div className="score-ring-wrap">
      <div className="score-ring">
        <svg width={size} height={size}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2d45" strokeWidth="6"/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeWidth="6"
            strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"/>
        </svg>
        <span className="score-ring-val" style={{fontSize: size < 80 ? 18 : 24, color: c}}>{score || 0}</span>
      </div>
      {label && <div className="score-ring-label">{label}</div>}
    </div>
  );
}

//  Main App 
export default function App() {
  const [page, setPage] = useState("upload");
  const [resumeText, setResumeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [drag, setDrag] = useState(false);
  const [dbResumes, setDbResumes] = useState([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    if (page === "database") loadDatabase();
    if (page === "dashboard" && !stats) loadStats();
  }, [page]);

  const loadStats = async () => {
    try {
      const r = await fetch(`${API}/resume/stats`);
      const d = await r.json();
      if (d.success) setStats(d.stats);
    } catch {}
  };

  const loadDatabase = async () => {
    setDbLoading(true);
    try {
      const r = await fetch(`${API}/resume?limit=50`);
      const d = await r.json();
      if (d.success) setDbResumes(d.resumes);
    } catch (e) { setError("Could not load database"); }
    finally { setDbLoading(false); }
  };

  const handleFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch(`${API}/resume/upload`, { method: "POST", body: formData });
      const d = await r.json();
      if (d.success) { setResult(d.data); setPage("result"); }
      else setError(d.error || "Analysis failed");
    } catch { setError("Backend not reachable. Is it running on :5000?"); }
    finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return setError("Please paste your resume text");
    setLoading(true); setError(""); setResult(null);
    try {
      const r = await fetch(`${API}/resume/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const d = await r.json();
      if (d.success) { setResult(d.data); setPage("result"); }
      else setError(d.error || "Analysis failed");
    } catch { setError("Backend not reachable. Is it running on :5000?"); }
    finally { setLoading(false); }
  };

  const handleMatch = async () => {
    if (!selectedJob) return setError("Select a job first");
    if (!result && !resumeText.trim()) return setError("Analyze a resume first");
    setMatchLoading(true); setMatchResult(null);
    try {
      const body = { jobDescription: selectedJob.description, jobTitle: selectedJob.title };
      if (result) body.resumeText = resumeText;
      else body.resumeText = resumeText;
      const r = await fetch(`${API}/match/single`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (d.success) setMatchResult(d);
      else setError(d.error);
    } catch { setError("Match failed"); }
    finally { setMatchLoading(false); }
  };

  const deleteResume = async (id) => {
    await fetch(`${API}/resume/${id}`, { method: "DELETE" });
    loadDatabase();
  };

  const verdictBadge = (v) => {
    if (!v) return null;
    if (v === "SHORTLIST") return <span className="badge badge-green"> Shortlist</span>;
    if (v === "REVIEW") return <span className="badge badge-yellow">~ Review</span>;
    return <span className="badge badge-red"> Reject</span>;
  };

  const matchBadge = (v) => {
    if (!v) return null;
    if (v.includes("STRONG")) return <span className="badge badge-green">{v}</span>;
    if (v.includes("MODERATE")) return <span className="badge badge-yellow">{v}</span>;
    return <span className="badge badge-red">{v}</span>;
  };

  //  Pages 
  const renderUpload = () => (
    <div>
      <div className="page-header">
        <h2>Analyze Resume</h2>
        <p>Upload a PDF/DOCX or paste resume text to get instant AI insights</p>
      </div>
      {error && <div className="alert alert-error"> {error}</div>}
      <div className="grid-2" style={{gap:24}}>
        <div className="card">
          <div className="section-title">Upload File</div>
          <div className={`upload-area ${drag ? "drag" : ""}`}
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); }}>
            <div className="upload-icon">[FILE]</div>
            <h3>Drop your resume here</h3>
            <p>PDF, DOCX, DOC, TXT  max 5MB</p>
            <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt" style={{display:"none"}}
              onChange={e => handleFile(e.target.files[0])} />
          </div>
          <div style={{marginTop:12,textAlign:"center",color:"var(--muted)",fontSize:13}}>or</div>
          <button className="btn btn-secondary btn-full mt-4" onClick={() => fileRef.current.click()}>
            [BROWSE] Browse Files
          </button>
        </div>
        <div className="card">
          <div className="section-title">Paste Text</div>
          <textarea rows={10} placeholder="Paste your resume content here..." value={resumeText}
            onChange={e => setResumeText(e.target.value)} />
          <button className="btn btn-primary btn-full mt-4" onClick={handleAnalyze} disabled={loading}>
            {loading ? <><span className="spinner"/>&nbsp;Analyzing...</> : "[RUN] Analyze Resume"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderResult = () => {
    if (!result) return <div className="card"><p className="text-muted">No result yet  analyze a resume first.</p></div>;
    const { atsScore, skills, skillCategories, mlPrediction, predictedRoles, experienceLevel } = result;
    const bd = atsScore?.breakdown || {};
    return (
      <div>
        <div className="page-header">
          <div className="flex-between">
            <div><h2>Analysis Result</h2><p style={{color:"var(--muted)",fontSize:14,marginTop:4}}>{result.candidateName}</p></div>
            <div className="flex gap-2">
              {verdictBadge(atsScore?.shortlistRecommendation)}
              <button className="btn btn-secondary" onClick={() => setPage("match")}>[MATCH] Match Jobs </button>
            </div>
          </div>
        </div>

        {/* Score row */}
        <div className="card mb-4">
          <div style={{display:"flex",gap:32,justifyContent:"center",flexWrap:"wrap",padding:"8px 0"}}>
            <ScoreRing score={atsScore?.overall} label="ATS Score" size={100}/>
            <ScoreRing score={bd.skillsScore} label="Skills" size={80}/>
            <ScoreRing score={bd.experienceScore} label="Experience" size={80}/>
            <ScoreRing score={bd.educationScore} label="Education" size={80}/>
            <ScoreRing score={bd.formattingScore} label="Formatting" size={80}/>
            <ScoreRing score={bd.completenessScore} label="Completeness" size={80}/>
          </div>
        </div>

        <div className="grid-2">
          {/* ML Prediction */}
          <div className="card">
            <div className="section-title">[AI] ML Role Prediction</div>
            <div style={{marginBottom:16}}>
              <div style={{fontSize:20,fontFamily:"'DM Serif Display',serif",color:"var(--accent)"}}>{mlPrediction?.predictedRole || predictedRoles?.[0] || "Unknown"}</div>
              <div style={{fontSize:12,color:"var(--muted)",marginTop:4}}>via {mlPrediction?.modelUsed || "keyword classifier"}  {mlPrediction?.source === "ml_model" ? " ML Model" : " Fallback"}</div>
            </div>
            {mlPrediction?.topPredictions?.map((p,i) => (
              <div key={i} style={{marginBottom:10}}>
                <div className="flex-between" style={{marginBottom:4}}>
                  <span style={{fontSize:13}}>{p.role}</span>
                  <span style={{fontSize:12,color:"var(--muted)"}}>{p.confidence?.toFixed(1)}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${p.confidence}%`,background: i===0?"var(--accent)":"var(--border)"}}/></div>
              </div>
            ))}
            <div className="divider"/>
            <div className="flex-between">
              <span className="text-sm text-muted">Experience Level</span>
              <span className="badge badge-yellow">{experienceLevel}</span>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="card">
            <div className="section-title">[OK] Strengths</div>
            {atsScore?.strengths?.map((s,i) => <div key={i} style={{fontSize:13,padding:"6px 0",borderBottom:"1px solid var(--border)",color:"var(--accent)"}}>+ {s}</div>)}
            <div className="section-title mt-4">[RUN] Improvements</div>
            {atsScore?.improvements?.map((s,i) => <div key={i} style={{fontSize:13,padding:"6px 0",borderBottom:"1px solid var(--border)",color:"var(--accent2)"}}> {s}</div>)}
          </div>
        </div>

        {/* Skills by category */}
        <div className="card mt-4">
          <div className="section-title">[SKILLS] Skills by Category</div>
          <div className="grid-3" style={{gap:16}}>
            {skillCategories && Object.entries(skillCategories).map(([cat, skls]) => skls.length > 0 && (
              <div key={cat} style={{background:"var(--surface2)",borderRadius:8,padding:12}}>
                <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:"1px",color:"var(--muted)",marginBottom:8}}>{cat}</div>
                <div className="tags">{skls.map(s => <span key={s} className="tag">{s}</span>)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderMatch = () => (
    <div>
      <div className="page-header"><h2>Job Matching</h2><p>Match your resume against job descriptions using semantic similarity</p></div>
      {error && <div className="alert alert-error"> {error}</div>}
      <div className="grid-2">
        <div>
          <div className="card mb-4">
            <div className="section-title">Select a Job</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {SAMPLE_JOBS.map(j => (
                <div key={j.id} className={`job-card ${selectedJob?.id===j.id?"selected":""}`} onClick={() => setSelectedJob(j)}>
                  <div className="job-title">{j.title}</div>
                  <div className="job-company">{j.company}</div>
                  <div className="tags" style={{marginTop:8}}>{j.skills.slice(0,4).map(s=><span key={s} className="tag">{s}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
          {!result && (
            <div className="card">
              <div className="section-title">Resume Text</div>
              <textarea rows={6} placeholder="Paste resume here for matching..." value={resumeText} onChange={e=>setResumeText(e.target.value)}/>
            </div>
          )}
          <button className="btn btn-primary btn-full mt-4" onClick={handleMatch} disabled={matchLoading||!selectedJob}>
            {matchLoading ? <><span className="spinner"/>&nbsp;Matching...</> : "[MATCH] Match Resume"}
          </button>
        </div>
        <div>
          {matchResult ? (
            <div className="card">
              <div className="flex-between mb-4">
                <div className="section-title" style={{margin:0}}>Match Result</div>
                {matchBadge(matchResult.verdict)}
              </div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
                <ScoreRing score={matchResult.matchScore} label="Match Score" size={120}/>
              </div>
              <div className="section-title">[OK] Matched Skills ({matchResult.matchedSkills?.length})</div>
              <div className="tags mb-4">{matchResult.matchedSkills?.map(s=><span key={s} className="tag">{s}</span>)}</div>
              <div className="section-title">[X] Missing Skills ({matchResult.missingSkills?.length})</div>
              <div className="tags">{matchResult.missingSkills?.map(s=><span key={s} className="tag missing">{s}</span>)}</div>
            </div>
          ) : (
            <div className="card" style={{textAlign:"center",padding:60}}>
              <div style={{fontSize:48,marginBottom:16}}>[MATCH]</div>
              <p className="text-muted">Select a job and click Match Resume</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDatabase = () => (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div><h2>Resume Database</h2><p>All analyzed resumes stored in MongoDB</p></div>
          <button className="btn btn-secondary" onClick={loadDatabase}>[REFRESH] Refresh</button>
        </div>
      </div>
      {dbLoading ? <div style={{textAlign:"center",padding:60}}><span className="spinner"/></div> : (
        <div className="card">
          {dbResumes.length === 0 ? (
            <div style={{textAlign:"center",padding:60,color:"var(--muted)"}}>No resumes in database yet. Analyze some resumes first.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th><th>Email</th><th>Predicted Role</th>
                  <th>ATS Score</th><th>Verdict</th><th>Skills</th><th>Date</th><th></th>
                </tr>
              </thead>
              <tbody>
                {dbResumes.map(r => (
                  <tr key={r._id}>
                    <td style={{fontWeight:500}}>{r.candidateName}</td>
                    <td className="text-muted text-sm">{r.email || ""}</td>
                    <td><span className="tag">{r.predictedRoles?.[0] || ""}</span></td>
                    <td><ScoreRing score={r.atsScore?.overall} size={48}/></td>
                    <td>{verdictBadge(r.atsScore?.shortlistRecommendation)}</td>
                    <td className="text-muted text-sm">{r.skills?.length || 0} skills</td>
                    <td className="text-muted text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><button className="btn btn-danger" style={{padding:"4px 10px",fontSize:12}} onClick={()=>deleteResume(r._id)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );

  const renderDashboard = () => (
    <div>
      <div className="page-header"><h2>Dashboard</h2><p>Overview of all resume analytics</p></div>
      <div className="grid-4" style={{marginBottom:24}}>
        {[
          {label:"Total Resumes",val:stats?.totalResumes||0,icon:"[FILE]"},
          {label:"Shortlisted",val:stats?.shortlisted||0,icon:"[OK]"},
          {label:"Avg ATS Score",val:stats?.avgAtsScore||0,icon:"[STATS]"},
          {label:"Job Roles",val:stats?.byRole?.length||0,icon:"[JOBS]"},
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{fontSize:28,marginBottom:8}}>{s.icon}</div>
            <div className="stat-val stat-accent">{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>
      {stats?.byRole?.length > 0 && (
        <div className="card">
          <div className="section-title">Resumes by Role</div>
          {stats.byRole.map(r=>(
            <div key={r.role} style={{marginBottom:12}}>
              <div className="flex-between" style={{marginBottom:4}}>
                <span style={{fontSize:13}}>{r.role||"Unknown"}</span>
                <span style={{fontSize:12,color:"var(--muted)"}}>{r.count}</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{width:`${(r.count/(stats.totalResumes||1))*100}%`}}/></div>
            </div>
          ))}
        </div>
      )}
      {!stats && <div className="card" style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Analyze resumes to see dashboard stats</div>}
    </div>
  );

  const NAV = [
    {id:"upload",icon:"[^]",label:"Analyze"},
    {id:"result",icon:"[STATS]",label:"Results"},
    {id:"match",icon:"[MATCH]",label:"Job Match"},
    {id:"database",icon:"[DB]",label:"Database"},
    {id:"dashboard",icon:"[CHART]",label:"Dashboard"},
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="sidebar">
          <div className="logo">
            <h1>ResumeAI</h1>
            <span>Intelligence System</span>
          </div>
          <nav className="nav">
            {NAV.map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <span className="nav-icon">{n.icon}</span>{n.label}
              </div>
            ))}
          </nav>
          <div className="sidebar-status">
            <div style={{fontSize:12,color:"var(--muted)"}}>
              <span className="status-dot"/>Backend :5000
            </div>
            <div style={{fontSize:12,color:"var(--muted)",marginTop:6}}>
              <span className="status-dot" style={{background:"var(--accent3)"}}/>ML API :5001
            </div>
          </div>
        </div>
        <main className="main">
          {page==="upload" && renderUpload()}
          {page==="result" && renderResult()}
          {page==="match" && renderMatch()}
          {page==="database" && renderDatabase()}
          {page==="dashboard" && renderDashboard()}
        </main>
      </div>
    </>
  );
}