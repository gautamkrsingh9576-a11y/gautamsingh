import crypto from "node:crypto";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";

const required = ["FIREBASE_SERVICE_ACCOUNT_JSON", "YOUTUBE_API_KEY"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
  });
}
const db = getFirestore();

const REGION_CODE = process.env.REGION_CODE || "IN";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.6";
const TECH_SEEDS = (process.env.TECH_SEEDS || [
  "smartphone launch",
  "AI tools",
  "laptop launch",
  "gaming technology",
  "tech gadgets",
  "Android update",
  "iPhone",
  "smartwatch",
  "headphones",
  "consumer technology"
].join(",")).split(",").map(s => s.trim()).filter(Boolean);

const now = () => new Date();
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const safeId = value => String(value).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 180);
const chunks = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;

function scoreVideo(video) {
  const published = new Date(video.snippet.publishedAt);
  const ageHours = Math.max((Date.now() - published.getTime()) / 36e5, 1);
  const views = number(video.statistics?.viewCount);
  const likes = number(video.statistics?.likeCount);
  const comments = number(video.statistics?.commentCount);
  const viewsPerHour = views / ageHours;
  const engagement = views ? (likes + comments) / views : 0;
  const freshness = clamp(1 - ageHours / (24 * 7), 0, 1);
  const score =
    Math.log10(views + 1) * 8 +
    Math.log10(viewsPerHour + 1) * 12 +
    engagement * 100 +
    freshness * 20;
  return {
    views,
    likes,
    comments,
    viewsPerHour: Math.round(viewsPerHour * 100) / 100,
    trendScore: Math.round(score * 100) / 100,
  };
}

async function youtube(path, params) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  });
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function fetchYouTubeTrends() {
  const ids = new Set();

  try {
    const popular = await youtube("videos", {
      part: "snippet,statistics",
      chart: "mostPopular",
      regionCode: REGION_CODE,
      videoCategoryId: "28",
      maxResults: 50,
    });
    for (const item of popular.items || []) ids.add(item.id);
  } catch (error) {
    console.warn("Most-popular feed failed:", error.message);
  }

  const publishedAfter = new Date(Date.now() - 48 * 36e5).toISOString();
  for (const keyword of TECH_SEEDS.slice(0, 12)) {
    try {
      const result = await youtube("search", {
        part: "snippet",
        q: keyword,
        type: "video",
        order: "viewCount",
        publishedAfter,
        regionCode: REGION_CODE,
        maxResults: 10,
      });
      for (const item of result.items || []) {
        if (item.id?.videoId) ids.add(item.id.videoId);
      }
      await sleep(120);
    } catch (error) {
      console.warn(`Search failed for "${keyword}":`, error.message);
    }
  }

  const videos = [];
  for (const batch of chunks([...ids], 50)) {
    const result = await youtube("videos", {
      part: "snippet,statistics",
      id: batch.join(","),
      maxResults: 50,
    });
    for (const item of result.items || []) {
      const metrics = scoreVideo(item);
      videos.push({
        itemId: `youtube_${item.id}`,
        externalId: item.id,
        source: "YouTube",
        kind: "video",
        title: item.snippet?.title || "Untitled",
        channel: item.snippet?.channelTitle || "Unknown",
        authorName: item.snippet?.channelTitle || "Unknown",
        url: `https://www.youtube.com/watch?v=${item.id}`,
        publishedAt: item.snippet?.publishedAt ? Timestamp.fromDate(new Date(item.snippet.publishedAt)) : null,
        ...metrics,
      });
    }
  }

  return videos.sort((a, b) => b.trendScore - a.trendScore);
}

