const DEMO = {
  trends: [
    {id:"demo-1",title:"Google's new AI browser feature is spreading fast",source:"YouTube",channel:"TechWiser",views:482000,vph:31200,score:96,observed:"12 min ago",url:"#"},
    {id:"demo-2",title:"Android 17 changes the way notifications work",source:"YouTube",channel:"Beebom",views:351000,vph:24800,score:93,observed:"18 min ago",url:"#"},
    {id:"demo-3",title:"This budget phone camera is beating expectations",source:"YouTube",channel:"Trakin Tech",views:276000,vph:19700,score:90,observed:"31 min ago",url:"#"},
    {id:"demo-4",title:"Best AI tools for students in 2026",source:"YouTube",channel:"Tech Burner",views:218000,vph:16600,score:88,observed:"43 min ago",url:"#"},
    {id:"demo-5",title:"Gaming laptop prices dropped before the sale",source:"YouTube",channel:"Venom's Tech",views:174000,vph:13900,score:84,observed:"1 hr ago",url:"#"},
    {id:"demo-6",title:"New wireless earbuds under ₹3,000 compared",source:"YouTube",channel:"Geekyranjit",views:121000,vph:9100,score:81,observed:"2 hr ago",url:"#"},
    {id:"demo-7",title:"iPhone battery feature nobody noticed",source:"YouTube",channel:"Mrwhosetheboss",views:89000,vph:7600,score:79,observed:"2 hr ago",url:"#"}
  ],
  ideas: [
    {score:96,title:"Google Just Changed How You Browse — Here's What Matters",hook:"If you use Chrome every day, this update changes something you probably don't even think about.",why:"High velocity across multiple tech channels with strong consumer relevance.",format:"Explainer",status:"Publish today"},
    {score:93,title:"Android 17: 5 Changes You'll Actually Notice",hook:"Forget the tiny updates. These are the changes that will actually affect how your phone feels.",why:"Fresh OS coverage with a practical angle instead of a feature dump.",format:"List + Demo",status:"Publish today"},
    {score:90,title:"This Budget Phone Camera Is Getting Too Good",hook:"I expected a normal budget-phone camera. Then I saw these shots.",why:"High buyer intent plus visual proof makes it useful for Shorts and long-form.",format:"Review angle",status:"Strong"},
    {score:88,title:"7 AI Tools Students Will Actually Use in 2026",hook:"Most AI tool lists are useless. These can actually save you time.",why:"Evergreen demand plus current AI search momentum.",format:"Practical guide",status:"Strong"},
    {score:84,title:"Gaming Laptop Prices Just Dropped — Buy or Wait?",hook:"If you're planning to buy a gaming laptop this month, don't checkout yet.",why:"Combines price movement with a clear purchase decision.",format:"Deal analysis",status:"Watch"},
    {score:81,title:"Best Earbuds Under ₹3,000: What I Would Buy",hook:"There are too many earbuds in this price range. I would ignore most of them.",why:"Strong shopping intent with a repeatable comparison format.",format:"Buyer guide",status:"Watch"}
  ],
  deals: [
    {id:"deal-1",title:"Sony WH-CH720N Wireless Headphones",source:"Amazon",price:"₹7,990",discount:"38%",rank:"#12",score:91,url:"#"},
    {id:"deal-2",title:"Samsung T7 1TB Portable SSD",source:"Amazon",price:"₹6,499",discount:"31%",rank:"#8",score:89,url:"#"},
    {id:"deal-3",title:"Logitech G304 Gaming Mouse",source:"Amazon",price:"₹2,295",discount:"29%",rank:"#21",score:84,url:"#"},
    {id:"deal-4",title:"Anker 20,000mAh Power Bank",source:"Amazon",price:"₹3,299",discount:"24%",rank:"#16",score:80,url:"#"},
    {id:"deal-5",title:"OnePlus Buds 3",source:"Amazon",price:"₹4,499",discount:"18%",rank:"#31",score:76,url:"#"}
  ],
  runs: [
    {status:"success",started:"Today · 7:30 AM",youtube:74,deals:28,ideas:8,duration:"2m 18s"},
    {status:"success",started:"Yesterday · 7:30 AM",youtube:69,deals:31,ideas:8,duration:"2m 06s"},
    {status:"success",started:"Oct 31 · 7:30 AM",youtube:71,deals:25,ideas:8,duration:"2m 22s"}
  ],
  sources: [
    {name:"YouTube Data API",code:"YT",description:"Trending technology videos, keyword search and video statistics.",state:"Connected"},
    {name:"Firebase Firestore",code:"FB",description:"Append-only trend history, deals, automation runs and AI video concepts.",state:"Ready"},
    {name:"OpenAI",code:"AI",description:"Noise filtering, titles, hooks, angles and opportunity scoring.",state:"Ready"},
    {name:"GitHub Actions",code:"GH",description:"Scheduled daily collection and processing workflow.",state:"Connected"},
    {name:"Amazon / Deal Feed",code:"AZ",description:"Optional approved marketplace or affiliate-feed deal source.",state:"Optional"},
    {name:"Google Trends",code:"GT",description:"Optional search-interest signal when API access is available.",state:"Optional"}
  ],
  series:[61,66,64,73,78,85,96]
};

