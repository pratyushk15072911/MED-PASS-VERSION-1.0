import express from 'express';
import type { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const TOURIST_GUIDE_SYSTEM_INSTRUCTION = `You are the "MedPass Site Guide", a cheerful, polite, and strictly non-medical tourist guide for the MedPass web application.

YOUR ABSOLUTE PRIME DIRECTIVE:
1. You ONLY explain how the MedPass website works, how to use its features, what each button and tab does, and how to navigate the app. You are like a museum or tourist guide for the software.
2. You are NOT a doctor, nurse, or clinical intelligence. You are explicitly NOT smart about medicine because medical advice from a chatbot can be dangerous and risky.
3. NEVER provide medical diagnoses, treatment recommendations, symptom evaluations, medication suggestions, or dosage advice.
4. If a user asks ANY medical, clinical, symptom, or treatment question (e.g. "What should I take for pain?", "Is my blood pressure safe?", "Can I take warfarin?"), IMMEDIATELY and politely decline:
   "I am strictly a website tour guide for MedPass and cannot provide medical advice, diagnosis, or treatment recommendations. For any medical questions, please consult a qualified doctor or access the Emergency Card in the top header."

WEBSITE FEATURES AND TOUR GUIDE KNOWLEDGE:
- **Emergency Triage (Doctor Clinical Reader)**: The rapid 30-second ER view for doctors. Displays color-coded vitals, verified active medications, confirmed allergies, and lethal contraindication alerts.
- **Patient Health Passport (Health Wallet)**: The patient's central vault. Shows prescription list, allergies, emergency contacts (ICE), blood type, organ donor badge, photo upload, and phone pairing.
- **Scan Records (formerly OCR Digitization)**: Upload or drag & drop paper prescriptions, hospital discharge slips, and clinic notes. The scanner extracts text and medication details.
- **Drug Warnings & CDSS (Allergies & Warnings)**: The Clinical Decision Support System that intercepts fatal drug interactions (e.g., Sildenafil + Nitroglycerin) and suggests safe alternative therapies.
- **Privacy Audit Log (Zero-Residual)**: Shows every clinical access event with zero lingering server records, demonstrating high security.
- **Mobile Wallet Simulator**: Previews what the patient's card and QR pass look like on iOS / Android Apple Wallet.
- **Emergency Paramedic Card**: Fast 1-click modal for EMTs/first responders with blood type and allergy badges.
- **Audio Summary**: High-fidelity audio debrief that reads aloud the patient's medical summary and doctor voice notes.
- **Patient Switcher**: Dropdown in the header bar allowing switching between Pratyush Kumar, Eleanor Kumar, and Emma Kumar, or uploading a photo.
- **Photo Upload**: Allows clicking the patient portrait in the top header or Patient Wallet to upload a portrait image.

Tone: Cheerful, friendly, simple, and concise. Use clean markdown bullet points. Keep answers brief (under 150 words).`;

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', hasGeminiKey: !!apiKey });
});

// Tourist Guide Chatbot API Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userMessage } = req.body;

    const messageList = Array.isArray(messages) && messages.length > 0
      ? messages
      : [{ role: 'user', text: userMessage || 'Hello! What can you help me with?' }];

    // Safety check: check for blatant medical questions to ensure fast zero-risk guardrail
    const latestUserMsg = (messageList[messageList.length - 1]?.text || userMessage || '').toLowerCase();
    const isMedicalQuery =
      latestUserMsg.includes('should i take') ||
      latestUserMsg.includes('can i take') ||
      latestUserMsg.includes('my symptoms') ||
      latestUserMsg.includes('diagnose') ||
      latestUserMsg.includes('dosage') ||
      latestUserMsg.includes('side effect') ||
      latestUserMsg.includes('cure') ||
      latestUserMsg.includes('treatment for') ||
      latestUserMsg.includes('headache') ||
      latestUserMsg.includes('chest pain') ||
      latestUserMsg.includes('fever');

    if (isMedicalQuery) {
      return res.json({
        text: "🚨 **Medical Safety Disclaimer**: I'm strictly a website tourist guide for MedPass and not a medical doctor. I cannot evaluate symptoms, suggest medications, or give dosage advice. If you are experiencing medical symptoms or have health questions, please speak directly with a healthcare professional or open the **Emergency Card** in the top navigation bar for immediate assistance.",
        isSafetyGuardrail: true,
      });
    }

    if (ai) {
      // Map contents for multi-turn chat
      const contents = messageList.map((m: { role: string; text: string }) => ({
        role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      // Call Gemini 2.5 Flash
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: {
            systemInstruction: TOURIST_GUIDE_SYSTEM_INSTRUCTION,
            temperature: 0.7,
            tools: [{ googleSearch: {} }],
          },
        });

        if (response && response.text) {
          return res.json({ text: response.text });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini API call warning, falling back to tourist guide knowledge base:', geminiErr?.message || geminiErr);
        // If googleSearch fails or model error, retry without tools
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
              systemInstruction: TOURIST_GUIDE_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });
          if (fallbackResponse && fallbackResponse.text) {
            return res.json({ text: fallbackResponse.text });
          }
        } catch (innerErr) {
          console.error('Gemini fallback attempt error:', innerErr);
        }
      }
    }

    // Built-in Tourist Guide response engine (Zero failure fallback)
    const fallbackAnswer = generateTouristGuideFallback(latestUserMsg);
    return res.json({ text: fallbackAnswer });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      text: "I'm the MedPass Site Guide! I had a brief hiccup connecting to the cloud, but I can still show you around any tab: Emergency Triage, Patient Health Passport, Scan Records, Drug Warnings, or Mobile Wallet. Which screen would you like to explore?",
      error: error?.message,
    });
  }
});

