# Embeddable RAG FAQ-Based AI Chatbot Widget - Next.js, Vectorize, Redis, Gemini, Hugging Face, OpenRouter FullStack Project

A production-ready, self-hosted RAG (Retrieval Augmented Generation) chatbot widget built with Next.js, Redis vector storage, and multiple AI model fallbacks. Perfect for embedding into portfolio websites or any web application.

- **Live Demo:** [https://portfolio-chatbot-widget.vercel.app/](https://portfolio-chatbot-widget.vercel.app/)

- **Production Live:** [https://www.arnobmahmud.com/](https://www.arnobmahmud.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [How It Works](#-how-it-works)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Usage](#-usage)
- [API Endpoints](#-api-endpoints)
- [Components & Architecture](#-components--architecture)
- [Reusing Components](#-reusing-components)
- [Code Examples](#-code-examples)
- [Keywords](#-keywords)
- [Conclusion](#-conclusion)

---

## 🎯 Overview

This project is a fully functional, embeddable AI chatbot widget that can be integrated into any website. It leverages Next.js Edge Runtime for fast API responses, Redis for vector storage and session management, and implements a robust RAG system with multiple AI model and embedding fallbacks for reliability.

### Key Highlights

- **RAG Implementation**: Semantic search through FAQ database using vector embeddings
- **Multiple AI Fallbacks**: Gemini → OpenRouter GPT for reliable responses
- **Multiple Embedding Fallbacks**: Gemini → Hugging Face → OpenRouter → OpenAI
- **Edge Runtime**: Fast API responses using Next.js Edge Runtime
- **React Components**: Modern React with TanStack Query for state management
- **Session Persistence**: 30-day conversation history stored in Redis
- **Zero Flash**: Instant theme loading prevents FOUC (Flash of Unstyled Content)
- **Mobile Responsive**: Optimized for all screen sizes

---

## ✨ Features

### Backend Features

- **RAG (Retrieval Augmented Generation)**: Semantic search through FAQ database using cosine similarity
- **Streaming AI Responses**: Real-time token streaming using Server-Sent Events (SSE)
- **AI Model Fallback Chain**: Gemini (primary) → OpenRouter GPT (fallback)
- **Embedding Fallback Chain**: Gemini → Hugging Face → OpenRouter → OpenAI
- **Session Persistence**: 30-day conversation history stored in Upstash Redis
- **Edge Runtime**: Fast API responses with Next.js Edge Runtime
- **CORS Support**: Cross-origin requests enabled for embedding
- **Rate Limiting**: Batch processing for embeddings to avoid API limits

### Frontend Features

- **React Components**: Modern React 19 with TypeScript
- **TanStack Query**: Efficient data fetching and caching
- **Dark/Light Mode**: System preference detection with manual toggle, zero flash
- **Mobile Optimized**: Responsive design with keyboard-aware positioning
- **Progressive Rendering**: Messages appear as they stream
- **Optimistic UI**: Instant feedback with optimistic updates
- **Menu System**: Theme toggle, font size, widget position, and more
- **Accessibility**: Proper ARIA labels and keyboard navigation

---

## 🛠 Technology Stack

### Frontend

- **Next.js 16.1.4**: React framework with App Router
- **React 19.2.3**: Latest React with concurrent features
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **TanStack Query 5.90.19**: Data fetching and state management
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library

### Backend

- **Next.js API Routes**: Serverless API endpoints
- **Edge Runtime**: Fast edge computing for API routes
- **Upstash Redis**: Serverless Redis for vector storage and sessions
- **Google Gemini API**: Primary AI model and embeddings
- **Hugging Face Inference API**: Embedding fallback
- **OpenRouter API**: AI model and embedding fallback
- **OpenAI API**: Embedding fallback (optional)

### Development Tools

- **ESLint**: Code linting
- **TypeScript**: Type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing

---

## 📁 Project Structure

```bash
portfolio-chatbot-widget/
├── app/
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # Chat API endpoint (Edge Runtime)
│   │   ├── feedback/
│   │   │   └── route.ts          # Feedback submission endpoint
│   │   ├── history/
│   │   │   └── route.ts          # Chat history retrieval
│   │   └── seed/
│   │       └── route.ts          # FAQ seeding endpoint (Node.js Runtime)
│   ├── layout.tsx                # Root layout with widget injection
│   ├── page.tsx                   # Demo page
│   ├── providers.tsx              # TanStack Query provider
│   └── globals.css                # Global styles
├── components/
│   ├── chatbot/
│   │   ├── chatbot-widget.tsx    # Main widget component
│   │   ├── widget-menu.tsx       # Menu dropdown component
│   │   └── message-skeleton.tsx  # Loading skeleton component
│   └── ui/
│       ├── button.tsx            # Button component (shadcn)
│       ├── dialog.tsx             # Dialog component (shadcn)
│       ├── skeleton.tsx           # Skeleton component (shadcn)
│       └── toast.tsx              # Toast notification component
├── hooks/
│   ├── use-chat.ts               # Chat functionality hook
│   └── use-widget-settings.ts    # Widget settings hook
├── lib/
│   ├── ai.ts                     # AI model integration (fallback chain)
│   ├── embeddings.ts             # Embedding generation (fallback chain)
│   ├── rag.ts                    # RAG search implementation
│   ├── redis.ts                  # Redis client and vector operations
│   ├── faqs.ts                   # FAQ knowledge base
│   ├── constants.ts              # Application constants
│   ├── types.ts                  # TypeScript type definitions
│   ├── utils.ts                  # Utility functions
│   └── export-utils.ts           # Chat export utilities
├── public/
│   ├── widget.js                 # Vanilla JS embeddable widget
│   └── styles.css                # Widget stylesheet
├── types/
│   └── window.d.ts               # Window type definitions
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

### File Descriptions

- **`app/api/chat/route.ts`**: Main chat API endpoint with SSE streaming
- **`app/api/seed/route.ts`**: Seeds FAQ embeddings into Redis
- **`components/chatbot/chatbot-widget.tsx`**: Main React widget component
- **`hooks/use-chat.ts`**: TanStack Query hook for chat functionality
- **`lib/ai.ts`**: AI model integration with fallback chain
- **`lib/embeddings.ts`**: Embedding generation with multiple fallbacks
- **`lib/rag.ts`**: RAG search implementation using cosine similarity
- **`lib/redis.ts`**: Redis client, vector storage, and session management
- **`public/widget.js`**: Vanilla JavaScript embeddable widget (for external sites)

---

## 🔄 How It Works

### Architecture Flow

```bash
User Input → React Component (chatbot-widget.tsx)
    ↓
useChat Hook → POST /api/chat
    ↓
1. Extract/Generate Session ID (from cookie)
2. Retrieve FAQ Context (RAG)
   - Generate embedding vector (Gemini → Hugging Face → OpenRouter → OpenAI)
   - Search Redis vectors (cosine similarity)
   - Get top 3 relevant FAQs
3. Build AI Message Array
   - System prompt + FAQ context
   - Last 6 conversation messages
4. Stream AI Response
   - Try Gemini models (gemini-2.5-flash, gemini-2.5-pro)
   - Fallback to OpenRouter GPT-4o-mini
   - Stream via SSE
5. Save to Redis
    ↓
SSE Stream → React Component
    ↓
TanStack Query Cache Update → UI Update
```

### RAG (Retrieval Augmented Generation) Process

1. **Question Embedding**: User's question is converted to a 768-dimensional vector
   - Primary: Gemini Embeddings API (`gemini-embedding-001`)
   - Fallback 1: Hugging Face (`sentence-transformers/all-MiniLM-L6-v2`)
   - Fallback 2: OpenRouter (OpenAI `text-embedding-ada-002`)
   - Fallback 3: OpenAI (direct, if API key available)

2. **Vector Search**: Redis is queried for similar vectors using cosine similarity
   - All FAQ vectors stored in Redis with metadata
   - Cosine similarity calculated for each vector
   - Top 3 most similar FAQs retrieved

3. **Context Retrieval**: Top 3 most relevant FAQ entries are formatted

4. **Context Injection**: FAQs are formatted and injected into the AI system prompt

5. **AI Generation**: AI model generates response using FAQ context + conversation history
   - Primary: Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`)
   - Fallback: OpenRouter GPT-4o-mini

### Session Management

- **Session Creation**: New sessions get a timestamp-based session ID
- **Cookie Storage**: Session ID stored in HttpOnly cookie (30-day expiration)
- **Redis Storage**: Full conversation history stored in Upstash Redis
- **Session Retrieval**: Existing sessions load conversation history on widget initialization

---

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Upstash Redis account (free tier available)
- Google Gemini API key (free tier available)
- Hugging Face API key (free tier available)
- OpenRouter API key (optional, for fallback)

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd portfolio-chatbot-widget
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required dependencies including Next.js, React, TanStack Query, and Redis client.

### Step 3: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

See [Environment Variables](#-environment-variables) section for detailed configuration.

### Step 4: Seed FAQ Data

After setting up environment variables, populate Redis with FAQ embeddings:

```bash
curl -X POST http://localhost:3000/api/seed
```

This generates embeddings for all FAQs and stores them in Redis.

### Step 5: Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the widget in action.

---

## 🔐 Environment Variables

### Required Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Redis Configuration (Upstash)
UPSTASH_REDIS_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_TOKEN=your-redis-token

# AI Model API Keys
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-api-key  # Optional, for fallback

# Embedding API Keys
HUGGING_FACE_API_KEY=your-huggingface-api-key
OPENAI_API_KEY=your-openai-api-key  # Optional, for embedding fallback

# Application Configuration
NEXT_PUBLIC_CHATBOT_URL=http://localhost:3000  # Your deployment URL
CHATBOT_TITLE=Chat Assistant  # Widget title
CHATBOT_GREETING=👋 How can I help you today?  # Initial greeting
CHATBOT_PLACEHOLDER=Message...  # Input placeholder

# Session Configuration (optional)
SESSION_TTL=2592000  # 30 days in seconds
```

### Getting API Keys

#### 1. Upstash Redis

1. Visit [https://upstash.com/](https://upstash.com/)
2. Create a free account
3. Create a new Redis database
4. Copy the `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`

#### 2. Google Gemini API

1. Visit [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the `GOOGLE_GEMINI_API_KEY`

#### 3. Hugging Face API

1. Visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Copy the `HUGGING_FACE_API_KEY`

#### 4. OpenRouter API (Optional)

1. Visit [https://openrouter.ai/](https://openrouter.ai/)
2. Create an account and add credits
3. Generate an API key
4. Copy the `OPENROUTER_API_KEY`

#### 5. OpenAI API (Optional)

1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the `OPENAI_API_KEY`

---

## 📦 Deployment

### Development

```bash
npm run dev
```

Starts development server at `http://localhost:3000` with hot reload.

### Production Build

```bash
npm run build
npm start
```

Builds optimized production bundle and starts production server.

### Deployment to Vercel

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Visit [https://vercel.com/](https://vercel.com/)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Post-Deployment**:
   - Update `NEXT_PUBLIC_CHATBOT_URL` to your Vercel URL
   - Run seed endpoint: `curl -X POST https://your-app.vercel.app/api/seed`

### Deployment to VPS (Coolify/Hetzner)

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Deploy to VPS"
   git push origin main
   ```

2. **Deploy via Coolify**:
   - Login to Coolify dashboard
   - Create new application
   - Connect GitHub repository
   - Set environment variables
   - Deploy!

3. **Configure Domain**:
   - Point DNS to your VPS IP
   - Configure domain in Coolify
   - Update `NEXT_PUBLIC_CHATBOT_URL`

---

## 💻 Usage

### Embedding in Your Portfolio

#### Option 1: React Component (Recommended for Next.js)

Add to your `app/layout.tsx`:

```tsx
import { ChatbotWidget } from "@/components/chatbot/chatbot-widget";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
```

#### Option 2: Vanilla JavaScript (For External Sites)

Add to your HTML:

```html
<!-- Configure widget -->
<script>
  window.CHATBOT_BASE_URL = "https://your-domain.com";
  window.CHATBOT_TITLE = "Support Assistant";
  window.CHATBOT_GREETING = "Hi! 👋 How can I help you today?";
  window.CHATBOT_PLACEHOLDER = "Type your message...";
</script>

<!-- Load widget script -->
<script src="https://your-domain.com/widget.js" async></script>
```

### Configuration Options

| Variable              | Default                          | Description              |
| --------------------- | -------------------------------- | ------------------------ |
| `CHATBOT_BASE_URL`    | `window.location.origin`         | API endpoint URL         |
| `CHATBOT_TITLE`       | `'Chat Assistant'`               | Widget header title      |
| `CHATBOT_GREETING`    | `'👋 How can I help you today?'` | Initial greeting message |
| `CHATBOT_PLACEHOLDER` | `'Message...'`                   | Input field placeholder  |

---

## 🔌 API Endpoints

### POST `/api/chat`

Sends a message and receives a streaming AI response.

**Request:**

```json
{
  "message": "Tell me about your services"
}
```

**Response:** Server-Sent Events (SSE) stream

```json
data: {"response": "Hello"}
data: {"response": "! "}
data: {"response": "I can"}
...
data: [DONE]
```

**Headers:**

- `Content-Type: application/json` (request)
- `Content-Type: text/event-stream` (response)
- `Set-Cookie: chatbot_session=...` (new sessions)

---

### GET `/api/history`

Retrieves conversation history for the current session.

**Request:** Cookie-based (no body needed)

**Response:**

```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": 1234567890
    },
    {
      "role": "assistant",
      "content": "Hi! How can I help?",
      "timestamp": 1234567891
    }
  ]
}
```

**Headers:**

- Cookie: `chatbot_session=<session-id>`

---

### POST `/api/seed`

Populates Redis with FAQ embeddings.

**Request:** No body required

**Response:**

```json
{
  "success": true,
  "count": 20
}
```

**Note:** Run this once after deployment to populate the knowledge base.

---

### POST `/api/feedback`

Submits user feedback.

**Request:**

```json
{
  "rating": 5,
  "comment": "Great chatbot!"
}
```

**Response:**

```json
{
  "success": true
}
```

---

## 🏗 Components & Architecture

### Backend Components

#### 1. RAG Search (`lib/rag.ts`)

**Purpose:** Implements Retrieval Augmented Generation

**Process:**

```typescript
export async function searchFAQ(
  query: string,
  topK: number = 3,
): Promise<string> {
  // 1. Generate embedding
  const queryEmbedding = await generateEmbedding(query);

  // 2. Search Redis vectors
  const results = await searchVectors(queryEmbedding, topK);

  // 3. Format context
  return results
    .map((result) => {
      const { question, answer } = result.metadata;
      return `Q: ${question}\nA: ${answer}`;
    })
    .join("\n\n");
}
```

**Reusability:** Can be extracted to a separate module for use in other projects.

---

#### 2. AI Model Integration (`lib/ai.ts`)

**Purpose:** Handles AI model calls with fallback chain

**Key Features:**

- Gemini models (primary): `gemini-2.5-flash`, `gemini-2.5-pro`
- OpenRouter GPT (fallback): `openai/gpt-4o-mini`
- Message normalization for different formats
- Streaming support

**Reusability:** The fallback pattern can be adapted for other AI models.

---

#### 3. Embedding Generation (`lib/embeddings.ts`)

**Purpose:** Generates embeddings with multiple fallbacks

**Fallback Chain:**

1. Gemini Embeddings (`gemini-embedding-001`)
2. Hugging Face (`sentence-transformers/all-MiniLM-L6-v2`)
3. OpenRouter (OpenAI `text-embedding-ada-002`)
4. OpenAI (direct, if API key available)

**Reusability:** Embedding logic can be extracted to a standalone utility.

---

#### 4. Redis Operations (`lib/redis.ts`)

**Purpose:** Manages Redis connections, sessions, and vector storage

**Key Functions:**

- `getSession()`: Retrieve session from Redis
- `saveSession()`: Save session to Redis with TTL
- `storeVector()`: Store FAQ embeddings
- `searchVectors()`: Cosine similarity search

**Reusability:** Redis operations can be adapted for other use cases.

---

### Frontend Components

#### 1. Chatbot Widget (`components/chatbot/chatbot-widget.tsx`)

**Purpose:** Main React component for the chatbot widget

**Key Features:**

- Toggle open/close state
- Message rendering
- Input handling
- Auto-scroll
- Responsive design

**Reusability:** Component can be customized for different use cases.

---

#### 2. Chat Hook (`hooks/use-chat.ts`)

**Purpose:** TanStack Query hook for chat functionality

**Key Features:**

- Chat history fetching
- Message sending with streaming
- Optimistic UI updates
- Error handling

**Reusability:** Hook can be adapted for other chat applications.

---

#### 3. Widget Settings Hook (`hooks/use-widget-settings.ts`)

**Purpose:** Manages widget settings (theme, font size, position)

**Key Features:**

- localStorage persistence
- Theme management
- Font size control
- Position control

**Reusability:** Settings logic can be extracted to a standalone utility.

---

## 🔄 Reusing Components

### Using RAG Function in Another Project

```typescript
// Copy searchFAQ() from lib/rag.ts
// Adapt to your embedding model and vector database

import { generateEmbedding } from "./embeddings";
import { searchVectors } from "./redis";

export async function customRAG(query: string, topK: number = 5) {
  const queryEmbedding = await generateEmbedding(query);
  const results = await searchVectors(queryEmbedding, topK);
  return results.map((r) => r.metadata);
}
```

### Using Chat Hook in Another Project

```typescript
// Copy useChat() from hooks/use-chat.ts
// Adapt to your API endpoint

import { useMutation, useQuery } from "@tanstack/react-query";

export function useCustomChat() {
  const { data: messages } = useQuery({
    queryKey: ["chat-history"],
    queryFn: fetchHistory,
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      // Your API call
    },
  });

  return { messages, sendMessage };
}
```

### Using AI Model Integration

```typescript
// Copy getAIResponse() from lib/ai.ts
// Adapt to your AI models

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getCustomAIResponse(messages: Message[]) {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContentStream(prompt);
  return result;
}
```

---

## 💡 Code Examples

### Example 1: Custom FAQ Dataset

Modify `lib/faqs.ts` to use your own FAQs:

```typescript
export const faqs = [
  ["What is your return policy?", "We offer 30-day returns..."],
  ["How do I track my order?", "You can track your order..."],
  // Add more FAQs
];
```

### Example 2: Custom AI Model

Add a new model to the fallback chain in `lib/ai.ts`:

```typescript
// Add before OpenRouter fallback
try {
  const customModel = new CustomAIClient(process.env.CUSTOM_API_KEY!);
  const response = await customModel.generate(messages);
  return { text: response };
} catch (error) {
  console.log("Custom model failed, trying next...");
}
```

### Example 3: Custom Embedding Model

Add a new embedding provider in `lib/embeddings.ts`:

```typescript
// Add before Hugging Face fallback
try {
  const response = await fetch("https://api.custom-embeddings.com/embed", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.CUSTOM_EMBEDDING_KEY}` },
    body: JSON.stringify({ text }),
  });
  const data = await response.json();
  return data.embedding;
} catch (error) {
  console.log("Custom embedding failed, trying next...");
}
```

### Example 4: Custom Widget Styling

Modify `components/chatbot/chatbot-widget.tsx`:

```typescript
// Update className for custom styling
<button
  className={cn(
    "fixed w-14 h-14 bg-blue-600 rounded-full", // Custom color
    "shadow-2xl flex items-center justify-center",
    // ... more styles
  )}
>
```

---

## 🏷 Keywords

- **RAG (Retrieval Augmented Generation)**
- **Next.js**
- **React**
- **TypeScript**
- **Redis**
- **Vector Database**
- **Semantic Search**
- **Embeddings**
- **AI Chatbot**
- **Streaming Responses**
- **Server-Sent Events (SSE)**
- **TanStack Query**
- **Edge Runtime**
- **Upstash Redis**
- **Google Gemini**
- **Hugging Face**
- **OpenRouter**
- **OpenAI**
- **Cosine Similarity**
- **Session Management**
- **Dark Mode**
- **Mobile Responsive**
- **Embeddable Widget**
- **FAQ-Based Chatbot**

---

## 📝 Conclusion

This project demonstrates a production-ready implementation of an AI chatbot widget with RAG capabilities, built with Next.js and modern React patterns. It showcases:

- **Modern Architecture**: Next.js App Router, Edge Runtime, React Server Components
- **Best Practices**: TypeScript, TanStack Query, proper error handling
- **Performance**: Edge Runtime, streaming responses, optimistic UI
- **Reliability**: Multiple fallback chains for AI models and embeddings
- **Scalability**: Redis for vector storage, efficient cosine similarity search
- **Developer Experience**: Well-documented, type-safe, reusable components

The codebase is well-documented and structured for easy understanding and extension. Each component can be reused independently in other projects.

---

## Happy Coding! 🎉

Feel free to use this project repository and extend this project further!

If you have any questions or want to share your work, reach out via GitHub or my portfolio at [https://www.arnobmahmud.com/](https://www.arnobmahmud.com/).

**Enjoy building and learning!** 🚀

Thank you! 😊

---