const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const fmt=n=>new Intl.NumberFormat("en-IN",{notation:Number(n)>999999?"compact":"standard",maximumFractionDigits:1}).format(Number(n)||0);
const toDateValue=v=>{
  if(!v) return null;
  if(v instanceof Date) return v;
  if(typeof v.toDate==="function") return v.toDate();
  if(typeof v.seconds==="number") return new Date(v.seconds*1000);
  const d=new Date(v); return Number.isNaN(d.getTime())?null:d;
};
const timeAgo=v=>{
  const d=toDateValue(v); if(!d) return "—";
  const mins=Math.max(0,Math.round((Date.now()-d.getTime())/60000));
  if(mins<60) return mins+" min ago";
  if(mins<1440) return Math.floor(mins/60)+" hr ago";
  return Math.floor(mins/1440)+" d ago";
};
const stableDate=v=>{
  const d=toDateValue(v); return d?d.toISOString().slice(0,10):"";
};

function buildDemoHistory(){
  const dates=[...Array(30)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-(29-i));return d.toISOString().slice(0,10);});
  const trends=[],deals=[];
  DEMO.trends.forEach((t,ti)=>dates.forEach((date,di)=>{
    const p=(di+1)/dates.length;
    trends.push({itemId:t.id,title:t.title,channel:t.channel,source:t.source,date,observedAt:new Date(date+"T07:30:00Z"),views:Math.round(t.views*(.42+.58*p)),viewsPerHour:Math.round(t.vph*(.55+.45*p)),trendScore:Math.round(t.score*(.7+.3*p))});
  }));
  DEMO.deals.forEach((d,di)=>{
    const base=Number(String(d.price).replace(/[^0-9.]/g,""))||1000;
    dates.forEach((date,i)=>deals.push({itemId:d.id,title:d.title,source:d.source,date,observedAt:new Date(date+"T07:30:00Z"),price:Math.round(base*(1.09-(i/dates.length)*.09+(di*.003))),currency:"INR",discountPct:Number(String(d.discount).replace(/[^0-9.]/g,""))||0,dealScore:d.score}));
  });
  return {trends,deals};
}

const state={
  data:structuredClone(DEMO),
  history:buildDemoHistory(),
  historyMode:"score",
  mode:"demo",
  range:7,
  ideaFilter:"all",
  firebase:null,
  auth:null,
  db:null,
  user:null,
  demoOverride:false
};

