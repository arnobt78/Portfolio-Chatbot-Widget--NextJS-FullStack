# Portfolio Chatbot Widget

A high-performance, self-hosted RAG (Retrieval Augmented Generation) chatbot widget for your portfolio website. Built with Next.js, Redis, and multiple AI model fallbacks.

## Features

- ⚡ **Instant Loading**: Widget button appears immediately, no blocking
- 🧠 **RAG-Powered**: Semantic search over 20 FAQs for accurate answers
- 🔄 **AI Fallback Chain**: Groq (fastest) → Gemini (reliable) → OpenRouter (backup)
- 💾 **Redis Sessions**: Persistent chat history with Upstash Redis
- 🎨 **Modern UI**: Dark mode, smooth animations, responsive design
- 🚀 **Edge Runtime**: Fast API responses with Next.js Edge Runtime
- 🔒 **Self-Hosted**: Full control on your VPS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js API Routes (Edge Runtime)
- **Vector Storage**: Upstash Redis
- **Embeddings**: Hugging Face Inference API (sentence-transformers)
- **AI Models**: Groq (Llama 3.1), Google Gemini, OpenRouter (Claude/GPT)
- **Deployment**: Coolify on Hetzner VPS

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `UPSTASH_REDIS_URL` - Your Upstash Redis URL
- `UPSTASH_REDIS_TOKEN` - Your Upstash Redis token
- `GROQ_API_KEY` - Groq API key (free tier available)
- `GOOGLE_GEMINI_API_KEY` - Google Gemini API key
- `OPENROUTER_API_KEY` - OpenRouter API key (optional, for fallback)
- `HUGGING_FACE_API_KEY` - Hugging Face API key for embeddings

### 3. Seed FAQs

First, seed the FAQ vectors into Redis:

```bash
curl -X POST http://localhost:3000/api/seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the widget.

## Deployment to VPS (Coolify)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Deploy via Coolify

1. Login to Coolify: `http://77.42.71.87:8000`
2. Create new application
3. Connect your GitHub repository
4. Set environment variables in Coolify dashboard
5. Deploy!

### 3. Update Domain (After IONOS purchase)

Once you have your domain (e.g., `arnobmahmud.com`):

1. Point DNS to your VPS IP: `77.42.71.87`
2. Configure domain in Coolify
3. Update `NEXT_PUBLIC_CHATBOT_URL` in environment variables

## Embedding in Your Portfolio

Add this to your portfolio's `layout.tsx`:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.CHATBOT_BASE_URL = "https://your-domain.com";
      window.CHATBOT_TITLE = "Arnob's Assistant";
      window.CHATBOT_GREETING = "👋 How can I help you today?";
      window.CHATBOT_PLACEHOLDER = "Ask about Arnob...";
    `,
  }}
/>
<script
  src="https://your-domain.com/widget.js"
  async
></script>
```

## API Endpoints

- `POST /api/chat` - Send a message, get streaming AI response
- `GET /api/history` - Get chat history for current session
- `POST /api/seed` - Seed FAQ vectors into Redis (run once)

## Performance Optimizations

1. **Instant Button Display**: Button HTML created immediately, no script blocking
2. **Edge Runtime**: API routes use Edge Runtime for faster responses
3. **Non-blocking History**: Chat history loads asynchronously
4. **Streaming Responses**: Real-time AI response streaming
5. **Vector Caching**: FAQ embeddings cached in Redis

## Troubleshooting

### Widget not appearing
- Check browser console for errors
- Verify `CHATBOT_BASE_URL` is correct
- Ensure CORS headers are set correctly

### Slow responses
- Check AI API rate limits
- Verify Redis connection
- Monitor VPS resources (CPU/RAM)

### Embeddings not working
- Verify Hugging Face API key
- Check Redis connection
- Re-run seed endpoint

## License

MIT
