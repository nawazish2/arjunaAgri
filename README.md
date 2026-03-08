# 🌾 Arjuna Agri — AI-Powered Precision Farming

An AI-powered farming platform that guides small Indian farmers through their entire crop cycle — from soil testing to market selling.

## ✨ MVP Features

| Feature | Route | Description |
|---------|-------|-------------|
| 👤 Farmer Registration | `/register` | Create profile (name, phone, village, state, language) |
| 📊 Dashboard | `/` | View soil history, active crops, disease alerts |
| 🌱 Soil Analysis + Crop Advice | `/soil` | Enter NPK/pH data → AI recommends 3 crops with cost breakdown + soil correction plan |
| 🔬 Disease Detection | `/disease` | Upload crop photo → AI diagnoses disease with severity + organic/chemical treatment table |
| 🎤 Voice Assistant | `/voice` | Speak farming questions → AI answers in English or Hindi via voice |

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd ArjunaAgri
npm install
```

### 2. Set up Environment Variables

Copy `.env.local` and fill in your keys:

```env
GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

- **Gemini API Key** (free): https://aistudio.google.com/apikey
- **Supabase** (free): https://supabase.com → Create project → Settings → API

### 3. Set up Supabase Database

Run this SQL in your Supabase SQL editor:

```sql
create table farmers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text not null,
  village text not null,
  state text not null,
  language text default 'en',
  created_at timestamptz default now()
);

create table soil_reports (
  id uuid default gen_random_uuid() primary key,
  farmer_id uuid references farmers(id),
  nitrogen numeric not null,
  phosphorus numeric not null,
  potassium numeric not null,
  ph numeric not null,
  moisture numeric not null,
  location text not null,
  preferred_crop text,
  recommendations jsonb,
  created_at timestamptz default now()
);

create table disease_reports (
  id uuid default gen_random_uuid() primary key,
  farmer_id uuid references farmers(id),
  disease_name text not null,
  severity text not null,
  actions jsonb,
  treatments jsonb,
  created_at timestamptz default now()
);
```

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **AI**: Google Gemini 1.5 Flash (text + vision)
- **Database**: Supabase (PostgreSQL)
- **Voice**: Web Speech API (SpeechRecognition + speechSynthesis) — no extra API

## 📱 Demo Flow

1. Open app → Register as farmer
2. Go to **Soil** → Enter N:40, P:20, K:30, pH:6.8 → Get AI crop recommendations
3. Go to **Disease** → Upload a photo of a plant → See disease diagnosis
4. Go to **Voice** → Ask "When should I irrigate wheat?" → Hear the answer
