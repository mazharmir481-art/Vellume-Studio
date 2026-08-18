// vee.js - Vee AI Assistant for Vellume Studio

document.addEventListener('DOMContentLoaded', () => {
  // Inject Vee UI into the body
  const veeContainer = document.createElement('div');
  veeContainer.id = 'vee-ai-container';
  veeContainer.className = 'fixed bottom-6 right-6 z-[99999] font-mono-tech flex flex-col items-end pointer-events-none';
  
  veeContainer.innerHTML = `
    <!-- Chat Window (Hidden by default) -->
    <div id="vee-chat-window" class="w-[340px] h-[450px] bg-[#0A0A0A] border border-[#222222] mb-4 flex flex-col pointer-events-auto transform transition-all duration-500 origin-bottom-right scale-0 opacity-0 shadow-2xl">
      <!-- Header -->
      <div class="h-14 border-b border-[#222222] flex items-center justify-between px-4 bg-[#111111]">
        <div class="flex items-center gap-3">
          <div class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span class="font-bold text-[#F5F5F3] text-sm tracking-widest uppercase">VEE // ASSISTANT</span>
        </div>
        <button id="vee-close-btn" class="text-[#666666] hover:text-[#F5F5F3] transition-colors cursor-hover">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <!-- Chat History -->
      <div id="vee-chat-history" class="flex-grow p-4 overflow-y-auto flex flex-col gap-4 text-sm bg-[#0A0A0A]">
        <!-- Welcome Message -->
        <div class="flex flex-col gap-1 items-start max-w-[85%]">
          <span class="text-[10px] text-[#666666] uppercase tracking-wider">Vee</span>
          <div class="bg-[#1A1A1A] text-[#F5F5F3] p-3 rounded-r-lg rounded-bl-lg border border-[#333333]">
            System initialized. I am Vee, the digital assistant for Vellume Studio. How can I assist you with your high-motion infrastructure today?
          </div>
        </div>
      </div>
      
      <!-- Input Area -->
      <div class="p-3 border-t border-[#222222] bg-[#111111] flex items-center gap-2">
        <input type="text" id="vee-input-field" placeholder="INITIALIZE QUERY..." class="flex-grow bg-transparent border-none outline-none text-[#F5F5F3] text-xs uppercase placeholder-[#444444] px-2 h-8" autocomplete="off">
        <button id="vee-send-btn" class="bg-[#F5F5F3] text-[#0A0A0A] w-8 h-8 flex items-center justify-center hover:bg-[#CCCCCC] transition-colors cursor-hover">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Floating Action Button -->
    <button id="vee-fab" class="w-14 h-14 bg-[#F5F5F3] border border-[#0A0A0A] rounded-full flex items-center justify-center shadow-lg pointer-events-auto hover:scale-105 transition-transform duration-300 group cursor-hover relative overflow-hidden">
      <!-- Glow effect behind icon -->
      <div class="absolute inset-0 bg-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
      
      <!-- V Icon -->
      <span class="font-heading font-black text-2xl text-[#0A0A0A] relative z-10 group-hover:text-emerald-600 transition-colors duration-300">V</span>
      
      <!-- Notification Dot -->
      <div class="absolute top-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#F5F5F3] animate-pulse"></div>
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
    
    const wrapper = document.createElement('div');
    wrapper.className = `flex flex-col gap-1 items-${sender === 'user' ? 'end' : 'start'} max-w-[85%] ${sender === 'user' ? 'self-end' : 'self-start'}`;
    
    const label = document.createElement('span');
    label.className = 'text-[10px] text-[#666666] uppercase tracking-wider';
    label.innerText = sender === 'user' ? 'GUEST' : 'Vee';
    
    const bubble = document.createElement('div');
    if (sender === 'user') {
      bubble.className = 'bg-[#F5F5F3] text-[#0A0A0A] p-3 rounded-l-lg rounded-br-lg border border-[#CCCCCC] font-medium';
    } else {
      bubble.className = 'bg-[#1A1A1A] text-[#F5F5F3] p-3 rounded-r-lg rounded-bl-lg border border-[#333333]';
    }
    bubble.innerText = text;
    
    wrapper.appendChild(label);
    wrapper.appendChild(bubble);
    chatHistory.appendChild(wrapper);
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
  };
  
  const handleSend = () => {
    const text = inputField.value;
    if (!text.trim()) return;
    
    // Add user message
    addMessage(text, 'user');
    inputField.value = '';
    
    // Simulate Vee thinking
    setTimeout(() => {
      addMessage("I am currently in development mode. System full capabilities will be online shortly. Please direct inquiries to hello@vellumestudio.com.au.", 'vee');
    }, 1000);
  };
  
  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
