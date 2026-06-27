import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import ChatWindow from './components/ChatWindow';
import CheckoutDrawer from './components/CheckoutDrawer';
import TechStackPage from './components/TechStackPage';


/**
 * Main Application Component for the Kapruka AI Shopping Assistant.
 * Manages global states (chat history, shopping cart, rate limits) 
 * and handles all API communication with the Python/FastAPI backend.
 */
function App() {
  // 💾 State: Chat History & Cart
  // Initialized with a lazy loading function to pull from localStorage.
  // This prevents catastrophic data loss if the user accidentally refreshes the browser.
  const [messages, setMessages] = useState([]);
  
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('kapruka_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isChatStarted, setIsChatStarted] = useState(() => {
    return localStorage.getItem('kapruka_messages') ? true : false;
  });
  const [isWelcomeVisible, setIsWelcomeVisible] = useState(() => {
    return localStorage.getItem('kapruka_messages') ? false : true;
  });
  const [showTechStack, setShowTechStack] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(true);
  const [shareToast, setShareToast] = useState(false);
  const lastSpokenIdRef = useRef(null);

  const speakText = (text) => {
    try {
      if (!('speechSynthesis' in window)) return;
      window.speechSynthesis.cancel();

      let cleanText = text
        .replace(/https?:\/\/[^\s]+/g, '')
        .replace(/\[CATEGORY:[^\]]+\]/g, '')
        .replace(/[*#_~`>|-]/g, '')
        .replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => 
        v.name.toLowerCase().includes('female') ||
        v.name.toLowerCase().includes('google uk english female') ||
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('sri lanka') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('victoria')
      );

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech synthesis error:", e);
    }
  };

  useEffect(() => {
    if (!isVoiceMode || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && (lastMsg.role === 'agent' || lastMsg.role === 'assistant')) {
      if (lastSpokenIdRef.current !== lastMsg.id) {
        lastSpokenIdRef.current = lastMsg.id;
        speakText(lastMsg.content);
      }
    }
  }, [messages, isVoiceMode]);

  useEffect(() => {
    if (!isChatStarted) {
      const timer = setTimeout(() => setIsWelcomeVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isChatStarted]);

  // ⏳ Effect: Rate-Limit Cooldown Timer
  // If the backend returns a 429 Quota Exceeded error, it sets the cooldown state.
  // This effect safely ticks down the cooldown by 1 every second.
  // A strict closure cleanup (clearInterval) prevents memory leaks and overlapping intervals.
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // 💾 Effect: Local Storage Syncing
  // Automatically syncs the messages and cart to the browser's local storage 
  // every time they are updated.
  useEffect(() => {
    localStorage.setItem('kapruka_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('kapruka_cart', JSON.stringify(cart));
  }, [cart]);

  const handleNewChat = async () => {
    try {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    } catch (e) {}
    setMessages([]);
    setCart([]);
    setIsChatStarted(false);
    setIsCheckoutOpen(false);
    setCooldown(0);
    localStorage.removeItem('kapruka_messages');
    localStorage.removeItem('kapruka_cart');
    try {
      await fetch('http://127.0.0.1:8000/reset-session', { method: 'POST' });
    } catch (e) {
      console.error("Failed to reset session:", e);
    }
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleAddToCart = (product, event) => {
    if (event && event.clientX && event.clientY) {
      confetti({ particleCount: 100, spread: 70, origin: { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight } });
    } else {
      confetti({ particleCount: 100, spread: 70 });
    }
    setCart(prev => {
      const existing = prev.find(item => item.name === product.name);
      if (existing) {
        return prev.map(item => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCheckoutOpen(true);
  };

  const handleShareCart = () => {
    const mockUrl = `https://www.kapruka.com/share?items=${cart.map(i => i.id || encodeURIComponent(i.name)).join(',')}`;
    navigator.clipboard.writeText(mockUrl);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 3000);
  };

  const handleUpdateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
    } else {
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item));
    }
  };

  /**
   * Handles sending the user's message to the FastAPI backend.
   * Manages the "typing" indicator, error handling, and parses the structured JSON payload
   * (including products, category targets, and rate limits) returned by Gemini.
   * 
   * @param {string} text - The raw text payload from the user.
   */
  const handleAudioUpload = async (base64Audio) => {
    setIsTranscribing(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio_data: base64Audio })
      });
      if (!response.ok) throw new Error("Transcription failed");
      const data = await response.json();
      return data.text || "";
    } catch (e) {
      console.error("Audio upload error:", e);
      alert("Failed to transcribe audio. Please try again.");
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSendMessage = async (text) => {
    const newMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      products: []
    };

    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    const fullHistory = [...messages, { role: 'user', content: text }];

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          chat_history: fullHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let rawReply = data.reply || "Sorry, I couldn't process that request.";
      
      // Clean up any remaining markdown asterisks or formatting from the text
      rawReply = rawReply.replace(/\*\*/g, '').trim();

      // 🚦 Rate Limit Trap
      // If the backend signals a rate limit, immediately lock the UI using the provided retry timer.
      if (data.error_type === 'rate_limit') {
        setCooldown(data.retry_after || 60);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: rawReply,
        products: data.products || [],
        categoryTarget: data.category_target || null
      }]);
    } catch (error) {
      console.error("Error communicating with backend:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: "Sorry, there was an error communicating with the Kapruka server.",
        products: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };
  const handleConfirmEdit = async (messageId, updatedText) => {
    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return;
    
    const truncated = messages.slice(0, index);
    const newEditedMessage = { id: messageId, role: 'user', content: updatedText, products: [] };
    const updatedHistory = [...truncated, newEditedMessage];
    setMessages(updatedHistory);
    
    setIsTyping(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: updatedText,
          chat_history: updatedHistory
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      let rawReply = data.reply || "Sorry, I couldn't process that request.";
      rawReply = rawReply.replace(/\*\*/g, '').trim();

      if (data.error_type === 'rate_limit') {
        setCooldown(data.retry_after || 60);
      }

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: rawReply,
        products: data.products || [],
        categoryTarget: data.category_target || null
      }]);
    } catch (error) {
      console.error("Error re-generating chat:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'agent',
        content: "Sorry, there was an error communicating with the Kapruka server.",
        products: []
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleTestEasterEgg = () => {
    setShowTechStack(false);
    setIsWelcomeVisible(false);
    setIsChatStarted(true);
    handleSendMessage("Kapruka owner kauda?");
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile md:px-margin-desktop h-16 bg-deep-purple shadow-lg">
        <div className="flex items-center gap-2">
          <img alt="Kapruka" className="h-8 md:h-10 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZn0Mxv0J-tKxyh7PoZXz5YG8T0Zlc--njZTW9jWTxjZaghgd90UNXOJeV76H9qrSkATHLT3XYn_qTjO8uX3iGxAGN-5oljPqhEMzF0al_dGF56y1E5fh4gFEWzzrmvp0dAYnU4jDCKFrH_01zZ75lPQ-tVyrlvbslANesGEZOdy1i2YbLmhC9mcPPdN4gmMX6qgpeB_5EO1jK9vXcTbjYTb2xrLzZB2nQY64bg2idNMrT1FIDqN8d6rpxKdFADLMGc-VECcUquAY" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              try {
                if (isVoiceMode && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
              } catch (e) {}
              setIsVoiceMode(prev => !prev);
            }}
            title="Toggle Voice"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-sm text-white"
          >
            <span className="text-lg">{isVoiceMode ? '🔊' : '🔇'}</span>
          </button>
          <button
            onClick={() => setShowTechStack(prev => !prev)}
            title="Behind the Scenes"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-sm text-white"
          >
            <span className="text-lg">🚀</span>
          </button>
          <button 
            onClick={handleNewChat}
            title="New Chat"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-sm text-white"
          >
            <span className="material-symbols-outlined text-white">add</span>
          </button>
          <div className="relative w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer shadow-sm" onClick={() => setIsCheckoutOpen(prev => !prev)} title="Shopping Cart">
            <span className="material-symbols-outlined text-white">shopping_cart</span>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent-yellow text-on-secondary-fixed text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-deep-purple">
                {cartItemCount}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Interactive HTML5 Canvas Antigravity Particle Background */}
      <InteractiveParticles />

      {/* Floating Shareable Cart UI */}
      {cart.length > 0 && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-500">
          <button
            onClick={handleShareCart}
            className="px-6 py-2.5 bg-white/80 backdrop-blur-md border border-purple-200/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-purple-900 font-bold text-xs sm:text-sm flex items-center gap-2 hover:bg-white hover:scale-105 transition-all active:scale-95 cursor-pointer"
          >
            <span>🛒 {cart.length} {cart.length === 1 ? 'Item' : 'Items'} Selected - Share Cart</span>
            {shareToast && <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px] ml-1 animate-pulse">Link Copied! ✨</span>}
          </button>
        </div>
      )}

      {/* 🔮 Glassmorphism App Layout */}
      <div className="flex w-full overflow-hidden min-h-[calc(100vh-64px)] mt-16 relative">
        {/* Premium Mesh Background Glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-200/30 rounded-full blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-200/20 rounded-full blur-[120px] pointer-events-none z-0" />

        {showTechStack && (
          <TechStackPage 
            onClose={() => setShowTechStack(false)} 
            onTestEasterEgg={handleTestEasterEgg} 
          />
        )}
        {/* Main Chat Container - Shrinks when Drawer opens */}
        <div className={`flex-1 transition-all duration-400 ease-in-out relative z-10 ${isCheckoutOpen ? 'md:pr-[400px]' : ''}`}>
           <ChatWindow 
            messages={messages} 
            onAddToCart={handleAddToCart}
            onSendMessage={handleSendMessage}
            onConfirmEdit={handleConfirmEdit}
            isTyping={isTyping}
            isCheckoutOpen={isCheckoutOpen}
            cooldown={cooldown}
            onAudioUpload={handleAudioUpload}
            isTranscribing={isTranscribing}
          />
        </div>

        <CheckoutDrawer 
          isOpen={isCheckoutOpen} 
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          updateQuantity={handleUpdateQuantity}
        />

        <div className="fixed bottom-24 right-4 md:hidden z-40">
          <button className="w-14 h-14 bg-accent-yellow text-deep-purple rounded-full shadow-2xl flex items-center justify-center animate-bounce" onClick={() => setIsCheckoutOpen(true)}>
            <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>shopping_bag</span>
          </button>
        </div>

        {!isChatStarted && (
          <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/20 backdrop-blur-sm overflow-y-auto transition-opacity duration-500 ${isWelcomeVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white/95 border border-purple-100 shadow-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full my-auto text-center transition-all duration-500 ${isWelcomeVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-full shadow-lg overflow-hidden border border-purple-100">
                <img alt="Kapruka" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBVIabXJxRrTsz2PWJDkfYNmQS3EHsueoGTfIh3TXRmOTUjHDZL-dIC_MC9gvU_Cn3nI5rIU6zN1tImvBVQBAQvQDLrYNOfAEHktNnPF2uhJjS0BQHuIUwgHuKOEtw9U3mgcHCSzfrJmaCk9pw7zve8CzxJrudJ8at_nU7tfLhXm0bV73HFhmMELb7Xk1XC48P5UEskzAWO-gKjfMbe6aKP3QDL8AX3toYQf-bGKr_sHQgZdgwTe5bkJFS9eewGZd4f9c4qY6fz74" />
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-deep-purple mb-2">
                Welcome to Kapruka AI
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mb-4 sm:mb-6">
                Your personal AI shopping assistant for everything Kapruka. Let's make gifting magical.
              </p>
              
              <div className="space-y-2 sm:space-y-3 text-left max-w-sm mx-auto mb-4 sm:mb-6">
                <div className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/50 shadow-sm border border-white/60">
                  <span className="text-xl">🗣️</span>
                  <div>
                    <h3 className="font-semibold text-on-surface text-xs sm:text-sm">Universal Language Support</h3>
                    <p className="text-[11px] sm:text-xs text-on-surface-variant">Chat naturally in English, Sinhala, or any language in the world.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/50 shadow-sm border border-white/60">
                  <span className="text-xl">🛍️</span>
                  <div>
                    <h3 className="font-semibold text-on-surface text-xs sm:text-sm">Smart Shopping</h3>
                    <p className="text-[11px] sm:text-xs text-on-surface-variant">Instant product searches, suggestions, and cart management.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/50 shadow-sm border border-white/60">
                  <span className="text-xl">🚚</span>
                  <div>
                    <h3 className="font-semibold text-on-surface text-xs sm:text-sm">Live Delivery Check</h3>
                    <p className="text-[11px] sm:text-xs text-on-surface-variant">Real-time delivery rates and date validation.</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setIsWelcomeVisible(false);
                  setTimeout(() => setIsChatStarted(true), 500);
                }}
                className="mt-4 sm:mt-6 w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-deep-purple text-white font-bold text-sm sm:text-base rounded-lg shadow-lg hover:shadow-deep-purple/40 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mx-auto cursor-pointer"
              >
                Get Started <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Interactive HTML5 Canvas Particle Background with Antigravity Mouse Repel Effect.
 */
function InteractiveParticles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Brand colors: purple, pink, amber with low opacity
    const colors = [
      'rgba(168, 85, 247, 0.4)', // purple
      'rgba(236, 72, 153, 0.4)', // pink
      'rgba(245, 158, 11, 0.4)', // amber
      'rgba(139, 92, 246, 0.4)'  // violet
    ];

    const particleCount = 80;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));

    const repelRadius = 100;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        // Antigravity mouse repel effect
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repelRadius && dist > 0) {
          const force = (repelRadius - dist) / repelRadius;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * force * 0.5;
          p.vy += Math.sin(angle) * force * 0.5;
        }

        // Apply friction to return to slow velocity
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Maintain minimum floating speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.2) {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > width) { p.x = width; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > height) { p.y = height; p.vy *= -1; }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-auto z-0" />;
}

export default App;
