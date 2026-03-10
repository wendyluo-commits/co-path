AI Tarot Reading Web App

An AI-powered tarot interpretation service built with Next.js and OpenAI, providing both single-card insights and three-card (Past–Present–Future) readings.

🌟 Features

AI-Powered Interpretations
Uses OpenAI GPT-4o with structured outputs to generate high-quality and consistent tarot interpretations.

Multiple Spreads
Supports both single-card quick insights and three-card spreads for deeper readings (Past–Present–Future).

Personalized Experience
Users can choose between gentle or direct interpretation tones.

Safety Boundaries
Built-in safety checks provide appropriate boundaries and guidance when sensitive topics appear.

Responsive Design
Optimized for both desktop and mobile devices.

Privacy Protection
User questions are not stored and are processed only temporarily during interpretation.

🛠 Tech Stack

Framework: Next.js 14 (App Router)

Language: TypeScript

Styling: Tailwind CSS

AI Model: OpenAI GPT-4o

Validation: Zod

Deployment: Vercel

Icons: Lucide React

🚀 Getting Started
Requirements

Node.js 18+

npm or yarn

OpenAI API Key

Installation
1. Clone the repository
git clone <repository-url>
cd web
2. Install dependencies
npm install
3. Configure environment variables
cp .env.example .env.local

Edit .env.local and add the required variables:

OPENAI_API_KEY=your_openai_api_key_here
MODEL_NAME=gpt-4o
NEXT_PUBLIC_APP_NAME=AI Tarot Reading
4. Start the development server
npm run dev
5. Open the application

Visit:

http://localhost:3000
📁 Project Structure
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes
│   │   ├── reading/        # Tarot reading API
│   │   └── health/         # Health check API
│   ├── reading/            # Reading result page
│   ├── terms/              # Terms of service
│   ├── privacy/            # Privacy policy
│   └── page.tsx            # Homepage
├── components/             # Reusable components
├── lib/                    # Utility libraries
│   ├── openai.ts           # OpenAI client
│   └── tarot.ts            # Tarot card logic
├── data/                   # Static data
│   └── tarot-cards.json    # Tarot card knowledge base
├── schemas/                # Data validation
│   └── reading.schema.ts   # Reading data schema
└── prompts/                # AI prompt templates
    └── reading.ts          # Reading prompt templates
🔧 API Endpoints
POST /api/reading

Generate a tarot interpretation.

Request body

{
  "question": "How should I prepare for next week's interview?",
  "spread": "three_card",
  "seed": 123456,
  "lang": "zh",
  "tone": "direct"
}

Response

{
  "spread": "three_card",
  "question": "How should I prepare for next week's interview?",
  "cards": [...],
  "overall": "Overall interpretation...",
  "action_steps": ["Actionable advice..."],
  "safety_note": "Safety notice (if applicable)",
  "tone": "direct"
}
GET /api/health

Service health check.

Response

{
  "ok": true,
  "timestamp": "2024-08-20T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
🛡 Security Features

Content Safety
Automatically detects sensitive topics and provides appropriate guidance.

Data Protection
User questions are not stored and are processed only during interpretation.

Error Handling
Robust error handling with graceful fallback mechanisms.

Rate Limiting
Prevents abuse of the service.

📋 Deploying to Vercel

Connect your Git repository

Log in to the Vercel dashboard

Import your Git repository

Configure environment variables

Add the following variables in your Vercel project settings:

OPENAI_API_KEY

MODEL_NAME

NEXT_PUBLIC_APP_NAME

Deploy

Vercel will automatically detect the Next.js project and deploy it.

🧪 Testing

Run the following commands:

# Type checking
npm run type-check

# Linting
npm run lint

# Build the project
npm run build
📄 License

This project is intended for learning and entertainment purposes only.

⚠️ Disclaimer

This service is intended for entertainment and self-reflection only.
It does not provide medical, legal, or financial advice. If you are experiencing a safety or health emergency, please contact a qualified professional or local emergency services.

🤝 Contributions

Contributions are welcome. Feel free to submit Issues or Pull Requests to improve the project.

📞 Contact

If you have any questions or suggestions, please open an Issue in the repository.
