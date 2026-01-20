# Deployment Guide

## Step 1: Create GitHub Repository

1. Go to <https://github.com/new>
2. Repository name: `portfolio-chatbot-widget`
3. Description: "Self-hosted RAG chatbot widget for portfolio website"
4. Choose **Private** or **Public** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Push to GitHub

After creating the repo, run these commands:

```bash
cd /Users/arnob_t78/Projects/NextJS/portfolio-chatbot-widget
git remote add origin https://github.com/arnobt78/portfolio-chatbot-widget.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

1. Go to <https://vercel.com/new>
2. Import the `portfolio-chatbot-widget` repository
3. Configure environment variables (see `.env.local` for all required keys):
   - `UPSTASH_REDIS_URL`
   - `UPSTASH_REDIS_TOKEN`
   - `HUGGING_FACE_API_KEY`
   - `GOOGLE_GEMINI_API_KEY`
   - `OPENROUTER_API_KEY`
   - `GROQ_API_KEY` (optional)
   - `OPENAI_API_KEY` (optional, if you have it)
   - `NEXT_PUBLIC_CHATBOT_URL` (will be set to your Vercel URL after deployment)
4. Click "Deploy"
5. Wait for deployment to complete
6. Copy your Vercel deployment URL (e.g., `https://portfolio-chatbot-widget.vercel.app`)

## Step 4: Seed the FAQ Database

After deployment, run the seed endpoint:

```bash
curl -X POST https://your-vercel-url.vercel.app/api/seed
```

You should see: `{"success":true,"count":20}`

## Step 5: Update Environment Variable

1. Go back to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_CHATBOT_URL` to your actual Vercel URL
3. Redeploy (or it will auto-redeploy)

## Step 6: Test the Widget

1. Open your Vercel URL in a browser
2. The widget button should appear in the bottom-right corner
3. Click it and test a question like "Tell me about Arnob Mahmud"
4. Verify RAG search and AI responses work

## Step 7: Integrate into Portfolio

Once testing is successful, update your portfolio (`portfolio-arnob-new`):

1. Edit `app/layout.tsx` in your portfolio project
2. Add the widget script:

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      window.CHATBOT_BASE_URL = "https://your-vercel-url.vercel.app";
      window.CHATBOT_TITLE = "Arnob's Assistant";
      window.CHATBOT_GREETING = "👋 How can I help you today?";
      window.CHATBOT_PLACEHOLDER = "Ask about Arnob...";
    `,
  }}
/>
<script
  src="https://your-vercel-url.vercel.app/widget.js"
  async
></script>
```

1. Test locally: `npm run dev` in your portfolio project
2. Deploy portfolio to Vercel

## Step 8: Future VPS Deployment (Optional)

Once everything works on Vercel, you can deploy to your VPS via Coolify:

1. Push to GitHub (already done)
2. In Coolify, create a new application
3. Connect to your GitHub repo
4. Set all environment variables
5. Deploy
6. Update `NEXT_PUBLIC_CHATBOT_URL` to your VPS domain
7. Update portfolio widget script to point to VPS domain
