import React, { useRef, useEffect, useState } from 'react';
import ProductCarousel from './ProductCarousel';

export default function ChatWindow({ messages, onAddToCart, onSendMessage, onConfirmEdit, isTyping, isCheckoutOpen, cooldown, onAudioUpload, isTranscribing }) {
  const scrollAreaRef = useRef(null);
  const textareaRef = useRef(null);
  const [inputText, setInputText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [ttsLoadingIndex, setTtsLoadingIndex] = useState(null);
  const [ttsPlayingIndex, setTtsPlayingIndex] = useState(null);
  const ttsAudioRef = useRef(null);

  const handlePlayTTS = async (text, index) => {
    if (ttsPlayingIndex === index && ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
      setTtsPlayingIndex(null);
      return;
    }

    if (ttsAudioRef.current) {
      ttsAudioRef.current.pause();
      ttsAudioRef.current = null;
      setTtsPlayingIndex(null);
    }

    try {
      setTtsLoadingIndex(index);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!response.ok) throw new Error("Failed to generate audio");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      ttsAudioRef.current = audio;

      audio.onended = () => {
        setTtsPlayingIndex(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setTtsPlayingIndex(null);
        URL.revokeObjectURL(url);
      };

      setTtsLoadingIndex(null);
      setTtsPlayingIndex(index);
      await audio.play();
    } catch (err) {
      console.error("TTS play error:", err);
      setTtsLoadingIndex(null);
      setTtsPlayingIndex(null);
    }
  };

  const toggleListening = async () => {
    try {
      if (isListening) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        setIsListening(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Audio recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        if (audioBlob.size === 0) return;

        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result;
            if (onAudioUpload) {
              const text = await onAudioUpload(base64Audio);
              if (text) {
                setInputText(prev => prev ? `${prev} ${text}` : text);
              }
            }
          };
        } catch (err) {
          console.error("Error processing audio:", err);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
    } catch (e) {
      console.error("Failed to start media recorder:", e);
      alert("Microphone permission denied or not available.");
      setIsListening(false);
    }
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleInputResize = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSend = () => {
    if (inputText.trim()) {
      if (editingId !== null) {
        onConfirmEdit(editingId, inputText);
        setEditingId(null);
      } else {
        onSendMessage(inputText);
      }
      setInputText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderInputBar = () => (
    <div className="w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto flex flex-col items-center">
      <div className="w-full flex items-center bg-white/95 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-purple-100/50 px-4 sm:px-6 py-2 sm:py-2.5 gap-2 sm:gap-3 min-h-[52px] sm:min-h-[56px] transition-all">
        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined">attach_file</span>
        </button>
        <div className="relative flex-1 flex items-center h-full">
          {cooldown > 0 && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 pointer-events-none flex items-center gap-1 pl-3">
              <span className="text-on-surface-variant/80 text-sm sm:text-base">⏳ API Limit reached. Please wait</span>
              <span className="text-red-600 font-bold text-sm sm:text-base">{cooldown}s</span>
              <span className="text-on-surface-variant/80 text-sm sm:text-base">...</span>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onInput={handleInputResize}
            onKeyDown={handleKeyPress}
            disabled={cooldown > 0}
            rows={1}
            className={`w-full bg-transparent border-none outline-none ring-0 focus:outline-none focus:ring-0 resize-none max-h-32 overflow-y-auto text-sm sm:text-base py-1.5 disabled:cursor-not-allowed ${cooldown > 0 ? 'placeholder:text-transparent disabled:opacity-100' : 'placeholder:text-on-surface-variant/60 disabled:opacity-50'}`}
            placeholder={cooldown > 0 ? "" : "Message Kapruka AI..."}
          />
        </div>
        <button
          type="button"
          onClick={toggleListening}
          disabled={cooldown > 0 || isTranscribing}
          title={isTranscribing ? "Transcribing audio..." : (isListening ? "Stop recording" : "Start voice input")}
          className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]' : (isTranscribing ? 'bg-purple-500 text-white animate-spin' : 'text-on-surface-variant hover:bg-surface-container')}`}
        >
          <span className="material-symbols-outlined">{isTranscribing ? 'sync' : (isListening ? 'mic_off' : 'mic')}</span>
        </button>
        <button disabled={cooldown > 0} onClick={handleSend} className={`w-10 h-10 flex-shrink-0 ${cooldown > 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-deep-purple hover:opacity-90 active:scale-95'} text-white rounded-full flex items-center justify-center shadow-md transition-all`}>
          <span className="material-symbols-outlined">arrow_upward</span>
        </button>
      </div>
      {messages.length === 0 && (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-4 transition-all duration-500 w-full px-2">
          {["🌸 Flowers for GF", "⌚ Gifts for Him", "🚚 Check Delivery"].map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSendMessage(pill)}
              className="px-4 py-2 bg-white/60 backdrop-blur-md border border-purple-100/40 rounded-full text-xs text-slate-600 hover:bg-purple-50 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm"
            >
              {pill}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <main className="relative h-screen pt-16 flex flex-col w-full items-center overflow-hidden">
      <section
        ref={scrollAreaRef}
        id="chat-scroll-area"
        className="w-full flex-1 flex flex-col items-center overflow-y-auto px-4 pb-8 pt-8 scroll-smooth hide-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto my-auto flex flex-col items-center justify-center gap-6 sm:gap-8 py-8 animate-in fade-in duration-500">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 text-center tracking-tight max-w-full break-words leading-snug">
              What can I help you find today?
            </h1>
            {renderInputBar()}
          </div>
        ) : (
          <div id="chat-messages-container" className="w-full max-w-md sm:max-w-lg md:max-w-3xl mx-auto flex flex-col gap-6 pb-[160px]">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'} w-full animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  <div className={`group flex items-center gap-4 ${isUser ? 'flex-row-reverse' : ''} max-w-[85%]`}>
                    {!isUser && (
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-deep-purple shadow-md overflow-hidden border border-white/20">
                        <img alt="Assistant" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBVIabXJxRrTsz2PWJDkfYNmQS3EHsueoGTfIh3TXRmOTUjHDZL-dIC_MC9gvU_Cn3nI5rIU6zN1tImvBVQBAQvQDLrYNOfAEHktNnPF2uhJjS0BQHuIUwgHuKOEtw9U3mgcHCSzfrJmaCk9pw7zve8CzxJrudJ8at_nU7tfLhXm0bV73HFhmMELb7Xk1XC48P5UEskzAWO-gKjfMbe6aKP3QDL8AX3toYQf-bGKr_sHQgZdgwTe5bkJFS9eewGZd4f9c4qY6fz74" />
                      </div>
                    )}
                    <div className={`${isUser ? 'bg-accent-yellow text-on-secondary-fixed rounded-tr-none' : 'bg-surface-container-lowest text-on-surface rounded-tl-none border border-outline-variant/10 shadow-[0px_4px_12px_rgba(0,0,0,0.05)]'} p-4 rounded-2xl shadow-sm overflow-hidden flex flex-col gap-2`}>
                      <p className={`font-body-md leading-relaxed whitespace-pre-wrap ${isUser ? 'font-medium' : ''}`}>{msg.content}</p>
                      {!isUser && (
                        <div className="flex items-center justify-end pt-2 mt-1 border-t border-gray-100/80">
                          <button
                            onClick={() => handlePlayTTS(msg.content, index)}
                            disabled={ttsLoadingIndex === index}
                            title={ttsPlayingIndex === index ? "Stop speaking" : "Read aloud"}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-500 hover:text-deep-purple hover:bg-purple-50/80 transition-all cursor-pointer border border-transparent hover:border-purple-100"
                          >
                            {ttsLoadingIndex === index ? (
                              <span className="material-symbols-outlined text-[16px] animate-spin text-purple-600">progress_activity</span>
                            ) : ttsPlayingIndex === index ? (
                              <span className="material-symbols-outlined text-[16px] text-purple-600 animate-pulse">volume_up</span>
                            ) : (
                              <span className="material-symbols-outlined text-[16px]">volume_up</span>
                            )}
                            <span>{ttsPlayingIndex === index ? 'Speaking...' : ttsLoadingIndex === index ? 'Fetching audio...' : 'Listen'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                    {isUser && (
                      <button
                        onClick={() => {
                          setInputText(msg.content);
                          setEditingId(msg.id);
                          textareaRef.current?.focus();
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-purple-600 transition-all ml-2"
                        title="Edit prompt"
                      >
                        ✏️
                      </button>
                    )}
                  </div>

                  {/* Explicit Category Link Button */}
                  {!isUser && msg.categoryTarget && (
                    <a
                      href={msg.categoryTarget.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 ml-14 inline-flex items-center gap-2 px-4 py-2.5 bg-white/40 backdrop-blur-md border border-purple-200/60 rounded-2xl text-purple-800 font-medium text-sm shadow-sm hover:bg-white/70 hover:shadow transition-all group w-fit"
                    >
                      <span className="text-purple-600 group-hover:scale-110 transition-transform">🔗</span>
                      {msg.categoryTarget.name}
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}

                  {/* Explicit Carousel Injection */}
                  {!isUser && msg.products && msg.products.length > 0 && (
                    <div className="w-full mt-2 overflow-hidden">
                      <ProductCarousel products={msg.products} onAdd={onAddToCart} />
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-10 h-10 rounded-full bg-deep-purple flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden border border-white/20">
                  <img alt="Assistant" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBVIabXJxRrTsz2PWJDkfYNmQS3EHsueoGTfIh3TXRmOTUjHDZL-dIC_MC9gvU_Cn3nI5rIU6zN1tImvBVQBAQvQDLrYNOfAEHktNnPF2uhJjS0BQHuIUwgHuKOEtw9U3mgcHCSzfrJmaCk9pw7zve8CzxJrudJ8at_nU7tfLhXm0bV73HFhmMELb7Xk1XC48P5UEskzAWO-gKjfMbe6aKP3QDL8AX3toYQf-bGKr_sHQgZdgwTe5bkJFS9eewGZd4f9c4qY6fz74" />
                </div>
                <div className="flex items-center gap-1 p-4 bg-white/50 backdrop-blur-md rounded-2xl w-fit shadow-sm border border-purple-100">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Fixed Chat Input Bar for active chat */}
      {messages.length > 0 && (
        <div className={`fixed left-0 bottom-0 w-full ${isCheckoutOpen ? 'md:w-[calc(100%-400px)]' : 'md:w-full'} flex justify-center z-40 pb-4 sm:pb-8 bg-gradient-to-t from-background via-background to-transparent pt-8 sm:pt-12 px-4 sm:px-5 animate-in fade-in slide-in-from-bottom duration-300`}>
          {renderInputBar()}
        </div>
      )}
    </main>
  );
}
