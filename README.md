# Arjuna Agri

Arjuna Agri is a hackathon web app built for the **Agriculture and AgriTech** theme. It combines AI-powered crop support with practical farm tools for Indian farmers, covering soil analysis, disease detection, irrigation planning, fertilizer calculation, yield estimation, market guidance, and profile-based farm management.

## Theme Alignment

**Hackathon theme:** Agriculture and AgriTech: Explore innovations in agriculture. Build tools or systems that can improve crop yield, farm management, or address food security challenges.

**How this project fits:**

- improves crop decisions using soil-based AI recommendations
- helps reduce crop loss with image-based disease detection
- supports better farm management with irrigation, expenses, fertilizer, and ROI tools
- improves accessibility with multilingual UI, voice interaction, and mobile-friendly design

## What The Website Does

Arjuna Agri is a multi-page farming platform with a guest landing page and a signed-in farmer dashboard.

### Guest experience

- Visiting `/` as a guest shows a landing page with product overview and feature highlights
- Users can register from `/register`
- Most farm tools are protected and require sign-in

### Farmer experience

After registration, the farmer can access:

- dashboard with weather, pest alerts, latest soil report, and disease alerts
- soil analysis workflow with AI crop recommendations
- disease detection from plant photos
- fertilizer calculator
- crop calendar
- market and government scheme reference
- irrigation scheduler
- yield and ROI predictor
- expense tracker
- voice assistant
- profile page
- support page
- pricing page

## Implemented Features

### 1. Farmer registration and lightweight auth

Route: `/register`

- two-step registration flow
- farmer identified by phone number
- returning farmer sessions restored from stored profile
- Supabase-backed when configured
- localStorage fallback when Supabase is not configured

### 2. Dashboard

Route: `/`

- guest landing page for non-signed-in users
- logged-in dashboard for farmers
- shows latest soil report and recommended crops
- shows recent disease alerts
- weather widget using browser geolocation
- pest alert component
- quick navigation to major tools

### 3. Soil analysis and crop advice

Route: `/soil`

- manual input for nitrogen, phosphorus, potassium, pH, moisture, and location
- optional preferred crop input
- upload soil report as image or PDF
- AI extracts NPK, pH, and moisture from uploaded report
- AI returns:
  - top crop recommendations
  - expected yield
  - cost estimates
  - soil correction plan
- downloadable PDF report
- WhatsApp share flow
- local soil history chart

### 4. Plant disease detection

Route: `/disease`

- upload crop or plant image
- AI analyzes image and identifies disease
- returns severity, immediate actions, treatments, and prevention tips
- stores result in Supabase or localStorage fallback

### 5. Fertilizer calculator

Route: `/fertilizer`

- rule-based calculator for common crops
- calculates Urea, DAP, MOP, and SSP quantities
- includes estimated total cost
- includes crop-specific deficiency view
- includes application schedule

### 6. Irrigation scheduler

Route: `/irrigation`

- stage-wise irrigation schedule by crop
- choose crop and sowing date
- shows next irrigation timing
- highlights critical irrigation stages
- includes water quantity guidance and crop notes

### 7. Yield and ROI predictor

Route: `/yield`

- compares profitability across selected crops
- uses acreage, soil quality, MSP, and indicative input costs
- shows gross income, total cost, ROI, and break-even values

### 8. Expense tracker

Route: `/expenses`

- tracks farm expenses by category
- budget tracking
- total spent, remaining budget, and per-acre spend
- local seasonal cost visibility

### 9. Crop calendar

Route: `/calendar`

- crop timing and seasonal planning interface
- sowing and harvest guidance layout

### 10. Market and schemes page

Route: `/market`

- MSP 2024-25 reference data for common crops
- season filtering
- farmer scheme cards with official links

Note: this page currently uses built-in MSP and scheme data in the app rather than a live mandi API.

### 11. Voice assistant

Route: `/voice`

