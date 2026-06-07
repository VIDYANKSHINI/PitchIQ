# PitchIQ AI - Your AI Co-Founder Swarm 🚀

A synchronized AI validation swarm running real-time competitive analysis, risk testing, and localized India-first GTM playbooks.

---

## Problem

First-time founders and builders face massive uncertainty when validating startup ideas. Traditional market research is slow, expensive, and fails to identify hyper-local execution risks, leaving teams with generic strategies and unstructured pitch outlines.

---

## Solution

PitchIQ solves this by providing an autonomous swarm of AI agents that instantly research competitors, pressure-test business assumptions, map out localization roadmaps (e.g. UPI/WhatsApp hooks), and output a structured, downloadable investor brief.

---

## How PitchIQ Works (Multi-Agent Swarm)

When a startup idea is input, PitchIQ coordinates specialized agents:

```mermaid
graph TD
    Input[User Startup Idea] --> Coordinator[PitchIQ Coordinator]
    
    subgraph Swarm Agents [AI Agent Validation Swarm]
        Coordinator --> Scout[Market Scout]
        Coordinator --> Devil[Devil's Advocate]
        Coordinator --> GTM[India GTM Agent]
        
        Scout -->|Competitor Landscape| Consensus[Consensus Integrator]
        Devil -->|Vulnerability & Risks| Consensus
        GTM -->|Localized GTM & Innovation| Consensus
    end
    
    Consensus --> Writer[Pitch Writer]
    Writer --> Output[Investor Brief & Viability Score]
    Output --> Interactive[Co-Founder Chatbot Console]
```

- **Market Scout**: Evaluates competitor landscapes, pricing models, and SWOT points.
- **Devil's Advocate**: Pressure-tests assumptions to find potential failures and bottlenecks.
- **India GTM Agent**: Outlines regional rollouts, vernacular interfaces, and UPI/ONDC integrations.
- **Pitch Writer**: Consolidates swarm intelligence into the final viability index and downloadable investor memorandum.

---

## Features

- **Viability Assessment Index**: 0-100 rating scale across parameters like Market Potential, India Fit, and Competition.
- **Competitor Mapping**: Detailed SWOT analysis of primary incumbents with their pricing models.
- **Vulnerability Analysis**: Anticipates risk vectors (e.g. CAC inflation, compliance) with impact ratings.
- **India-First Playbook**: Actionable roadmap emphasizing UPI settlement, WhatsApp bots, and ONDC catalogs.
- **Core Innovation Callout**: Visualizes your startup's core differentiators and technical moats.
- **One-Page Investor Brief**: Interactive summaries available for instant `.txt` file download.
- **Interactive Co-Founder Chat**: Brainstorm strategy with the co-founder agents in real-time.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Spline 3D (with 2D Canvas fallback).
- **Backend**: Node.js, Express, Cors, Dotenv.
- **AI Core**: Google GenAI SDK (Gemini 2.5 Flash / Gemini 2.5 Pro).

---

## Project Structure

```text
PitchIQ-AI/
├── public/                  # Static assets (favicons, icons, and diagrams)
├── server/                  # Node.js/Express backend for Gemini orchestration
│   ├── .env.example         # Example configuration for environment variables
│   ├── package.json         # Backend dependencies
│   └── server.js            # Main backend server entry (handles multi-agent consensus logic)
├── src/                     # React/TypeScript frontend
│   ├── assets/              # Fonts, styling assets, and local media
│   ├── components/          # Reusable React components
│   │   ├── ui/              # Atom UI components (buttons, inputs)
│   │   ├── AgentActivity.tsx# Live console showing agent reasoning logs
│   │   ├── AgentsSection.tsx# Swarm coordinator UI panel
│   │   ├── CoFounderChat.tsx# Interactive chat for strategy brainstorming
│   │   ├── CompetitorAnalysis.tsx # SWOT and competitive landscape mapping
│   │   ├── ErrorBoundary.tsx# Fallback handler for UI stability
│   │   ├── FailureAnalysis.tsx # Devil's Advocate pressure-testing component
│   │   ├── Footer.tsx       # Bottom navbar and creator links
│   │   ├── HeroSection.tsx  # Dynamic introductory landing view
│   │   ├── IndiaGtm.tsx     # Localized India-first playbook panel (UPI, WhatsApp, ONDC)
│   │   ├── InputSection.tsx # Form input for the startup concept
│   │   ├── InvestorPitch.tsx# Structured report and text exporter
│   │   ├── Navbar.tsx       # Top navigation header
│   │   └── StartupScore.tsx # Visual rating scale across viability parameters
│   ├── lib/                 # Shared utilities and helper scripts
│   │   └── utils.ts         # Tailwind/class merger utility
│   ├── App.tsx              # Core App entry combining layout and state
│   ├── index.css            # Tailwind directives and custom animation classes
│   └── main.tsx             # DOM bootstrapper file
├── package.json             # Root NPM dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite Bundler settings
```

---

## Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (version 18+).

### 2. Installation
Install project dependencies in the root directory:
```bash
npm install
```

### 3. Environment Variable
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your-google-gemini-api-key"
```
*Note: If no API key is specified, the application will automatically fall back to the dynamic rules-based mock engine.*

### 4. Start Development Servers
Start both the backend and frontend concurrently:
```bash
npm run dev
```

---

## Usage

1. **Input Startup Concept**: Enter your startup description in the main textarea.
2. **Launch AI Swarm**: Click **Analyze Startup** to trigger the analysis engine.
3. **Inspect Live Reasoning**: Scroll to check the **Agent Activity Console** as log inputs stream.
4. **Read Report Sections**: Review the Viability Score, Competitor Landscape, GTM Roadmap, and Innovation panel.
5. **Download Memorandum Brief**: Click **Download PDF Brief** to save your investor brief.
6. **Consult AI Swarm**: Use the bottom interactive chat to ask follow-up questions.

---

## Screenshots

Below is a flat UI dashboard preview of PitchIQ AI:

<img width="1894" height="901" alt="image" src="https://github.com/user-attachments/assets/943904b8-0397-4716-80b9-5660bd1f22e4" />
<img width="1893" height="904" alt="image" src="https://github.com/user-attachments/assets/847e460f-5d76-4d57-bb88-014e4bc7bbb0" />
<img width="1892" height="896" alt="image" src="https://github.com/user-attachments/assets/f9abbc1a-6fd8-49c8-a345-8a97466fa608" />


---

## Demo

- **Frontend App Url (Local)**: `http://localhost:5173`
- **Backend API Url (Local)**: `http://localhost:5001`
- **Render Production Url**: [Connected for auto-deployment via Github integration.](https://pitchiq-5cbb.onrender.com/)

---

## Team / License

- **License**: MIT License - feel free to use and adapt this system for your own startup builds.
- **Creators / Team**:
  - **[Vidyankshini](https://github.com/VIDYANKSHINI)** - Frontend, API, and Core Development
  - **[Mayur Dhavan](https://github.com/mayur-dhavan)** - Original Idea & Backend Integration