function extractJson(text) {
  const cleaned = String(text || "").trim().replace(/^\`\`\`(?:json)?/i, "").replace(/\`\`\`$/i, "").trim();
  try { return JSON.parse(cleaned); } catch {}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try { return JSON.parse(cleaned.slice(first, last + 1)); } catch {}
  }
  throw new Error("AI response was not valid JSON");
}

function heuristicIdeas(trends) {
  return trends.slice(0, 8).map((t, index) => ({
    topic: t.title,
    suggestedTitle: t.title,
    hook: `This tech story is moving fast — here is what actually matters before everyone starts talking about it.`,
    angle: "Explain the practical consumer impact instead of repeating the headline.",
    whyNow: `Current trend score ${Math.round(t.trendScore)} with approximately ${Math.round(t.viewsPerHour).toLocaleString("en-IN")} views/hour.`,
    videoFormat: index < 3 ? "Short + explainer" : "Explainer",
    priorityScore: clamp(Math.round(t.trendScore), 50, 98),
    evidenceUrls: [t.url],
    aiProvider: "heuristic-fallback",
  }));
}

async function generateIdeas(trends, deals) {
  if (!process.env.OPENAI_API_KEY) return heuristicIdeas(trends);

  const evidence = {
    generatedAt: new Date().toISOString(),
    region: REGION_CODE,
    topYouTubeSignals: trends.slice(0, 30).map(t => ({
      title: t.title,
      channel: t.channel,
      views: t.views,
      viewsPerHour: t.viewsPerHour,
      trendScore: t.trendScore,
      url: t.url,
    })),
    dealSignals: deals.slice(0, 15).map(d => ({
      title: d.title,
      source: d.source,
      price: d.price,
      discountPct: d.discountPct,
      dealScore: d.dealScore,
      url: d.url,
    })),
  };

  const prompt = `You are the trend analyst for E-TECH, an India-focused consumer-tech YouTube channel.
Use ONLY the evidence below. Remove noise and duplicates. Find high-velocity, practical consumer-tech opportunities.
Return JSON only with this exact top-level shape:
{"ideas":[{"topic":"...","suggestedTitle":"...","hook":"...","angle":"...","whyNow":"...","videoFormat":"...","priorityScore":0,"evidenceUrls":["..."]}]}
Create exactly 8 ideas. priorityScore must be 0-100. Do not invent prices, specifications, launches, dates, or statistics.
Evidence:
${JSON.stringify(evidence)}`;

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: prompt,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI failed: ${res.status} ${await res.text()}`);
    const json = await res.json();
    const text = json.output_text || (json.output || [])
      .flatMap(item => item.content || [])
      .filter(part => part.type === "output_text")
      .map(part => part.text)
      .join("\n");
    const parsed = extractJson(text);
    const ideas = Array.isArray(parsed.ideas) ? parsed.ideas : [];
    if (!ideas.length) throw new Error("No AI ideas returned");
    return ideas.slice(0, 8).map(i => ({
      topic: String(i.topic || i.suggestedTitle || "Tech opportunity"),
      suggestedTitle: String(i.suggestedTitle || i.topic || "Tech opportunity"),
      hook: String(i.hook || ""),
      angle: String(i.angle || ""),
      whyNow: String(i.whyNow || ""),
      videoFormat: String(i.videoFormat || "Explainer"),
      priorityScore: clamp(Math.round(number(i.priorityScore)), 0, 100),
      evidenceUrls: Array.isArray(i.evidenceUrls) ? i.evidenceUrls.slice(0, 8) : [],
      aiProvider: `openai:${OPENAI_MODEL}`,
    }));
  } catch (error) {
    console.warn("AI generation failed, using heuristic fallback:", error.message);
    return heuristicIdeas(trends);
  }
}

function calculateDealScore(item) {
  const discount = number(item.discountPct);
  const rank = number(item.salesRank);
  const rankBonus = rank > 0 ? Math.max(0, 28 - Math.log10(rank + 1) * 7) : 0;
  return Math.round((discount * 1.5 + rankBonus) * 100) / 100;
}

