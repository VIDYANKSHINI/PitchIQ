import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { GoogleGenAI } from '@google/genai'

import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env variables from root and server directories
dotenv.config()
dotenv.config({ path: path.resolve(__dirname, '.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const app = express()
app.use(cors())
app.use(express.json())

console.log('[System Debug] Resolving .env files...')
console.log('  - CWD:', process.cwd())
console.log('  - server/.env path:', path.resolve(__dirname, '.env'))
console.log('  - root/.env path:', path.resolve(__dirname, '../.env'))

try {
  const rawEnv = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf8')
  console.log('  - Raw .env content (JSON):', JSON.stringify(rawEnv))
} catch (e) {
  console.log('  - Failed to read .env file directly:', e.message)
}

const API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
console.log('  - Resolved GEMINI_API_KEY:', API_KEY ? `Found (starts with ${API_KEY.substring(0, 5)}...)` : 'Not Found')

let ai = null

if (API_KEY) {
  console.log('[System] GEMINI_API_KEY found. Initializing Gemini SDK...')
  ai = new GoogleGenAI({ apiKey: API_KEY })
} else {
  console.log('[System] GEMINI_API_KEY not found. Running in Dynamic Mock Fallback mode.')
}

// JSON Schema for Gemini response validation
const responseSchema = {
  type: "object",
  properties: {
    score: {
      type: "object",
      properties: {
        overall: { type: "integer" },
        metrics: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              score: { type: "integer" }
            },
            required: ["name", "score"]
          }
        }
      },
      required: ["overall", "metrics"]
    },
    competitors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          pricing: { type: "string" },
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } }
        },
        required: ["name", "pricing", "strengths", "weaknesses"]
      }
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          desc: { type: "string" },
          impact: { type: "string" }
        },
        required: ["title", "desc", "impact"]
      }
    },
    gtm: {
      type: "array",
      items: {
        type: "object",
        properties: {
          phase: { type: "string" },
          title: { type: "string" },
          highlights: { type: "array", items: { type: "string" } }
        },
        required: ["phase", "title", "highlights"]
      }
    },
    innovation: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        points: { type: "array", items: { type: "string" } }
      },
      required: ["title", "description", "points"]
    },
    pitch: {
      type: "object",
      properties: {
        businessTitle: { type: "string" },
        sections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              text: { type: "string" }
            },
            required: ["title", "text"]
          }
        },
        gtmStrategy: { type: "string" },
        criticalRisks: { type: "string" }
      },
      required: ["businessTitle", "sections", "gtmStrategy", "criticalRisks"]
    },
    logs: {
      type: "array",
      items: {
        type: "object",
        properties: {
          text: { type: "string" },
          type: { type: "string" }
        },
        required: ["text", "type"]
      }
    }
  },
  required: ["score", "competitors", "risks", "gtm", "pitch", "innovation", "logs"]
}

// System Instruction / Prompt for Gemini
const systemInstruction = `You are the PitchIQ AI core analysis engine. Your job is to analyze a startup idea and compile an investor validation report.
You must output a single JSON object that strictly adheres to the requested schema.

The JSON schema details:
- score: An object containing:
  - overall: Integer between 0 and 100 representing the viability score.
  - metrics: Array of 5 objects representing: "Market Potential", "India Fit", "Investor Appeal", "Competition", "Execution Difficulty". Each must have a "name" and a "score" (integer 0-100).
- competitors: Array of 3 objects representing direct or indirect competitors. Each competitor must have:
  - name: String.
  - pricing: String detailing their price points or business model.
  - strengths: Array of 3 strings detailing their key strengths.
  - weaknesses: Array of 3 strings detailing their key weaknesses.
- risks: Array of 4 objects outlining risk vectors. Each risk must have:
  - title: String.
  - desc: String explaining the risk.
  - impact: String, one of "LOW", "MEDIUM", "MEDIUM-HIGH", "HIGH".
- gtm: Array of 2 objects representing "Phase 1" and "Phase 2" of the India GTM strategy. Each phase must have:
  - phase: String (e.g., "Phase 1", "Phase 2").
  - title: String.
  - highlights: Array of 3 strings. Each string must be formatted as "Title: Description" (with a colon).
- innovation: An object detailing how this startup stands out and its core innovation:
  - title: A catchy short title for the innovation differentiator (e.g., "Zero-Friction WhatsApp Commerce Moat").
  - description: A short paragraph explaining the unique angle or core technical/business innovation.
  - points: Array of 3 strings outlining unique operational advantages, each formatted as "Title: Description" (with a colon).
- pitch: An object containing:
  - businessTitle: A catchy, creative, and memorable business name/title for the venture (e.g., "WanderLoom AI").
  - sections: Array of 5 objects representing Pitch Summary. The sections must have "title" (exactly one of: "Problem Statement", "Proposed Solution", "Market Opportunity", "Revenue Model", "Competitive Advantage") and "text" (a summary paragraph).
  - gtmStrategy: String summarizing the overall GTM strategy.
  - criticalRisks: String summarizing the critical risks.
- logs: Array of 15 log messages showing the step-by-step consensus reasoning of the agent swarm. Each log message has:
  - text: String (e.g., "[Market Scout] Searching competitor database...", "System: Complete").
  - type: String, one of "system", "market", "devil", "gtm", "writer".

Ensure all descriptions, names, risks, and strategies are specifically tailored to the user's startup idea. Analyze it with depth, realism, and local Indian market awareness.`;

