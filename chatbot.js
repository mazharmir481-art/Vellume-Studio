// Vel Custom Chatbot - Brutalist High-Motion Implementation
(function() {
  // Load GSAP if not already present (it should be on Vellume Studio pages)
  
  // 1. State Machine & Context (Asynchronous Context Retention)
  const state = {
    isOpen: false,
    context: {
      budget: null,
      service: null,
      escalated: false
    },
    step: 0
  };

  // 2. Brutalist Spatial UI Injection (Visual Frictionlessness)
  const injectUI = () => {
    const container = document.createElement('div');
    container.id = 'vel-chatbot-container';
    container.className = 'fixed bottom-6 right-6 z-[99999] flex flex-col items-end pointer-events-none';
    
    container.innerHTML = `
      <!-- Chat Window -->
      <div id="vel-chat-window" class="w-[420px] max-w-[95vw] h-[650px] max-h-[85vh] bg-[#0A0A0A] border-2 border-[#F5F5F3] shadow-[12px_12px_0_0_#F5F5F3] flex flex-col mb-6 pointer-events-auto origin-bottom-right scale-0 opacity-0 transition-none">
        
        <!-- Header -->
        <div class="h-20 border-b-2 border-[#222222] flex items-center justify-between px-6 bg-black">
          <div class="flex items-center gap-4">
            <div class="w-4 h-4 bg-emerald-400 rounded-none animate-pulse"></div>
            <span class="font-heading font-black tracking-tighter text-[#F5F5F3] text-2xl uppercase">VEL // SYSTEM</span>
          </div>
          <button id="vel-close-btn" class="font-mono-tech text-sm text-[#888888] hover:text-[#F5F5F3] uppercase tracking-widest cursor-pointer">[ CLOSE ]</button>
        </div>

        <!-- Chat Area -->
        <div id="vel-chat-feed" class="flex-grow overflow-y-auto p-6 space-y-8 bg-black font-body text-base text-[#CCCCCC]">
          <!-- Initial Message -->
          <div class="flex flex-col items-start w-full">
            <span class="font-mono-tech text-xs text-[#666666] mb-2">// SYSTEM_INIT</span>
            <div class="bg-[#111111] border border-[#222222] p-5 text-[#F5F5F3] max-w-[90%] font-medium text-lg leading-relaxed">
              Vellume infrastructure online. I am Vel. Are you looking to upgrade your digital presence or start a new build?
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="h-20 border-t-2 border-[#222222] flex bg-black relative">
          <div id="vel-loading" class="absolute inset-0 bg-[#0A0A0A]/90 flex items-center justify-center font-mono-tech text-sm text-emerald-400 tracking-widest hidden z-10">
            [ PROCESSING ]
          </div>
          <input type="text" id="vel-input" class="w-full h-full bg-transparent text-[#F5F5F3] px-6 font-body text-lg focus:outline-none placeholder:text-[#444444]" placeholder="Type your objective..." autocomplete="off">
          <button id="vel-send-btn" class="h-full px-8 bg-[#F5F5F3] text-[#0A0A0A] font-heading font-black text-xl tracking-tighter uppercase hover:bg-emerald-400 transition-colors">SEND</button>
        </div>
      </div>

      <!-- Launcher Button -->
      <button id="vel-launcher" class="w-20 h-20 bg-[#0A0A0A] border-2 border-[#F5F5F3] text-[#F5F5F3] rounded-full shadow-[6px_6px_0_0_#F5F5F3] flex items-center justify-center hover:bg-emerald-400 hover:text-[#0A0A0A] hover:scale-105 transition-all duration-300 pointer-events-auto group relative">
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full animate-ping group-hover:hidden"></div>
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full group-hover:hidden"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square" stroke-linejoin="miter">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </button>
    `;
    
    document.body.appendChild(container);
  };

  // 3. Logic & Conversion (Zero-Hallucination, Conversion-Driven, Escalation)
  const processInput = (text) => {
    const lowerText = text.toLowerCase();
    let response = "";
    let delay = 300; // Sub-800ms latency simulated

    if (state.context.escalated) {
      return; // Stop processing if handed off
    }

    // Step 0: Initial intent extraction
    if (state.step === 0) {
      if (lowerText.includes('upgrade') || lowerText.includes('rebuild') || lowerText.includes('fix')) {
        state.context.service = 'upgrade';
        response = "Acknowledged. Upgrading legacy systems is our core competency. Do you have a budget allocated for this transformation? (e.g., $10k+)";
        state.step = 1;
      } else if (lowerText.includes('new') || lowerText.includes('start') || lowerText.includes('build')) {
        state.context.service = 'new_build';
        response = "A blank canvas. Optimal for 60FPS engineering. What is the approximate budget for this build?";
        state.step = 1;
      } else if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much')) {
        response = "Custom digital infrastructure begins at $15k AUD. Our builds are investments, not expenses. Does this align with your capital allocation?";
        state.step = 1;
      } else {
        response = "I operate strictly within digital infrastructure boundaries. To direct you properly, are we discussing a new build or an upgrade?";
      }
    } 
    // Step 1: Budget & Qualification
    else if (state.step === 1) {
      // Capture budget if numbers mentioned (Asynchronous Context Retention)
      const match = lowerText.match(/\\$?\\d+[,.]?\\d*k?/);
      if (match) {
        state.context.budget = match[0];
        response = `Recorded budget matrix: ${state.context.budget}. This parameters is viable. To initiate a technical consultation, please provide your direct phone number.`;
        state.step = 2;
      } else if (lowerText.includes('yes') || lowerText.includes('yep') || lowerText.includes('align')) {
        response = "Excellent. To initiate a technical consultation and lock in the architecture, please provide your direct phone number.";
        state.step = 2;
      } else {
        // Seamless Escalation trigger on objection
        state.context.escalated = true;
        response = "That requires a custom engineering assessment. What is the best phone number for our lead architect to reach you at directly?";
        state.step = 2;
      }
    }
    // Step 2: Lead Capture & Native API Execution
    else if (state.step === 2) {
      // Basic phone number validation
      if (lowerText.replace(/\\D/g,'').length >= 8) {
        // Mock Native API Execution
        executeWebhook(text);
        response = "Lead secured. A Vellume architect will initiate contact within 24 hours. Terminating session.";
        state.context.escalated = true; // Lock chat
        setTimeout(() => closeChat(), 4000);
      } else {
        response = "Error: Invalid phone format. Please provide a standard numerical sequence.";
      }
    }

    return { response, delay };
  };

  const executeWebhook = (phone) => {
    console.log("[VEL] Executing Native POST payload...");
    const payload = {
      source: 'vel_bot',
      service: state.context.service || 'unknown',
      budget: state.context.budget || 'unknown',
      phone: phone,
      timestamp: new Date().toISOString()
    };
    
    // Fire and forget (Sub-800ms)
    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }).then(() => console.log("[VEL] CRM Webhook executed successfully."));
  };

  // 4. Rendering & GSAP Integration
  const appendMessage = (text, isUser) => {
    const feed = document.getElementById('vel-chat-feed');
    const msgBlock = document.createElement('div');
    msgBlock.className = `flex flex-col w-full ${isUser ? 'items-end' : 'items-start'} opacity-0 translate-y-4`;
    
    const meta = document.createElement('span');
    meta.className = 'font-mono-tech text-[10px] text-[#666666] mb-1';
    meta.innerText = isUser ? '// CLIENT_INPUT' : '// SYSTEM_RESPONSE';
    
    const bubble = document.createElement('div');
    bubble.className = `p-4 max-w-[90%] font-medium text-[#F5F5F3] ${isUser ? 'bg-[#333333] border-l-2 border-emerald-400 text-right' : 'bg-[#111111] border border-[#222222]'}`;
    bubble.innerText = text;
    
    msgBlock.appendChild(meta);
    msgBlock.appendChild(bubble);
    feed.appendChild(msgBlock);
    
    // Smooth GSAP reveal
    if (typeof gsap !== 'undefined') {
      gsap.to(msgBlock, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
    } else {
      msgBlock.style.opacity = '1';
      msgBlock.style.transform = 'translateY(0)';
      msgBlock.style.transition = 'all 0.3s ease';
    }
    
    // Auto-scroll
    feed.scrollTop = feed.scrollHeight;
  };

  const handleInput = () => {
    const inputEl = document.getElementById('vel-input');
    const text = inputEl.value.trim();
    if (!text || state.context.escalated && state.step > 2) return; // Block if finished
    
    inputEl.value = '';
    appendMessage(text, true);
    
    const loadingEl = document.getElementById('vel-loading');
    loadingEl.classList.remove('hidden');
    
    const { response, delay } = processInput(text);
    
    setTimeout(() => {
      loadingEl.classList.add('hidden');
      if (response) appendMessage(response, false);
    }, delay); // Sub-800ms Latency
  };

  // 5. Interactions
  const openChat = () => {
    if (state.isOpen) return;
    state.isOpen = true;
    const windowEl = document.getElementById('vel-chat-window');
    const launcherEl = document.getElementById('vel-launcher');
    
    if (typeof gsap !== 'undefined') {
      gsap.to(launcherEl, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' });
      gsap.to(windowEl, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' });
    } else {
      windowEl.style.transform = 'scale(1)';
      windowEl.style.opacity = '1';
    }
    document.getElementById('vel-input').focus();
  };

  const closeChat = () => {
    if (!state.isOpen) return;
    state.isOpen = false;
    const windowEl = document.getElementById('vel-chat-window');
    const launcherEl = document.getElementById('vel-launcher');
    
    if (typeof gsap !== 'undefined') {
      gsap.to(windowEl, { scale: 0, opacity: 0, duration: 0.3, ease: 'power2.in' });
      gsap.to(launcherEl, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)', delay: 0.2 });
    } else {
      windowEl.style.transform = 'scale(0)';
      windowEl.style.opacity = '0';
    }
  };

  // Initialization
  const initChatbot = () => {
    injectUI();
    
    document.getElementById('vel-launcher').addEventListener('click', openChat);
    document.getElementById('vel-close-btn').addEventListener('click', closeChat);
    
    const inputEl = document.getElementById('vel-input');
    const sendBtn = document.getElementById('vel-send-btn');
    
    sendBtn.addEventListener('click', handleInput);
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleInput();
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initChatbot);
  } else {
    initChatbot();
  }

})();
