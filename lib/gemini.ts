import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import type { SoilData, CropRecommendation, DiseaseResult } from './types';

// ── Groq client (primary for text — 14,400 free req/day) ──
const groqClient = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

// ── Gemini clients with key rotation (fallback for text, primary for images) ──
const geminiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

let geminiKeyIdx = 0;
function getGeminiModel() {
  const key = geminiKeys[geminiKeyIdx % geminiKeys.length];
  geminiKeyIdx++;
  return new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-flash-latest' });
}

// ── In-memory response cache (24h TTL) ──
const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 24 * 60 * 60 * 1000;
function getCached<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > TTL) { cache.delete(key); return null; }
  return e.data as T;
}
function setCache(key: string, data: unknown) { cache.set(key, { data, ts: Date.now() }); }

// Round NPK to nearest 5 so tiny variations reuse cache
function soilCacheKey(s: SoilData) {
  const r = (n: number) => Math.round(n / 5) * 5;
  return `crop:${r(s.nitrogen)}:${r(s.phosphorus)}:${r(s.potassium)}:${Math.round(s.ph * 2) / 2}:${s.preferred_crop || ''}`;
}

function isQuotaError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('rate_limit');
}

// ── Text via Groq (fast) → fallback to Gemini ──
async function textCompletion(prompt: string): Promise<string> {
  if (groqClient) {
    try {
      const res = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1500,
      });
      return res.choices[0].message.content || '';
    } catch (err) {
      if (!isQuotaError(err)) throw err;
      console.warn('Groq quota hit, falling back to Gemini...');
    }
  }
  // Fallback: try Gemini keys in rotation
  for (let i = 0; i < geminiKeys.length + 1; i++) {
    try {
      const model = getGeminiModel();
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      if (!isQuotaError(err) || i === geminiKeys.length) throw err;
      console.warn(`Gemini key ${geminiKeyIdx} quota hit, rotating...`);
    }
  }
  throw new Error('All API keys exhausted');
}

export async function getCropRecommendation(soil: SoilData): Promise<CropRecommendation> {
  const cacheKey = soilCacheKey(soil);
  const cached = getCached<CropRecommendation>(cacheKey);
  if (cached) return cached;

  const preferred = soil.preferred_crop
    ? `The farmer specifically wants to grow: ${soil.preferred_crop}. Provide a detailed soil correction plan to optimise soil for this crop.`
    : 'Recommend the 3 best crops for this soil.';

  const month = new Date().getMonth() + 1; // 1-12
  const season = (month >= 6 && month <= 10) ? 'Kharif (Jun-Oct)' : (month >= 11 || month <= 3) ? 'Rabi (Nov-Mar)' : 'Zaid/Summer (Apr-Jun)';

  const prompt = `You are a senior agronomist advising small marginal Indian farmers (avg 2-3 acres). Current season: ${season}.

Soil Data: N=${soil.nitrogen} kg/ha, P=${soil.phosphorus} kg/ha, K=${soil.potassium} kg/ha, pH=${soil.ph}, Moisture=${soil.moisture}%, Location=${soil.location}

${preferred}

Guidelines:
- Prioritise crops suitable for current ${season} season
- Always list cheapest treatment option first
- Use Indian market prices (INR/kg, INR/quintal)
- Include specific Indian variety names (e.g. HD-2967 wheat, Pusa Basmati rice)
- careTips must mention irrigation schedule, pest watch, harvesting tip
- expectedYield in quintals per acre
- inputCostEstimate in INR per acre
- costBreakdown: seeds + fertilizer + pesticide in INR

Respond ONLY with valid JSON (no markdown, no extra text):
{
  "topCrops": [{"name":"","expectedYield":"","inputCostEstimate":"","costBreakdown":"","careTips":""}],
  "soilCorrectionPlan": {"nitrogenFix":"","phosphorusFix":"","potassiumFix":"","phCorrection":"","organicAlternatives":"","targetCropNote":""},
  "summary": ""
}`;

  const text = await textCompletion(prompt);
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid AI response');
  const result = JSON.parse(match[0]) as CropRecommendation;
  setCache(cacheKey, result);
  return result;
}

