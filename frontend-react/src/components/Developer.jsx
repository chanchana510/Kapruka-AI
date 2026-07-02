import React from 'react';

export default function Developer({ onBack }) {
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-full flex items-center justify-center overflow-y-auto bg-slate-900/40 backdrop-blur-lg p-6 sm:p-10 animate-in fade-in duration-500">
      {/* Background Subtle Blobs / Ambient OS Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-400/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-indigo-400/15 rounded-full blur-[150px]" />
      </div>

      {/* 1. Minimalist Circular Glass Back Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <button
          onClick={onBack}
          aria-label="Go back"
          title="Back"
          className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/15 shadow-sm flex items-center justify-center transition-all duration-300 hover:bg-white/40 dark:hover:bg-white/20 hover:scale-105 text-slate-800 dark:text-white cursor-pointer group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 stroke-[1.5] group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Main Wrapper */}
      <div className="relative z-10 max-w-md w-full my-auto">
        {/* 2. Premium Frosted Glass Panel */}
        <div className="relative bg-white/20 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/40 dark:border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-3xl p-10 sm:p-12 text-center flex flex-col items-center gap-7 transition-all duration-500">
          
          {/* Top Subtle Accent Glow inside card */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-tr from-purple-500/15 to-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Avatar Section */}
          <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 transition-transform duration-300 hover:scale-105 cursor-pointer group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-purple-500/40 via-indigo-500/40 to-blue-500/40 rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500" />
            <div className="relative w-full h-full rounded-full bg-white/40 dark:bg-slate-800/60 backdrop-blur-md p-1 shadow-inner flex items-center justify-center border border-white/60 dark:border-white/25 group-hover:border-white transition-colors duration-300 overflow-hidden">
              {/* Sleek Avatar Placeholder */}
              <div className="w-full h-full rounded-full bg-gradient-to-br from-white/60 via-white/20 to-transparent dark:from-white/10 dark:to-transparent flex items-center justify-center text-slate-700 dark:text-slate-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-[1.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
            </div>
            {/* Active Status Indicator */}
            <span className="absolute bottom-1.5 right-2 w-4.5 h-4.5 bg-emerald-500 border-2 border-white/80 dark:border-slate-900 rounded-full shadow-sm flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </span>
          </div>

          {/* 4. Refined Typography */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800 dark:text-white font-sans">
              D M C Kawshalya
            </h1>
            <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 tracking-wide">
              Undergraduate in CS at SLIIT City Uni
            </p>
          </div>

          {/* 3. Redesigned Contact Pills (Centered, internal widget aesthetic) */}
          <div className="flex flex-col gap-3.5 w-full pt-1">
            {/* Email Widget */}
            <a
              href="mailto:chanchana.kawshalya765@gmail.com"
              className="group flex items-center justify-center gap-3 w-full py-3.5 px-5 bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/15 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/40 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100 font-medium text-sm shadow-sm"
            >
              <span className="flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </span>
              <span className="truncate tracking-tight text-xs sm:text-sm">chanchana.kawshalya765@gmail.com</span>
            </a>

            {/* Phone Widget */}
            <a
              href="tel:0767511835"
              className="group flex items-center justify-center gap-3 w-full py-3.5 px-5 bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/15 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/40 dark:hover:bg-white/20 text-slate-800 dark:text-slate-100 font-medium text-sm shadow-sm"
            >
              <span className="flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </span>
              <span className="tracking-tight text-xs sm:text-sm">0767511835</span>
            </a>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 dark:via-white/15 to-transparent my-1" />

          {/* Core Stack & AI Icons Row */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Core Stack & AI
            </span>
            <div className="flex items-center justify-center gap-4 sm:gap-5">
              {/* React Icon */}
              <div title="React Ecosystem" className="w-11 h-11 rounded-2xl bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/25 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-400 shadow-xs cursor-pointer">
                <svg className="w-5 h-5 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="2.5" />
                  <ellipse rx="10" ry="4.5" transform="rotate(30 12 12)" cx="12" cy="12" />
                  <ellipse rx="10" ry="4.5" transform="rotate(90 12 12)" cx="12" cy="12" />
                  <ellipse rx="10" ry="4.5" transform="rotate(150 12 12)" cx="12" cy="12" />
                </svg>
              </div>

              {/* Node / JS Ecosystem Icon */}
              <div title="Node.js & Backend" className="w-11 h-11 rounded-2xl bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/25 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-400 shadow-xs cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12m0 0L3 7m9 5l9-5" />
                </svg>
              </div>

              {/* FastAPI / High Performance API Icon */}
              <div title="FastAPI & Async Architecture" className="w-11 h-11 rounded-2xl bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/25 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-400 shadow-xs cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>

              {/* AI / Sparkles Icon */}
              <div title="Gemini AI & Agentic MCP" className="w-11 h-11 rounded-2xl bg-white/30 hover:bg-white/40 dark:bg-white/10 dark:hover:bg-white/20 backdrop-blur-md border border-white/25 dark:border-white/15 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all duration-300 hover:-translate-y-1 hover:text-purple-600 dark:hover:text-purple-400 shadow-xs cursor-pointer">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Subtle Footer Challenge Badge */}
          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-950/40 border border-purple-300/40 dark:border-purple-500/30 text-xs font-semibold text-purple-700 dark:text-purple-300 shadow-2xs">
              <span>✨ Kapruka AI Challenge Architect</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