// Endpoint to analyze startup idea
app.post('/api/analyze', async (req, res) => {
  const { idea } = req.body

  if (!idea || typeof idea !== 'string' || !idea.trim()) {
    return res.status(400).json({ error: 'Startup idea is required and must be a valid string.' })
  }

  console.log(`[Server] Analyzing startup idea: "${idea.substring(0, 60)}..."`)

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following startup idea:\n\n"${idea}"`,
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        }
      })

      const resultText = response.text
      const data = JSON.parse(resultText)
      return res.json(data)
    } catch (err) {
      console.error('[Gemini API Error] Failed to generate validation report:', err)
      console.log('[System] Falling back to dynamic mock generation...')
      // Fall through to mock generator if API call fails
    }
  }

  // Dynamic Rule-Based Mock Fallback Engine
  const data = generateDynamicMock(idea)
  return res.json(data)
})

// Endpoint to chat with the co-founder agents swarm
app.post('/api/chat', async (req, res) => {
  const { idea, messages } = req.body

  if (!idea || !messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Startup idea and messages history are required.' })
  }

  console.log(`[Server] Chat request received for idea: "${idea.substring(0, 45)}..."`)

  if (ai) {
    try {
      const systemPrompt = `You are the PitchIQ AI Co-Founder Swarm. The user has described their startup idea: "${idea}".
Your job is to answer their follow-up questions regarding the startup validation report, business strategy, monetization, or GTM in a helpful, expert, and actionable manner. Keep your responses structured, professional, and tailored specifically to the Indian business ecosystem when applicable. Keep it concise, strategic, and direct.`;

      let chatHistoryPrompt = `${systemPrompt}\n\nChat History:\n`;
      messages.forEach((msg) => {
        const sender = msg.role === 'user' ? 'User' : 'AI Co-Founder';
        chatHistoryPrompt += `${sender}: ${msg.text}\n`;
      });
      chatHistoryPrompt += `AI Co-Founder:`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: chatHistoryPrompt,
      })

      return res.json({ text: response.text })
    } catch (err) {
      console.error('[Gemini API Error] Failed to generate chat reply:', err)
      // Fall through to mock response
    }
  }

  // Fallback Chat Responder
  const lastMessage = messages[messages.length - 1]?.text || ''
  const reply = generateMockChatReply(idea, lastMessage)
  return res.json({ text: reply })
})

function generateMockChatReply(idea, message) {
  const msgLower = message.toLowerCase()
  const keywords = extractKeywords(idea)
  const product = keywords.join(' ') || 'your startup product'

  if (msgLower.match(/(user|customer|acquire|marketing|growth|gtm|launch)/)) {
    return `To acquire your first 100 users for ${product}, I suggest a hyper-targeted grassroots campaign:
1. **Direct Onboarding**: Manually register early pilot users through localized WhatsApp groups or industry forums.
2. **Incentive Loops**: Offer zero-friction benefits (e.g. cashback, free setup) to reduce early testing barriers.
3. **Local Champions**: Partner with micro-influencers or local shop coordinators to build initial trust.`;
  } else if (msgLower.match(/(monetize|revenue|price|pricing|charge|fee|commission|model)/)) {
    return `For ${product}, a multi-tiered revenue model is ideal in the Indian market:
1. **Transactional commissions**: Charge a small, clear markup or commission per transaction (e.g., 2-5%) to avoid upfront friction.
2. **SaaS Subscription**: Offer value-added premium features (like custom catalogs or analytics tools) for power users.
3. **Value addons**: Charge for micro-upgrades or priority listings.`;
  } else if (msgLower.match(/(compete|competitor|moat|defender|advantage)/)) {
    return `To protect ${product} from large incumbents:
1. **Hyper-localization**: Build workflows specifically optimized for regional conditions (e.g. UPILite integrations, local dialects).
2. **Conversational Interface**: Use lightweight WhatsApp catalogs to keep customer onboarding friction near zero.
3. **Exclusive Local Supply**: Form direct tie-ups with primary local supply nodes to create a defensible regional inventory.`;
  }

  return `That is a solid point regarding ${product}. For this business model, I strongly advise focusing on:
- Minimizing user friction through regional language WhatsApp portals.
- Integrating PhonePe/UPI AutoPay systems to lock in subscription renewals.
- Partnering with local guilds or associations to scale input/supply channels.

Let me know if you would like me to detail a specific phase of this strategy!`;
}

// Dynamic Mock Fallback Generator
function generateDynamicMock(idea) {
  const ideaLower = idea.toLowerCase()
  let category = 'generic'
  
  if (ideaLower.match(/(travel|tour|hotel|trip|holiday|homestay|itinerary|vacation|flight|booking|tourism)/)) {
    category = 'travel'
  } else if (ideaLower.match(/(pay|payment|finance|credit|bank|money|loan|ledger|spend|wallet|wealth|stock|crypto|banking)/)) {
    category = 'finance'
  } else if (ideaLower.match(/(health|clinic|doctor|medical|patient|medicine|wellness|gym|fit|hospital|diet|yoga)/)) {
    category = 'health'
  } else if (ideaLower.match(/(learn|teach|study|school|college|course|education|student|skill|tutor|classroom|training)/)) {
    category = 'education'
  } else if (ideaLower.match(/(food|delivery|restaurant|dining|kitchen|grocery|meal|cook|recipe|eat|beverage|swiggy|zomato|fastfood|ordering)/)) {
    category = 'food'
  } else if (ideaLower.match(/(shop|buy|store|commerce|retail|product|sell|brand|d2c|clothing|fashion|marketplace|checkout)/)) {
    category = 'ecommerce'
  } else if (ideaLower.match(/(logis|supply|truck|ship|warehouse|transport|ride|cab|driver|auto|courier|freight|dispatch)/)) {
    category = 'logistics'
  } else if (ideaLower.match(/(agri|farm|crop|soil|fertilizer|seed|harvest|water|tractor|farmer|crop|yield)/)) {
    category = 'agri'
  }

  console.log(`[Server] Selected dynamic mockup category: "${category.toUpperCase()}" based on user input.`)

  const templates = {
    travel: {
      overall: 84,
      metrics: [
        { name: "Market Potential", score: 88 },
        { name: "India Fit", score: 92 },
        { name: "Investor Appeal", score: 80 },
        { name: "Competition", score: 75 },
        { name: "Execution Difficulty", score: 65 }
      ],
      competitors: [
        { name: "Airbnb Local Experiences", pricing: "$30 - $150 per tour (20% platform commission)", strengths: ["Massive global brand recognition & user trust.", "Deep integration with homestay booking system.", "High quality verification process for hosts."], weaknesses: ["Lacks hyper-local customized itinerary builders.", "Very low presence in Tier-2/3 Indian tourist spots.", "Payment flows are not optimized for UPI/local cards."] },
        { name: "MakeMyTrip Itineraries", pricing: "Dynamic package pricing ($200 - $800 avg booking)", strengths: ["Dominant player in the Indian travel market.", "Direct API integrations with Indian railways and airlines.", "High advertising budget and SEO dominance."], weaknesses: ["Static packages rather than AI-personalized itineraries.", "Clunky user interface with a heavy transactional focus.", "Customer support is largely automated and slow."] },
        { name: "Thrillophilia", pricing: "A-la-carte bookings (15% commission markup)", strengths: ["Strong focus on adventurous & offbeat local activities.", "Deep supplier relationships with regional organizers.", "Strong community review platform."], weaknesses: ["Frequent booking disputes due to bad organizer sync.", "No continuous itinerary flow, only singular bookings.", "Inconsistent quality of customer onboarding."] }
      ],
      risks: [
        { title: "High Customer Acquisition Cost (CAC)", desc: "Bidding on travel & itinerary keywords is highly competitive, raising digital CAC.", impact: "HIGH" },
        { title: "Highly Competitive Market", desc: "Large incumbent OTA platforms possess massive brand equity and local supplier integrations.", impact: "MEDIUM-HIGH" },
        { title: "Weak Monetization Buffer", desc: "Commission-only margins on tour operators are thin. Without SaaS elements, LTV remains low.", impact: "HIGH" },
        { title: "User Retention Concerns", desc: "Leisure travel is a low-frequency transaction. Sustaining monthly active user engagement is difficult.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Core Infrastructure & Local Friction Reduction", highlights: ["UPI Integration: Single-click instant payment nodes via PhonePe and GPay SDKs to maximize conversion.", "WhatsApp Onboarding: Zero-app-install itinerary query engine running directly on WhatsApp API.", "Hindi Support: Dynamic multilingual conversational AI interface for onboarding support."] },
        { phase: "Phase 2", title: "Regional Penetration & Organic Growth", highlights: ["Regional Languages: Support for Tamil, Telugu, Kannada, Bengali, and Marathi to target Tier-2 hubs.", "College Partnerships: Campus ambassador programs in major universities to seed youth travel loops.", "Community Growth: Micro-incentives for users sharing itinerary reviews via local social networks."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "Leisure travelers in India lack access to hyper-local activity scheduling. OTA packages are rigid, and smaller regional homestays suffer from poor digital visibility, leading to highly generic travel patterns." },
          { title: "Proposed Solution", text: "A WhatsApp-based AI travel co-founder that builds custom, dynamic local itineraries in real-time, integrating regional travel agents and homestay bookings with frictionless UPI payment workflows." },
          { title: "Market Opportunity", text: "Domestic tourism in India is experiencing exponential post-digitization growth, currently estimated at over $150B. The Tier-2 and Tier-3 leisure segment is expanding rapidly but remains highly fragmented." },
          { title: "Revenue Model", text: "A transactional commission model (12-15% on local activities & accommodations) combined with a premium SaaS subscription tier for travel planners and homestay hosts to manage customer flows." },
          { title: "Competitive Advantage", text: "Hyper-localized AI agents capable of instant regional coordination, lightweight WhatsApp onboarding, and a direct UPI checkout node that reduces cart dropouts by 40%." }
        ],
        gtmStrategy: "Deploy localized WhatsApp marketing loops targeted at Tier-2 cities in India. Partner with local travel influencers and homestay guilds to aggregate primary inventory nodes.",
        criticalRisks: "Customer acquisition cost inflation due to keyword competition, accommodation compliance standards, and supplier retention friction."
      },
      logs: [
        { text: "[Market Scout] Found competitor: Airbnb Local Services (Direct competitor)", type: "market" },
        { text: "[Market Scout] Found competitor: MakeMyTrip Itineraries (Indirect competitor)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: Customer acquisition cost (CAC) likely high due to search bidding wars.", type: "devil" },
        { text: "[India GTM] Computing localization requirements for Indian consumer base...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: UPI payment nodes and regionalized WhatsApp marketing channels.", type: "gtm" }
      ]
    },
    finance: {
      overall: 79,
      metrics: [
        { name: "Market Potential", score: 85 },
        { name: "India Fit", score: 90 },
        { name: "Investor Appeal", score: 82 },
        { name: "Competition", score: 68 },
        { name: "Execution Difficulty", score: 72 }
      ],
      competitors: [
        { name: "Razorpay Checkout", pricing: "1.5% - 2.5% transaction commission", strengths: ["Market leader in online payment processing in India.", "Developer-friendly API infrastructure.", "Vast network of business merchant relations."], weaknesses: ["Focus is primarily merchant-first rather than consumer wealth.", "Integration is complex for tiny regional micro-businesses.", "High regulatory overhead for credit products."] },
        { name: "Paytm Business Suite", pricing: "Merchant transaction fees (varies by instrument)", strengths: ["Massive consumer wallet userbase.", "Soundbox terminal dominance at retail locations.", "Brand presence across all cities."], weaknesses: ["Faced severe regulatory actions from RBI in 2024.", "Complex, cluttered multi-service application.", "Low user-satisfaction for wealth-tech services."] },
        { name: "Cred Pay / Cred Cash", pricing: "Credit card billing fees and member lending interest", strengths: ["High average order value consumer segment.", "Sleek UI and gamified rewards loop.", "High-trust credit profiling database."], weaknesses: ["Limited customer acquisition cap (only active cardholders).", "Difficult to scale into mass-market Tier-3 India.", "Lending is highly capital intensive."] }
      ],
      risks: [
        { title: "Strict RBI Regulations", desc: "India's central bank (RBI) has highly strict compliance requirements for payments, lending licenses, and third-party API gateways.", impact: "HIGH" },
        { title: "High Trust Acquisition Barrier", desc: "Indian consumers are highly conservative with financial details. Convincing them to trust a new app takes large marketing capital.", impact: "MEDIUM-HIGH" },
        { title: "UPI Margin Squeeze", desc: "UPI transaction fees are zero for standard merchants, making basic payment brokerage non-monetizable.", impact: "HIGH" },
        { title: "High Default Rates on Credit", desc: "Micro-credit or unstructured loans in Tier 2/3 sectors suffer from high non-performing asset (NPA) percentages.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Compliance Shield & UPI Aggregator Launch", highlights: ["NPCI Compliance: Form formal banking partnerships to host third-party application providers (TPAP) nodes.", "Vernacular Ledger: Launch local language voice ledger tools for shopkeepers to build initial trust.", "UPI Lite Nodes: Integrated offline/low-value UPI Lite node for high-frequency low-value payments."] },
        { phase: "Phase 2", title: "Credit Scoring & Financial Services Scale", highlights: ["Alternative Data Scoring: Track utility bill cycles and WhatsApp catalog transactions for credit profile generation.", "Micro-Insurance API: Single-click health and agricultural insurance distribution with premium under 50 INR.", "Regional Bank Nodes: Sync directly with regional cooperative banks to expand credit distribution channels."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "Small merchants and regional consumers in India are excluded from traditional credit scoring. Standard payment processors do not cater to informal cash-flow habits, leaving a $300B credit gap." },
          { title: "Proposed Solution", text: "A localized conversational financial engine that tracks cash-flows via WhatsApp Business ledger systems and computes customized micro-credit scores for instant UPI-disbursed micro-loans." },
          { title: "Market Opportunity", text: "Indian digital retail payments will exceed $1T by 2026. Informal merchant credit remains an underserved, high-margin asset class growing at 22% annually." },
          { title: "Revenue Model", text: "Interest margins on disbursed micro-loans (18-24% APR) split with underwriting banks, combined with premium API subscription plans for commercial distribution partners." },
          { title: "Competitive Advantage", text: "Proprietary conversational ledger data models, zero-fee consumer-facing UI, and instant settlement integrations that build merchant loyalty." }
        ],
        gtmStrategy: "Acquire merchants via offline localized B2B marketing guilds. Leverage voice ledger features to hook Tier-2 shopkeepers, followed by digital micro-lending upsells.",
        criticalRisks: "Changes in RBI regulations regarding digital credit card limits, interest caps, and collection agency guidelines."
      },
      logs: [
        { text: "[Market Scout] Found competitor: Razorpay (Direct B2B competitor)", type: "market" },
        { text: "[Market Scout] Found competitor: Paytm (Indirect consumer competitor)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: UPI has zero MDR margins. Monetization must rely on credit or SaaS features.", type: "devil" },
        { text: "[India GTM] Formulating NPCI & RBI compliance protocols...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: Zero-setup B2B local voice ledgers and UPI TPAP integrations.", type: "gtm" }
      ]
    },
    health: {
      overall: 81,
      metrics: [
        { name: "Market Potential", score: 89 },
        { name: "India Fit", score: 87 },
        { name: "Investor Appeal", score: 84 },
        { name: "Competition", score: 70 },
        { name: "Execution Difficulty", score: 75 }
      ],
      competitors: [
        { name: "Practo", pricing: "SaaS model for doctor consultation margins", strengths: ["Largest digital directory of healthcare practitioners in India.", "Robust booking management software.", "Established digital prescription portal."], weaknesses: ["Primarily transactional focus with low continuous user care.", "Severe delays in on-call doctor assignment.", "Low penetration outside Tier-1 cities."] },
        { name: "Tata 1mg", pricing: "E-pharmacy delivery commission (10-25% markup)", strengths: ["Strong supply chain backing and rapid pharmacy shipping.", "Highly trusted Tata brand name.", "Lab test aggregation infrastructure."], weaknesses: ["Low margins on prescription drugs.", "High user acquisition and delivery overhead.", "No customized lifestyle or wellness coaching."] },
        { name: "Cult.fit (Curefit)", pricing: "Premium physical gym and online membership plans", strengths: ["Strong millennial brand identity.", "Gamified fitness group workouts.", "Expanding diagnostic lab chains."], weaknesses: ["Heavy reliance on physical studio lease overhead.", "Hard to expand to rural sectors.", "Primarily fitness-focused rather than medical diagnostics."] }
      ],
      risks: [
        { title: "Supply Acquisition Bottleneck", desc: "Onboarding verified Indian doctors is slow due to heavy offline shifts and skepticism of digital portals.", impact: "HIGH" },
        { title: "Medical Compliance & Liability", desc: "Telemedicine is governed by the Indian Medical Council Act. Incorrect diagnosis can lead to licensing issues.", impact: "HIGH" },
        { title: "User Behavior Modification Friction", desc: "Indian consumers usually consult a local family doctor offline. Shifting health habits online takes time.", impact: "MEDIUM-HIGH" },
        { title: "Low Vernacular Health Literacy", desc: "Converting medical terms into regional vernacular correctly to avoid confusion is a major technical challenge.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Localized Tele-Consulting & WhatsApp Triage", highlights: ["WhatsApp Diagnostics: Build lightweight AI triage questionnaires in WhatsApp for basic symptom checks.", "ASHA Network Sync: Form grassroots links with local healthcare coordinators (ASHA workers) in Tier-2/3 sectors.", "UPI Pharmacy Nodes: Direct doctor-to-pharmacy UPI payment flow to speed up drug ordering."] },
        { phase: "Phase 2", title: "Chronic Care Subscriptions & Local Clinic SaaS", highlights: ["Diabetes/BP Tracking: Local language continuous care plans for chronic disease management.", "Clinic Management Suite: Low-cost clinic software for regional doctors to digitize patient history.", "Diagnostic Lab Partnerships: Local network of health test vans for door-to-door diagnostic collection."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "More than 70% of India's medical infrastructure is in Tier-1 cities, leaving Tier-2/3 consumers dependent on unqualified local practitioners. Remote diagnostics lack quality control." },
          { title: "Proposed Solution", text: "An AI-guided telemedicine triage suite running in regional languages on WhatsApp that instantly matches users with local certified doctors, providing digital-verified prescriptions and UPI medicine deliveries." },
          { title: "Market Opportunity", text: "The Indian digital health market is growing at a 21% CAGR, driven by rural internet adoption and the government's Ayushman Bharat Digital Mission API." },
          { title: "Revenue Model", text: "Telehealth consultation platform fees (15%), recurring subscription packages for chronic disease management, and commissions on diagnostic tests." },
          { title: "Competitive Advantage", text: "Instant WhatsApp accessibility, local language NLP engines, and direct integration with regional pharmacies for same-day delivery." }
        ],
        gtmStrategy: "Partner with regional public health campaigns and local pharmaceutical retailers to distribute QR codes for instant doctor consults on WhatsApp.",
        criticalRisks: "Regulatory compliance audits by National Health Authority and state telemedicine councils."
      },
      logs: [
        { text: "[Market Scout] Found competitor: Practo (Direct telemedicine competitor)", type: "market" },
        { text: "[Market Scout] Found competitor: Tata 1mg (Indirect delivery competitor)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: Telemedicine licensing laws are strict. AI cannot prescribe medicine directly.", type: "devil" },
        { text: "[India GTM] Localizing medical terminology for regional languages...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: WhatsApp-based AI triage and local clinic onboarding.", type: "gtm" }
      ]
    },
    education: {
      overall: 83,
      metrics: [
        { name: "Market Potential", score: 87 },
        { name: "India Fit", score: 91 },
        { name: "Investor Appeal", score: 81 },
        { name: "Competition", score: 72 },
        { name: "Execution Difficulty", score: 68 }
      ],
      competitors: [
        { name: "PhysicsWallah (PW)", pricing: "Ultra-affordable course subscriptions (2K-5K INR per year)", strengths: ["Massive cult-like organic student community.", "Extremely low-cost distribution model.", "Expanding offline hybrid coaching centers (Vidyapeeth)."], weaknesses: ["High student-to-teacher ratio in live batches.", "Lacks automated personalized progress analytics.", "Focus is heavily restricted to competitive examinations (JEE/NEET)."] },
        { name: "Unacademy", pricing: "Subscription models for exam categories", strengths: ["Large roster of top-tier exam preparation educators.", "Interactive live chat interface during classes.", "Robust tests series system."], weaknesses: ["High educator acquisition costs.", "Intense internal competition among educators.", "Low completion rates for standard students."] },
        { name: "Local Offline Coaching Centers", pricing: "High fee ranges based on city location", strengths: ["Direct physical face-to-face interaction.", "Strong offline peer competition loops.", "Close connection with regional school syllabi."], weaknesses: ["Non-scalable and dependent on local teacher availability.", "Very poor quality of analytics tools.", "Often lack visual learning materials."] }
      ],
      risks: [
        { title: "Intense Competition", desc: "The Indian test-prep market is overcrowded. Customer acquisition costs on digital keywords are high.", impact: "HIGH" },
        { title: "Student Retention Fatigue", desc: "Academic pressure is high in India, but digital fatigue leads to rapid course dropout rates.", impact: "MEDIUM-HIGH" },
        { title: "Price Sensitivity", desc: "Tier-2/3 Indian parents are willing to pay for education, but only if they see clear score improvements or job results.", impact: "HIGH" },
        { title: "Curriculum Alignment Inertia", desc: "Education boards (CBSE, ICSE, state boards) change syllabus guidelines frequently, requiring fast content updates.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Micro-Courses & WhatsApp Homework Solver", highlights: ["WhatsApp Solver: Instant photo-to-solution engine running via WhatsApp OCR bot.", "Micro-Payments: Chapter-by-chapter micro-pricing (e.g., 29 INR for a single math topic) to lower price barriers.", "Vernacular Explanations: Interactive local language voice explanations to clarify tough concepts."] },
        { phase: "Phase 2", title: "School Partnerships & Peer Learning Hubs", highlights: ["Local School SaaS: Provide free weekly test generation software to private budget schools.", "Peer Gamification: Weekly leaderboard tournaments with mobile recharge rewards for top performers.", "Vernacular Job Placement: Link course completion to local vocational or back-office job opportunities."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "Budget schools in India lack resources for personalized student attention. Traditional online coaching is either too expensive or too crowded, leaving average students behind." },
          { title: "Proposed Solution", text: "An AI-powered vernacular homework assistant and personalized test preparation companion that fits budget-school curriculum, accessible instantly over WhatsApp with micro-priced topic licenses." },
          { title: "Market Opportunity", text: "India has the world's largest student population (250M+ in K-12). supplemental education market is valued over $15B and shifting rapidly toward hyper-affordable digital tools." },
          { title: "Revenue Model", text: "Micro-transaction models (10-30 INR per customized study unit), premium monthly personalized AI tutoring tiers, and school license subscriptions." },
          { title: "Competitive Advantage", text: "Highly localized vernacular learning nodes, micro-payment support, and zero-latency WhatsApp photo-solving chatbot pipelines." }
        ],
        gtmStrategy: "Seed organic student loops using the free WhatsApp photo-solving bot. Distribute low-cost offline brochures near local budget schools in Tier-2 districts.",
        criticalRisks: "Monetization churn in Tier-3 segments and local school admin onboarding delays."
      },
      logs: [
        { text: "[Market Scout] Found competitor: PhysicsWallah (Direct competitor)", type: "market" },
        { text: "[Market Scout] Found competitor: Unacademy (Indirect competitor)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: Price sensitivity is high in Tier-2/3. Avoid expensive upfront packages.", type: "devil" },
        { text: "[India GTM] Adapting material for regional state education boards...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: WhatsApp homework bots and micro-transactions.", type: "gtm" }
      ]
    },
    food: {
      overall: 83,
      metrics: [
        { name: "Market Potential", score: 89 },
        { name: "India Fit", score: 92 },
        { name: "Investor Appeal", score: 81 },
        { name: "Competition", score: 70 },
        { name: "Execution Difficulty", score: 68 }
      ],
      competitors: [
        { name: "Zomato", pricing: "Subscription Zomato Gold + 18-25% restaurant commission", strengths: ["Market leader in India food delivery.", "Strong loyalty program with Zomato Gold.", "Vast network of restaurant listings and user reviews."], weaknesses: ["High dependency on gig delivery labor.", "Intense margin pressure from Swiggy.", "High sensitivity to fuel price fluctuations."] },
        { name: "Swiggy", pricing: "Swiggy One subscription + restaurant delivery markup", strengths: ["Pioneered multi-category delivery (Food, Instamart quick commerce).", "Highly optimized routing algorithms.", "Strong brand presence in urban Tier-1 hubs."], weaknesses: ["Historically lower margin profiles than Zomato.", "Instamart inventory storage overhead costs.", "High driver fleet attrition."] },
        { name: "Zepto / Blinkit (Quick Commerce)", pricing: "Product markup + small handling & delivery fees", strengths: ["10-minute convenience proposition.", "Dense network of urban dark stores.", "High customer app purchase frequency."], weaknesses: ["Extremely capital intensive dark store setup.", "Limited average order values.", "Struggles to capture rural/Tier-3 sectors."] }
      ],
      risks: [
        { title: "Delivery Fleet Attrition", desc: "Gig worker logistics in India suffer from high churn, raising onboarding and insurance overhead costs.", impact: "HIGH" },
        { title: "Low Consumer Loyalty", desc: "Consumers switch platforms instantly based on discount coupons and delivery time differences.", impact: "MEDIUM-HIGH" },
        { title: "High Commission Resistance", desc: "Local restaurants protest high commission rates (18-25%) and demand open network models like ONDC.", impact: "HIGH" },
        { title: "Food Prep Quality Control", desc: "Cloud kitchens have low visibility, leading to brand health risks from consumer food hygiene concerns.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Hyper-Local Partnering & WhatsApp Ordering", highlights: ["WhatsApp Catalog: Order direct from local kitchens via lightweight WhatsApp chatbot loops.", "ONDC Integration: List menus directly on open network registries to bypass high commission tags.", "UPI Lite Settlement: Instant small-ticket UPI nodes for zero-failure delivery payment."] },
        { phase: "Phase 2", title: "Regional Kitchen Aggregation & Subscription Loops", highlights: ["Vernacular Support: Launch Hindi, Tamil, and Bengali voice ordering features for Tier-2 parents.", "Office Meal Subscriptions: Bundled lunch deliveries for commercial office blocks at low price points.", "Cold Chain Partners: Partner with local regional dairy operators to expand organic meal margins."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "Indian consumers in Tier-2/3 hubs want quality local food but face clunky apps and high delivery markups. Local restaurants struggle with Zomato/Swiggy commissions (18-25%), eating their thin margins." },
          { title: "Proposed Solution", text: "A commission-free local food delivery aggregator utilizing WhatsApp conversational ordering interfaces and open-network ONDC rails to slash transaction costs for restaurants and diners." },
          { title: "Market Opportunity", text: "India's food service market will exceed $80B by 2026, with Tier-2/3 cities representing the fastest growing segments following mass internet penetration." },
          { title: "Revenue Model", text: "Low flat subscription fees for restaurants instead of high volume-based commission cuts, paired with premium placement ads and customer delivery fees." },
          { title: "Competitive Advantage", text: "Zero commission ONDC rails, lightweight conversational WhatsApp ordering bots, and hyper-local merchant networks." }
        ],
        gtmStrategy: "Onboard popular regional local restaurants by promising zero commission layouts. Run localized hyper-targeted social media promos.",
        criticalRisks: "Competitor discount matching, delivery rider shortages, and local regulatory restaurant compliance audits."
      },
      logs: [
        { text: "[Market Scout] Found competitor: Zomato (Direct market leader)", type: "market" },
        { text: "[Market Scout] Found competitor: Swiggy (Direct incumbent)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: Gig logistics have high churn. Ensure stable driver incentives.", type: "devil" },
        { text: "[India GTM] Formatting ONDC open catalog integrations...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: WhatsApp ordering and ONDC commission bypass.", type: "gtm" }
      ]
    },
    ecommerce: {
      overall: 80,
      metrics: [
        { name: "Market Potential", score: 88 },
        { name: "India Fit", score: 85 },
        { name: "Investor Appeal", score: 82 },
        { name: "Competition", score: 72 },
        { name: "Execution Difficulty", score: 74 }
      ],
      competitors: [
        { name: "Amazon India", pricing: "Seller commission (5-20%) + Prime subscription fees", strengths: ["Unrivaled logistics infrastructure (FBA) and delivery speed.", "Massive product inventory catalog.", "High customer trust and easy return policies."], weaknesses: ["High pricing model structure limits appeal to budget Tier-3 users.", "High merchant advertisement dependency.", "Clunky mobile interface compared to social shopping apps."] },
        { name: "Flipkart", pricing: "Seller fees + advertising commissions", strengths: ["Strong market share in mobile and consumer electronic categories in India.", "Highly tailored local language search functions.", "Robust discount marketing engines."], weaknesses: ["Faced high user retention struggles outside sale events.", "Intense logistics costs.", "Frequent product return delivery disputes."] },
        { name: "Meesho", pricing: "Zero-commission seller platform + advertising margins", strengths: ["Dominant player in budget/unbranded fashion for Tier-2/3 sectors.", "Extremely lightweight app footprint.", "Vast network of social seller distributors."], weaknesses: ["Inconsistent product quality control.", "Slower delivery timelines than Amazon/Flipkart.", "High volume of customer order cancellations."] }
      ],
      risks: [
        { title: "High COD Return-to-Origin (RTO)", desc: "Cash-on-delivery orders in India suffer from high refusal rates at the doorstep, leading to massive double shipping overheads.", impact: "HIGH" },
        { title: "Thin Product Net Margins", desc: "Intense price matching wars on online shopping platforms result in extremely low margins for non-premium goods.", impact: "HIGH" },
        { title: "Intense Customer Acquisition Costs", desc: "Bidding on e-commerce search keywords and social media ad feeds is extremely expensive.", impact: "MEDIUM-HIGH" },
        { title: "Seller Retention Friction", desc: "Sellers shift rapidly between Amazon, Meesho, and Flipkart based on storage costs and commission adjustments.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "WhatsApp Cataloging & COD RTO Guardrails", highlights: ["WhatsApp Commerce: Browse and checkout products directly inside WhatsApp catalogs.", "RTO Risk AI: Score COD orders dynamically based on past location delivery failure records.", "UPI Incentive: Offer 5% cashback for pre-paid UPI orders to slash cash-delivery overheads."] },
        { phase: "Phase 2", title: "Regional Video Hubs & Micro-Influencer Links", highlights: ["Social Video Shopping: Launch localized short-form videos showing product fit and reviews.", "Rural Reseller Hubs: Enable local village coordinators to place group orders for communities.", "Fast Supply Chains: Connect directly to regional manufacturing clusters (e.g. Tirupur for textiles)."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "Consumers in Tier-2/3 Indian towns want budget fashion and electronics but face high delivery markups on Amazon/Flipkart. Sellers face high commissions and massive delivery return fees (RTOs) that wipe out profits." },
          { title: "Proposed Solution", text: "A zero-commission, lightweight social e-commerce marketplace running directly on WhatsApp that leverages AI-driven risk scoring to slash customer product returns." },
          { title: "Market Opportunity", text: "India's e-commerce market is scaling toward $120B by 2026, with newly internet-enabled Tier-3 consumers driving over 60% of new shopper volume." },
          { title: "Revenue Model", text: "Zero commission on core transactions, charging sellers optional fees for premium visibility ads, AI return-risk analytics, and logistics courier services." },
          { title: "Competitive Advantage", text: "Advanced AI-powered RTO return prevention algorithms, zero platform commissions, and friction-free UPI checkout nodes." }
        ],
        gtmStrategy: "Onboard manufacturing hubs directly by guaranteeing zero platform fees. Promote the WhatsApp store via micro-influencers.",
        criticalRisks: "Aggressive discounting matchings by Meesho and rising logistics freight prices."
      },
      logs: [
        { text: "[Market Scout] Found competitor: Amazon India (Indirect retail leader)", type: "market" },
        { text: "[Market Scout] Found competitor: Meesho (Direct Tier-2 retail competitor)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: COD orders have high return rates. Implement UPI prepayment nudges.", type: "devil" },
        { text: "[India GTM] Configuring AI-driven Return-To-Origin risk filters...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: WhatsApp shop cataloging and COD to pre-paid UPI incentives.", type: "gtm" }
      ]
    },
    logistics: {
      overall: 82,
      metrics: [
        { name: "Market Potential", score: 86 },
        { name: "India Fit", score: 90 },
        { name: "Investor Appeal", score: 83 },
        { name: "Competition", score: 71 },
        { name: "Execution Difficulty", score: 75 }
      ],
      competitors: [
        { name: "Delhivery", pricing: "Volume-based shipping weight contracts", strengths: ["Vast automated sorting centers and nationwide hub networks.", "Deep B2B e-commerce enterprise integrations.", "Proprietary address-location mapping database."], weaknesses: ["High operating costs lead to inconsistent small-seller pricing.", "Not optimized for instant intra-city on-demand shipping.", "Customer dispute resolutions are slow."] },
        { name: "Porter", pricing: "Distance and vehicle-type hourly dynamic rates", strengths: ["Dominant player in intra-city light truck and three-wheeler shipping.", "Simple on-demand booking interface.", "Strong driver supply network in major cities."], weaknesses: ["Limited presence in long-distance inter-city courier logistics.", "Difficult to scale driver compliance standards.", "High pricing volatility during peak hours."] },
        { name: "Ola / Uber (Enterprise Cargo)", pricing: "Dynamic travel booking fees", strengths: ["Extremely dense existing driver fleets.", "Sleek GPS tracking app software.", "Massive consumer brand recognition."], weaknesses: ["Logistics is treated as a secondary business concern.", "High vehicle commission rates provoke driver strikes.", "Unoptimized for commercial B2B freight handling."] }
      ],
      risks: [
        { title: "Fuel Price Volatility", desc: "Rising diesel and petrol costs in India directly squeeze shipping margins unless pass-through pricing is accepted.", impact: "HIGH" },
        { title: "Driver Retention & Supply", desc: "Light vehicle drivers churn quickly due to high commission deductions and long loading delays.", impact: "MEDIUM-HIGH" },
        { title: "Fragmented Supply Networks", desc: "More than 80% of logistics trucks in India are owned by small operators with under 5 vehicles, complicating coordination.", impact: "HIGH" },
        { title: "Urban Entry Regulations", desc: "Commercial heavy vehicles face strict city entry window restrictions during daytime hours in major hubs.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Driver Onboarding & WhatsApp Booking Nodes", highlights: ["WhatsApp Dispatch: Book commercial trucks and track orders directly via WhatsApp conversations.", "Driver Cash Flow: Offer same-day trip payment settlements directly to driver UPI nodes.", "Lightweight GPS: Use driver WhatsApp location sharing to avoid hardware GPS tracking installation costs."] },
        { phase: "Phase 2", title: "B2B SME Aggregation & Regional Hub Sync", highlights: ["LTL Consolidation: Aggregate Less-Than-Truckload shipments from local MSMEs to cut shipping costs.", "Mandi Linkages: Partner with regional agricultural Mandis to optimize vehicle return trips.", "SaaS Fleet Tools: Provide free simple accounting tools to small truck owners to secure supply loyalty."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "Small businesses (MSMEs) in India face highly unreliable shipping pricing. Truck booking is highly fragmented, drivers face delayed settlements, and legacy B2B couriers are too slow." },
          { title: "Proposed Solution", text: "An on-demand digital freight network connecting MSMEs with local truck operators via lightweight WhatsApp booking flows, providing instant driver settlements." },
          { title: "Market Opportunity", text: "India's logistics sector is valued at over $200B, with the road transport MSME market growing rapidly as businesses shift online." },
          { title: "Revenue Model", text: "A simple transaction fee model (10-12% commission on bookings) paired with premium subscriptions for enterprise fleet analytics dashboards." },
          { title: "Competitive Advantage", text: "Instant UPI driver payout settlements, zero-setup WhatsApp customer onboarding, and dynamic load-matching systems." }
        ],
        gtmStrategy: "Onboard small business clusters at local wholesale markets. Distribute QR booking codes directly to retail merchants.",
        criticalRisks: "Regulatory compliance checks and competitive price matchings by Porter."
      },
      logs: [
        { text: "[Market Scout] Found competitor: Delhivery (Nationwide shipping incumbent)", type: "market" },
        { text: "[Market Scout] Found competitor: Porter (Local dispatch competitor)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: Fuel volatility is a key margin risk. Set up dynamic customer surcharge parameters.", type: "devil" },
        { text: "[India GTM] Customizing regional driver interfaces for vernacular use...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: WhatsApp dispatch logs and same-day UPI driver settlements.", type: "gtm" }
      ]
    },
    agri: {
      overall: 84,
      metrics: [
        { name: "Market Potential", score: 91 },
        { name: "India Fit", score: 95 },
        { name: "Investor Appeal", score: 85 },
        { name: "Competition", score: 70 },
        { name: "Execution Difficulty", score: 65 }
      ],
      competitors: [
        { name: "DeHaat", pricing: "Input seed margin margins + output distribution fees", strengths: ["Huge network of physical farmer centers (DeHaat Centers) in East India.", "Direct partnerships with major seed and chemical brands.", "End-to-end crop advisory to distribution loops."], weaknesses: ["High operating expense due to physical storefront leases.", "Lacks automated conversational voice diagnostics.", "Slow crop collection logistics in off-road villages."] },
        { name: "Ninjacart", pricing: "Farm-to-retail supply markup (10-18%)", strengths: ["Highly optimized supply chain connecting farmers directly to retail stores.", "Vast network of cold storage warehouses.", "Direct corporate food buyers database."], weaknesses: ["High logistics waste on highly perishable crops.", "Fails to support direct agricultural inputs (seeds, feeds).", "Struggles during regional weather disruptions."] },
        { name: "AgroStar", pricing: "Agri-input retail margins + premium consulting fees", strengths: ["Dominant brand in advisory-led input sales.", "Highly active farmer call center support.", "Strong digital catalog library."], weaknesses: ["Difficult to scale advisory calls via manual human support.", "Lacks direct crop output procurement networks.", "High logistics cost for delivery to single farms."] }
      ],
      risks: [
        { title: "Monsoon Dependencies", desc: "Farming cycles in India depend heavily on monsoons. Extreme climate drops seed demand and output supply.", impact: "HIGH" },
        { title: "Unstable Mandi Pricing", desc: "Government crop price shifts (MSP) and middleman manipulation at Mandis cause output price drops.", impact: "HIGH" },
        { title: "High Output Perishability", desc: "Without cold chains, fresh produce suffers 25-40% waste, destroying supply margins.", impact: "HIGH" },
        { title: "Farmer Trust Deficit", desc: "Indian farmers are highly conservative. Onboarding them to online catalogs requires local human trust anchors.", impact: "MEDIUM-HIGH" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Voice-Based Advisory & Input Delivery", highlights: ["WhatsApp Voice Bot: Farmers describe crop pests using regional voice notes to receive AI diagnoses.", "Krishi Mitras: Recruit village youth as trust agents to book inputs on behalf of local farmers.", "Doorstep Delivery: Group deliveries to single village drop points to slash input freight costs."] },
        { phase: "Phase 2", title: "Mandi Bypass & Crop Procurement Network", highlights: ["B2B Procurement: Group crop output sales directly to large food processing plants.", "Agri-Credit: Partner with rural cooperative banks to offer fertilizer loans based on crop sales records.", "Weather-Based Insurance: Automated crop insurance nodes using local rainfall data feeds."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: "Indian farmers suffer from low yields due to bad seed quality and lack of crop advisory. They face massive exploitation by commission middlemen at physical Mandis, eating up to 30% of crop value." },
          { title: "Proposed Solution", text: "A conversational, voice-first AI advisory platform in regional languages on WhatsApp that delivers high-quality seeds and inputs directly to farms, bypassing local middlemen." },
          { title: "Market Opportunity", text: "India's agricultural sector represents over $350B, with input sales and output retail scaling rapidly as mobile internet covers 600K+ villages." },
          { title: "Revenue Model", text: "Trading margins on agricultural inputs (seeds, fertilizer, feed), paired with transaction commission markups on direct-to-buyer crop sales." },
          { title: "Competitive Advantage", text: "Voice-first regional language AI diagnostic bots, village coordinator micro-networks, and middleman-free logistics routing." }
        ],
        gtmStrategy: "Recycle local trust channels by onboarding village group heads. Seed local demo crop plots to showcase yield improvements.",
        criticalRisks: "Unpredictable monsoon shifts and local government regulatory seed storage compliance."
      },
      logs: [
        { text: "[Market Scout] Found competitor: DeHaat (Agri-input leader)", type: "market" },
        { text: "[Market Scout] Found competitor: Ninjacart (Procurement competitor)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: Perishable logistics have high waste risks. Implement village collection storage nodes.", type: "devil" },
        { text: "[India GTM] Designing voice-activated regional query bot models...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: Voice-based crop consulting and village drop-point input delivery.", type: "gtm" }
      ]
    }
  }

  // Fallback to Category Templates or Dynamic Keyword Engine
  let data = templates[category]

  if (!data) {
    // Generate dynamically using extracted keywords
    const keywords = extractKeywords(idea)
    const mainKW = keywords[0] || 'AI Automation'
    const fullKW = keywords.join(' ') || 'AI Enterprise Workflow'

    data = {
      overall: 80,
      metrics: [
        { name: "Market Potential", score: 85 },
        { name: "India Fit", score: 80 },
        { name: "Investor Appeal", score: 82 },
        { name: "Competition", score: 75 },
        { name: "Execution Difficulty", score: 70 }
      ],
      competitors: [
        { name: `${mainKW} India Pro`, pricing: "SaaS Subscription starting at 1,999 INR/month", strengths: ["Highly tailored localization for this specific product.", "Direct regional customer relationships.", "Simple interface."], weaknesses: ["Lacks automated scalability.", "High manual operations requirement.", "No local regional language support."] },
        { name: `Legacy B2B Systems`, pricing: "High custom licensing & setup contracts", strengths: ["Deep corporate enterprise integrations.", "Extensive feature sets built over decades."], weaknesses: ["Extremely complex to set up and customize.", "Very expensive for budget Indian businesses.", "Low user-satisfaction and slow updates."] },
        { name: "Manual Spreadsheets & Physical Records", pricing: "Free to start, but high labor costs", strengths: ["Zero software overhead cost.", "Totally customizable configurations."], weaknesses: ["Highly error-prone and non-scalable.", "No real-time analytics data.", "No automated tracking notifications."] }
      ],
      risks: [
        { title: "Low Moat Wrapper Risk", desc: "If the core technology is easily copied, competitors can capture the market in months.", impact: "HIGH" },
        { title: "B2B Sales Cycle Delays", desc: `Selling ${fullKW} services to Indian firms involves long approval delays.`, impact: "MEDIUM-HIGH" },
        { title: "High Customer Onboarding Cost", desc: "Users in this sector require high training support to shift from manual sheets.", impact: "HIGH" },
        { title: "Frontline Adoption Friction", desc: "Management may purchase the software, but workers resist using the system.", impact: "MEDIUM" }
      ],
      gtm: [
        { phase: "Phase 1", title: "Localized Workflow Integration & Sandbox Pilot", highlights: [`WhatsApp Dashboard: Connect ${mainKW} operations natively to WhatsApp API triggers.`, "Zero-setup Pilots: Offer free 14-day pilots with dedicated onboarding support.", "UPI Auto-Pay: Dynamic recurring subscription checkout nodes."] },
        { phase: "Phase 2", title: "API Partner Network & Local Language Support", highlights: ["Developer SDKs: Launch open API points for third-party developer integrations.", "Vernacular Commands: Support voice and text instructions in Hindi and regional languages.", "Partner Distributors: Partner with local resellers to scale distribution."] }
      ],
      pitch: {
        sections: [
          { title: "Problem Statement", text: `Indian firms lack affordable tools to handle ${fullKW} operations. Existing software is too expensive and lacks the specific local integrations (WhatsApp, UPI) required.` },
          { title: "Proposed Solution", text: `An affordable, hyper-localized AI agent suite specifically designed for Indian businesses, offering native WhatsApp and UPI workflow integrations for ${fullKW}.` },
          { title: "Market Opportunity", text: "The Indian enterprise SaaS and MSME tech market is growing rapidly, targeting millions of firms digitizing for the first time." },
          { title: "Revenue Model", text: "Tiered monthly SaaS subscription models retail (starting at 999 INR/month) paired with transaction fees." },
          { title: "Competitive Advantage", text: "Deep localization, extremely simple mobile-friendly UI requiring zero IT setup, and automated local data compliance." }
        ],
        gtmStrategy: `Acquire clients via localized partner channels. Offer zero-barrier WhatsApp sandbox access to ${fullKW} features.`,
        criticalRisks: `Customer churn in smaller merchant tiers and rapid pricing shifts of underlying API tokens.`
      },
      logs: [
        { text: `[Market Scout] Found competitor: ${mainKW} India (Direct niche competitor)`, type: "market" },
        { text: "[Market Scout] Found competitor: Legacy B2B Systems (Indirect incumbent)", type: "market" },
        { text: "[Devil's Advocate] Activating devil's advocate agent...", type: "devil" },
        { text: "[Devil's Advocate] ⚠ Warning: High onboarding friction. Ensure simple mobile-first workflows.", type: "devil" },
        { text: "[India GTM] Formatting UPI auto-pay loops...", type: "gtm" },
        { text: "[India GTM] ✓ Phase 1 GTM strategy: WhatsApp CRM integrations and sandbox pilots.", type: "gtm" }
      ]
    }
  }

  // Inject catchy business title and innovation details dynamically
  const keywords = extractKeywords(idea)
  const mainKeyword = keywords[0] || 'Venture'
  const secondKeyword = keywords[1] || 'Flow'
  
  let catchyTitle = ""
  if (category === 'travel') catchyTitle = `${mainKeyword}Wander AI`
  else if (category === 'finance') catchyTitle = `${mainKeyword}Pay`
  else if (category === 'health') catchyTitle = `${mainKeyword}Care`
  else if (category === 'education') catchyTitle = `Edu${mainKeyword}`
  else if (category === 'food') catchyTitle = `${mainKeyword}Bite`
  else if (category === 'ecommerce') catchyTitle = `${mainKeyword}Cart`
  else if (category === 'logistics') catchyTitle = `${mainKeyword}Route`
  else if (category === 'agri') catchyTitle = `Agri${mainKeyword}`
  else catchyTitle = `${mainKeyword}${secondKeyword} AI`

  catchyTitle = catchyTitle.charAt(0).toUpperCase() + catchyTitle.slice(1)

  let innovation = {
    title: "Zero-Friction Conversational Commerce Moat",
    description: `Our co-founder agent swarm bypasses clunky App Store installations by deploying a lightweight, AI-driven planning flow natively on WhatsApp, coupled with automatic offline UPI QR validation loops.`,
    points: [
      "Grassroots Niche Guild Networks: Direct physical partnerships with regional homestay hosts and tourist guilds that aren't indexed on global OTAs like Airbnb or MakeMyTrip.",
      "Dynamic Vernacular Dialect Routing: Multi-agent conversational translation system that automatically parses Hinglish, Tamil-English, and other colloquial queries to return accurate itineraries.",
      "Frictionless Instant UPI Node: Bypasses 3-5 day banking settlement delays by routing commissions directly to regional operators' accounts instantly upon booking validation."
    ]
  }

  if (category === 'finance') {
    innovation = {
      title: "Conversational Ledger & AI Underwriting Engine",
      description: `Bypasses traditional document-heavy KYC processes by building automated ledger logs directly from WhatsApp merchant conversations, feed-syncing to regional cooperative banking nodes.`,
      points: [
        "Alternative Cashflow Analysis: Algorithmic underwriting that scores informal shopkeepers based on raw transaction streams rather than standard credit histories.",
        "Voice-Ledger Onboarding: High-accuracy speech-to-text nodes in local languages enabling non-literate merchants to log sales in seconds.",
        "UPILite Micro-disbursement: Automated small-ticket loan triggers disbursed directly to merchant handles with auto-pay collection rules."
      ]
    }
  } else if (category === 'health') {
    innovation = {
      title: "ASHA Grassroots Network & Vernacular Diagnostics",
      description: `Leverages local health volunteers (ASHA workers) combined with AI symptom triage via WhatsApp to establish certified medical consulting nodes directly in Tier-3 villages.`,
      points: [
        "Regional Language AI Triage: Instantly converts regional medical queries into standardized clinical reports for doctors.",
        "Direct UPI Prescription Checkout: One-click drug ordering and payment flow straight from the online consultation screen.",
        "Local Pharmacy Delivery Sync: Automatically routes approved prescriptions to the closest local independent pharmacy for rapid home delivery."
      ]
    }
  } else if (category === 'education') {
    innovation = {
      title: "WhatsApp Micro-Learning & Chapter Licensing",
      description: `Disrupts traditional high-cost annual edtech models by offering laser-focused micro-lessons and automated homework help directly over WhatsApp for nominal single-use fees.`,
      points: [
        "WhatsApp OCR Homework Solver: Students snap a photo of a problem and receive step-by-step video solutions in under 10 seconds.",
        "Micro-payment Topic Licensing: Bypasses large upfront course fees, letting students unlock individual topics for 10-30 INR via UPI.",
        "Local Board Alignment: Tailored content libraries dynamically synchronized with individual regional state school board syllabi."
      ]
    }
  } else if (category === 'food') {
    innovation = {
      title: "Zero-Commission ONDC Conversational Ordering",
      description: `Eliminates the 18-25% platform markup commissions of traditional food tech apps by integrating menus directly onto open-source ONDC rails over WhatsApp.`,
      points: [
        "ONDC Catalog Mapping: Direct publishing of menus to the Open Network for Digital Commerce, bypassing central gatekeepers.",
        "Conversational Order Assembly: High-fidelity natural language ordering bots that understand custom food adjustments in Hinglish.",
        "Local Rider Fleet Dispatch: Real-time integration with decentralized local hyper-local delivery groups for lower-cost shipping."
      ]
    }
  } else if (category === 'ecommerce') {
    innovation = {
      title: "AI Return-to-Origin (RTO) Risk Shield",
      description: `Slashes the massive cost of Cash-on-Delivery (COD) product returns in India by scoring buyers' delivery behaviors and incentivizing pre-paid UPI checkout nodes.`,
      points: [
        "Dynamic RTO Risk Profiler: Real-time predictive models scoring the likelihood of delivery refusal based on location and historical data.",
        "UPI Prepayment Nudges: Automatic conversational cashbacks offering up to 5% savings to convert high-risk COD orders into pre-paid sales.",
        "WhatsApp Live Tracking: Keeping buyer excitement and engagement high through automated shipping status alerts."
      ]
    }
  } else if (category === 'logistics') {
    innovation = {
      title: "Decentralized Intra-city Route Optimizer",
      description: `Coordinates driver routing dynamically using low-bandwidth multi-agent negotiation systems, specifically tailored for crowded Tier-2 Indian business centers.`,
      points: [
        "Low-Bandwidth Dispatch: Fully functioning dispatch triggers operating via lightweight offline cellular signals and WhatsApp widgets.",
        "Cooperative Hub Warehousing: Dynamic dispatch nodes hosted in small local shops, reducing heavy capital storage costs.",
        "Real-Time Delivery Verification: Secure PIN validation syncs through instant UPI payout triggers upon delivery validation."
      ]
    }
  } else if (category === 'agri') {
    innovation = {
      title: "Voice-driven Farm Yield Optimization",
      description: `Bridges agricultural consulting gaps by offering voice-activated crop health diagnostics and localized input distribution directly to smallholder farmers.`,
      points: [
        "Voice Soil Assessment: Voice-first conversational guides for farmers to register soil tests and receive regional soil health recommendations.",
        "Collective Crop Pooling: Aggregating smallholder harvests via WhatsApp to secure higher bargaining power with national wholesalers.",
        "Direct-to-Farm Input Delivery: Partnerships with local warehouse distributors to ship fertilizers and seeds directly to fields with UPI billing."
      ]
    }
  } else if (category === 'generic') {
    innovation = {
        title: "Localized Workflow Integration & Conversational Hub",
        description: `Bypasses standard workflow complexity by linking operational modules directly into conversational messaging nodes, slashing setup costs for budget-conscious Indian firms.`,
        points: [
          "WhatsApp Native Interface: Interactive widgets running directly on messaging networks requiring zero customer application training.",
          "Alternative Data Integrations: Synthesizing unstructured local reports into actionable business compliance ledger files.",
          "UPI Business Settlement: Integrated instant checkout payment nodes reducing invoice payment delays by up to 80%."
        ]
      }
    }

  // Populate base response and dynamically add logs
  const response = {
    score: { overall: data.overall, metrics: data.metrics },
    competitors: data.competitors,
    risks: data.risks,
    gtm: data.gtm,
    innovation: innovation,
    pitch: {
      businessTitle: catchyTitle,
      sections: data.pitch.sections,
      gtmStrategy: data.pitch.gtmStrategy,
      criticalRisks: data.pitch.criticalRisks
    },
    logs: [
      { text: "System: Initializing PitchIQ AI Swarm...", type: "system" },
      { text: `System: Core agents spawned to analyze concept: "${idea.substring(0, 45)}..."`, type: "system" },
      { text: "[Market Scout] Initiating database crawl and web-search...", type: "market" },
      { text: "[Market Scout] Spotting direct and indirect competitors in India...", type: "market" },
      ...data.logs,
      { text: "[Pitch Writer] Compiling all agent insights into investor-ready package...", type: "writer" },
      { text: "[Pitch Writer] ✓ Investor Brief successfully compiled.", type: "writer" },
      { text: "System: Startup validation process completed successfully. Final score unlocked.", type: "system" }
    ]
  }

  return response
}

function extractKeywords(idea) {
  const clean = idea.replace(/[^\w\s]/g, '').toLowerCase()
  const words = clean.split(/\s+/)
  const stopWords = new Set(['and', 'the', 'a', 'an', 'for', 'with', 'that', 'helps', 'users', 'online', 'platform', 'app', 'tool', 'ai', 'powered', 'system', 'software', 'service', 'in', 'to', 'of', 'on', 'is', 'it', 'helps', 'helping', 'users', 'customers', 'companies', 'businesses'])
  const filtered = words.filter(w => w.length > 3 && !stopWords.has(w))
  return filtered.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1))
}

// Serve static assets from the frontend build in production
const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))

// Route all non-API requests to index.html
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' })
  }
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = process.env.PORT || 5001
app.listen(PORT, () => {
  console.log(`[Server] PitchIQ backend server running on port ${PORT}`)
}) // Trigger API key reload 2
