const DEMO = {
  trends: [
    {title:"Google's new AI browser feature is spreading fast",source:"YouTube",channel:"TechWiser",views:482000,vph:31200,score:96,observed:"12 min ago",url:"#"},
    {title:"Android 17 changes the way notifications work",source:"YouTube",channel:"Beebom",views:351000,vph:24800,score:93,observed:"18 min ago",url:"#"},
    {title:"This budget phone camera is beating expectations",source:"YouTube",channel:"Trakin Tech",views:276000,vph:19700,score:90,observed:"31 min ago",url:"#"},
    {title:"Best AI tools for students in 2026",source:"YouTube",channel:"Tech Burner",views:218000,vph:16600,score:88,observed:"43 min ago",url:"#"},
    {title:"Gaming laptop prices dropped before the sale",source:"YouTube",channel:"Venom's Tech",views:174000,vph:13900,score:84,observed:"1 hr ago",url:"#"},
    {title:"New wireless earbuds under ₹3,000 compared",source:"YouTube",channel:"Geekyranjit",views:121000,vph:9100,score:81,observed:"2 hr ago",url:"#"},
    {title:"iPhone battery feature nobody noticed",source:"YouTube",channel:"Mrwhosetheboss",views:89000,vph:7600,score:79,observed:"2 hr ago",url:"#"}
  ],
  ideas: [
    {score:96,title:"Google Just Changed How You Browse — Here's What Matters",hook:"If you use Chrome every day, this update changes something you probably don't even think about.",why:"High velocity across multiple tech channels with strong consumer relevance.",format:"Explainer",status:"Publish today"},
    {score:93,title:"Android 17: 5 Changes You'll Actually Notice",hook:"Forget the 40 tiny updates. These are the five that will change how your phone feels.",why:"Fresh OS coverage with a strong practical angle instead of a feature dump.",format:"List + Demo",status:"Publish today"},
    {score:90,title:"This Budget Phone Camera Is Getting Too Good",hook:"I expected a normal ₹20K phone camera. Then I saw these shots.",why:"High buyer intent plus visual proof makes it ideal for Shorts and long-form.",format:"Review angle",status:"Strong"},
    {score:88,title:"7 AI Tools Students Will Actually Use in 2026",hook:"Most AI tool lists are useless. These seven can save you hours this week.",why:"Evergreen demand plus current AI search momentum.",format:"Practical guide",status:"Strong"},
    {score:84,title:"Gaming Laptop Prices Just Dropped — Buy or Wait?",hook:"If you're planning to buy a gaming laptop this month, don't checkout yet.",why:"Combines price movement with a clear purchase decision.",format:"Deal analysis",status:"Watch"},
    {score:81,title:"Best Earbuds Under ₹3,000: What I Would Buy",hook:"There are 40 earbuds in this price range. I would ignore most of them.",why:"Strong shopping intent with repeatable comparison format.",format:"Buyer guide",status:"Watch"}
  ],
  deals: [
    {title:"Sony WH-CH720N Wireless Headphones",source:"Amazon",price:"₹7,990",discount:"38%",rank:"#12",score:91,url:"#"},
    {title:"Samsung T7 1TB Portable SSD",source:"Amazon",price:"₹6,499",discount:"31%",rank:"#8",score:89,url:"#"},
    {title:"Logitech G304 Gaming Mouse",source:"Amazon",price:"₹2,295",discount:"29%",rank:"#21",score:84,url:"#"},
    {title:"Anker 20,000mAh Power Bank",source:"Amazon",price:"₹3,299",discount:"24%",rank:"#16",score:80,url:"#"},
    {title:"OnePlus Buds 3",source:"Amazon",price:"₹4,499",discount:"18%",rank:"#31",score:76,url:"#"}
  ],
  runs: [
    {status:"success",started:"Today · 7:30 AM",youtube:74,deals:28,ideas:8,duration:"2m 18s"},
    {status:"success",started:"Yesterday · 7:30 AM",youtube:69,deals:31,ideas:8,duration:"2m 06s"},
    {status:"success",started:"Oct 31 · 7:30 AM",youtube:71,deals:25,ideas:8,duration:"2m 22s"},
    {status:"failed",started:"Oct 30 · 7:30 AM",youtube:38,deals:0,ideas:0,duration:"51s"}
  ],
  sources: [
    {name:"YouTube Data API",code:"YT",description:"Trending technology videos, keyword search and video statistics.",state:"Connected"},
    {name:"Amazon Creators API",code:"AZ",description:"Consumer-tech products, deal signals, price and rank history.",state:"Optional"},
    {name:"Google Trends",code:"GT",description:"Search interest and velocity when official API access is available.",state:"Optional"},
    {name:"Supabase",code:"SB",description:"Trend history, deals, automation runs and AI video concepts.",state:"Ready"},
    {name:"OpenAI / Gemini",code:"AI",description:"Noise filtering, competitor angles, titles, hooks and priority scoring.",state:"Ready"},
    {name:"GitHub Actions",code:"GH",description:"Scheduled daily collection and processing workflow.",state:"Connected"}
  ],
  series:[61,66,64,73,78,85,96]
};