async function loadDeals() {
  let raw = [];
  if (process.env.TECH_DEALS_JSON) {
    try { raw = JSON.parse(process.env.TECH_DEALS_JSON); } catch (e) { console.warn("TECH_DEALS_JSON invalid:", e.message); }
  } else if (process.env.TECH_DEALS_JSON_URL) {
    try {
      const res = await fetch(process.env.TECH_DEALS_JSON_URL, { headers: { "User-Agent": "E-TECH-Trend-Radar/1.0" } });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      raw = await res.json();
    } catch (error) {
      console.warn("Deal feed failed:", error.message);
    }
  }
  if (!Array.isArray(raw)) raw = raw?.items || raw?.products || [];
  return raw.slice(0, 100).map((item, index) => {
    const externalId = String(item.externalId || item.asin || item.sku || crypto.createHash("sha1").update(String(item.url || item.title || index)).digest("hex").slice(0, 18));
    const normalized = {
      itemId: `${safeId(item.source || "deal")}_${safeId(externalId)}`,
      externalId,
      title: String(item.title || "Untitled product"),
      source: String(item.source || "Approved deal feed"),
      url: String(item.url || ""),
      price: item.price == null ? null : number(item.price),
      currency: String(item.currency || "INR"),
      discountPct: item.discountPct == null ? null : number(item.discountPct),
      salesRank: item.salesRank == null ? null : Math.round(number(item.salesRank)),
    };
    return { ...normalized, dealScore: number(item.dealScore) || calculateDealScore(normalized) };
  }).sort((a, b) => b.dealScore - a.dealScore);
}

async function commitBatches(ops) {
  for (const group of chunks(ops, 400)) {
    const batch = db.batch();
    for (const op of group) {
      if (op.type === "set") batch.set(op.ref, op.data, op.options || {});
      else if (op.type === "update") batch.update(op.ref, op.data);
    }
    await batch.commit();
  }
}

async function saveTrends(runId, trends) {
  const observedAt = Timestamp.now();
  const ops = [];
  trends.forEach(t => {
    const identityRef = db.collection("trend_items").doc(safeId(t.itemId));
    ops.push({
      type: "set",
      ref: identityRef,
      data: {
        itemId: t.itemId,
        externalId: t.externalId,
        source: t.source,
        kind: t.kind,
        title: t.title,
        channel: t.channel,
        authorName: t.authorName,
        url: t.url,
        publishedAt: t.publishedAt,
        updatedAt: observedAt,
        createdAt: FieldValue.serverTimestamp(),
      },
      options: { merge: true },
    });

    const obsRef = db.collection("trend_observations").doc(`${runId}_${safeId(t.itemId)}`);
    ops.push({
      type: "set",
      ref: obsRef,
      data: {
        runId,
        itemId: t.itemId,
        externalId: t.externalId,
        title: t.title,
        source: t.source,
        channel: t.channel,
        authorName: t.authorName,
        url: t.url,
        publishedAt: t.publishedAt,
        views: t.views,
        likes: t.likes,
        comments: t.comments,
        viewsPerHour: t.viewsPerHour,
        trendScore: t.trendScore,
        observedAt,
      },
    });
  });
  await commitBatches(ops);
}

async function saveDeals(runId, deals) {
  const observedAt = Timestamp.now();
  const ops = [];
  deals.forEach(d => {
    const identityRef = db.collection("deal_items").doc(safeId(d.itemId));
    ops.push({
      type: "set",
      ref: identityRef,
      data: {
        itemId: d.itemId,
        externalId: d.externalId,
        source: d.source,
        title: d.title,
        url: d.url,
        updatedAt: observedAt,
        createdAt: FieldValue.serverTimestamp(),
      },
      options: { merge: true },
    });
    const obsRef = db.collection("deal_observations").doc(`${runId}_${safeId(d.itemId)}`);
    ops.push({
      type: "set",
      ref: obsRef,
      data: {
        runId,
        itemId: d.itemId,
        externalId: d.externalId,
        source: d.source,
        title: d.title,
        url: d.url,
        price: d.price,
        currency: d.currency,
        discountPct: d.discountPct,
        salesRank: d.salesRank,
        dealScore: d.dealScore,
        observedAt,
      },
    });
  });
  await commitBatches(ops);
}

