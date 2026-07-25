import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client server-side
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// --- API ENDPOINT: Health check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API ENDPOINT: AI Auto-Generate Innovation Gig ---
app.post('/api/ai/generate-gig', async (req, res) => {
  try {
    const { title, ideaDescription, department } = req.body;

    if (!title && !ideaDescription) {
      return res.status(400).json({ error: 'Title or idea description is required.' });
    }

    const ai = getGeminiClient();

    const prompt = `You are an expert Enterprise Innovation & Skill Marketplace Architect. 
An innovation idea selected from our Corporate Innovation Portal needs to be converted into an actionable, structured Gig for internal employees to contribute their skills.

Idea Title: ${title || 'Innovation Project'}
Idea Description / Context: ${ideaDescription || 'An innovative internal productivity or AI tool.'}
Target Department: ${department || 'Cross-Functional Innovation'}

Generate a structured innovation gig breakdown adhering strictly to this JSON format.
Ensure realistic phase-by-phase deliverables (Phases 1 through 4), required roles with clear required skills, expected duration, and business impact.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a corporate innovation strategist. Always respond with clean structured JSON matching the requested schema.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            innovationId: { type: Type.STRING, description: 'e.g. INN-2026-99' },
            tagline: { type: Type.STRING, description: 'Catchy 1-sentence summary' },
            useCase: { type: Type.STRING, description: 'Detailed business use case, problem background, and solution scope' },
            targetImpact: { type: Type.STRING, description: 'Quantifiable ROI, time saved, or business value expected' },
            durationWeeks: { type: Type.NUMBER, description: 'Total project duration in weeks (e.g. 4 to 8)' },
            weeklyHoursExpected: { type: Type.NUMBER, description: 'Average hours per week per contributor (e.g. 3 to 6)' },
            totalValuePoints: { type: Type.NUMBER, description: 'Reward points/recognition value for completing the gig (e.g. 1500 to 3500)' },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 to 5 domain tags e.g. GenAI, UX, Cloud, Automation',
            },
            requiredRoles: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  spotsCount: { type: Type.NUMBER },
                  hoursPerWeek: { type: Type.NUMBER },
                  valuePoints: { type: Type.NUMBER },
                },
                required: ['title', 'skills', 'spotsCount', 'hoursPerWeek', 'valuePoints'],
              },
            },
            deliverables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phaseNumber: { type: Type.NUMBER },
                  phaseTitle: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  dueDateDaysFromStart: { type: Type.NUMBER },
                  assignedRoleTitle: { type: Type.STRING },
                },
                required: ['phaseNumber', 'phaseTitle', 'title', 'description', 'dueDateDaysFromStart', 'assignedRoleTitle'],
              },
            },
          },
          required: [
            'innovationId',
            'tagline',
            'useCase',
            'targetImpact',
            'durationWeeks',
            'weeklyHoursExpected',
            'totalValuePoints',
            'tags',
            'requiredRoles',
            'deliverables',
          ],
        },
      },
    });

    const generatedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: generatedData });
  } catch (error: any) {
    console.error('Error generating gig with AI:', error);
    res.status(500).json({ error: error.message || 'Failed to generate gig with Gemini AI.' });
  }
});

// --- API ENDPOINT: AI Skill Match Evaluator ---
app.post('/api/ai/match-skills', async (req, res) => {
  try {
    const { applicantSkills, applicantBio, roleTitle, roleSkills, gigTitle, gigUseCase } = req.body;

    const ai = getGeminiClient();

    const prompt = `Evaluate how well this candidate matches the specific Gig Role requirements in an internal corporate innovation gig marketplace.

Gig Title: ${gigTitle}
Gig Use Case: ${gigUseCase}
Role Required: ${roleTitle}
Required Role Skills: ${JSON.stringify(roleSkills)}

Applicant Skills: ${JSON.stringify(applicantSkills)}
Applicant Bio/Pitch: ${applicantBio || 'No additional pitch provided.'}

Return JSON with:
1. matchScore: integer from 0 to 100 representing suitability.
2. matchRationale: 2-3 sentences explaining strengths and skill alignment.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchScore: { type: Type.INTEGER },
            matchRationale: { type: Type.STRING },
          },
          required: ['matchScore', 'matchRationale'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error matching skills with AI:', error);
    res.status(500).json({ error: error.message || 'Failed to evaluate skill match.' });
  }
});

// --- API ENDPOINT: AI Executive Leadership Digest ---
app.post('/api/ai/executive-digest', async (req, res) => {
  try {
    const { gigsSummary, metrics } = req.body;

    const ai = getGeminiClient();

    const prompt = `You are Chief Innovation Officer preparing an Executive Leadership Briefing for the Board & VP Leadership team on internal skill marketplace gig activity.

Current Portfolio Summary:
Total Gigs: ${metrics.totalGigs}
In Progress: ${metrics.inProgress}
Completed: ${metrics.completed}
Backlog / Open: ${metrics.backlog}
Total Skill Hours Contributed: ${metrics.totalHoursContributed} hrs
Total Estimated ROI / Value Generated: $${metrics.totalValueGenerated.toLocaleString()}

Active Gigs Overview:
${JSON.stringify(gigsSummary)}

Generate a high-impact executive report in Markdown with sections:
1. Executive Summary & ROI Highlights
2. Top Active Innovation Breakthroughs
3. Strategic Skill Gaps & Cross-Department Talent Velocity
4. Recommended Executive Actions to Accelerate Completion`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an executive C-level innovation advisor. Provide concise, bulleted, professional executive insights.',
      },
    });

    res.json({ success: true, report: response.text });
  } catch (error: any) {
    console.error('Error generating executive digest:', error);
    res.status(500).json({ error: error.message || 'Failed to generate executive digest.' });
  }
});

// --- VITE MIDDLEWARE & STATIC SERVING ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
