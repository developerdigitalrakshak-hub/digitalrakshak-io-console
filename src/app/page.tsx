export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white p-6">
      <main className="max-w-3xl w-full text-center space-y-8 bg-slate-900/60 backdrop-blur-md p-10 rounded-2xl border border-slate-800 shadow-2xl">
        <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium">
          DigitalRakshak IO Console
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
          Security & Protection Console
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          Welcome to DigitalRakshak Console. Next.js app setup is complete and ready for development.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold transition duration-200 shadow-lg shadow-purple-600/30"
          >
            Documentation →
          </a>
          <div className="px-6 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 font-mono text-sm">
            src/app/page.tsx
          </div>
        </div>
      </main>
    </div>
  );
}

