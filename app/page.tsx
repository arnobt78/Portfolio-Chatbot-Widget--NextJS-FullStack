export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-8 py-16 text-center">
        <div className="flex flex-col items-center gap-6">
          <h1 className="text-4xl font-bold tracking-tight text-black dark:text-zinc-50 sm:text-5xl">
            Portfolio Chatbot Widget
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A high-performance, self-hosted RAG chatbot widget powered by Next.js, Redis, and multiple AI models.
          </p>
        </div>

        <div className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">
            Widget is Active! 🎉
          </h2>
          <p className="mb-6 text-zinc-600 dark:text-zinc-400">
            Look for the chatbot button in the bottom-right corner. Click it to test the RAG-powered assistant!
          </p>
          <div className="space-y-4 text-left">
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-black dark:text-zinc-50">✅ Status</h3>
              <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>• 20 FAQs embedded and ready</li>
                <li>• RAG semantic search active</li>
                <li>• AI fallback chain configured</li>
                <li>• Redis session management enabled</li>
              </ul>
            </div>
            <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
              <h3 className="mb-2 font-semibold text-black dark:text-zinc-50">🧪 Try These Questions</h3>
              <ul className="space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <li>• "Tell me about Arnob Mahmud"</li>
                <li>• "Where is Arnob located?"</li>
                <li>• "What are Arnob's technical skills?"</li>
                <li>• "How can I contact Arnob?"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <a
            href="https://github.com/arnobt78/portfolio-chatbot-widget"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            View on GitHub
          </a>
          <span>•</span>
          <a
            href="/api/seed"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            Seed API
          </a>
        </div>
      </main>
    </div>
  );
}