function buildDemoHistory(){
  const dates=[...Array(30)].map((_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-(29-i)); return d.toISOString().slice(0,10);
  });
  const trendHistory=[];
  DEMO.trends.forEach((t,ti)=>{
    dates.forEach((date,di)=>{
      const progress=(di+1)/dates.length;
      trendHistory.push({
        trend_item_id:"demo-trend-"+ti,
        title:t.title,
        channel:t.channel,
        source:t.source,
        date,
        observed_at:date+"T07:30:00Z",
        views:Math.max(1000,Math.round(t.views*(0.42+0.58*progress))),
        views_per_hour:Math.max(100,Math.round(t.vph*(0.55+0.45*progress))),
        trend_score:Math.max(20,Math.round(t.score*(0.70+0.30*progress)))
      });
    });
  });
  const dealHistory=[];
  DEMO.deals.forEach((d,di)=>{
    const base=Number(String(d.price).replace(/[^0-9.]/g,""))||1000;
    dates.forEach((date,idx)=>{
      const factor=1.09-(idx/dates.length)*0.09+(di*0.003);
      dealHistory.push({
        deal_item_id:"demo-deal-"+di,
        title:d.title,
        source:d.source,
        date,
        observed_at:date+"T07:30:00Z",
        price:Math.round(base*factor),
        currency:"INR",
        discount_pct:Number(String(d.discount).replace(/[^0-9.]/g,""))||0,
        deal_score:d.score
      });
    });
  });
  return {trends:trendHistory,deals:dealHistory,dates};
}

const state = {
  data: structuredClone(DEMO),
  history: buildDemoHistory(),
  historyMode:"score",
  mode:"demo",
  range:7,
  ideaFilter:"all"
};

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const fmt = n => new Intl.NumberFormat("en-IN",{notation:n>999999?"compact":"standard",maximumFractionDigits:1}).format(n||0);
const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const timeAgo = iso => {
  if(!iso) return "—";
  const mins=Math.max(0,Math.round((Date.now()-new Date(iso).getTime())/60000));
  if(mins<60) return mins+" min ago";
  if(mins<1440) return Math.floor(mins/60)+" hr ago";
  return Math.floor(mins/1440)+" d ago";
};

function toast(message){
  const el=$("#toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(window.__toast); window.__toast=setTimeout(()=>el.classList.remove("show"),2200);
}

function setConnection(live, sub=""){
  $("#connectionDot").classList.toggle("live",live);
  $("#connectionLabel").textContent=live?"Live data":"Demo mode";
  $("#connectionSub").textContent=sub || (live?"Supabase connected":"Supabase not connected");
}

function route(view){
  $$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+view));
  $$(".nav-item").forEach(n=>n.classList.toggle("active",n.dataset.view===view));
  const active=$('.nav-item[data-view="'+view+'"]');
  $("#pageTitle").textContent=active?active.textContent.trim():"Overview";
  $("#sidebar").classList.remove("open");
  history.replaceState(null,"","#"+view);
  if(view==="overview") requestAnimationFrame(drawChart);
}

function scoreClass(score){ return score>=90?"hot":score>=80?"strong":"watch"; }

