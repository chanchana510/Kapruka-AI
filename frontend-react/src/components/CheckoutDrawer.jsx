import React, { useState, useEffect } from 'react';

/**
 * Sliding Checkout Drawer Component.
 * Manages the shopping cart UI, delivery calculations, city autocomplete, 
 * and final order submission to the Kapruka backend.
 */
export default function CheckoutDrawer({ isOpen, onClose, cart, updateQuantity }) {
  const [recipientName, setRecipientName] = useState("Samanthi Perera");
  const [address, setAddress] = useState("45/2, Flower Road");
  const [city, setCity] = useState("Colombo");
  const [selectedCity, setSelectedCity] = useState("Colombo");
  
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const [deliveryDate, setDeliveryDate] = useState(getTodayDate());
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(450);
  const [isCheckingDelivery, setIsCheckingDelivery] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + (parseInt(item.price) * item.quantity), 0);
  const total = subtotal + (cart.length > 0 ? deliveryFee : 0);

  const handleCityChange = (e) => {
    setCity(e.target.value);
    setSelectedCity(""); // Clear selection since they are typing a new search
  };

  // 🏙️ Effect: City Autocomplete & API Debounce
  // Watches the `city` input state and triggers a search against the backend `/search-cities` endpoint.
  // We use a strict 500ms debounce (`setTimeout`) to prevent spamming the backend API on every single keystroke.
  // Furthermore, an `AbortController` is attached. If the user types another letter BEFORE the 500ms fetch resolves,
  // the previous pending HTTP request is physically aborted, saving network bandwidth and preventing race conditions.
  useEffect(() => {
    if (city.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/search-cities?q=${encodeURIComponent(city)}`, {
          signal: signal
        });
        
        if (!response.ok) return;
        const data = await response.json();
        setSuggestions(data.cities || []);
        setShowSuggestions(true);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted safely');
        } else {
          console.error("City fetch error:", err);
        }
      }
    }, 500);

    return () => {
      clearTimeout(delayDebounceFn);
      controller.abort();
    };
  }, [city]);

  // 🚚 Effect: Live Delivery Fee Calculation
  // Automatically triggers whenever the cart contents, city, or delivery date changes.
  // It pings the backend to dynamically calculate the exact delivery rate via the Kapruka MCP bridge.
  // Uses a 600ms debounce to prevent rapid fire requests while the user is filling out the form.
  useEffect(() => {
    if (!selectedCity || selectedCity.trim().length === 0 || !deliveryDate || cart.length === 0) return;
    
    const checkDelivery = async () => {
      setIsCheckingDelivery(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/check-delivery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            city: selectedCity.trim(),
            delivery_date: deliveryDate,
            product_id: cart.length > 0 ? cart[0].id : ""
          })
        });
        const data = await response.json();
        if (data.delivery_fee !== undefined) {
          setDeliveryFee(data.delivery_fee);
        }
      } catch (error) {
        console.error("Failed to check delivery:", error);
      } finally {
        setIsCheckingDelivery(false);
      }
    };
    
    const timer = setTimeout(() => checkDelivery(), 600);
    return () => clearTimeout(timer);
  }, [selectedCity, deliveryDate, cart]);

  const handleCheckout = async () => {
    setIsProcessingOrder(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart,
          recipient: { name: recipientName, address: address, city: selectedCity },
          delivery: { date: deliveryDate },
          gift_message: giftMessage
        })
      });
      const data = await response.json();
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert("Failed to securely generate payment URL.");
        setIsProcessingOrder(false);
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      setIsProcessingOrder(false);
    }
  };

  return (
    <>
      {/* 🛒 Sliding Drawer Layout */}
      {/* The drawer uses Tailwind transform utilities to smoothly slide in from the right border. */}
      <aside 
        className={`fixed right-0 top-16 bottom-0 w-full md:w-[400px] bg-white shadow-[-12px_0px_32px_rgba(0,0,0,0.1)] z-40 drawer-transition flex flex-col border-l border-outline-variant/20 ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${isOpen ? 'flex' : 'hidden md:flex'}`}
        id="checkout-drawer"
      >
        <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
          <h2 className="text-xl font-bold text-on-surface">Order Summary</h2>
          <button className="p-2 hover:bg-surface-container rounded-full transition-colors md:hidden" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 hide-scrollbar">
          {cart.length === 0 ? (
            <p className="text-center text-on-surface-variant py-10">Your cart is empty.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-surface-container flex-shrink-0 overflow-hidden border border-outline-variant/20 relative">
                  {item.image && typeof item.image === 'string' && item.image.trim() !== '' && item.image.trim().toLowerCase() !== 'null' && item.image.trim().toLowerCase() !== 'undefined' ? (
                    <img alt={item.name || 'Item'} className="w-full h-full object-cover" src={item.image} onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-surface-variant to-outline-variant flex items-center justify-center">
                       <span className="material-symbols-outlined text-white">shopping_bag</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface line-clamp-1">{item.name}</p>
                  <p className="text-deep-purple font-bold">{item.price} LKR</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 border border-outline-variant rounded flex items-center justify-center hover:bg-surface-container-low">-</button>
                  <span className="text-body-md font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 border border-outline-variant rounded flex items-center justify-center hover:bg-surface-container-low">+</button>
                </div>
              </div>
            ))
          )}

          {cart.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-deep-purple">local_shipping</span>
                Delivery Details
              </h3>
              <div className="grid gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Recipient Name</label>
                  <input 
                    className="rounded-lg border-outline-variant focus:border-deep-purple focus:ring-deep-purple/20 font-body-md bg-white" 
                    type="text" 
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1 relative w-full">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">City</label>
                  <input 
                    className="rounded-lg border-outline-variant focus:border-deep-purple focus:ring-deep-purple/20 font-body-md bg-white" 
                    type="text" 
                    value={city}
                    onChange={handleCityChange}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 w-full bg-white/95 backdrop-blur-md border border-purple-200/80 rounded-xl shadow-2xl z-[99999] max-h-56 overflow-y-auto divide-y divide-gray-100/50">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setCity(suggestion);
                            setSelectedCity(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-purple-600 hover:text-white cursor-pointer transition-all duration-150 font-medium block"
                        >
                          📍 {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Address Line</label>
                  <textarea 
                    className="rounded-lg border-outline-variant focus:border-deep-purple focus:ring-deep-purple/20 font-body-md bg-white" 
                    rows="2" 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Gift Message (Optional)</label>
                  <textarea 
                    className="rounded-lg border-outline-variant focus:border-deep-purple focus:ring-deep-purple/20 font-body-md bg-white placeholder:text-on-surface-variant/50" 
                    rows="2" 
                    placeholder="Write a sweet note..."
                    value={giftMessage}
                    onChange={e => setGiftMessage(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant ml-1">Delivery Date</label>
                  <input 
                    className="rounded-lg border-outline-variant focus:border-deep-purple focus:ring-deep-purple/20 font-body-md bg-white" 
                    type="date" 
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
          
          {cart.length > 0 && (
            <div className="pt-6 border-t border-dashed border-outline-variant space-y-2">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span>
                <span>{subtotal} LKR</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span className="flex items-center gap-1">
                  Delivery Fee
                  {isCheckingDelivery && <span className="w-3 h-3 border-2 border-deep-purple border-t-transparent rounded-full animate-spin"></span>}
                </span>
                <span className={isCheckingDelivery ? 'opacity-50' : 'opacity-100'}>{deliveryFee} LKR</span>
              </div>
              <div className="flex justify-between items-baseline mt-2">
                <span className="text-lg font-bold text-on-surface">Total</span>
                <span className="text-2xl font-bold text-deep-purple">{total} LKR</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-surface-container-low border-t border-outline-variant/10">
          <button 
            disabled={cart.length === 0 || isProcessingOrder} 
            onClick={handleCheckout}
            className="w-full h-14 bg-deep-purple text-white font-bold rounded-xl shadow-lg hover:shadow-deep-purple/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessingOrder ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Locking prices &amp; generating secure invoice...</span>
              </>
            ) : (
              <>
                <span>Proceed to Payment</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </aside>
      
      {/* Backdrop for Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-black/40 glass-blur z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 block' : 'opacity-0 hidden'}`}
        onClick={onClose}
      ></div>
    </>
  );
}