async function saveIdeas(runId, ideas) {
  const createdAt = Timestamp.now();
  const ops = ideas.map((i, index) => ({
    type: "set",
    ref: db.collection("video_ideas").doc(`${runId}_${String(index + 1).padStart(2, "0")}`),
    data: {
      runId,
      topic: i.topic,
      suggestedTitle: i.suggestedTitle,
      hook: i.hook,
      angle: i.angle,
      whyNow: i.whyNow,
      videoFormat: i.videoFormat,
      priorityScore: i.priorityScore,
      evidenceUrls: i.evidenceUrls,
      aiProvider: i.aiProvider,
      status: "new",
      createdAt,
    },
  }));
  await commitBatches(ops);
}

function buildDigest(trends, deals, ideas) {
  const lines = ["🚀 E-TECH DAILY TREND RADAR", "", "🔥 TOP TECH SIGNALS"];
  trends.slice(0, 5).forEach((t, i) => {
    lines.push(`${i + 1}. ${t.title}\n   score ${Math.round(t.trendScore)} · ${Math.round(t.viewsPerHour).toLocaleString("en-IN")} views/hr\n   ${t.url}`);
  });
  if (deals.length) {
    lines.push("", "🛒 TECH DEAL SIGNALS");
    deals.slice(0, 5).forEach((d, i) => lines.push(`${i + 1}. ${d.title}\n   ${d.discountPct ?? "—"}% off · score ${Math.round(d.dealScore)}\n   ${d.url}`));
  }
  lines.push("", "🎥 VIDEO IDEAS");
  ideas.slice(0, 5).forEach((i, n) => lines.push(`${n + 1}. [${i.priorityScore}/100] ${i.suggestedTitle}\n   Hook: ${i.hook}`));
  return lines.join("\n");
}

async function notify(text) {
  if (process.env.DISCORD_WEBHOOK_URL) {
    for (const part of text.match(/[\s\S]{1,1800}/g) || []) {
      try { await fetch(process.env.DISCORD_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content: part }) }); } catch {}
    }
  }
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    for (const part of text.match(/[\s\S]{1,3500}/g) || []) {
      try {
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: part, disable_web_page_preview: true }),
        });
      } catch {}
    }
  }
}

async function main() {
  const runId = `${new Date().toISOString().slice(0, 10)}_${crypto.randomUUID().slice(0, 8)}`;
  const runRef = db.collection("automation_runs").doc(runId);
  const startedAt = Timestamp.now();

  await runRef.set({
    runId,
    startedAt,
    status: "running",
    youtubeCount: 0,
    dealCount: 0,
    ideaCount: 0,
    source: "github-actions",
    region: REGION_CODE,
  });

  let trends = [], deals = [], ideas = [];
  try {
    console.log("Fetching YouTube tech trends…");
    trends = await fetchYouTubeTrends();
    console.log(`Collected ${trends.length} YouTube signals`);
    await saveTrends(runId, trends);

    console.log("Loading approved deal feed…");
    deals = await loadDeals();
    console.log(`Collected ${deals.length} deal signals`);
    if (deals.length) await saveDeals(runId, deals);

    console.log("Generating video opportunities…");
    ideas = await generateIdeas(trends, deals);
    console.log(`Generated ${ideas.length} ideas`);
    await saveIdeas(runId, ideas);

    const digest = buildDigest(trends, deals, ideas);
    console.log("\n" + digest);
    await notify(digest);

    await runRef.update({
      status: "success",
      finishedAt: Timestamp.now(),
      youtubeCount: trends.length,
      dealCount: deals.length,
      ideaCount: ideas.length,
      topTrendScore: trends[0]?.trendScore || 0,
    });
  } catch (error) {
    console.error(error);
    await runRef.update({
      status: "failed",
      finishedAt: Timestamp.now(),
      youtubeCount: trends.length,
      dealCount: deals.length,
      ideaCount: ideas.length,
      error: String(error?.stack || error).slice(0, 5000),
    });
    process.exitCode = 1;
  }
}

await main();