function renderOverview(){
  const d=state.data;
  $("#kpiTrends").textContent=d.trends.length;
  $("#kpiRising").textContent=d.trends.filter(x=>Number(x.vph)>=12000).length;
  $("#kpiIdeas").textContent=d.ideas.length;
  $("#kpiDeals").textContent=d.deals.filter(x=>Number(x.score)>=80).length;
  const highest=Math.max(0,...d.ideas.map(x=>Number(x.score)||0),...d.trends.map(x=>Number(x.score)||0));
  $("#heroScore").textContent=highest||"—";

  $("#opportunityList").innerHTML=d.ideas.slice(0,4).map(i=>`
    <div class="opportunity">
      <div class="score">${esc(i.score)}</div>
      <div><strong>${esc(i.title)}</strong><p>${esc(i.hook)}</p></div>
      <span class="format">${esc(i.format)}</span>
    </div>`).join("");

  $("#risingList").innerHTML=d.trends.slice(0,5).map((t,i)=>`
    <div class="rank-row">
      <span class="rank-num">${String(i+1).padStart(2,"0")}</span>
      <div class="rank-main"><strong>${esc(t.title)}</strong><span>${esc(t.channel)} · score ${esc(t.score)}</span></div>
      <span class="velocity">+${fmt(t.vph)}/h</span>
    </div>`).join("");

  const comps=buildCompetitors(d.trends);
  $("#competitorMini").innerHTML=comps.slice(0,5).map((c,i)=>`
    <div class="rank-row">
      <span class="rank-num">${String(i+1).padStart(2,"0")}</span>
      <div class="rank-main"><strong>${esc(c.name)}</strong><span>${c.videos} trending videos</span></div>
      <span class="velocity">${fmt(c.velocity)}/h</span>
    </div>`).join("");
  drawChart();
}

function renderTrends(){
  const q=($("#trendSearch")?.value||"").toLowerCase().trim();
  const rows=state.data.trends.filter(t=>!q || [t.title,t.channel,t.source].join(" ").toLowerCase().includes(q));
  $("#trendTable").innerHTML=rows.map(t=>`
    <tr>
      <td><a href="${esc(t.url||"#")}" ${t.url&&t.url!=="#"?'target="_blank" rel="noreferrer"':""}><strong>${esc(t.title)}</strong></a><small>${esc(t.channel)}</small></td>
      <td><span class="source-badge">${esc(t.source)}</span></td>
      <td>${fmt(t.views)}</td><td class="velocity">${fmt(t.vph)}/h</td>
      <td><span class="table-score">${esc(t.score)}</span></td><td>${esc(t.observed)}</td>
    </tr>`).join("") || '<tr><td colspan="6">No matching trends.</td></tr>';
}

function renderIdeas(){
  const min=state.ideaFilter==="all"?0:Number(state.ideaFilter);
  $("#ideaGrid").innerHTML=state.data.ideas.filter(i=>Number(i.score)>=min).map(i=>`
    <article class="idea-card">
      <div class="idea-top"><span class="priority">${esc(i.score)} / 100</span><span class="status ${i.score>=90?"success":""}">${esc(i.status)}</span></div>
      <h3>${esc(i.title)}</h3>
      <p class="hook">“${esc(i.hook)}”</p>
      <p class="why">${esc(i.why)}</p>
      <div class="idea-meta"><span>${esc(i.format)}</span><span class="${scoreClass(i.score)}">Priority ${esc(i.score)}</span></div>
    </article>`).join("");
}

function renderDeals(){
  $("#dealTable").innerHTML=state.data.deals.map(d=>`
    <tr>
      <td><a href="${esc(d.url||"#")}" ${d.url&&d.url!=="#"?'target="_blank" rel="noreferrer"':""}><strong>${esc(d.title)}</strong></a></td>
      <td><span class="source-badge">${esc(d.source)}</span></td>
      <td>${esc(d.price||"—")}</td><td class="velocity">${esc(d.discount||"—")}</td>
      <td>${esc(d.rank||"—")}</td><td><span class="table-score">${esc(d.score)}</span></td>
    </tr>`).join("");
}

function buildCompetitors(trends){
  const map={};
  for(const t of trends){
    const name=t.channel||"Unknown";
    if(!map[name]) map[name]={name,videos:0,views:0,velocity:0,best:0};
    map[name].videos++; map[name].views+=Number(t.views)||0; map[name].velocity+=Number(t.vph)||0; map[name].best=Math.max(map[name].best,Number(t.score)||0);
  }
  return Object.values(map).sort((a,b)=>b.velocity-a.velocity);
}

