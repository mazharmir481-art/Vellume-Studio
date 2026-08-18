// vee.js - Vee AI Assistant for Vellume Studio

document.addEventListener('DOMContentLoaded', () => {
  // Inject Vee UI into the body
  const veeContainer = document.createElement('div');
  veeContainer.id = 'vee-ai-container';
  veeContainer.className = 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[99999] font-body flex flex-col items-end pointer-events-none';
  
  veeContainer.innerHTML = `
    <!-- Chat Window (Hidden by default) -->
    <div id="vee-chat-window" class="w-[calc(100vw-2rem)] sm:w-[400px] md:w-[450px] h-[75vh] sm:h-[600px] max-h-[800px] bg-[#0A0A0A] border border-[#222222] mb-4 flex flex-col pointer-events-auto transform transition-all duration-500 origin-bottom-right scale-0 opacity-0 shadow-2xl rounded-lg overflow-hidden">
      <!-- Header -->
      <div class="h-14 sm:h-16 border-b border-[#222222] flex items-center justify-between px-4 sm:px-6 bg-[#111111]">
        <div class="flex items-center gap-3">
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
      <div id="vee-chat-history" class="flex-grow p-4 sm:p-6 overflow-y-auto flex flex-col gap-5 sm:gap-6 text-sm sm:text-base bg-[#0A0A0A]">
        <!-- Welcome Message -->
        <div class="flex flex-col gap-1.5 items-start max-w-[90%]">
          <span class="text-[10px] sm:text-xs text-[#666666] uppercase tracking-wider">Vee</span>
          <div class="bg-[#1A1A1A] text-[#F5F5F3] p-3 rounded-r-lg rounded-bl-lg border border-[#333333]">
            System initialized. I am Vee, the digital assistant for Vellume Studio. How can I assist you with your high-motion infrastructure today?
          </div>
        </div>
      </div>
      
      <!-- Input Area -->
      <div class="p-3 sm:p-4 border-t border-[#222222] bg-[#111111] flex items-center gap-3">
        <input type="text" id="vee-input-field" placeholder="INITIALIZE QUERY..." class="flex-grow bg-[#0A0A0A] border border-[#222222] rounded-md outline-none text-[#F5F5F3] text-sm sm:text-base placeholder-[#555555] px-4 h-10 sm:h-12 focus:border-[#444444] transition-colors" autocomplete="off">
        <button id="vee-send-btn" class="bg-[#F5F5F3] text-[#0A0A0A] rounded-md w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:bg-[#CCCCCC] transition-colors cursor-hover flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Floating Action Button -->
    <button id="vee-fab" class="w-14 h-14 sm:w-16 sm:h-16 bg-[#0A0A0A] border-2 border-[#333333] rounded-full flex items-center justify-center shadow-2xl pointer-events-auto hover:scale-105 hover:bg-[#111111] transition-all duration-300 group cursor-hover relative overflow-hidden">
      <!-- Logo Icon -->
      <img src="./images/logo_transparent.png" alt="Vellume Logo" class="w-8 h-8 sm:w-10 sm:h-10 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110">
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
    wrapper.className = `flex flex-col gap-1.5 items-${sender === 'user' ? 'end' : 'start'} max-w-[90%] ${sender === 'user' ? 'self-end' : 'self-start'}`;
    
    const label = document.createElement('span');
    label.className = 'text-[10px] sm:text-xs text-[#666666] uppercase tracking-wider';
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
