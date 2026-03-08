# Arjuna Agri — Hackathon Project Documentation

> **AI-Powered Precision Agriculture Platform for Indian Farmers**
> Built for Hack-N-Win 3.0 Hackathon

---

## 🌾 Project Overview

**Arjuna Agri** is a full-stack web application that empowers small and marginal Indian farmers with AI-driven agricultural insights — soil analysis, crop disease detection, fertilizer advice, market prices, and more — all in their local language, accessible on any device.

**Core Problem Solved:** Small Indian farmers lack access to expert agronomy advice, real-time market prices, and timely disease/pest alerts. Arjuna Agri brings these capabilities to any smartphone through an intuitive, multilingual interface powered by state-of-the-art AI models.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.x (App Router) | Full-stack React framework, SSR + API routes |
| **TypeScript** | 5.x | Type-safe development |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **React** | 18.x | UI components |
| **Chart.js + react-chartjs-2** | Latest | NPK trend charts, soil history graphs |
| **next-pwa** | Latest | Progressive Web App (offline support) |

### Backend / API
| Technology | Purpose |
|---|---|
| **Next.js API Routes** | Serverless backend (`/api/*`) |
| **Groq SDK** (`llama-3.3-70b-versatile`) | Text AI — crop advice, voice chat, fertilizer |
| **Google Gemini** (`gemini-flash-latest`) | Vision AI — disease detection, soil report extraction |
| **pdfjs-dist** | PDF → Image conversion for soil report uploads |
| **jsPDF** | Generate downloadable PDF soil reports |

### Database & Auth
| Technology | Purpose |
|---|---|
| **Supabase** (PostgreSQL) | Farmer profiles, soil reports, disease reports |
| **localStorage** | Session token (`farmer_id`), offline fallback |

> **Auth Note:** Phone OTP auth bypassed (requires Supabase Pro/Twilio). Instead uses direct `INSERT/SELECT` on `farmers` table — phone number as unique identifier.

### AI Models
| Model | Provider | Used For |
|---|---|---|
| `llama-3.3-70b-versatile` | Groq | Crop recommendations, fertilizer advice, voice assistant, AI support chat |
| `gemini-flash-latest` | Google Gemini | Plant disease detection (image), soil test report extraction (image/PDF) |

---

## 📁 Project Structure

```
ArjunaAgri/
├── app/
│   ├── page.tsx              # Dashboard / Landing page
│   ├── register/             # Farmer registration (2-step: info → language)
│   ├── soil/                 # Soil Analysis + NPK input + PDF upload
│   ├── disease/              # AI Plant Disease Detection
│   ├── fertilizer/           # Fertilizer Calculator & Advice
│   ├── calendar/             # Crop Calendar (sowing/harvesting dates)
│   ├── market/               # Market Prices & MSP (Minimum Support Price)
│   ├── voice/                # Voice AI Assistant (Arjuna)
│   ├── yield/                # Yield & ROI Predictor
│   ├── irrigation/           # Irrigation Scheduler
│   ├── expenses/             # Input Cost Tracker
│   ├── support/              # Customer Support (AI chat + Human form)
│   ├── pricing/              # Pricing Plans (Free / Pro / Business)
│   ├── profile/              # Farmer Profile (pincode/district/state)
│   ├── offline/              # Offline fallback page (PWA)
│   └── api/
│       ├── crop-recommend/   # POST → Groq AI crop suggestions from NPK data
│       ├── disease-detect/   # POST → Gemini Vision plant disease analysis
│       ├── extract-soil/     # POST → Gemini Vision extract NPK from report image/PDF
│       └── voice-chat/       # POST → Groq AI voice assistant responses
│
├── components/
│   ├── TopNav.tsx            # Responsive navbar (6-language aware)
│   ├── BottomNav.tsx         # Mobile bottom navigation
│   ├── Footer.tsx            # Site footer with all links
│   ├── LangToggle.tsx        # Language switcher dropdown
│   ├── AuthGuard.tsx         # Route protection (redirect to register)
│   ├── WeatherWidget.tsx     # Live weather data widget
│   ├── PestAlert.tsx         # Seasonal pest alert banner
│   └── SoilHistoryChart.tsx  # NPK trend chart (Chart.js)
│
├── lib/
│   ├── gemini.ts             # Gemini API helpers (disease detect, soil extract)
│   ├── lang.tsx              # Language context (useLang hook, LangProvider)
│   ├── translations.ts       # 35+ UI strings × 6 languages
│   ├── india-locations.ts    # All 28 states + 8 UTs + ~700 districts
│   ├── supabase.ts           # Supabase client
│   └── types.ts              # Shared TypeScript types
│
└── docs/
    └── DOCUMENTATION.md      # This file
```

---

## 🚀 Features Built

### 1. 🧪 Soil Analysis (AI-Powered)
- Input NPK values (Nitrogen, Phosphorus, Potassium), pH, Moisture, Location
- **📄 Upload soil test report** (photo or PDF) → Gemini AI auto-extracts NPK values
  - PDF → rendered to image using `pdfjs-dist` → sent to Gemini Vision
  - Auto-fills form fields with extracted values + confidence rating (High/Medium/Low)
- Groq AI generates:
  - Top 3 crop recommendations with expected yield & input cost
  - Soil correction plan (what to add to fix deficiencies)
  - Organic vs chemical treatment options
- Download report as **PDF** or **share on WhatsApp**
- NPK history chart (tracks last 10 tests over time)

### 2. 🔬 Disease Detection
- Upload photo of crop/plant
- Gemini Vision identifies disease with severity (Low/Medium/High)
- Returns: disease name, immediate actions, organic + chemical treatments (INR prices), prevention tips
- Indian market product names and dosages

