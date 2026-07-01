import { useState, useEffect, useRef } from "react";
const API = "https://fazeelayazq-connexuslead.hf.space/api";

const IconBolt     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#fff"/></svg>;
const IconScraper  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const IconLogs     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconHelp     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconMail     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IconTrash    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>;
const IconPlus     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconDot      = () => <svg width="6" height="6" viewBox="0 0 6 6" fill="#4F46E5"><circle cx="3" cy="3" r="3"/></svg>;
const IconRefresh  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
const IconAnalysis = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20"/><path d="M7 20V10"/><path d="M12 20V4"/><path d="M17 20v-6"/></svg>;
const IconChevron  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;

// ─── RESPONSIVE HOOK ──────────────────────────────────────
function useIsMobile(breakpoint = 860) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    function onResize() { setIsMobile(window.innerWidth <= breakpoint); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);
  return isMobile;
}

const NAV_ITEMS = [
  { id: "Scraper",  icon: <IconScraper />  },
  { id: "Analysis", icon: <IconAnalysis /> },
  { id: "Outreach", icon: <IconMail />     },
  { id: "Logs",     icon: <IconLogs />     },
  { id: "Help",     icon: <IconHelp />     },
];

export default function App() {
  const [page, setPage]                       = useState("Scraper");
  const [presets, setPresets]                 = useState([]);
  const [selectedPresets, setSelectedPresets] = useState([]);
  const [queue, setQueue]                     = useState([]);
  const [stats, setStats]                     = useState({ total: 0, with_email: 0, with_phone: 0, new_leads: 0 });
  const [emailStats, setEmailStats]           = useState({ total: 0, email_sent: 0, followup_sent: 0, seen: 0, pending: 0, error: 0 });
  const [analysisStats, setAnalysisStats]     = useState({});
  const [logs, setLogs]                       = useState([]);
  const [running, setRunning]                 = useState(false);
  const [maxLeads, setMaxLeads]               = useState(20);
  const [form, setForm]                       = useState({ query: "", location: "", country: "", niche: "" });
  const logRef                                = useRef(null);
  const isMobile                              = useIsMobile();

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight; }, [logs]);

  function fetchAll() { fetchPresets(); fetchQueue(); fetchStats(); fetchEmailStats(); fetchAnalysisStats(); }
  async function fetchPresets()       { try { const r = await fetch(`${API}/presets`);         setPresets(await r.json());       } catch {} }
  async function fetchQueue()         { try { const r = await fetch(`${API}/queue`);           setQueue(await r.json());         } catch {} }
  async function fetchStats()         { try { const r = await fetch(`${API}/stats`);           setStats(await r.json());         } catch {} }
  async function fetchEmailStats()    { try { const r = await fetch(`${API}/email-stats`);     setEmailStats(await r.json());    } catch {} }
  async function fetchAnalysisStats() { try { const r = await fetch(`${API}/analysis-stats`); setAnalysisStats(await r.json()); } catch {} }

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
        if (msg === "__DONE__") { setRunning(false); fetchStats(); fetchEmailStats(); fetchAnalysisStats(); break; }
        setLogs(prev => [...prev, msg]);
      }
    }
    setRunning(false);
  }

  const totalSelected = selectedPresets.length + queue.length;

  return (
    <div style={{ ...s.root, flexDirection: isMobile ? "column" : "row" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #F8FAFC; }
        input:focus { outline: none; border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79,70,229,0.12) !important; }
        button:disabled { opacity: 0.45; cursor: not-allowed; }
        button { -webkit-tap-highlight-color: transparent; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; background: #E2E8F0; border-radius: 4px; outline: none; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #4F46E5; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(79,70,229,0.35); cursor: pointer; }
        ::-webkit-scrollbar { width: 5px; height: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .nav-btn:hover { background: #EEF2FF !important; color: #4F46E5 !important; }
        .btn-primary:hover { background: #4338CA !important; }
        .btn-secondary:hover { border-color: #4F46E5 !important; color: #4F46E5 !important; }
        .btn-danger:hover { background: #FEE2E2 !important; color: #DC2626 !important; border-color: #FECACA !important; }
        .stat-card:hover { box-shadow: 0 4px 24px rgba(79,70,229,0.10) !important; transform: translateY(-1px); }
        .stat-card { transition: all 0.15s; }
        .queue-pill:hover { border-color: #C7D2FE !important; }
        .email-stat-row:hover { background: #F8FAFC !important; }
        .refresh-btn:hover { background: #EEF2FF !important; color: #4F46E5 !important; }
        .analysis-row:hover { background: #F8FAFC !important; }
        .issue-chip { display:inline-block; background:#FEF3C7; color:#92400E; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:500; margin:2px; }
        .soc-chip   { display:inline-block; background:#EEF2FF; color:#3730A3; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:500; margin:2px; }
        .suggest-line { border-left:3px solid #4F46E5; padding-left:10px; margin-bottom:6px; font-size:12px; color:#334155; line-height:1.5; }
        .kpi-scroll { display:flex; gap:10px; overflow-x:auto; -webkit-overflow-scrolling:touch; scroll-snap-type:x proximity; padding-bottom:4px; }
        .kpi-scroll::-webkit-scrollbar { display:none; }
        .kpi-scroll > div { scroll-snap-align:start; }
        .bottom-nav-btn { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; flex:1; background:transparent; border:none; padding:8px 2px 6px; cursor:pointer; color:#94A3B8; font-size:10px; font-weight:600; }
        .bottom-nav-btn.active { color:#4F46E5; }
        .lead-card { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:14px 16px; margin-bottom:10px; }
        @media (max-width: 860px) {
          .desktop-only { display: none !important; }
        }
        @media (min-width: 861px) {
          .mobile-only { display: none !important; }
        }
      `}</style>

      {/* MOBILE TOP BAR */}
      {isMobile && (
        <header style={s.mobileHeader}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <div style={s.logoIcon}><IconBolt /></div>
            <div style={s.logoText}>Connexus</div>
          </div>
          <div style={s.mobileHeaderBadge}>Pro · 84%</div>
        </header>
      )}

      {/* DESKTOP SIDEBAR */}
      {!isMobile && (
        <aside style={s.sidebar}>
          <div style={s.logo}>
            <div style={s.logoIcon}><IconBolt /></div>
            <div>
              <div style={s.logoText}>Connexus</div>
              <div style={s.logoSub}>Lead Intel</div>
            </div>
          </div>
          <div style={s.navSection}>
            <div style={s.navLabel}>Menu</div>
            {NAV_ITEMS.map(({ id, icon }) => (
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
      )}

      {/* MAIN */}
      <main style={{ ...s.main, ...(isMobile ? s.mainMobile : {}) }}>
        {page === "Scraper"  && <ScraperPage  isMobile={isMobile} stats={stats} presets={presets} selectedPresets={selectedPresets} togglePreset={togglePreset} queue={queue} removeFromQueue={removeFromQueue} clearQueue={clearQueue} form={form} setForm={setForm} addToQueue={addToQueue} maxLeads={maxLeads} setMaxLeads={setMaxLeads} totalSelected={totalSelected} running={running} startScraping={startScraping} logs={logs} logRef={logRef} />}
        {page === "Analysis" && <AnalysisPage isMobile={isMobile} analysisStats={analysisStats} fetchAnalysisStats={fetchAnalysisStats} />}
        {page === "Outreach" && <OutreachPage isMobile={isMobile} emailStats={emailStats} fetchEmailStats={fetchEmailStats} />}
        {page === "Logs"     && <LogsPage     logs={logs} clearLogs={() => setLogs([])} />}
        {page === "Help"     && <HelpPage />}
      </main>

      {/* MOBILE BOTTOM NAV */}
      {isMobile && (
        <nav style={s.bottomNav}>
          {NAV_ITEMS.map(({ id, icon }) => (
            <button key={id} className={`bottom-nav-btn ${page === id ? "active" : ""}`} onClick={() => setPage(id)}>
              {icon}
              {id}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// ─── ANALYSIS PAGE ────────────────────────────────────────
function AnalysisPage({ isMobile, analysisStats, fetchAnalysisStats }) {
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const [search, setSearch]   = useState("");

  useEffect(() => { loadLeads(); }, []);

  async function loadLeads() {
    setLoading(true);
    try {
      const r    = await fetch(`${API}/leads-analysis`);
      const data = await r.json();
      setLeads(data || []);
    } catch {
      setLeads([]);
    }
    setLoading(false);
  }

  const { no_ssl = 0, slow_sites = 0, low_seo = 0, broken_links = 0, no_social = 0 } = analysisStats;
  const total = leads.length;

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.biz_name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === "no_ssl")    return l.has_ssl === "❌ No";
    if (filter === "slow")      return parseFloat(l.load_time) > 3;
    if (filter === "low_seo")   return parseInt(l.seo_score) < 60;
    if (filter === "broken")    return parseInt(l.broken_links) > 0;
    if (filter === "no_social") return !l.social_media || l.social_media === "None found";
    return true;
  });

  const kpis = [
    { label: "No SSL",        value: no_ssl,      color: "#EF4444", bg: "#FEF2F2",  filter: "no_ssl",    desc: "Visitors see 'Not Secure'" },
    { label: "Slow Sites",    value: slow_sites,  color: "#F59E0B", bg: "#FFFBEB",  filter: "slow",      desc: "Load time > 3 seconds" },
    { label: "Low SEO",       value: low_seo,     color: "#8B5CF6", bg: "#F5F3FF", filter: "low_seo",   desc: "SEO score under 60" },
    { label: "Broken Links",  value: broken_links,color: "#EF4444", bg: "#FEF2F2",  filter: "broken",    desc: "Internal 404 pages found" },
    { label: "No Social",     value: no_social,   color: "#0EA5E9", bg: "#E0F2FE",  filter: "no_social", desc: "Missing social media links" },
  ];

  function seoColor(score) {
    const n = parseInt(score);
    if (isNaN(n)) return "#94A3B8";
    if (n >= 80)  return "#10B981";
    if (n >= 60)  return "#F59E0B";
    return "#EF4444";
  }

  function speedColor(speed) {
    const n = parseFloat(speed);
    if (isNaN(n) || n < 0) return "#94A3B8";
    if (n <= 2) return "#10B981";
    if (n <= 4) return "#F59E0B";
    return "#EF4444";
  }

  return (
    <div style={{ animation: "fadeIn 0.2s ease" }}>
      <div style={{ ...s.pageHeader, ...(isMobile ? s.pageHeaderMobile : {}) }}>
        <div>
          <div style={s.eyebrow}>Website Intelligence</div>
          <div style={{ ...s.pageTitle, ...(isMobile ? s.pageTitleMobile : {}) }}>Analysis Dashboard</div>
          <div style={s.pageSub}>SSL, speed, SEO, broken links, and social media — per lead.</div>
        </div>
        <button onClick={() => { fetchAnalysisStats(); loadLeads(); }} className="refresh-btn"
          style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#fff", border:"1.5px solid #E2E8F0", color:"#64748B", fontSize:13, fontWeight:500, padding:"9px 16px", borderRadius:8, cursor:"pointer", transition:"all 0.12s", whiteSpace:"nowrap" }}>
          <IconRefresh /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      {isMobile ? (
        <div className="kpi-scroll" style={{ marginBottom:20 }}>
          {kpis.map(k => (
            <div key={k.label} className="stat-card"
              onClick={() => setFilter(filter === k.filter ? "all" : k.filter)}
              style={{ ...s.statCard, minWidth:150, cursor:"pointer", border: filter === k.filter ? `2px solid ${k.color}` : "1px solid #E2E8F0", background: filter === k.filter ? k.bg : "#fff" }}>
              <div style={{ fontSize:26, fontWeight:700, color:k.color, fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:"#334155", marginTop:5 }}>{k.label}</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{k.desc}</div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:12, marginBottom:24 }}>
          {kpis.map(k => (
            <div key={k.label} className="stat-card"
              onClick={() => setFilter(filter === k.filter ? "all" : k.filter)}
              style={{ ...s.statCard, cursor:"pointer", border: filter === k.filter ? `2px solid ${k.color}` : "1px solid #E2E8F0", background: filter === k.filter ? k.bg : "#fff" }}>
              <div style={{ fontSize:28, fontWeight:700, color:k.color, fontVariantNumeric:"tabular-nums", lineHeight:1 }}>{k.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:"#334155", marginTop:5 }}>{k.label}</div>
              <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{k.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <input
          style={{ ...s.input, maxWidth: isMobile ? "100%" : 280, padding:"8px 12px" }}
          placeholder="Search business name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {filter !== "all" && (
          <button onClick={() => setFilter("all")} className="btn-danger" style={s.btnDanger}>
            Clear filter
          </button>
        )}
        <span style={{ fontSize:12, color:"#94A3B8", marginLeft: isMobile ? 0 : "auto" }}>
          {filtered.length} of {total} leads
        </span>
      </div>

      {/* Leads: Table (desktop) / Cards (mobile) */}
      {loading ? (
        <div style={{ ...s.card, padding:0 }}>
          <div style={{ padding:"48px 0", textAlign:"center", color:"#94A3B8", fontSize:13 }}>
            <div style={{ width:28, height:28, border:"2.5px solid #E2E8F0", borderTopColor:"#4F46E5", borderRadius:"50%", animation:"spin 0.7s linear infinite", margin:"0 auto 12px" }} />
            Loading analysis data...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...s.card, padding:0 }}>
          <div style={{ padding:"48px 0", textAlign:"center", color:"#94A3B8", fontSize:13 }}>
            <div style={{ fontSize:32, marginBottom:10 }}>🔍</div>
            No leads match this filter.<br />
            <span style={{ fontSize:12 }}>Run the scraper first, then come back here.</span>
          </div>
        </div>
      ) : isMobile ? (
        <div>
          {filtered.map((lead, i) => (
            <div key={i} className="lead-card">
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div>
                  <div style={{ fontWeight:700, color:"#0F172A", fontSize:14 }}>{lead.biz_name || "—"}</div>
                  <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{lead.niche}</div>
                </div>
                <div style={{ width:38, height:38, borderRadius:"50%", background:`conic-gradient(${seoColor(lead.seo_score)} ${(parseInt(lead.seo_score)||0) * 3.6}deg, #E2E8F0 0)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <div style={{ width:28, height:28, background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color: seoColor(lead.seo_score) }}>
                    {lead.seo_score || "?"}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                <span style={{ padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600, background: lead.has_ssl === "✅ Yes" ? "#ECFDF5" : "#FEF2F2", color: lead.has_ssl === "✅ Yes" ? "#065F46" : "#991B1B" }}>
                  {lead.has_ssl === "✅ Yes" ? "✅ Secure" : "❌ No SSL"}
                </span>
                <span style={{ padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600, background:"#F8FAFC", color: speedColor(lead.load_time) }}>
                  ⚡ {lead.load_time && lead.load_time !== "N/A" ? lead.load_time : "—"}
                </span>
                {parseInt(lead.broken_links) > 0
                  ? <span style={{ background:"#FEF2F2", color:"#991B1B", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600 }}>⚠ {lead.broken_links} broken</span>
                  : <span style={{ background:"#ECFDF5", color:"#065F46", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600 }}>✓ No broken links</span>
                }
              </div>
              {lead.social_media && lead.social_media !== "None found" ? (
                <div style={{ marginBottom:8 }}>
                  {lead.social_media.split(",").slice(0,3).map((soc,j) => (
                    <span key={j} className="soc-chip">{soc.split(":")[0].trim()}</span>
                  ))}
                </div>
              ) : (
                <div style={{ color:"#EF4444", fontSize:11, fontWeight:500, marginBottom:8 }}>No social profiles found</div>
              )}
              {lead.suggestions && (
                <div style={{ borderTop:"1px solid #F1F5F9", paddingTop:8, marginTop:2 }}>
                  {lead.suggestions.split("|").slice(0,2).map((tip, j) => (
                    <div key={j} className="suggest-line">{tip.trim()}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...s.card, padding:0, overflow:"hidden" }}>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
              <thead>
                <tr style={{ background:"#F8FAFC", borderBottom:"1px solid #E2E8F0" }}>
                  {["Business","SSL","Speed","SEO","Broken Links","Social Media","Issues / Suggestions"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:600, color:"#94A3B8", letterSpacing:0.4, textTransform:"uppercase", whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead, i) => (
                  <tr key={i} className="analysis-row" style={{ borderBottom:"1px solid #F1F5F9", transition:"background 0.1s" }}>
                    <td style={{ padding:"12px 14px", maxWidth:160 }}>
                      <div style={{ fontWeight:600, color:"#0F172A", fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{lead.biz_name || "—"}</div>
                      <div style={{ fontSize:11, color:"#94A3B8", marginTop:2 }}>{lead.niche}</div>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{
                        display:"inline-flex", alignItems:"center", gap:4,
                        padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600,
                        background: lead.has_ssl === "✅ Yes" ? "#ECFDF5" : "#FEF2F2",
                        color:       lead.has_ssl === "✅ Yes" ? "#065F46" : "#991B1B",
                      }}>
                        {lead.has_ssl === "✅ Yes" ? "✅ Secure" : "❌ None"}
                      </span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <span style={{ fontWeight:600, color: speedColor(lead.load_time), fontVariantNumeric:"tabular-nums" }}>
                        {lead.load_time && lead.load_time !== "N/A" ? lead.load_time : "—"}
                      </span>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                        <div style={{ width:36, height:36, borderRadius:"50%", background:`conic-gradient(${seoColor(lead.seo_score)} ${(parseInt(lead.seo_score)||0) * 3.6}deg, #E2E8F0 0)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <div style={{ width:26, height:26, background:"#fff", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color: seoColor(lead.seo_score) }}>
                            {lead.seo_score || "?"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 14px" }}>
                      {parseInt(lead.broken_links) > 0
                        ? <span style={{ background:"#FEF2F2", color:"#991B1B", padding:"3px 8px", borderRadius:6, fontSize:11, fontWeight:600 }}>⚠ {lead.broken_links}</span>
                        : <span style={{ color:"#10B981", fontWeight:600, fontSize:12 }}>✓ None</span>
                      }
                    </td>
                    <td style={{ padding:"12px 14px", maxWidth:180 }}>
                      {lead.social_media && lead.social_media !== "None found" ? (
                        <div>
                          {lead.social_media.split(",").slice(0,3).map((soc,j) => (
                            <span key={j} className="soc-chip">{soc.split(":")[0].trim()}</span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color:"#EF4444", fontSize:11, fontWeight:500 }}>None found</span>
                      )}
                    </td>
                    <td style={{ padding:"12px 14px", maxWidth:300 }}>
                      {lead.suggestions
                        ? lead.suggestions.split("|").slice(0,3).map((tip, j) => (
                            <div key={j} className="suggest-line">{tip.trim()}</div>
                          ))
                        : <span style={{ color:"#94A3B8", fontSize:11 }}>No issues</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop:14, display:"flex", gap:16, flexWrap:"wrap" }}>
        {[
          { color:"#10B981", label:"Good (SEO ≥80 / Speed ≤2s)" },
          { color:"#F59E0B", label:"Warning (SEO 60–79 / Speed 2–4s)" },
          { color:"#EF4444", label:"Critical (SEO <60 / Speed >4s)" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#64748B" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OUTREACH PAGE ────────────────────────────────────────
function OutreachPage({ isMobile, emailStats, fetchEmailStats }) {
  const { total, email_sent, followup_sent, seen, pending, error } = emailStats;
  const contacted  = (email_sent || 0) + (followup_sent || 0) + (seen || 0);
  const openRate   = contacted > 0 ? Math.round((seen || 0) / contacted * 100) : 0;
  const reachRate  = total > 0     ? Math.round(contacted / total * 100)        : 0;

  const rows = [
    { label: "First Email Sent",  value: email_sent,    color: "#4F46E5", bg: "#EEF2FF",  desc: "Promo email delivered" },
    { label: "Followup Sent",     value: followup_sent, color: "#0EA5E9", bg: "#E0F2FE",  desc: "Second touchpoint sent" },
    { label: "Seen (Opened)",     value: seen,          color: "#10B981", bg: "#ECFDF5",  desc: "Email opened by recipient" },
    { label: "Pending",           value: pending,       color: "#F59E0B", bg: "#FFFBEB",  desc: "Not emailed yet" },
    { label: "Errors",            value: error || 0,    color: "#EF4444", bg: "#FEF2F2",  desc: "Send failed" },
  ];

  return (
    <div>
      <div style={{ ...s.pageHeader, ...(isMobile ? s.pageHeaderMobile : {}) }}>
        <div>
          <div style={s.eyebrow}>Email Campaign</div>
          <div style={{ ...s.pageTitle, ...(isMobile ? s.pageTitleMobile : {}) }}>Outreach Overview</div>
          <div style={s.pageSub}>Live status from your Google Sheet — synced with the Apps Script automation.</div>
        </div>
        <button onClick={fetchEmailStats} className="refresh-btn"
          style={{ display:"inline-flex", alignItems:"center", gap:6, background:"#fff", border:"1.5px solid #E2E8F0", color:"#64748B", fontSize:13, fontWeight:500, padding:"9px 16px", borderRadius:8, cursor:"pointer", transition:"all 0.12s", whiteSpace:"nowrap" }}>
          <IconRefresh /> Refresh
        </button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 14, marginBottom:24 }}>
        {[
          { label:"Total Leads",  value:total,         color:"#4F46E5", foot:"In sheet" },
          { label:"Contacted",    value:contacted,     color:"#0EA5E9", foot:`${reachRate}% of all leads` },
          { label:"Open Rate",    value:`${openRate}%`,color:"#10B981", foot:`${seen} opened` },
        ].map(({ label, value, color, foot }, i) => (
          <div key={label} className="stat-card" style={{ ...s.statCard, ...(isMobile && i === 2 ? { gridColumn:"1 / -1" } : {}) }}>
            <div style={{ ...s.statAccentBar, background:color }} />
            <div style={s.statLabel}>{label}</div>
            <div style={{ ...s.statValue, color, fontSize: isMobile ? 26 : 34 }}>{value}</div>
            <div style={s.statFoot}>{foot}</div>
          </div>
        ))}
      </div>
      <div style={s.card}>
        <div style={{ ...s.cardHeader, marginBottom:4 }}>
          <div style={s.cardTitle}>Status Breakdown</div>
          <div style={s.cardSub}>Per-status count from Leads tab</div>
        </div>
        {total > 0 && (
          <div style={{ marginBottom:20, marginTop:16 }}>
            <div style={{ display:"flex", height:8, borderRadius:8, overflow:"hidden", gap:1 }}>
              {[
                { val:email_sent,    color:"#4F46E5" },
                { val:followup_sent, color:"#0EA5E9" },
                { val:seen,          color:"#10B981" },
                { val:pending,       color:"#F59E0B" },
                { val:error||0,      color:"#EF4444" },
              ].filter(s => s.val > 0).map((seg, i) => (
                <div key={i} style={{ flex:seg.val, background:seg.color, minWidth:seg.val>0?4:0 }} />
              ))}
            </div>
          </div>
        )}
        <div style={{ display:"flex", flexDirection:"column" }}>
          {rows.map((row, i) => (
            <div key={row.label} className="email-stat-row"
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding: isMobile ? "12px 6px" : "13px 10px", borderTop:i===0?"none":"1px solid #F1F5F9", borderRadius:8, transition:"background 0.1s", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 12, minWidth:0 }}>
                <div style={{ width:34, height:34, borderRadius:8, background:row.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <div style={{ width:10, height:10, borderRadius:"50%", background:row.color }} />
                </div>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:"#0F172A" }}>{row.label}</div>
                  {!isMobile && <div style={{ fontSize:12, color:"#94A3B8", marginTop:1 }}>{row.desc}</div>}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap: isMobile ? 8 : 16, flexShrink:0 }}>
                {total > 0 && !isMobile && (
                  <div style={{ fontSize:12, color:"#94A3B8", minWidth:36, textAlign:"right" }}>
                    {Math.round((row.value||0)/total*100)}%
                  </div>
                )}
                <div style={{ fontSize: isMobile ? 18 : 22, fontWeight:700, color:row.color, minWidth: isMobile ? 30 : 44, textAlign:"right", fontVariantNumeric:"tabular-nums" }}>
                  {row.value ?? 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop:14, background:"#EEF2FF", border:"1px solid #C7D2FE", borderRadius:10, padding:"11px 16px", fontSize:12, color:"#4338CA", display:"flex", alignItems:"center", gap:8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span><b>Seen</b> status updates automatically when a lead opens your email — powered by the tracking pixel in your Apps Script Web App.</span>
      </div>
    </div>
  );
}

// ─── SCRAPER PAGE ─────────────────────────────────────────
function ScraperPage({ isMobile, stats, presets, selectedPresets, togglePreset, queue, removeFromQueue, clearQueue, form, setForm, addToQueue, maxLeads, setMaxLeads, totalSelected, running, startScraping, logs, logRef }) {
  const total    = stats.total      ?? 0;
  const wEmail   = stats.with_email ?? 0;
  const wPhone   = stats.with_phone ?? 0;
  const todayNew = stats.new_leads  ?? 0;
  const emailPct = total > 0 ? `${Math.round(wEmail/total*100)}%` : "0%";
  const phonePct = total > 0 ? `${Math.round(wPhone/total*100)}%` : "0%";
  return (
    <div>
      <div style={{ ...s.pageHeader, ...(isMobile ? s.pageHeaderMobile : {}) }}>
        <div>
          <div style={s.eyebrow}>Lead Intelligence</div>
          <div style={{ ...s.pageTitle, ...(isMobile ? s.pageTitleMobile : {}) }}>Lead Scraper</div>
          <div style={s.pageSub}>Pull verified business leads from Google Maps into your sheet.</div>
        </div>
        <button onClick={startScraping} disabled={running} className="btn-primary"
          style={{ ...s.btnPrimary, padding:"10px 22px", fontSize:14, width: isMobile ? "100%" : "auto", justifyContent:"center" }}>
          {running
            ? <><span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,0.4)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Running...</>
            : <><IconPlus /> Start Scraping</>}
        </button>
      </div>
      <div style={{ ...s.statGrid, gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 10 : 14 }}>
        {[
          { label:"Total Leads",  value:total,    foot:"In Google Sheet",      color:"#4F46E5" },
          { label:"With Email",   value:wEmail,   foot:`${emailPct} of total`, color:"#0EA5E9" },
          { label:"With Phone",   value:wPhone,   foot:`${phonePct} of total`, color:"#10B981" },
          { label:"Added Today",  value:todayNew, foot:"Live from sheet",       color:"#F59E0B" },
        ].map(({ label, value, foot, color }) => (
          <div key={label} className="stat-card" style={s.statCard}>
            <div style={{ ...s.statAccentBar, background:color }} />
            <div style={s.statLabel}>{label}</div>
            <div style={{ ...s.statValue, color, fontSize: isMobile ? 26 : 34 }}>{value}</div>
            <div style={s.statFoot}>{foot}</div>
          </div>
        ))}
      </div>
      <div style={{ ...s.bodyGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>Preset Queries</div>
              <div style={s.cardSub}>{selectedPresets.length} selected</div>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              {presets.map((p) => (
                <label key={p.index} style={s.checkRow}>
                  <div style={{ ...s.checkBox, ...(selectedPresets.includes(p.index) ? s.checkBoxChecked : {}) }}
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
            <div style={{ marginTop:14 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={s.sliderLabel}>Leads</span>
                <span style={s.sliderValue}>{maxLeads}</span>
              </div>
              <input type="range" min={5} max={100} value={maxLeads} onChange={e => setMaxLeads(Number(e.target.value))} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
                <span style={s.sliderTick}>5</span>
                <span style={s.sliderTick}>100</span>
              </div>
            </div>
          </div>
          {totalSelected > 0 && (
            <div style={s.infoBar}>
              <IconDot />
              <span><b style={{ color:"#4F46E5" }}>{totalSelected}</b> {totalSelected===1?"query":"queries"} queued, up to <b style={{ color:"#4F46E5" }}>{totalSelected*maxLeads}</b> leads</span>
            </div>
          )}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={s.card}>
            <div style={s.cardHeader}><div style={s.cardTitle}>Custom Query</div></div>
            <div style={{ ...s.formGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
              {[
                { key:"query",    label:"Search Term", placeholder:"e.g. SEO Consultant" },
                { key:"location", label:"Location",    placeholder:"e.g. London, UK"     },
                { key:"country",  label:"Country",     placeholder:"e.g. UK"             },
                { key:"niche",    label:"Niche Label", placeholder:"e.g. SEO Agency"     },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <div style={s.inputLabel}>{label}</div>
                  <input style={s.input} placeholder={placeholder} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              <button onClick={addToQueue} className="btn-primary" style={{ ...s.btnPrimary, flex: isMobile ? 1 : "initial", justifyContent:"center" }}><IconPlus /> Add to Queue</button>
              <button onClick={clearQueue} className="btn-danger"  style={{ ...s.btnDanger, flex: isMobile ? 1 : "initial", justifyContent:"center" }}><IconTrash /> Clear Queue</button>
            </div>
          </div>
          {queue.length > 0 && (
            <div style={s.card}>
              <div style={s.cardHeader}>
                <div style={s.cardTitle}>Queue</div>
                <span style={s.badge}>{queue.length}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {queue.map((item, i) => (
                  <div key={i} className="queue-pill" style={s.queuePill}>
                    <div style={{ minWidth:0, overflow:"hidden" }}>
                      <span style={s.queueNum}>{i+1}</span>
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
      <div style={{ marginTop:24 }}>
        <div style={s.consoleHeader}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:running?"#10B981":"#94A3B8", animation:running?"pulse 1.5s ease-in-out infinite":"none" }} />
            <span style={s.consoleTitle}>Live Console</span>
          </div>
          {running && <span style={s.consoleLive}>Running</span>}
        </div>
        <div ref={logRef} style={{ ...s.consoleBody, fontSize: isMobile ? 11 : 12, maxHeight: isMobile ? 240 : 320 }}>
          {logs.length === 0
            ? <span style={{ color:"#94A3B8", fontStyle:"italic" }}>Waiting for scraper to start...</span>
            : logs.map((line, i) => (
                <div key={i} style={{ color: line.startsWith("[+]")?"#10B981":line.startsWith("[ERROR]")?"#EF4444":line.startsWith("[SKIP]")?"#94A3B8":line.startsWith("[QUERY]")?"#4F46E5":line.startsWith("[ANALYZING]")?"#8B5CF6":"#334155" }}>
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
        <div style={{ ...s.card, textAlign:"center", padding:"60px 24px", marginTop:20 }}>
          <div style={{ width:48, height:48, borderRadius:"50%", background:"#EEF2FF", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}><IconLogs /></div>
          <div style={{ fontSize:14, fontWeight:600, color:"#64748B" }}>No logs yet</div>
          <div style={{ fontSize:13, color:"#94A3B8", marginTop:4 }}>Run the scraper first to see output here.</div>
        </div>
      ) : (
        <>
          <div style={{ ...s.consoleBody, marginTop:20 }}>
            {logs.map((line, i) => (
              <div key={i} style={{ color: line.startsWith("[+]")?"#10B981":line.startsWith("[ERROR]")?"#EF4444":line.startsWith("[SKIP]")?"#94A3B8":line.startsWith("[QUERY]")?"#4F46E5":"#334155" }}>
                {line}
              </div>
            ))}
          </div>
          <button onClick={clearLogs} className="btn-danger" style={{ ...s.btnDanger, marginTop:12 }}><IconTrash /> Clear Logs</button>
        </>
      )}
    </div>
  );
}

function HelpPage() {
  const steps = [
    { n:"1", title:"Pick your queries",   desc:"On the Scraper page, check the niches you want under Preset Queries. Location and country are pre-filled so you can run immediately." },
    { n:"2", title:"Add a custom query",  desc:"Fill in Search Term, Location, Country, and a Niche Label. Click Add to Queue. Custom queries persist across restarts via custom_queue.json." },
    { n:"3", title:"Set max leads",       desc:"Use the slider to control how many businesses to scrape per query. Start with 20 to 30 to test before running large batches." },
    { n:"4", title:"Start scraping",      desc:"Click Start Scraping. Chrome opens automatically and browses Google Maps. Purple [ANALYZING] lines mean the website analysis is running. Green [+] lines are confirmed leads." },
    { n:"5", title:"View Analysis page",  desc:"After scraping, go to the Analysis tab. Click any KPI card to filter leads by that issue. Each lead shows SSL, speed, SEO score, broken links, social media, and tailored suggestions." },
    { n:"6", title:"Check your sheet",    desc:"All leads push live to the Leads tab. Columns K–S hold the analysis data: SSL, Speed, SEO Score, Broken Links, Meta Title, Meta Desc, Social Media, Issues, Suggestions." },
  ];
  const tips = [
    { title:"Use the analysis to pitch",     desc:"Sort by 'No SSL' or 'Low SEO' — these are your easiest sells. Every issue listed is a pain point you can solve." },
    { title:"Limit queries per session",     desc:"More than 5 to 6 queries per session can trigger Google rate limiting. Split large campaigns across multiple runs." },
    { title:"Email extraction is best-effort", desc:"The scraper checks 12 pages per website. Businesses without a public email will show NA in the sheet." },
  ];
  return (
    <div>
      <div style={s.eyebrow}>Documentation</div>
      <div style={s.pageTitle}>How to Use</div>
      <div style={s.pageSub}>Six steps from zero to a full lead sheet.</div>
      <div style={{ display:"flex", flexDirection:"column", gap:16, marginTop:20 }}>
        <div style={s.card}>
          <div style={{ ...s.cardTitle, marginBottom:4 }}>Getting Started</div>
          <div style={{ fontSize:12, color:"#94A3B8", marginBottom:20 }}>Follow these steps in order</div>
          {steps.map((step, i) => (
            <div key={step.n} style={{ display:"flex", gap:16, paddingBottom:i<steps.length-1?20:0, marginBottom:i<steps.length-1?20:0, borderBottom:i<steps.length-1?"1px solid #F1F5F9":"none" }}>
              <div style={s.stepNum}>{step.n}</div>
              <div>
                <div style={s.stepTitle}>{step.title}</div>
                <div style={s.stepDesc}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={s.card}>
          <div style={{ ...s.cardTitle, marginBottom:20 }}>Tips</div>
          {tips.map((tip, i) => (
            <div key={i} style={{ display:"flex", gap:16, paddingBottom:i<tips.length-1?20:0, marginBottom:i<tips.length-1?20:0, borderBottom:i<tips.length-1?"1px solid #F1F5F9":"none" }}>
              <div style={{ ...s.stepNum, background:"#FEF3C7", color:"#D97706" }}>!</div>
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
  root:           { display:"flex", minHeight:"100vh", background:"#F8FAFC", color:"#0F172A", fontFamily:"'Inter',system-ui,sans-serif" },
  sidebar:        { width:220, minWidth:220, background:"#fff", borderRight:"1px solid #E2E8F0", display:"flex", flexDirection:"column", minHeight:"100vh", position:"sticky", top:0, height:"100vh" },
  logo:           { display:"flex", alignItems:"center", gap:10, padding:"22px 20px", borderBottom:"1px solid #F1F5F9" },
  logoIcon:       { width:34, height:34, background:"#4F46E5", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 2px 8px rgba(79,70,229,0.3)" },
  logoText:       { fontSize:15, fontWeight:700, color:"#0F172A", letterSpacing:-0.3 },
  logoSub:        { fontSize:10, color:"#94A3B8", fontWeight:500, letterSpacing:0.5, marginTop:1 },
  navSection:     { padding:"12px 10px", flex:1 },
  navLabel:       { fontSize:10, fontWeight:600, color:"#CBD5E1", letterSpacing:1, textTransform:"uppercase", padding:"6px 10px 10px" },
  navBtn:         { display:"flex", alignItems:"center", gap:9, background:"transparent", border:"none", color:"#64748B", fontSize:13, fontWeight:500, padding:"9px 10px", width:"100%", textAlign:"left", cursor:"pointer", borderRadius:8, transition:"all 0.12s", position:"relative" },
  navBtnActive:   { background:"#EEF2FF", color:"#4F46E5", fontWeight:600 },
  navBtnIcon:     { color:"#94A3B8", display:"flex", alignItems:"center" },
  navActivePill:  { position:"absolute", right:10, width:6, height:6, borderRadius:"50%", background:"#4F46E5" },
  sidebarFoot:    { padding:"12px 10px 16px", borderTop:"1px solid #F1F5F9" },
  footCard:       { background:"#F8FAFC", borderRadius:10, padding:"12px 14px" },
  footRow:        { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 },
  footPlan:       { fontSize:12, fontWeight:600, color:"#334155" },
  footBadge:      { fontSize:10, fontWeight:600, color:"#4F46E5", background:"#EEF2FF", padding:"2px 8px", borderRadius:20 },
  footBarBg:      { height:4, background:"#E2E8F0", borderRadius:4, marginBottom:7 },
  footBarFill:    { height:4, background:"#4F46E5", borderRadius:4, width:"84%" },
  footCredits:    { fontSize:11, color:"#94A3B8" },
  main:           { flex:1, padding:"32px 36px", overflowY:"auto", maxWidth:"calc(100vw - 220px)" },
  mainMobile:     { maxWidth:"100vw", padding:"16px 16px 92px", overflowX:"hidden" },
  mobileHeader:   { position:"sticky", top:0, zIndex:20, background:"#fff", borderBottom:"1px solid #E2E8F0", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  mobileHeaderBadge: { fontSize:10, fontWeight:600, color:"#4F46E5", background:"#EEF2FF", padding:"4px 9px", borderRadius:20 },
  bottomNav:      { position:"fixed", bottom:0, left:0, right:0, zIndex:20, background:"#fff", borderTop:"1px solid #E2E8F0", display:"flex", paddingBottom:"env(safe-area-inset-bottom, 0px)", boxShadow:"0 -2px 12px rgba(15,23,42,0.05)" },
  pageHeader:     { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28 },
  pageHeaderMobile: { flexDirection:"column", gap:14, marginBottom:20 },
  eyebrow:        { fontSize:11, fontWeight:600, color:"#4F46E5", letterSpacing:0.8, textTransform:"uppercase", marginBottom:5 },
  pageTitle:      { fontSize:24, fontWeight:700, color:"#0F172A", letterSpacing:-0.5, lineHeight:1.2 },
  pageTitleMobile:{ fontSize:20 },
  pageSub:        { fontSize:13, color:"#64748B", marginTop:4 },
  statGrid:       { display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 },
  statCard:       { background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:"18px 20px", position:"relative", overflow:"hidden" },
  statAccentBar:  { position:"absolute", top:0, left:0, right:0, height:3, borderRadius:"12px 12px 0 0" },
  statLabel:      { fontSize:11, fontWeight:600, color:"#94A3B8", letterSpacing:0.5, textTransform:"uppercase", marginBottom:10, marginTop:4 },
  statValue:      { fontSize:34, fontWeight:700, letterSpacing:-1.5, lineHeight:1, fontVariantNumeric:"tabular-nums" },
  statFoot:       { fontSize:11, color:"#94A3B8", marginTop:6 },
  bodyGrid:       { display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 },
  card:           { background:"#fff", border:"1px solid #E2E8F0", borderRadius:12, padding:"20px 22px" },
  cardHeader:     { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  cardTitle:      { fontSize:14, fontWeight:600, color:"#0F172A" },
  cardSub:        { fontSize:12, color:"#94A3B8" },
  badge:          { fontSize:11, fontWeight:600, color:"#4F46E5", background:"#EEF2FF", padding:"2px 8px", borderRadius:20 },
  checkRow:       { display:"flex", alignItems:"center", gap:10, padding:"7px 6px", borderRadius:7, cursor:"pointer" },
  checkBox:       { width:16, height:16, border:"1.5px solid #CBD5E1", borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all 0.12s", background:"#fff" },
  checkBoxChecked:{ background:"#4F46E5", borderColor:"#4F46E5" },
  checkLabel:     { fontSize:13, color:"#334155", fontWeight:500, cursor:"pointer" },
  checkLabelSub:  { fontSize:12, color:"#94A3B8", fontWeight:400 },
  sliderLabel:    { fontSize:12, fontWeight:500, color:"#64748B" },
  sliderValue:    { fontSize:20, fontWeight:700, color:"#4F46E5", fontVariantNumeric:"tabular-nums" },
  sliderTick:     { fontSize:11, color:"#CBD5E1" },
  infoBar:        { background:"#EEF2FF", border:"1px solid #C7D2FE", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#4338CA", display:"flex", alignItems:"center", gap:8 },
  formGrid:       { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 },
  inputLabel:     { fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:0.3, textTransform:"uppercase", marginBottom:5 },
  input:          { width:"100%", background:"#F8FAFC", border:"1.5px solid #E2E8F0", borderRadius:8, color:"#0F172A", fontSize:13, padding:"9px 12px", transition:"all 0.15s", fontFamily:"inherit" },
  btnPrimary:     { display:"inline-flex", alignItems:"center", gap:6, background:"#4F46E5", border:"none", color:"#fff", fontSize:13, fontWeight:600, padding:"9px 16px", borderRadius:8, cursor:"pointer", transition:"all 0.12s" },
  btnDanger:      { display:"inline-flex", alignItems:"center", gap:6, background:"#fff", border:"1.5px solid #E2E8F0", color:"#64748B", fontSize:13, fontWeight:500, padding:"9px 14px", borderRadius:8, cursor:"pointer", transition:"all 0.12s" },
  queuePill:      { display:"flex", alignItems:"center", justifyContent:"space-between", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:8, padding:"9px 12px", transition:"all 0.12s", gap:8 },
  queueNum:       { fontSize:11, fontWeight:600, color:"#94A3B8", marginRight:8, fontVariantNumeric:"tabular-nums" },
  queueText:      { fontSize:13, fontWeight:500, color:"#334155" },
  queueLoc:       { fontSize:12, color:"#94A3B8", marginLeft:6 },
  queueDelete:    { background:"transparent", border:"none", color:"#CBD5E1", cursor:"pointer", padding:4, borderRadius:4, display:"flex", alignItems:"center", transition:"all 0.12s", flexShrink:0 },
  consoleHeader:  { background:"#fff", border:"1px solid #E2E8F0", borderBottom:"none", borderRadius:"12px 12px 0 0", padding:"11px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  consoleTitle:   { fontSize:12, fontWeight:600, color:"#64748B", letterSpacing:0.3 },
  consoleLive:    { fontSize:11, fontWeight:600, color:"#10B981", background:"#ECFDF5", padding:"2px 8px", borderRadius:20 },
  consoleBody:    { background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:"0 0 12px 12px", padding:"14px 18px", fontFamily:"'JetBrains Mono','Fira Code',monospace", fontSize:12, color:"#334155", minHeight:180, maxHeight:320, overflowY:"auto", whiteSpace:"pre-wrap", lineHeight:1.8 },
  stepNum:        { width:28, height:28, borderRadius:8, background:"#EEF2FF", color:"#4F46E5", fontSize:12, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  stepTitle:      { fontSize:14, fontWeight:600, color:"#0F172A", marginBottom:4 },
  stepDesc:       { fontSize:13, color:"#64748B", lineHeight:1.6 },
};