function toast(message){
  const el=$("#toast"); if(!el) return;
  el.textContent=message;el.classList.add("show");clearTimeout(window.__toast);window.__toast=setTimeout(()=>el.classList.remove("show"),2400);
}
function setConnection(live,sub=""){
  $("#connectionDot")?.classList.toggle("live",live);
  if($("#connectionLabel")) $("#connectionLabel").textContent=live?"Live data":"Demo mode";
  if($("#connectionSub")) $("#connectionSub").textContent=sub||(live?"Firebase connected":"Firebase not connected");
}
function route(view){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+view));
  $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  const active=$('.nav-item[data-view="'+view+'"]');
  if($("#pageTitle")) $("#pageTitle").textContent=active?active.textContent.trim():"Overview";
  $("#sidebar")?.classList.remove("open");
  history.replaceState(null,"","#"+view);
  if(view==="overview") requestAnimationFrame(drawChart);
}
function scoreClass(score){return Number(score)>=90?"hot":Number(score)>=80?"strong":"watch";}

function renderOverview(){
  const d=state.data;
  $("#kpiTrends").textContent=d.trends.length;
  $("#kpiRising").textContent=d.trends.filter(x=>Number(x.vph)>=12000).length;
  $("#kpiIdeas").textContent=d.ideas.length;
  $("#kpiDeals").textContent=d.deals.filter(x=>Number(x.score)>=80).length;
  const highest=Math.max(0,...d.ideas.map(x=>Number(x.score)||0),...d.trends.map(x=>Number(x.score)||0));
  $("#heroScore").textContent=highest||"—";
  $("#opportunityList").innerHTML=d.ideas.slice(0,4).map(i=>`
    <div class="opportunity"><div class="score">${esc(i.score)}</div><div><strong>${esc(i.title)}</strong><p>${esc(i.hook)}</p></div><span class="format">${esc(i.format)}</span></div>`).join("");
  $("#risingList").innerHTML=d.trends.slice(0,5).map((t,i)=>`
    <div class="rank-row"><span class="rank-num">${String(i+1).padStart(2,"0")}</span><div class="rank-main"><strong>${esc(t.title)}</strong><span>${esc(t.channel)} · score ${esc(t.score)}</span></div><span class="velocity">+${fmt(t.vph)}/h</span></div>`).join("");
  const comps=buildCompetitors(d.trends);
  $("#competitorMini").innerHTML=comps.slice(0,5).map((c,i)=>`
    <div class="rank-row"><span class="rank-num">${String(i+1).padStart(2,"0")}</span><div class="rank-main"><strong>${esc(c.name)}</strong><span>${c.videos} trending videos</span></div><span class="velocity">${fmt(c.velocity)}/h</span></div>`).join("");
  drawChart();
}
function renderTrends(){
  const q=($("#trendSearch")?.value||"").toLowerCase().trim();
  const rows=state.data.trends.filter(t=>!q||[t.title,t.channel,t.source].join(" ").toLowerCase().includes(q));
  $("#trendTable").innerHTML=rows.map(t=>`
    <tr><td><a href="${esc(t.url||"#")}" ${t.url&&t.url!=="#"?'target="_blank" rel="noreferrer"':""}><strong>${esc(t.title)}</strong></a><small>${esc(t.channel)}</small></td>
    <td><span class="source-badge">${esc(t.source)}</span></td><td>${fmt(t.views)}</td><td class="velocity">${fmt(t.vph)}/h</td><td><span class="table-score">${esc(t.score)}</span></td><td>${esc(t.observed)}</td></tr>`).join("")||'<tr><td colspan="6">No matching trends.</td></tr>';
}
function renderIdeas(){
  const min=state.ideaFilter==="all"?0:Number(state.ideaFilter);
  $("#ideaGrid").innerHTML=state.data.ideas.filter(i=>Number(i.score)>=min).map(i=>`
    <article class="idea-card"><div class="idea-top"><span class="priority">${esc(i.score)} / 100</span><span class="status ${Number(i.score)>=90?"success":""}">${esc(i.status)}</span></div>
    <h3>${esc(i.title)}</h3><p class="hook">“${esc(i.hook)}”</p><p class="why">${esc(i.why)}</p>
    <div class="idea-meta"><span>${esc(i.format)}</span><span class="${scoreClass(i.score)}">Priority ${esc(i.score)}</span></div></article>`).join("");
}
function renderDeals(){
  $("#dealTable").innerHTML=state.data.deals.map(d=>`
    <tr><td><a href="${esc(d.url||"#")}" ${d.url&&d.url!=="#"?'target="_blank" rel="noreferrer"':""}><strong>${esc(d.title)}</strong></a></td>
    <td><span class="source-badge">${esc(d.source)}</span></td><td>${esc(d.price||"—")}</td><td class="velocity">${esc(d.discount||"—")}</td><td>${esc(d.rank||"—")}</td><td><span class="table-score">${esc(d.score)}</span></td></tr>`).join("")||'<tr><td colspan="6">No approved deal-feed data yet.</td></tr>';
}
function buildCompetitors(trends){
  const map={};
  for(const t of trends){const name=t.channel||"Unknown";if(!map[name])map[name]={name,videos:0,views:0,velocity:0,best:0};map[name].videos++;map[name].views+=Number(t.views)||0;map[name].velocity+=Number(t.vph)||0;map[name].best=Math.max(map[name].best,Number(t.score)||0);}
  return Object.values(map).sort((a,b)=>b.velocity-a.velocity);
}
function renderCompetitors(){
  $("#competitorGrid").innerHTML=buildCompetitors(state.data.trends).map(c=>`
    <article class="competitor-card"><p class="section-label">CHANNEL</p><h3>${esc(c.name)}</h3><p>Momentum calculated from tracked trend snapshots.</p>
    <div class="competitor-stats"><div><span>Videos</span><strong>${c.videos}</strong></div><div><span>Views</span><strong>${fmt(c.views)}</strong></div><div><span>Velocity</span><strong>${fmt(c.velocity)}/h</strong></div></div></article>`).join("");
}
function renderRuns(){
  $("#runTable").innerHTML=state.data.runs.map(r=>`
    <tr><td><span class="status ${r.status==="success"?"success":""}">${esc(r.status)}</span></td><td>${esc(r.started)}</td><td>${esc(r.youtube)}</td><td>${esc(r.deals)}</td><td>${esc(r.ideas)}</td><td>${esc(r.duration)}</td></tr>`).join("");
}
function renderSources(){
  $("#sourceGrid").innerHTML=state.data.sources.map(s=>`
    <article class="source-card"><div class="source-icon">${esc(s.code)}</div><div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p></div>
    <div class="source-meta"><span class="status ${s.state==="Connected"||s.state==="Ready"?"success":""}">${esc(s.state)}</span></div></article>`).join("");
}