### 3. 🌱 Fertilizer Calculator
- Input crop type, soil NPK, area (acres)
- Groq AI calculates exact fertilizer quantities
- Recommendations in Indian market brands and INR pricing

### 4. 📅 Crop Calendar
- Season-aware sowing and harvesting schedule
- State/region-specific crop suggestions
- Monthly farming activity planner

### 5. 📈 Market Prices & MSP
- Government Minimum Support Price (MSP) data
- Market price comparisons
- Best time to sell recommendations

### 6. 🎤 Voice AI Assistant (Arjuna)
- Talk to AI in natural language
- Groq LLaMA processes farming queries
- Responses optimized for voice playback (under 80 words)
- Answers farming questions in context of farmer's soil data

### 7. 📊 Yield & ROI Predictor
- Input crop, area, input costs
- Predicts expected yield and return on investment

### 8. 💧 Irrigation Scheduler
- Crop and soil moisture-based irrigation planning
- Water-saving recommendations

### 9. 💸 Input Cost Tracker
- Track seeds, fertilizer, labour expenses
- Season-wise cost analysis

### 10. 🎧 Customer Support
- **AI Chat tab** — Groq-powered instant support (quick question chips, typing indicator)
- **Human Support tab** — callback request form (name, phone, category, issue) with ticket ID generation
- **Sidebar** — WhatsApp, Helpline, Email contact cards + FAQ accordion + support hours

### 11. 💳 Pricing Plans
| Plan | Price | Key Features |
|---|---|---|
| Free | ₹0/month | 1 soil test, basic crop advice, community support |
| **Farmer Pro** *(highlighted)* | ₹199/month | Unlimited soil tests, AI disease detection, voice assistant 24/7, government scheme alerts |
| Agri Business | ₹999/month | Everything in Pro + 10 farmer accounts + direct market access + priority expert support |

### 12. 👤 Farmer Profile
- Name, Village, **Pincode → auto-fetches District & State** (India Post API)
- Edit mode with save to Supabase + localStorage
- Soil test count, disease scan count, activity stats
- Logout

---

## 🌐 Multi-Language Support

Full UI translation in **6 Indian languages**:

| Code | Language | Script |
|---|---|---|
| `en` | English | Latin |
| `hi` | हिंदी (Hindi) | Devanagari |
| `te` | తెలుగు (Telugu) | Telugu |
| `ta` | தமிழ் (Tamil) | Tamil |
| `mr` | मराठी (Marathi) | Devanagari |
| `pa` | ਪੰਜਾਬੀ (Punjabi) | Gurmukhi |

Language persists in `localStorage`. Toggle via flag dropdown in navbar.

---

## 🗄️ Database Schema (Supabase)

### `farmers` table
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Full name |
| `phone` | text | Unique, used as login identifier |
| `village` | text | Village name |
| `state` | text | State name |
| `language` | text | Preferred language code (en/hi/te...) |
| `created_at` | timestamp | Auto |

### `soil_reports` table
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `farmer_id` | uuid | FK → farmers |
| `nitrogen`, `phosphorus`, `potassium` | numeric | kg/ha |
| `ph`, `moisture` | numeric | pH (0-14), Moisture (%) |
| `location` | text | Village, State |
| `preferred_crop` | text | Optional |
| `recommendations` | jsonb | Full AI response |
| `created_at` | timestamp | Auto |

### `disease_reports` table
| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `farmer_id` | uuid | FK → farmers |
| `image_url` | text | Uploaded image reference |
| `result` | jsonb | Full Gemini analysis |
| `created_at` | timestamp | Auto |

---

## 🔌 API Routes

| Route | Method | AI Model | Description |
|---|---|---|---|
| `/api/crop-recommend` | POST | Groq LLaMA | NPK → crop recommendations + soil correction plan |
| `/api/disease-detect` | POST | Gemini Vision | Image → disease name, severity, treatments |
| `/api/extract-soil` | POST | Gemini Vision | Image/PDF → NPK, pH, moisture extraction |
| `/api/voice-chat` | POST | Groq LLaMA | Text query → farming advice (voice-optimized) |

---

## 📱 PWA (Progressive Web App)

- Installable on Android/iOS home screen
- Offline fallback page (`/offline`) via `next-pwa`
- Service worker caches static assets
- Works on low-connectivity networks

---

## 🔐 Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
GEMINI_API_KEY=<your-gemini-api-key>
GROQ_API_KEY=<your-groq-api-key>
# Optional: add GEMINI_API_KEY_2, GEMINI_API_KEY_3 for key rotation on quota limits
```

---

## 🚦 Running the Project

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎯 Target Users

- **Small & marginal farmers** (< 5 acres) across India
- **Semi-literate users** — minimal text, icon-heavy UI, voice support
- **Feature phone / low-end Android** users — PWA, fast loading
- **All regions** — 6 language support covers ~800M Indian language speakers

---

## 🏆 Hackathon Highlights

| Metric | Value |
|---|---|
| Pages / Features | 12 full pages + 4 AI API routes |
| Languages supported | 6 (EN, HI, TE, TA, MR, PA) |
| AI Models integrated | 2 (Groq LLaMA-3.3-70B + Google Gemini Flash) |
| Database | Supabase (PostgreSQL) |
| Offline support | ✅ PWA |
| PDF generation | ✅ Soil report download |
| WhatsApp sharing | ✅ One-tap share |
| Pincode → location | ✅ India Post API auto-fill |
| Soil report upload | ✅ Photo + PDF (Gemini AI extraction) |

---

*Built with ❤️ for Indian Farmers — Arjuna Agri © 2025*
