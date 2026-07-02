import React from 'react';

export default function Developer({ onBack }) {
  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-full flex items-center justify-center overflow-y-auto bg-slate-950/20 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-500">
      {/* Background Subtle Blobs / Mesh Gradient matching App aesthetic */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-300/30 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-300/25 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] bg-indigo-300/20 rounded-full blur-[140px]" />
      </div>

      {/* Sleek "Back" Button at Top-Left Corner */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-20">
        <button
          onClick={onBack}
          className="group inline-flex items-center gap-2.5 px-4.5 py-2.5 rounded-full bg-white/75 hover:bg-white/95 dark:bg-slate-900/65 dark:hover:bg-slate-900/90 backdrop-blur-xl border border-purple-200/60 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:-translate-x-1 active:scale-95 text-slate-800 dark:text-slate-100 font-medium text-sm sm:text-base cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-purple-600 group-hover:-translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back</span>
        </button>
      </div>

      {/* Centered Glassmorphic Profile Card */}
      <div className="relative z-10 max-w-md w-full bg-white/85 dark:bg-slate-900/75 backdrop-blur-2xl border border-white/70 dark:border-white/15 shadow-[0_20px_60px_-15px_rgba(147,51,234,0.22)] rounded-3xl p-8 sm:p-10 text-center transition-all duration-500 hover:shadow-[0_25px_70px_-15px_rgba(147,51,234,0.3)]">
        
        {/* Subtle Decorative Gradient Accent inside Card */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Circular Placeholder for Profile Image with Subtle Gradient Ring & Soft Shadow */}
        <div className="relative mx-auto w-32 h-32 sm:w-36 sm:h-36 mb-6">
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 rounded-full blur-sm opacity-80 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-slate-50 to-purple-50/80 dark:from-slate-800 dark:to-slate-900 p-1 shadow-inner flex items-center justify-center border-2 border-white/90 overflow-hidden">
            {/* Elegant Minimalist Placeholder Icon */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-indigo-500/10 flex items-center justify-center text-purple-600/80">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-[1.2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
          </div>
          {/* Active status indicator badge */}
          <span className="absolute bottom-1 right-2 w-5 h-5 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-md flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          </span>
        </div>

        {/* Bold, Elegant Heading for Name */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2.5 font-sans">
          D M C Kawshalya
        </h1>

        {/* Subtitle Below Name in Muted, Sophisticated Text Color */}
        <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 tracking-wide leading-relaxed">
          Undergraduate in CS at SLIIT City Uni
        </p>

        {/* Sleek Apple-Style Contact Section */}
        <div className="mt-5 flex flex-col items-center gap-2.5">
          {/* Email */}
          <a
            href="mailto:chanchana.kawshalya765@gmail.com"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-purple-100/60 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-normal tracking-tight opacity-85 hover:opacity-100 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-xs transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-500/80 group-hover:text-purple-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            <span>chanchana.kawshalya765@gmail.com</span>
          </a>

          {/* Phone */}
          <a
            href="tel:0767511835"
            className="group flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-purple-100/60 dark:border-white/10 text-slate-600 dark:text-gray-300 text-sm font-normal tracking-tight opacity-85 hover:opacity-100 hover:bg-white/80 dark:hover:bg-slate-800/80 hover:text-purple-700 dark:hover:text-purple-300 hover:shadow-xs transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-purple-500/80 group-hover:text-purple-600 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            <span>0767511835</span>
          </a>
        </div>

        {/* Optional Decorative Separator Line */}
        <div className="my-6 w-16 h-0.5 mx-auto bg-gradient-to-r from-transparent via-purple-300 to-transparent rounded-full opacity-70" />

        {/* Subtle Challenge Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-xs font-semibold text-purple-700 dark:text-purple-300 shadow-sm">
          <span>✨ Kapruka AI Challenge Architect</span>
        </div>

      </div>
    </div>
  );
}
