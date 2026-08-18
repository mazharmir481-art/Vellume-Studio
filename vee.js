// vee.js - Vee AI Assistant for Vellume Studio

document.addEventListener('DOMContentLoaded', () => {
  // Inject Vee UI into the body
  const veeContainer = document.createElement('div');
  veeContainer.id = 'vee-ai-container';
  veeContainer.className = 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] font-body flex flex-col items-end pointer-events-none';
  
  veeContainer.innerHTML = `
    <style>
      @keyframes chatBubbleEnter {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .chat-bubble-anim { animation: chatBubbleEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    </style>
    <!-- Chat Window (Hidden by default) -->
    <div id="vee-chat-window" class="w-[calc(100vw-2rem)] sm:w-[400px] md:w-[450px] h-[75vh] sm:h-[600px] max-h-[800px] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 mb-4 flex flex-col pointer-events-auto transform transition-all duration-500 origin-bottom-right scale-0 opacity-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden">
      <!-- Header -->
      <div class="h-14 sm:h-16 border-b border-white/5 flex items-center justify-between px-5 sm:px-6 bg-transparent">
        <div class="flex items-center gap-2.5">
          <img src="./images/vee-logo.png" alt="Vee Logo" class="w-5 h-5 object-contain">
          <span class="font-bold text-[#F5F5F3] text-sm sm:text-base tracking-widest uppercase">Vee</span>
        </div>
        <button id="vee-close-btn" class="text-[#666666] hover:text-[#F5F5F3] transition-colors cursor-hover">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- Chat History -->
      <div id="vee-chat-history" class="flex-grow p-5 sm:p-6 overflow-y-auto flex flex-col gap-5 sm:gap-6 text-sm sm:text-base bg-transparent scroll-smooth">
        <!-- Centered Welcome State -->
        <div id="vee-welcome-state" class="flex flex-col items-center justify-center flex-grow text-center gap-4 h-full my-auto pt-8 sm:pt-12">
          <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/10 bg-[#111111] flex items-center justify-center p-4 shadow-lg overflow-hidden">
             <img src="./images/vee-logo.png" class="w-full h-full object-contain filter brightness-200">
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="text-xl sm:text-2xl font-bold text-white tracking-wide">How can I help you today?</h3>
            <p class="text-xs sm:text-sm text-[#888888]">I'm Vee, your personal assistant at Vellume Studio.</p>
          </div>
        </div>
      </div>
      
      <!-- Input Area -->
      <div class="p-4 sm:p-5 border-t border-white/5 bg-transparent flex items-center gap-3">
        <input type="text" id="vee-input-field" placeholder="Message Vee..." class="flex-grow bg-[#111111]/80 border border-white/10 rounded-full outline-none text-[#F5F5F3] text-sm sm:text-base placeholder-[#666666] px-5 h-12 focus:border-white/30 focus:bg-[#1A1A1A] transition-all shadow-inner" autocomplete="off">
        <button id="vee-send-btn" class="bg-white text-black rounded-full w-12 h-12 flex items-center justify-center hover:scale-105 transition-transform cursor-hover flex-shrink-0 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Floating Action Button -->
    <button id="vee-fab" class="w-14 h-14 sm:w-16 sm:h-16 bg-[#0A0A0A] border-2 border-[#F5F5F3] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(245,245,243,0.15)] pointer-events-auto hover:scale-105 hover:shadow-[0_0_40px_rgba(245,245,243,0.25)] transition-all duration-300 group cursor-hover relative overflow-hidden">
      <!-- Logo Icon -->
      <img src="./images/vee-logo.png" alt="Vee Logo" class="w-full h-full object-contain p-2.5 sm:p-3 relative z-10 transition-transform duration-300 group-hover:scale-110 filter brightness-200">
    </button>
  `;
  
  // Execute immediately without checking readyState (because the script is at the end of the body)
  document.body.appendChild(veeContainer);
  
  // Logic
  const fab = document.getElementById('vee-fab');
  const chatWindow = document.getElementById('vee-chat-window');
  const closeBtn = document.getElementById('vee-close-btn');
  const inputField = document.getElementById('vee-input-field');
  const sendBtn = document.getElementById('vee-send-btn');
  const chatHistory = document.getElementById('vee-chat-history');
  
  let isOpen = false;
  
  const toggleChat = () => {
    isOpen = !isOpen;
    if (isOpen) {
      chatWindow.classList.remove('scale-0', 'opacity-0');
      chatWindow.classList.add('scale-100', 'opacity-100');
      inputField.focus();
    } else {
      chatWindow.classList.remove('scale-100', 'opacity-100');
      chatWindow.classList.add('scale-0', 'opacity-0');
    }
  };
  
  fab.addEventListener('click', toggleChat);
  closeBtn.addEventListener('click', toggleChat);
  
  const addMessage = (text, sender) => {
    if (!text.trim()) return;
    
    // Remove welcome state if it exists
    const welcomeState = document.getElementById('vee-welcome-state');
    if (welcomeState) welcomeState.remove();
    
    const wrapper = document.createElement('div');
    wrapper.className = `flex flex-col gap-1.5 items-${sender === 'user' ? 'end' : 'start'} max-w-[90%] ${sender === 'user' ? 'self-end' : 'self-start'}`;
    
    const label = document.createElement('span');
    label.className = `text-[10px] sm:text-xs text-[#666666] uppercase tracking-wider ${sender === 'user' ? 'mr-1' : 'ml-1'}`;
    label.innerText = sender === 'user' ? 'GUEST' : 'Vee';
    
    const bubble = document.createElement('div');
    if (sender === 'user') {
      bubble.className = 'bg-white text-black p-4 rounded-2xl rounded-br-sm font-medium leading-relaxed shadow-md chat-bubble-anim';
    } else {
      bubble.className = 'bg-[#1A1A1A]/90 text-[#F5F5F3] p-4 rounded-2xl rounded-bl-sm border border-white/5 leading-relaxed chat-bubble-anim';
    }
    bubble.innerText = text;
    
    wrapper.appendChild(label);
    wrapper.appendChild(bubble);
    chatHistory.appendChild(wrapper);
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };
  
  const handleSend = async () => {
    const text = inputField.value;
    if (!text.trim()) return;
    
    // Add user message
    addMessage(text, 'user');
    inputField.value = '';
    
    // Disable input while waiting
    inputField.disabled = true;
    inputField.placeholder = "VEE IS THINKING...";
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      
      if (!response.ok) {
        throw new Error('API Error');
      }
      
      const data = await response.json();
      addMessage(data.reply, 'vee');
    } catch (error) {
      console.error(error);
      addMessage("I'm currently offline or experiencing a connection error. Please email hello@vellumestudio.com.au directly.", 'vee');
    } finally {
      inputField.disabled = false;
      inputField.placeholder = "INITIALIZE QUERY...";
      inputField.focus();
    }
  };
  
  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