- voice and text farming queries
- short, voice-friendly responses
- optional use of farmer soil context
- speech recognition and speech synthesis in the browser

### 12. Profile page

Route: `/profile`

- editable farmer details
- profile stats for soil tests and disease scans
- pincode lookup to auto-fill district and state
- logout flow

### 13. Support page

Route: `/support`

- support UI with FAQ and contact/help information
- callback request form with ticket ID generation
- support tabs for AI-style and human support layouts

### 14. PWA support

- offline fallback page at `/offline`
- manifest and installable app setup
- service worker generated via `next-pwa`

## AI Features In The Codebase

### AI-powered

- crop recommendation from soil data
- plant disease detection from image
- soil report extraction from image or PDF
- voice assistant responses

### Non-AI calculator/planner features

- fertilizer calculator
- irrigation scheduler
- yield and ROI predictor
- expense tracker
- market and scheme information
- crop calendar

## Tech Stack

### Frontend

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Chart.js and `react-chartjs-2`

### AI and backend

- Groq SDK with `llama-3.3-70b-versatile` for text responses
- Google Gemini `gemini-flash-latest` for image and report analysis
- Next.js API routes

### Data and storage

- Supabase PostgreSQL
- localStorage fallback for local/offline-style usage

### Other libraries

- `pdfjs-dist` for PDF soil report parsing
- `jspdf` for soil report export
- `next-pwa` for PWA support

## Authentication And Data Flow

- authentication is lightweight and session-like, based on stored farmer profile data
- no OTP flow is implemented
- when Supabase is configured, farmer, soil, and disease data are saved there
- when Supabase is not configured, the app falls back to localStorage for core flows

## Multi-Language Support

The UI includes translation support for:

- English
- Hindi
- Telugu
- Tamil
- Marathi
- Punjabi

Language is stored in localStorage and can be changed from the navbar.

## Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

Optional Gemini fallback keys:

```env
GEMINI_API_KEY_2=your_second_key
GEMINI_API_KEY_3=your_third_key
```

## Database Schema

Run this in Supabase SQL editor:

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

## Project Structure

```text
ArjunaAgri/
├── app/
│   ├── api/
│   │   ├── crop-recommend/
│   │   ├── disease-detect/
│   │   ├── extract-soil/
│   │   └── voice-chat/
│   ├── calendar/
│   ├── disease/
│   ├── expenses/
│   ├── fertilizer/
│   ├── irrigation/
│   ├── market/
│   ├── offline/
│   ├── pricing/
│   ├── profile/
│   ├── register/
│   ├── soil/
│   ├── support/
│   ├── voice/
│   ├── yield/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
├── docs/
├── lib/
├── public/
├── next.config.js
├── package.json
└── README.md
```

## Run Locally

### 1. Clone the repo

```bash
git clone https://github.com/nawazish2/arjunaAgri.git
cd arjunaAgri
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start development server

```bash
npm run dev
```

If file watcher issues happen on your machine, use:

```bash
npm run dev:prod
```

### 4. Build for production

```bash
npm run build
npm start
```

Open `http://localhost:3000`.

## Demo Flow

1. Open the app and register a farmer profile
2. Go to `Soil Analysis` and either enter values manually or upload a soil report
3. Generate crop recommendations and soil correction suggestions
4. Open `Disease Detection` and upload a plant image
5. Use `Fertilizer Calculator`, `Irrigation Scheduler`, and `Yield & ROI` for farm planning
6. Open `Market & Schemes` to check MSP reference and scheme links
7. Try the `Voice Assistant` for spoken farming advice

## Notes

- `.env.local` is intentionally not committed to GitHub
- most feature pages require sign-in through the registration flow
- the codebase includes a more detailed project document at `docs/DOCUMENTATION.md`

## Hackathon Summary

Arjuna Agri is a practical AgriTech prototype focused on:

- crop yield improvement
- better farm planning and decision support
- easier access to agricultural tools for Indian farmers
- multilingual, mobile-friendly farm assistance
