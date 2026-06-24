import { useState, useEffect, useRef } from "react";

const API = "https://fazeelayazq-brandflow-backend.hf.space/api";

const IconBolt    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/></svg>;
const IconScraper = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconLogs    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconHelp    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconTrash   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const IconPlus    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconDot     = () => <svg width="6" height="6" viewBox="0 0 6 6" fill="#4F46E5"><circle cx="3" cy="3" r="3"/></svg>;

export default function App() {
  const [page, setPage]                       = useState("Scraper");
  const [presets, setPresets]                 = useState([]);
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [queue, setQueue]                     = useState([]);
  const [stats, setStats]                     = useState({ total: 0, with_email: 0, with_phone: 0, new_leads: 0 });
  const [logs, setLogs]                       = useState([]);
  const [running, setRunning]                 = useState(false);
  const [maxLeads, setMaxLeads]               = useState(20);
  const [form, setForm]                       = useState({ query: "", location: "", country: "", niche: "" });
  const logRef                                = useRef(null);

  useEffect(() => { fetchPresets(); fetchQueue(); fetchStats(); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  async function fetchPresets() { try { const r = await fetch(`${API}/presets`); setPresets(await r.json()); } catch {} }
  async function fetchQueue()   { try { const r = await fetch(`${API}/queue`);   setQueue(await r.json());   } catch {} }
  async function fetchStats()   { try { const r = await fetch(`${API}/stats`);   setStats(await r.json());   } catch {} }

  function togglePreset(index) {
    setSelectedPresets(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  }

  async function addToQueue() {
    if (!form.query || !form.location) return alert("Search Term and Location required.");
    const r    = await fetch(`${API}/queue`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: form.query, location: form.location, country: form.country || "N/A", niche: form.niche || form.query }) });
    const data = await r.json();
    if (data.status === "duplicate") alert("Already in queue.");
    else { setForm({ query: "", location: "", country: "", niche: "" }); fetchQueue(); }
  }

  async function removeFromQueue(index) { await fetch(`${API}/queue/${index}`, { method: "DELETE" }); fetchQueue(); }
  async function clearQueue()           { await fetch(`${API}/queue`,          { method: "DELETE" }); fetchQueue(); }

  async function startScraping() {
    if (selectedPresets.length === 0 && queue.length === 0) return alert("No queries selected.");
    setRunning(true); setLogs([]); setPage("Scraper");
    const r = await fetch(`${API}/scrape`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preset_indices: selectedPresets, custom_queue: queue, max_per_query: maxLeads }) });
    const reader = r.body.getReader(); const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
      for (const line of lines) {
        const msg = line.replace("data: ", "");
        if (msg === "__DONE__") { setRunning(false); fetchStats(); break; }
        setLogs(prev => [...prev, msg]);
      }
    }
    setRunning(false);
  }

  const totalSelected = selectedPresets.length + queue.length;

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; }
        input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important; }
        button:disabled { opacity: 0.45; cursor: not-allowed; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; background: #E2E8F0; border-radius: 4px; outline: none; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #4F46E5; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(79,70,229,0.35); cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .nav-btn:hover { background: #EEF2FF !important; color: #4F46E5 !important; }
        .btn-primary:hover { background: #4338CA !important; }
        .btn-secondary:hover { border-color: #4F46E5 !important; color: #4F46E5 !important; }
        .btn-danger:hover { background: #FEE2E2 !important; color: #DC2626 !important; border-color: #FECACA !important; }
        .stat-card:hover { box-shadow: 0 4px 24px rgba(79,70,229,0.10) !important; transform: translateY(-1px); }
        .stat-card { transition: all 0.15s; }
        .queue-pill:hover { border-color: #C7D2FE !important; }
        label:hover .check-box { border-color: #4F46E5 !important; }
      `}</style>

      {/* SIDEBAR */}
      <aside style={s.sidebar}>
        <div style={s.logo}>
          <div style={s.logoIcon}><IconBolt /></div>
          <div>
            <div style={s.logoText}>BrandFlow</div>
            <div style={s.logoSub}>Lead Intel</div>
          </div>
        </div>

        <div style={s.navSection}>
          <div style={s.navLabel}>Menu</div>
          {[
            { id: "Scraper", icon: <IconScraper /> },
            { id: "Logs",    icon: <IconLogs />    },
            { id: "Help",    icon: <IconHelp />     },
          ].map(({ id, icon }) => (
            <button key={id} className="nav-btn" onClick={() => setPage(id)}
              style={{ ...s.navBtn, ...(page === id ? s.navBtnActive : {}) }}>
              <span style={{ ...s.navBtnIcon, ...(page === id ? { color: "#4F46E5" } : {}) }}>{icon}</span>
              {id}
              {page === id && <div style={s.navActivePill} />}
            </button>
          ))}
        </div>

        <div style={s.sidebarFoot}>
          <div style={s.footCard}>
            <div style={s.footRow}>
              <span style={s.footPlan}>Pro Plan</span>
              <span style={s.footBadge}>Active</span>
            </div>
            <div style={s.footBarBg}><div style={s.footBarFill} /></div>
            <div style={s.footCredits}>840 of 1,000 credits used</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={s.main}>
        {page === "Scraper" && <ScraperPage stats={stats} presets={presets} selectedPresets={selectedPresets} togglePreset={togglePreset} queue={queue} removeFromQueue={removeFromQueue} clearQueue={clearQueue} form={form} setForm={setForm} addToQueue={addToQueue} maxLeads={maxLeads} setMaxLeads={setMaxLeads} totalSelected={totalSelected} running={running} startScraping={startScraping} logs={logs} logRef={logRef} />}
        {page === "Logs"    && <LogsPage logs={logs} clearLogs={() => setLogs([])} />}
        {page === "Help"    && <HelpPage />}
      </main>
    </div>
  );
}

function ScraperPage({ stats, presets, selectedPresets, togglePreset, queue, removeFromQueue, clearQueue, form, setForm, addToQueue, maxLeads, setMaxLeads, totalSelected, running, startScraping, logs, logRef }) {
  const total    = stats.total      ?? 0;
  const wEmail   = stats.with_email ?? 0;
  const wPhone   = stats.with_phone ?? 0;
  const todayNew = stats.new_leads  ?? 0;
  const emailPct = total > 0 ? `${Math.round(wEmail / total * 100)}%` : "0%";
  const phonePct = total > 0 ? `${Math.round(wPhone / total * 100)}%` : "0%";

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <div style={s.eyebrow}>Lead Intelligence</div>
          <div style={s.pageTitle}>Lead Scraper</div>
          <div style={s.pageSub}>Pull verified business leads from Google Maps into your sheet.</div>
        </div>
        <button onClick={startScraping} disabled={running} className="btn-primary" style={{ ...s.btnPrimary, padding: "10px 22px", fontSize: 14 }}>
          {running
            ? <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} /> Running...</>
            : <><IconPlus /> Start Scraping</>}
        </button>
      </div>

      {/* Stat Cards */}
      <div style={s.statGrid}>
        {[
          { label: "Total Leads",  value: total,    foot: "In Google Sheet",   color: "#4F46E5" },
          { label: "With Email",   value: wEmail,   foot: `${emailPct} of total`, color: "#0EA5E9" },
          { label: "With Phone",   value: wPhone,   foot: `${phonePct} of total`, color: "#10B981" },
          { label: "Added Today",  value: todayNew, foot: "Live from sheet",    color: "#F59E0B" },
        ].map(({ label, value, foot, color }) => (
          <div key={label} className="stat-card" style={s.statCard}>
            <div style={{ ...s.statAccentBar, background: color }} />
            <div style={s.statLabel}>{label}</div>
            <div style={{ ...s.statValue, color }}>{value}</div>
            <div style={s.statFoot}>{foot}</div>
          </div>
        ))}
      </div>

      {/* Body grid */}
      <div style={s.bodyGrid}>
        {/* LEFT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>Preset Queries</div>
              <div style={s.cardSub}>{selectedPresets.length} selected</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {presets.map((p) => (
                <label key={p.index} style={s.checkRow}>
                  <div style={{ ...s.checkBox, ...(selectedPresets.includes(p.index) ? s.checkBoxChecked : {}), }} className="check-box"
                    onClick={() => togglePreset(p.index)}>
                    {selectedPresets.includes(p.index) && (
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    )}
                  </div>
                  <span style={s.checkLabel} onClick={() => togglePreset(p.index)}>
                    {p.query.replace(/\b\w/g, c => c.toUpperCase())}
                    <span style={s.checkLabelSub}> {p.location}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Max Leads per Query</div>
            <div style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={s.sliderLabel}>Leads</span>
                <span style={s.sliderValue}>{maxLeads}</span>
              </div>
              <input type="range" min={5} max={100} value={maxLeads} onChange={e => setMaxLeads(Number(e.target.value))} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={s.sliderTick}>5</span>
                <span style={s.sliderTick}>100</span>
              </div>
            </div>
          </div>

          {totalSelected > 0 && (
            <div style={s.infoBar}>
              <IconDot />
              <span><b style={{ color: "#4F46E5" }}>{totalSelected}</b> {totalSelected === 1 ? "query" : "queries"} queued, up to <b style={{ color: "#4F46E5" }}>{totalSelected * maxLeads}</b> leads</span>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>Custom Query</div>
            </div>
            <div style={s.formGrid}>
              {[
                { key: "query",    label: "Search Term", placeholder: "e.g. SEO Consultant" },
                { key: "location", label: "Location",    placeholder: "e.g. London, UK" },
                { key: "country",  label: "Country",     placeholder: "e.g. UK" },
                { key: "niche",    label: "Niche Label", placeholder: "e.g. SEO Agency" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={s.inputLabel}>{label}</div>
                  <input style={s.input} placeholder={placeholder} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button onClick={addToQueue} className="btn-primary" style={s.btnPrimary}><IconPlus /> Add to Queue</button>
              <button onClick={clearQueue} className="btn-danger"  style={s.btnDanger}><IconTrash /> Clear Queue</button>
            </div>
          </div>

          {queue.length > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardTitle}>Queue</div>
                <span style={s.badge}>{queue.length}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {queue.map((item, i) => (
                  <div key={i} className="queue-pill" style={s.queuePill}>
                    <div>
                      <span style={s.queueNum}>{i + 1}</span>
                      <span style={s.queueText}>{item[0]}</span>
                      <span style={s.queueLoc}>{item[1]}</span>
                    </div>
                    <button onClick={() => removeFromQueue(i)} style={s.queueDelete} title="Remove"><IconTrash /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Console */}
      <div style={{ marginTop: 24 }}>
        <div style={s.consoleHeader}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: running ? "#10B981" : "#94A3B8", animation: running ? "pulse 1.5s ease-in-out infinite" : "none" }} />
            <span style={s.consoleTitle}>Live Console</span>
          </div>
          {running && <span style={s.consoleLive}>Running</span>}
        </div>
        <div ref={logRef} style={s.consoleBody}>
          {logs.length === 0
            ? <span style={{ color: "#94A3B8", fontStyle: "italic" }}>Waiting for scraper to start...</span>
            : logs.map((line, i) => (
                <div key={i} style={{ color: line.startsWith("[+]") ? "#10B981" : line.startsWith("[ERROR]") ? "#EF4444" : line.startsWith("[SKIP]") ? "#94A3B8" : line.startsWith("[QUERY]") ? "#4F46E5" : "#334155" }}>
                  {line}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}

function LogsPage({ logs, clearLogs }) {
  return (
    <div>
      <div style={s.eyebrow}>Debug</div>
      <div style={s.pageTitle}>Session Logs</div>
      <div style={s.pageSub}>Full output from the last scraper run.</div>

      {logs.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "60px 24px" }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}><IconLogs /></div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#64748B" }}>No logs yet</div>
          <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Run the scraper first to see output here.</div>
        </div>
      ) : (
        <>
          <div style={s.consoleBody}>
            {logs.map((line, i) => (
              <div key={i} style={{ color: line.startsWith("[+]") ? "#10B981" : line.startsWith("[ERROR]") ? "#EF4444" : line.startsWith("[SKIP]") ? "#94A3B8" : line.startsWith("[QUERY]") ? "#4F46E5" : "#334155" }}>
                {line}
              </div>
            ))}
          </div>
          <button onClick={clearLogs} className="btn-danger" style={{ ...s.btnDanger, marginTop: 12 }}><IconTrash /> Clear Logs</button>
        </>
      )}
    </div>
  );
}

function HelpPage() {
  const steps = [
    { n: "1", title: "Pick your queries",  desc: "On the Scraper page, check the niches you want under Preset Queries. Location and country are pre-filled so you can run immediately." },
    { n: "2", title: "Add a custom query", desc: "Fill in Search Term, Location, Country, and a Niche Label. Click Add to Queue. Custom queries persist across restarts via custom_queue.json." },
    { n: "3", title: "Set max leads",      desc: "Use the slider to control how many businesses to scrape per query. Start with 20 to 30 to test before running large batches." },
    { n: "4", title: "Start scraping",     desc: "Click Start Scraping. Chrome opens automatically and browses Google Maps. Green [+] lines are confirmed leads. Do not close the browser mid-run." },
    { n: "5", title: "Check your sheet",   desc: "All leads push live to the Leads tab in your Google Sheet. Columns: Owner Name, Business Name, Niche, Country, Phone, Email, LinkedIn, Status, Notes, Date Added. Duplicates are skipped." },
    { n: "6", title: "Review logs",        desc: "Visit the Logs page after a run. [SKIP] entries were bypassed. [DONE] at the bottom shows the final count." },
  ];
  const tips = [
    { title: "Limit queries per session",  desc: "More than 5 to 6 queries per session can trigger Google rate limiting. Split large campaigns across multiple runs throughout the day." },
    { title: "Queue is persistent",        desc: "Custom queries save to custom_queue.json in the backend folder and reload on startup. Use Clear Queue to reset." },
    { title: "Email extraction is best-effort", desc: "The scraper checks homepage, About, About Us, and Contact pages. Businesses without a public email will show NA in the sheet." },
  ];

  return (
    <div>
      <div style={s.eyebrow}>Documentation</div>
      <div style={s.pageTitle}>How to Use</div>
      <div style={s.pageSub}>Six steps from zero to a full lead sheet.</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={s.card}>
          <div style={{ ...s.cardTitle, marginBottom: 4 }}>Getting Started</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 20 }}>Follow these steps in order</div>
          {steps.map((step, i) => (
            <div key={step.n} style={{ display: "flex", gap: 16, paddingBottom: i < steps.length - 1 ? 20 : 0, marginBottom: i < steps.length - 1 ? 20 : 0, borderBottom: i < steps.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <div style={s.stepNum}>{step.n}</div>
              <div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={s.card}>
          <div style={{ ...s.cardTitle, marginBottom: 20 }}>Tips</div>
          {tips.map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < tips.length - 1 ? 20 : 0, marginBottom: i < tips.length - 1 ? 20 : 0, borderBottom: i < tips.length - 1 ? "1px solid #F1F5F9" : "none" }}>
              <div style={{ ...s.stepNum, background: "#FEF3C7", color: "#D97706" }}>!</div>
              <div>
                <div style={s.stepTitle}>{tip.title}</div>
                <div style={s.stepDesc}>{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  root:           { display: "flex", minHeight: "100vh", background: "#F8FAFC", color: "#0F172A", fontFamily: "'Inter', system-ui, sans-serif" },
  sidebar:        { width: 220, minWidth: 220, background: "#fff", borderRight: "1px solid #E2E8F0", display: "flex", flexDirection: "column", minHeight: "100vh", position: "sticky", top: 0, height: "100vh" },
  logo:           { display: "flex", alignItems: "center", gap: 10, padding: "22px 20px", borderBottom: "1px solid #F1F5F9" },
  logoIcon:       { width: 34, height: 34, background: "#4F46E5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(79,70,229,0.3)" },
  logoText:       { fontSize: 15, fontWeight: 700, color: "#0F172A", letterSpacing: -0.3 },
  logoSub:        { fontSize: 10, color: "#94A3B8", fontWeight: 500, letterSpacing: 0.5, marginTop: 1 },
  navSection:     { padding: "12px 10px", flex: 1 },
  navLabel:       { fontSize: 10, fontWeight: 600, color: "#CBD5E1", letterSpacing: 1, textTransform: "uppercase", padding: "6px 10px 10px" },
  navBtn:         { display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "none", color: "#64748B", fontSize: 13, fontWeight: 500, padding: "9px 10px", width: "100%", textAlign: "left", cursor: "pointer", borderRadius: 8, transition: "all 0.12s", position: "relative" },
  navBtnActive:   { background: "#EEF2FF", color: "#4F46E5", fontWeight: 600 },
  navBtnIcon:     { color: "#94A3B8", display: "flex", alignItems: "center" },
  navActivePill:  { position: "absolute", right: 10, width: 6, height: 6, borderRadius: "50%", background: "#4F46E5" },
  sidebarFoot:    { padding: "12px 10px 16px", borderTop: "1px solid #F1F5F9" },
  footCard:       { background: "#F8FAFC", borderRadius: 10, padding: "12px 14px" },
  footRow:        { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  footPlan:       { fontSize: 12, fontWeight: 600, color: "#334155" },
  footBadge:      { fontSize: 10, fontWeight: 600, color: "#4F46E5", background: "#EEF2FF", padding: "2px 8px", borderRadius: 20 },
  footBarBg:      { height: 4, background: "#E2E8F0", borderRadius: 4, marginBottom: 7 },
  footBarFill:    { height: 4, background: "#4F46E5", borderRadius: 4, width: "84%" },
  footCredits:    { fontSize: 11, color: "#94A3B8" },
  main:           { flex: 1, padding: "32px 36px", overflowY: "auto", maxWidth: "calc(100vw - 220px)" },
  pageHeader:     { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 },
  eyebrow:        { fontSize: 11, fontWeight: 600, color: "#4F46E5", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 },
  pageTitle:      { fontSize: 24, fontWeight: 700, color: "#0F172A", letterSpacing: -0.5, lineHeight: 1.2 },
  pageSub:        { fontSize: 13, color: "#64748B", marginTop: 4 },
  statGrid:       { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 },
  statCard:       { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "18px 20px", position: "relative", overflow: "hidden" },
  statAccentBar:  { position: "absolute", top: 0, left: 0, right: 0, height: 3, borderRadius: "12px 12px 0 0" },
  statLabel:      { fontSize: 11, fontWeight: 600, color: "#94A3B8", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10, marginTop: 4 },
  statValue:      { fontSize: 34, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, fontVariantNumeric: "tabular-nums" },
  statFoot:       { fontSize: 11, color: "#94A3B8", marginTop: 6 },
  bodyGrid:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  card:           { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, padding: "20px 22px" },
  cardHeader:     { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  cardTitle:      { fontSize: 14, fontWeight: 600, color: "#0F172A" },
  cardSub:        { fontSize: 12, color: "#94A3B8" },
  badge:          { fontSize: 11, fontWeight: 600, color: "#4F46E5", background: "#EEF2FF", padding: "2px 8px", borderRadius: 20 },
  checkRow:       { display: "flex", alignItems: "center", gap: 10, padding: "7px 6px", borderRadius: 7, cursor: "pointer" },
  checkBox:       { width: 16, height: 16, border: "1.5px solid #CBD5E1", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer", transition: "all 0.12s", background: "#fff" },
  checkBoxChecked: { background: "#4F46E5", borderColor: "#4F46E5" },
  checkLabel:     { fontSize: 13, color: "#334155", fontWeight: 500, cursor: "pointer" },
  checkLabelSub:  { fontSize: 12, color: "#94A3B8", fontWeight: 400 },
  sliderLabel:    { fontSize: 12, fontWeight: 500, color: "#64748B" },
  sliderValue:    { fontSize: 20, fontWeight: 700, color: "#4F46E5", fontVariantNumeric: "tabular-nums" },
  sliderTick:     { fontSize: 11, color: "#CBD5E1" },
  infoBar:        { background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#4338CA", display: "flex", alignItems: "center", gap: 8 },
  formGrid:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  inputLabel:     { fontSize: 11, fontWeight: 600, color: "#64748B", letterSpacing: 0.3, textTransform: "uppercase", marginBottom: 5 },
  input:          { width: "100%", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, color: "#0F172A", fontSize: 13, padding: "9px 12px", transition: "all 0.15s", fontFamily: "inherit" },
  btnPrimary:     { display: "inline-flex", alignItems: "center", gap: 6, background: "#4F46E5", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, padding: "9px 16px", borderRadius: 8, cursor: "pointer", transition: "all 0.12s" },
  btnDanger:      { display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #E2E8F0", color: "#64748B", fontSize: 13, fontWeight: 500, padding: "9px 14px", borderRadius: 8, cursor: "pointer", transition: "all 0.12s" },
  queuePill:      { display: "flex", alignItems: "center", justifyContent: "space-between", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 8, padding: "9px 12px", transition: "all 0.12s" },
  queueNum:       { fontSize: 11, fontWeight: 600, color: "#94A3B8", marginRight: 8, fontVariantNumeric: "tabular-nums" },
  queueText:      { fontSize: 13, fontWeight: 500, color: "#334155" },
  queueLoc:       { fontSize: 12, color: "#94A3B8", marginLeft: 6 },
  queueDelete:    { background: "transparent", border: "none", color: "#CBD5E1", cursor: "pointer", padding: 4, borderRadius: 4, display: "flex", alignItems: "center", transition: "all 0.12s" },
  consoleHeader:  { background: "#fff", border: "1px solid #E2E8F0", borderBottom: "none", borderRadius: "12px 12px 0 0", padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  consoleTitle:   { fontSize: 12, fontWeight: 600, color: "#64748B", letterSpacing: 0.3 },
  consoleLive:    { fontSize: 11, fontWeight: 600, color: "#10B981", background: "#ECFDF5", padding: "2px 8px", borderRadius: 20 },
  consoleBody:    { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "0 0 12px 12px", padding: "14px 18px", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", fontSize: 12, color: "#334155", minHeight: 180, maxHeight: 320, overflowY: "auto", whiteSpace: "pre-wrap", lineHeight: 1.8 },
  stepNum:        { width: 28, height: 28, borderRadius: 8, background: "#EEF2FF", color: "#4F46E5", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  stepTitle:      { fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 4 },
  stepDesc:       { fontSize: 13, color: "#64748B", lineHeight: 1.6 },
};