// Intelligent Built-in Tourist Guide Knowledge Base
function generateTouristGuideFallback(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('scan') || q.includes('ocr') || q.includes('record') || q.includes('document')) {
    return `### 📄 Scan Records (Document Scanner)
In the **Scan Records** tab (formerly OCR Digitization), you can:
- **Drag & Drop** or upload paper prescription slips, hospital discharge summaries, or lab sheets.
- The scanner will extract medication names, dosages, and clinician notes directly into the digital pass.
- Click **"Inspect Record"** to view the original scan alongside digitized entities.`;
  }

  if (q.includes('switch') || q.includes('patient') || q.includes('profile') || q.includes('photo')) {
    return `### 👤 Patient Vault & Photo Management
- **Switching Patients**: Click the patient badge at the top-left of the navigation bar to switch between **Pratyush Kumar**, **Eleanor Kumar**, and **Emma Kumar**.
- **Uploading Photos**: Click the patient avatar thumbnail or click **"Upload Photo"** in the dropdown or Patient Health Wallet to set a custom portrait!`;
  }

  if (q.includes('triage') || q.includes('doctor') || q.includes('clinical reader')) {
    return `### 🩺 Emergency Triage (Clinical Reader)
The **Emergency Triage** tab gives emergency room doctors a high-speed **30-second clinical overview**:
- Color-coded vital signs (Blood Pressure, Heart Rate, SpO2)
- Critical drug-drug interaction banner (red CDSS alert)
- Verified active medications and verified allergies
- Fast-action buttons to acknowledge warnings or complete clinical sessions.`;
  }

  if (q.includes('contraindication') || q.includes('warning') || q.includes('cdss') || q.includes('drug')) {
    return `### ⚠️ Drug Warnings & CDSS
This tab features MedPass's **Clinical Decision Support System (CDSS)**:
- It intercepts lethal drug-drug interactions (e.g. **Sildenafil + Nitroglycerin**).
- It highlights why the combination is dangerous (e.g. fatal hypotension).
- It suggests safe clinical alternatives (e.g. Tadalafil timing or non-nitrate anti-anginals).`;
  }

  if (q.includes('phone') || q.includes('sync') || q.includes('mobile') || q.includes('wallet')) {
    return `### 📱 Phone Sync & Mobile Wallet
- **Phone Pairing**: In the **Patient Health Passport**, toggle "Connected to Phone" to simulate live synchronization with the patient's mobile device.
- **Mobile Wallet Simulator**: Visit the **Mobile Wallet** tab to see what the digital pass looks like inside an iOS / Android wallet with dynamic QR codes!`;
  }

  if (q.includes('emergency') || q.includes('paramedic') || q.includes('card')) {
    return `### 🚑 Emergency Paramedic Card
Click the red **"Emergency Card"** button in the header bar or the Patient Wallet to launch the fast resuscitation passport for first responders, showing blood type, verified allergies, organ donor status, and ICE contacts.`;
  }

  if (q.includes('audio') || q.includes('voice') || q.includes('listen')) {
    return `### 🔊 Audio Summary & Voice Notes
Click the **"Audio Summary"** button in the top navigation or patient portal to listen to a simulated clinical debrief or verbal doctor's notes with playback controls!`;
  }

  return `### 👋 Welcome to MedPass!
I am your **Site Tourist Guide**. My only job is to help you explore and understand how this website works:

1. **Emergency Triage**: 30-second rapid dashboard for ER doctors.
2. **Patient Health Passport**: The patient's personal health vault with meds & contacts.
3. **Scan Records**: Simple scanner for paper prescriptions and clinic notes.
4. **Drug Warnings**: CDSS interaction checker preventing harmful drug conflicts.
5. **Privacy Audit Log**: Cryptographic record of zero-residual data access.
6. **Mobile Wallet Simulator**: Smartphone pass with dynamic QR code.

*Remember: I'm only a guide for the site interface and cannot give medical advice!* Which feature would you like to learn about?`;
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Vite middleware mode in development
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: port,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`MedPass server running on http://0.0.0.0:${port}`);
  });
}

startServer();