function last30Dates(){return [...Array(30)].map((_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);return d.toISOString().slice(0,10);});}
function formatHistoryDate(date){return new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short"});}
function renderHistory(){
  const mode=state.historyMode,dates=last30Dates(),raw=mode==="deals"?state.history.deals:state.history.trends;
  const valueKey=mode==="score"?"trendScore":mode==="velocity"?"viewsPerHour":"price";
  const groups=new Map();
  for(const row of raw){
    const id=row.itemId||row.title;
    if(!groups.has(id))groups.set(id,{title:row.title||"Untitled",source:row.channel||row.source||"",values:new Map()});
    const date=stableDate(row.observedAt||row.date);if(!date)continue;
    const prev=groups.get(id).values.get(date);
    if(!prev||toDateValue(row.observedAt)>=toDateValue(prev.observedAt))groups.get(id).values.set(date,row);
  }
  const rows=[...groups.values()].sort((a,b)=>Number(b.values.get(dates[0])?.[valueKey]??-Infinity)-Number(a.values.get(dates[0])?.[valueKey]??-Infinity)).slice(0,25);
  $("#historyHead").innerHTML=`<tr><th class="history-topic">Topic / product</th>${dates.map(d=>`<th>${formatHistoryDate(d)}</th>`).join("")}</tr>`;
  $("#historyBody").innerHTML=rows.map(group=>`
    <tr><td class="history-topic"><strong>${esc(group.title)}</strong><small>${esc(group.source)}</small></td>
    ${dates.map(date=>{const row=group.values.get(date);if(!row)return '<td class="history-empty">—</td>';const val=Number(row[valueKey]);if(mode==="deals")return `<td>${new Intl.NumberFormat("en-IN",{style:"currency",currency:row.currency||"INR",maximumFractionDigits:0}).format(val||0)}</td>`;if(mode==="velocity")return `<td>${fmt(val)}/h</td>`;return `<td><span class="table-score">${Number.isFinite(val)?Math.round(val):"—"}</span></td>`;}).join("")}</tr>`).join("")||'<tr><td>No historical data yet.</td></tr>';
}

function drawChart(){
  const canvas=$("#trendChart");if(!canvas||!canvas.offsetParent)return;
  const ratio=window.devicePixelRatio||1,rect=canvas.getBoundingClientRect();canvas.width=Math.max(500,rect.width*ratio);canvas.height=250*ratio;
  const ctx=canvas.getContext("2d");ctx.scale(ratio,ratio);const w=rect.width,h=250,pad={l:10,r:12,t:18,b:22};
  const values=(state.data.series?.length?state.data.series:DEMO.series).map(Number),max=Math.max(...values,100),min=Math.min(...values,0);
  ctx.clearRect(0,0,w,h);ctx.strokeStyle="#294363";ctx.lineWidth=1;
  for(let i=0;i<5;i++){const y=pad.t+(h-pad.t-pad.b)*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();}
  const pts=values.map((v,i)=>({x:pad.l+(w-pad.l-pad.r)*(i/(values.length-1||1)),y:pad.t+(max-v)/(max-min||1)*(h-pad.t-pad.b)}));
  const grad=ctx.createLinearGradient(0,pad.t,0,h);grad.addColorStop(0,"rgba(94,234,255,.24)");grad.addColorStop(1,"rgba(94,234,255,0)");
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.lineTo(pts.at(-1).x,h-pad.b);ctx.lineTo(pts[0].x,h-pad.b);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
  ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle="#5eeaff";ctx.lineWidth=2;ctx.stroke();
  pts.forEach(p=>{ctx.beginPath();ctx.arc(p.x,p.y,3.2,0,Math.PI*2);ctx.fillStyle="#071328";ctx.fill();ctx.strokeStyle="#5eeaff";ctx.lineWidth=2;ctx.stroke();});
  ctx.fillStyle="#7895b3";ctx.font='9px "DM Mono"';ctx.fillText("opportunity score",pad.l,h-4);
}
function renderAll(){
  renderOverview();renderTrends();renderHistory();renderIdeas();renderDeals();renderCompetitors();renderRuns();renderSources();
  $("#lastUpdated").textContent="Updated "+new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
}

function getFirebaseConfig(){
  const runtime=window.__ETECH_FIREBASE_CONFIG__||window.__TREND_RADAR_CONFIG__||{};
  if(runtime?.projectId&&runtime?.apiKey)return runtime;
  try{const local=JSON.parse(localStorage.getItem("etech.firebaseConfig")||"null");if(local?.projectId&&local?.apiKey)return local;}catch{}
  return null;
}
function updateAuthUi(){
  const email=state.user?.email||"No";
  if($("#authUserLabel"))$("#authUserLabel").textContent=email;
  if($("#firebaseProjectBadge"))$("#firebaseProjectBadge").textContent=state.firebase?.options?.projectId||"Not configured";
  const gate=$("#authGate");
  if(gate)gate.hidden=!(state.firebase&&!state.user&&!state.demoOverride);
}
function resetToDemo(message="Demo mode"){
  state.data=structuredClone(DEMO);state.history=buildDemoHistory();state.mode="demo";setConnection(false,message);renderAll();
}
async function initFirebase(){
  const config=getFirebaseConfig();
  if(!config||!window.firebase){resetToDemo("Firebase not configured");updateAuthUi();return;}
  try{
    if(!firebase.apps.length)firebase.initializeApp(config);
    state.firebase=firebase.app();state.auth=firebase.auth();state.db=firebase.firestore();
    updateAuthUi();
    state.auth.onAuthStateChanged(async user=>{
      state.user=user||null;updateAuthUi();
      if(user){await loadFirestore();}
      else if(!state.demoOverride){resetToDemo("Sign in for live data");}
    });
  }catch(err){console.error(err);resetToDemo("Firebase connection failed");toast("Firebase setup error. Check the web config.");}
}
async function googleSignIn(){
  if(!state.auth){toast("Firebase is not configured yet.");return;}
  try{
    const provider=new firebase.auth.GoogleAuthProvider();
    await state.auth.signInWithPopup(provider);
  }catch(err){
    console.error(err);
    if(/popup|blocked|operation-not-supported/i.test(String(err?.code||err?.message||""))){
      try{await state.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());}catch(e){console.error(e);toast("Google sign-in failed.");}
    }else toast("Google sign-in failed.");
  }
}
async function signOutUser(){
  if(state.auth)await state.auth.signOut();
  state.demoOverride=true;resetToDemo("Signed out · demo mode");updateAuthUi();
}
function docData(doc){return {id:doc.id,...doc.data()};}
async function loadFirestore(){
  if(!state.db||!state.user)return;
  const since=new Date(Date.now()-30*24*60*60*1000);
  const ts=firebase.firestore.Timestamp.fromDate(since);
  try{
    const [trendSnap,ideaSnap,dealSnap,runSnap]=await Promise.all([
      state.db.collection("trend_observations").where("observedAt",">=",ts).orderBy("observedAt","asc").limit(5000).get(),
      state.db.collection("video_ideas").where("createdAt",">=",ts).orderBy("createdAt","desc").limit(1000).get(),
      state.db.collection("deal_observations").where("observedAt",">=",ts).orderBy("observedAt","asc").limit(5000).get(),
      state.db.collection("automation_runs").where("startedAt",">=",ts).orderBy("startedAt","desc").limit(1000).get()
    ]);
    const trendRows=trendSnap.docs.map(docData),ideaRows=ideaSnap.docs.map(docData),dealRows=dealSnap.docs.map(docData),runRowsRaw=runSnap.docs.map(docData);
    const latestTrend=new Map();
    trendRows.forEach(o=>{const key=o.itemId||o.externalId||o.title;const p=latestTrend.get(key);if(!p||toDateValue(o.observedAt)>toDateValue(p.observedAt))latestTrend.set(key,o);});
    const latestDeal=new Map();
    dealRows.forEach(o=>{const key=o.itemId||o.externalId||o.title;const p=latestDeal.get(key);if(!p||toDateValue(o.observedAt)>toDateValue(p.observedAt))latestDeal.set(key,o);});
    const trends=[...latestTrend.values()].sort((a,b)=>Number(b.trendScore)-Number(a.trendScore)).slice(0,50).map(o=>({
      id:o.itemId||o.id,title:o.title||"Untitled",source:o.source||"YouTube",channel:o.channel||o.authorName||"Unknown",views:Number(o.views)||0,vph:Number(o.viewsPerHour)||0,score:Number(o.trendScore)||0,observed:timeAgo(o.observedAt),url:o.url||"#"
    }));
    const ideas=ideaRows.slice(0,60).map(i=>({
      score:Number(i.priorityScore)||0,title:i.suggestedTitle||i.topic||"Untitled idea",hook:i.hook||"",why:i.whyNow||i.angle||"",format:i.videoFormat||"Video",status:Number(i.priorityScore)>=90?"Publish today":Number(i.priorityScore)>=80?"Strong":"Watch"
    }));
    const deals=[...latestDeal.values()].sort((a,b)=>Number(b.dealScore)-Number(a.dealScore)).slice(0,50).map(o=>({
      id:o.itemId||o.id,title:o.title||"Untitled product",source:o.source||"Marketplace",
      price:o.price!=null?new Intl.NumberFormat("en-IN",{style:"currency",currency:o.currency||"INR",maximumFractionDigits:0}).format(Number(o.price)):"—",
      discount:o.discountPct!=null?Number(o.discountPct).toFixed(0)+"%":"—",rank:o.salesRank?"#"+o.salesRank:"—",score:Number(o.dealScore)||0,url:o.url||"#"
    }));
    const runs=runRowsRaw.map(r=>{
      const start=toDateValue(r.startedAt),finish=toDateValue(r.finishedAt);
      return {status:r.status||"unknown",started:start?start.toLocaleString():"—",youtube:r.youtubeCount||0,deals:r.dealCount||0,ideas:r.ideaCount||0,duration:start&&finish?Math.max(1,Math.round((finish-start)/1000))+"s":"—"};
    });
    state.history={
      trends:trendRows.map(o=>({...o,itemId:o.itemId||o.externalId||o.id,viewsPerHour:Number(o.viewsPerHour)||0,trendScore:Number(o.trendScore)||0})),
      deals:dealRows.map(o=>({...o,itemId:o.itemId||o.externalId||o.id,dealScore:Number(o.dealScore)||0}))
    };
    state.data={...structuredClone(DEMO),trends:trends.length?trends:DEMO.trends,ideas:ideas.length?ideas:[],deals:deals.length?deals:[],runs:runs.length?runs:[]};
    state.data.series=(state.data.trends.slice(0,7).map(x=>x.score).reverse());
    state.mode="live";setConnection(true,"Firebase · 30-day Firestore history");renderAll();updateAuthUi();toast("Live Firestore data loaded");
  }catch(err){
    console.error(err);
    resetToDemo("Firestore read failed · demo shown");
    toast("Could not read Firestore. Check Auth, rules and indexes.");
  }
}