export async function detectDisease(base64Image: string, mimeType: string): Promise<DiseaseResult> {
  // Images require Gemini Vision — try all keys
  for (let i = 0; i < geminiKeys.length + 1; i++) {
    try {
      const model = getGeminiModel();
      const prompt = `You are an expert plant pathologist advising Indian farmers. Carefully analyze this crop/plant image.

If the plant is healthy, set diseaseName to "Healthy Crop" and severity to "low".

For diseases: identify the exact disease name, causative organism (fungal/bacterial/viral/pest), and provide Indian-market treatments.

Severity scale: "low" = early stage <25% affected, "medium" = 25-60% affected, "high" = >60% or spreading fast.

treatments: list organic option FIRST (cheapest), then chemical. Use Indian product names and INR prices.
estimatedCost: per acre in INR.

Respond ONLY with valid JSON (no markdown):
{
  "diseaseName": "Exact disease name or 'Healthy Crop'",
  "severity": "low|medium|high",
  "immediateActions": ["specific action 1", "specific action 2", "specific action 3"],
  "treatments": [
    {"type":"organic","name":"Indian product name","dosage":"amount per litre/acre","estimatedCost":"₹X per acre"},
    {"type":"chemical","name":"Indian product name","dosage":"amount per litre/acre","estimatedCost":"₹X per acre"}
  ],
  "preventionTips": "2-3 specific prevention sentences mentioning Indian farming practices"
}`;
      const result = await model.generateContent([prompt, { inlineData: { mimeType, data: base64Image } }]);
      const text = result.response.text();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Invalid response');
      return JSON.parse(match[0]) as DiseaseResult;
    } catch (err) {
      if (!isQuotaError(err) || i === geminiKeys.length) throw err;
    }
  }
  throw new Error('All Gemini keys exhausted for image analysis');
}

export interface SoilExtractResult {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  rawText: string;
  confidence: 'high' | 'medium' | 'low';
}

export async function extractSoilReport(base64Image: string, mimeType: string): Promise<SoilExtractResult> {
  for (let i = 0; i < geminiKeys.length + 1; i++) {
    try {
      const model = getGeminiModel();
      const prompt = `You are an expert soil scientist. Analyze this soil test report image/document and extract the numerical values.

Look for: Nitrogen (N), Phosphorus (P or P2O5), Potassium (K or K2O), pH, and Moisture/Water content.
- N/P/K values may be in kg/ha, mg/kg, ppm, or % — convert to kg/ha if needed (1 ppm ≈ 2 kg/ha for N/P/K).
- If moisture is not found, use 40 as default.
- If any value truly cannot be found, use 0.
- confidence: "high" if most values clearly visible, "medium" if some guessed, "low" if mostly unclear.

Respond ONLY with valid JSON (no markdown, no explanation):
{
  "nitrogen": <number kg/ha>,
  "phosphorus": <number kg/ha>,
  "potassium": <number kg/ha>,
  "ph": <number 0-14>,
  "moisture": <number 0-100>,
  "rawText": "<brief description of what was found in the report>",
  "confidence": "high|medium|low"
}`;
      const result = await model.generateContent([prompt, { inlineData: { mimeType, data: base64Image } }]);
      const text = result.response.text();
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error('Invalid response');
      return JSON.parse(match[0]) as SoilExtractResult;
    } catch (err) {
      if (!isQuotaError(err) || i === geminiKeys.length) throw err;
    }
  }
  throw new Error('All Gemini keys exhausted');
}

export async function getVoiceChatResponse(query: string, context?: string): Promise<string> {
  const prompt = `You are Arjuna, a friendly AI agriculture advisor for small Indian farmers. Answer in simple, conversational language (no markdown, no bullet points). Keep under 80 words for voice playback. Be specific with quantities, prices in INR, and Indian crop/product names.
${context ? `Farmer's latest soil data: ${context}` : ''}
Question: ${query}

Answer directly and practically:`;

  try {
    return await textCompletion(prompt);
  } catch {
    return 'Sorry, the AI service is busy right now. Please try again in a minute.';
  }
}