function renderCompetitors(){
  $("#competitorGrid").innerHTML=buildCompetitors(state.data.trends).map(c=>`
    <article class="competitor-card">
      <p class="section-label">CHANNEL</p><h3>${esc(c.name)}</h3><p>Momentum calculated from currently tracked videos.</p>
      <div class="competitor-stats">
        <div><span>Videos</span><strong>${c.videos}</strong></div>
        <div><span>Views</span><strong>${fmt(c.views)}</strong></div>
        <div><span>Velocity</span><strong>${fmt(c.velocity)}/h</strong></div>
      </div>
    </article>`).join("");
}

function renderRuns(){
  $("#runTable").innerHTML=state.data.runs.map(r=>`
    <tr><td><span class="status ${r.status==="success"?"success":""}">${esc(r.status)}</span></td>
    <td>${esc(r.started)}</td><td>${esc(r.youtube)}</td><td>${esc(r.deals)}</td><td>${esc(r.ideas)}</td><td>${esc(r.duration)}</td></tr>`).join("");
}

function renderSources(){
  $("#sourceGrid").innerHTML=state.data.sources.map(s=>`
    <article class="source-card"><div class="source-icon">${esc(s.code)}</div><div><h3>${esc(s.name)}</h3><p>${esc(s.description)}</p></div>
    <div class="source-meta"><span class="status ${s.state==="Connected"||s.state==="Ready"?"success":""}">${esc(s.state)}</span></div></article>`).join("");
}

function last30Dates(){
  return [...Array(30)].map((_,i)=>{
    const d=new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-i); return d.toISOString().slice(0,10);
  });
}

function formatHistoryDate(date){
  const d=new Date(date+"T00:00:00");
  return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short"});
}

function renderHistory(){
  const mode=state.historyMode;
  const dates=last30Dates();
  const raw=mode==="deals" ? state.history.deals : state.history.trends;
  const idKey=mode==="deals" ? "deal_item_id" : "trend_item_id";
  const valueKey=mode==="score" ? "trend_score" : mode==="velocity" ? "views_per_hour" : "price";
  const groups=new Map();

  for(const row of raw){
    const id=row[idKey] || row.title;
    if(!groups.has(id)) groups.set(id,{title:row.title||"Untitled",source:row.channel||row.source||"",values:new Map()});
    const date=(row.observed_at||row.date||"").slice(0,10);
    if(!date) continue;
    const existing=groups.get(id).values.get(date);
    if(!existing || new Date(row.observed_at||date) >= new Date(existing.observed_at||date)){
      groups.get(id).values.set(date,row);
    }
  }

  const rows=[...groups.values()].sort((a,b)=>{
    const av=a.values.get(dates[0])?.[valueKey] ?? -Infinity;
    const bv=b.values.get(dates[0])?.[valueKey] ?? -Infinity;
    return Number(bv)-Number(av);
  }).slice(0,25);

  $("#historyHead").innerHTML=`<tr><th class="history-topic">Topic / product</th>${dates.map(d=>`<th>${formatHistoryDate(d)}</th>`).join("")}</tr>`;
  $("#historyBody").innerHTML=rows.map(group=>`
    <tr>
      <td class="history-topic"><strong>${esc(group.title)}</strong><small>${esc(group.source)}</small></td>
      ${dates.map(date=>{
        const row=group.values.get(date);
        if(!row) return '<td class="history-empty">—</td>';
        const val=Number(row[valueKey]);
        if(mode==="deals") return `<td>${new Intl.NumberFormat("en-IN",{style:"currency",currency:row.currency||"INR",maximumFractionDigits:0}).format(val||0)}</td>`;
        if(mode==="velocity") return `<td>${fmt(val)}/h</td>`;
        return `<td><span class="table-score">${Number.isFinite(val)?Math.round(val):"—"}</span></td>`;
      }).join("")}
    </tr>`).join("") || '<tr><td>No historical data yet.</td></tr>';
}

