import React from 'react';

export default function TechStackPage({ onClose, onTestEasterEgg, onNavigateDeveloper }) {
  const handleDeveloperClick = () => {
    if (onNavigateDeveloper) {
      onNavigateDeveloper();
    } else {
      window.history.pushState({}, '', '/developer');
      window.dispatchEvent(new PopStateEvent('popstate'));
      if (onClose) onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-300">
      <div className="max-w-4xl w-full bg-white/95 backdrop-blur-md border border-purple-100 shadow-2xl rounded-3xl p-6 sm:p-10 my-auto sm:my-8">
        
        {/* Header section */}
        <div className="flex justify-between items-start sm:items-center mb-6 pb-4 border-b border-purple-100 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-purple-100 text-purple-800 rounded-full">Behind the Scenes</span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-deep-purple mt-2">
              Built for the Kapruka Agent Challenge 🏆
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-purple-700 hover:bg-purple-50 rounded-full transition-colors flex items-center justify-center flex-shrink-0"
            title="Back to Chat"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Free-Tier Disclaimer */}
        <div className="mb-6 flex items-start sm:items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left sm:text-center text-sm text-amber-800 shadow-sm">
          <span className="text-lg">⚠️</span>
          <p className="font-medium leading-relaxed">
            <strong>Note:</strong> This prototype was built using free-tier APIs and servers. You might experience slight delays or minor errors during heavy usage.
          </p>
        </div>

        {/* Intro */}
        <p className="text-gray-600 leading-relaxed mb-8 text-sm sm:text-base">
          Our AI Shopping Assistant combines state-of-the-art conversational AI with custom Model Context Protocol (MCP) integrations to deliver a seamless, delightful gifting experience for Sri Lanka.
        </p>

        {/* Tech Stack Grid */}
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>⚡</span> Core Technology Stack
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          
          <div className="bg-white/50 border border-slate-200/50 backdrop-blur-md p-4 rounded-xl shadow-sm text-left hover:bg-white/70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">⚛️</span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">React (Frontend)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Provides a snappy, highly responsive user interface with custom interactive product carousels, dynamic drawers, and smooth transitions.
            </p>
          </div>

          <div className="bg-white/50 border border-slate-200/50 backdrop-blur-md p-4 rounded-xl shadow-sm text-left hover:bg-white/70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎨</span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Tailwind CSS (Styling)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Powers the modern glassmorphism aesthetic, custom design tokens, vibrant color palettes, and fully responsive layouts across mobile and desktop.
            </p>
          </div>

          <div className="bg-white/50 border border-slate-200/50 backdrop-blur-md p-4 rounded-xl shadow-sm text-left hover:bg-white/70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🚀</span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">FastAPI (Backend)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              High-performance asynchronous Python API bridge managing conversational history, rate-limit trapping, and dynamic session rebuilding.
            </p>
          </div>

          <div className="bg-white/50 border border-slate-200/50 backdrop-blur-md p-4 rounded-xl shadow-sm text-left hover:bg-white/70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🧠</span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Gemini AI (The Brain)</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Acts as a multilingual Sri Lankan concierge capable of Singlish understanding, intelligent product search, and live MCP tool execution.
            </p>
          </div>

          <div className="bg-white/50 border border-slate-200/50 backdrop-blur-md p-4 rounded-xl shadow-sm text-left hover:bg-white/70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🎙️</span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Multimodal Voice AI</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Seamless browser-native audio recording streamed directly to Gemini for high-accuracy Sinhala/Singlish transcription and intent recognition.
            </p>
          </div>

          <div className="bg-white/50 border border-slate-200/50 backdrop-blur-md p-4 rounded-xl shadow-sm text-left hover:bg-white/70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🧠</span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Sentiment & Mood Analysis</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Real-time emotional tracking of user prompts to intelligently suggest context-aware, empathetic gift recommendations.
            </p>
          </div>

          <div className="bg-white/50 border border-slate-200/50 backdrop-blur-md p-4 rounded-xl shadow-sm text-left hover:bg-white/70 hover:shadow-md transition-all duration-300 sm:col-span-2">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">🛒</span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">Smart Shareable Cart</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dynamic state management allowing users to compile multi-item wishlists into a single, seamless Kapruka checkout link.
            </p>
          </div>

        </div>

        {/* Architecture Section */}
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>🔗</span> System Architecture Flow
        </h2>
        <div className="p-6 rounded-2xl bg-purple-900 text-white shadow-inner mb-10 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] text-center text-sm font-medium gap-2">
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
              🗣️ User Input
            </div>
            <span className="text-accent-yellow">➡️</span>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
              ⚡ FastAPI
            </div>
            <span className="text-accent-yellow">➡️</span>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
              🛠️ Gemini Tool Calling
            </div>
            <span className="text-accent-yellow">➡️</span>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
              📦 Kapruka API
            </div>
            <span className="text-accent-yellow">➡️</span>
            <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20">
              ✨ Glassmorphic UI
            </div>
          </div>
        </div>

        {/* Action / Easter Egg Button */}
        <div className="mt-8 pt-6 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-gray-800 text-base">Want to see our custom persona in action?</h4>
            <p className="text-xs text-gray-500">Test our special Easter Egg built into the system instructions.</p>
          </div>
          <button 
            onClick={onTestEasterEgg}
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <span>Test the Easter Egg 🥚</span>
          </button>
        </div>

        {/* Meet the Developer Navigation Section */}
        <div className="mt-8 pt-6 border-t border-purple-100/80 flex justify-center">
          <button
            onClick={handleDeveloperClick}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white/60 hover:bg-white/95 backdrop-blur-md border border-purple-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_12px_36px_rgba(147,51,234,0.18)] hover:border-purple-300/80 text-gray-800 font-semibold text-sm sm:text-base transition-all duration-300 ease-out hover:scale-[1.03] active:scale-[0.98] cursor-pointer overflow-hidden"
          >
            {/* Apple-style soft glow gradient overlay on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />

            {/* Minimalist User Profile + Sparkles Icon */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-purple-50 border border-purple-200/60 text-purple-600 group-hover:scale-110 group-hover:bg-purple-100 transition-all duration-300 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-500"></span>
              </span>
            </div>

            <span className="relative z-10 font-semibold tracking-wide text-slate-800 group-hover:text-purple-950 transition-colors">
              Meet the Developer
            </span>

            <svg xmlns="http://www.w3.org/2000/svg" className="relative z-10 w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </div>
  );
}