$$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>route(btn.dataset.view)));
$$("[data-jump]").forEach(btn=>btn.addEventListener("click",()=>route(btn.dataset.jump)));
$("#mobileMenu")?.addEventListener("click",()=>$("#sidebar")?.classList.toggle("open"));
$("#refreshBtn")?.addEventListener("click",async()=>{if(state.user)await loadFirestore();else{renderAll();toast("Demo data refreshed");}});
$("#rangeSelect")?.addEventListener("change",e=>{state.range=Number(e.target.value);toast("Date range set to "+e.target.options[e.target.selectedIndex].text);});
$("#trendSearch")?.addEventListener("input",renderTrends);
$$("[data-history-mode]").forEach(btn=>btn.addEventListener("click",()=>{$$("[data-history-mode]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");state.historyMode=btn.dataset.historyMode;renderHistory();}));
$$("[data-idea-filter]").forEach(btn=>btn.addEventListener("click",()=>{$$("[data-idea-filter]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");state.ideaFilter=btn.dataset.ideaFilter;renderIdeas();}));
$("#saveFirebaseConfig")?.addEventListener("click",async()=>{
  try{
    const cfg=JSON.parse($("#firebaseConfigJson").value.trim());
    if(!cfg?.apiKey||!cfg?.projectId||!cfg?.authDomain)throw new Error("Missing apiKey/projectId/authDomain");
    localStorage.setItem("etech.firebaseConfig",JSON.stringify(cfg));toast("Firebase config saved. Reloading…");location.reload();
  }catch{toast("Paste a valid Firebase web config JSON.");}
});
$("#clearFirebaseConfig")?.addEventListener("click",()=>{localStorage.removeItem("etech.firebaseConfig");state.demoOverride=true;resetToDemo("Demo mode");toast("Browser Firebase config cleared.");});
$("#googleSignInBtn")?.addEventListener("click",googleSignIn);
$("#authGateSignIn")?.addEventListener("click",googleSignIn);
$("#signOutBtn")?.addEventListener("click",signOutUser);
$("#authGateDemo")?.addEventListener("click",()=>{state.demoOverride=true;$("#authGate").hidden=true;resetToDemo("Demo mode");});
window.addEventListener("resize",()=>requestAnimationFrame(drawChart));

const initial=(location.hash||"#overview").slice(1);
route(["overview","trends","history","ideas","deals","competitors","automations","sources","settings"].includes(initial)?initial:"overview");
renderAll();
initFirebase();