function drawChart(){
  const canvas=$("#trendChart"); if(!canvas || !canvas.offsetParent) return;
  const ratio=window.devicePixelRatio||1, rect=canvas.getBoundingClientRect();
  canvas.width=Math.max(500,rect.width*ratio); canvas.height=250*ratio;
  const ctx=canvas.getContext("2d"); ctx.scale(ratio,ratio);
  const w=rect.width,h=250,pad={l:10,r:12,t:18,b:22};
  const values=(state.data.series?.length?state.data.series:DEMO.series).map(Number);
  const max=Math.max(...values,100),min=Math.min(...values,0);
  ctx.clearRect(0,0,w,h);
  ctx.strokeStyle="#294363";ctx.lineWidth=1;
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

async function api(path, config){
  const headers={apikey:config.anon,Authorization:"Bearer "+config.anon};
  const res=await fetch(config.url.replace(/\/$/,"")+"/rest/v1/"+path,{headers});
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}

async function loadSupabase(){
  const runtime=window.__TREND_RADAR_CONFIG__ || {};
  const url=runtime.supabaseUrl || localStorage.getItem("trendRadar.supabaseUrl");
  const anon=runtime.supabaseAnonKey || localStorage.getItem("trendRadar.supabaseAnon");
  if(!url||!anon){
    state.data=structuredClone(DEMO);state.history=buildDemoHistory();state.mode="demo";setConnection(false);renderAll();return;
  }
  $("#supabaseUrl").value=url;$("#supabaseAnon").value=anon;
  const cfg={url,anon};
  const since=new Date(Date.now()-30*24*60*60*1000).toISOString();
  const sinceEncoded=encodeURIComponent(since);
  try{
    const [trendObs,ideaRows,dealObs,runs]=await Promise.all([
      api(`trend_observations?select=trend_item_id,views,views_per_hour,trend_score,observed_at,trend_items(title,url,author_name,source,published_at)&observed_at=gte.${sinceEncoded}&order=observed_at.asc&limit=5000`,cfg),
      api(`video_ideas?select=*&created_at=gte.${sinceEncoded}&order=created_at.desc&limit=1000`,cfg),
      api(`deal_observations?select=deal_item_id,price,currency,discount_pct,sales_rank,deal_score,observed_at,deal_items(title,url,source)&observed_at=gte.${sinceEncoded}&order=observed_at.asc&limit=5000`,cfg),
      api(`automation_runs?select=*&started_at=gte.${sinceEncoded}&order=started_at.desc&limit=1000`,cfg)
    ]);

    const latestTrendMap=new Map();
    for(const o of trendObs){
      const key=o.trend_item_id||o.trend_items?.title;
      const previous=latestTrendMap.get(key);
      if(!previous || new Date(o.observed_at)>new Date(previous.observed_at)) latestTrendMap.set(key,o);
    }
    const latestDealMap=new Map();
    for(const o of dealObs){
      const key=o.deal_item_id||o.deal_items?.title;
      const previous=latestDealMap.get(key);
      if(!previous || new Date(o.observed_at)>new Date(previous.observed_at)) latestDealMap.set(key,o);
    }

    const trends=[...latestTrendMap.values()].sort((a,b)=>Number(b.trend_score)-Number(a.trend_score)).slice(0,50).map(o=>({
      title:o.trend_items?.title||"Untitled",source:o.trend_items?.source||"YouTube",channel:o.trend_items?.author_name||"Unknown",
      views:Number(o.views)||0,vph:Number(o.views_per_hour)||0,score:Number(o.trend_score)||0,observed:timeAgo(o.observed_at),url:o.trend_items?.url||"#"
    }));
    const ideas=ideaRows.slice(0,60).map(i=>({
      score:Number(i.priority_score)||0,title:i.suggested_title||i.topic||"Untitled idea",hook:i.hook||"",why:i.why_now||i.angle||"",
      format:i.video_format||"Video",status:Number(i.priority_score)>=90?"Publish today":Number(i.priority_score)>=80?"Strong":"Watch"
    }));
    const deals=[...latestDealMap.values()].sort((a,b)=>Number(b.deal_score)-Number(a.deal_score)).slice(0,50).map(o=>({
      title:o.deal_items?.title||"Untitled product",source:o.deal_items?.source||"Marketplace",
      price:o.price?new Intl.NumberFormat("en-IN",{style:"currency",currency:o.currency||"INR",maximumFractionDigits:0}).format(Number(o.price)):"—",
      discount:o.discount_pct!=null?Number(o.discount_pct).toFixed(0)+"%":"—",rank:o.sales_rank?"#"+o.sales_rank:"—",score:Number(o.deal_score)||0,url:o.deal_items?.url||"#"
    }));
    const runRows=runs.map(r=>({
      status:r.status||"unknown",started:r.started_at?new Date(r.started_at).toLocaleString():"—",youtube:r.youtube_count||0,deals:r.deal_count||0,ideas:r.idea_count||0,
      duration:r.finished_at&&r.started_at?Math.max(1,Math.round((new Date(r.finished_at)-new Date(r.started_at))/1000))+"s":"—"
    }));

    state.history={
      trends:trendObs.map(o=>({...o,title:o.trend_items?.title||"Untitled",channel:o.trend_items?.author_name||"",source:o.trend_items?.source||"YouTube"})),
      deals:dealObs.map(o=>({...o,title:o.deal_items?.title||"Untitled product",source:o.deal_items?.source||"Marketplace"}))
    };
    state.data={...structuredClone(DEMO),trends:trends.length?trends:DEMO.trends,ideas:ideas.length?ideas:DEMO.ideas,deals:deals.length?deals:DEMO.deals,runs:runRows.length?runRows:DEMO.runs};
    state.data.series=(state.data.trends.slice(0,7).map(x=>x.score).reverse());
    state.mode="live";setConnection(true,"Supabase · 30-day history");renderAll();toast("Live Supabase data loaded");
  }catch(err){
    console.error(err);state.data=structuredClone(DEMO);state.history=buildDemoHistory();state.mode="demo";setConnection(false,"Connection failed · demo shown");renderAll();toast("Could not read Supabase. Check connection and RLS.");
  }
}

$$(".nav-item").forEach(btn=>btn.addEventListener("click",()=>route(btn.dataset.view)));
$$("[data-jump]").forEach(btn=>btn.addEventListener("click",()=>route(btn.dataset.jump)));
$("#mobileMenu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
$("#refreshBtn").addEventListener("click",async()=>{await loadSupabase();toast(state.mode==="live"?"Live data refreshed":"Demo data refreshed");});
$("#rangeSelect").addEventListener("change",e=>{state.range=Number(e.target.value);toast("Date range set to "+e.target.options[e.target.selectedIndex].text);});
$("#trendSearch").addEventListener("input",renderTrends);
$("[data-history-mode]").forEach(btn=>btn.addEventListener("click",()=>{
  $("[data-history-mode]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");state.historyMode=btn.dataset.historyMode;renderHistory();
}));
$$("[data-idea-filter]").forEach(btn=>btn.addEventListener("click",()=>{
  $$("[data-idea-filter]").forEach(x=>x.classList.remove("active"));btn.classList.add("active");state.ideaFilter=btn.dataset.ideaFilter;renderIdeas();
}));
$("#saveConnection").addEventListener("click",async()=>{
  const url=$("#supabaseUrl").value.trim(),anon=$("#supabaseAnon").value.trim();
  if(!/^https:\/\/.+\.supabase\.co\/?$/i.test(url)){toast("Enter a valid Supabase project URL");return;}
  if(anon.length<20){toast("Enter your Supabase anon/public key");return;}
  localStorage.setItem("trendRadar.supabaseUrl",url);localStorage.setItem("trendRadar.supabaseAnon",anon);await loadSupabase();
});
$("#clearConnection").addEventListener("click",()=>{
  localStorage.removeItem("trendRadar.supabaseUrl");localStorage.removeItem("trendRadar.supabaseAnon");
  $("#supabaseUrl").value="";$("#supabaseAnon").value="";state.data=structuredClone(DEMO);state.history=buildDemoHistory();state.mode="demo";setConnection(false);renderAll();toast("Demo mode enabled");
});
window.addEventListener("resize",()=>requestAnimationFrame(drawChart));

const initial=(location.hash||"#overview").slice(1);
route(["overview","trends","history","ideas","deals","competitors","automations","sources","settings"].includes(initial)?initial:"overview");
loadSupabase();