// vee.js - Vee AI Assistant for Vellume Studio (Client-Side)

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
      #vee-chat-history::-webkit-scrollbar { display: none; }
      #vee-chat-history { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
    <!-- Chat Window (Hidden by default) -->
    <div id="vee-chat-window" class="w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] h-[50vh] sm:h-[460px] max-h-[500px] bg-[#0A0A0A]/80 backdrop-blur-2xl border border-white/10 mb-4 flex flex-col pointer-events-auto transform transition-all duration-500 origin-bottom-right scale-0 opacity-0 shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden">
      <!-- Header -->
      <div class="h-14 sm:h-16 border-b border-white/5 flex items-center justify-between px-5 sm:px-6 bg-transparent">
        <div class="flex items-center gap-2.5">
          <img src="./images/vee-logo.png" alt="Vee Logo" class="w-8 h-8 object-contain">
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
        <div id="vee-welcome-state" class="flex flex-col items-center text-center gap-4 pt-6 sm:pt-8 pb-4">
          <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-white/10 bg-[#111111] flex items-center justify-center p-2 shadow-lg overflow-hidden">
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
      <img src="./images/vee-logo.png" alt="Vee Logo" class="w-full h-full object-contain p-1.5 sm:p-2 relative z-10 transition-transform duration-300 group-hover:scale-110 filter brightness-200">
    </button>
  `;
  
  document.body.appendChild(veeContainer);
  
  // --- CLIENT-SIDE RESPONSE ENGINE ---
  const responses = [
    {
      keywords: ['hello', 'hi', 'hey', 'howdy', 'sup', 'yo', 'g\'day', 'gday'],
      replies: [
        "Welcome to Vellume Studio. How can I assist you today? Whether it's web development, branding, or design -- I'm here to help.",
        "Hey there. I'm Vee, the digital concierge for Vellume Studio. What can I help you with?",
        "Hello. Good to have you here. Ask me anything about our services, process, or how to get started."
      ]
    },
    {
      keywords: ['price', 'pricing', 'cost', 'how much', 'budget', 'quote', 'rate', 'rates', 'package', 'packages', 'affordable', 'expensive', 'cheap', 'investment'],
      replies: [
        "Every project is unique, so we tailor pricing to your specific scope. Reach out to hello@vellumestudio.com.au or use our Inquiry form and we'll provide a detailed proposal within 24 hours.",
        "We don't do cookie-cutter pricing. Each build is scoped individually based on complexity, timeline, and deliverables. Drop us a line at hello@vellumestudio.com.au for a custom quote.",
        "Our projects typically range based on scope and complexity. For an accurate estimate, submit an inquiry through our booking page or email hello@vellumestudio.com.au directly."
      ]
    },
    {
      keywords: ['service', 'services', 'offer', 'what do you do', 'capabilities', 'what can you', 'help with'],
      replies: [
        "Vellume Studio specialises in four core pillars: Branding and Identity, UX/UI Design, Web Development, and 3D / Motion. We also offer Social Media Management, Digital Marketing, SEO Services, and Video Production.",
        "We build high-performance digital infrastructure. Our services span branding, UX/UI design, full-stack web development, 3D motion graphics, SEO, social media management, and video production.",
        "From brand identity systems to 60FPS web builds and cinematic 3D renders -- we cover the full spectrum. Check out the Services section on this page for the full breakdown."
      ]
    },
    {
      keywords: ['contact', 'email', 'reach', 'get in touch', 'talk', 'call', 'phone', 'message'],
      replies: [
        "You can reach us directly at hello@vellumestudio.com.au or submit a detailed inquiry through our booking page. We typically respond within 24 hours.",
        "The best way to get in touch is via email at hello@vellumestudio.com.au. Alternatively, click the Inquire button on our site to fill out a project brief.",
        "Drop us an email at hello@vellumestudio.com.au or head to our booking page to submit your project details. We'll get back to you promptly."
      ]
    },
    {
      keywords: ['location', 'where', 'based', 'adelaide', 'australia', 'office', 'address'],
      replies: [
        "Vellume Studio is based in Adelaide, South Australia. We work with clients both locally and globally.",
        "We operate out of Adelaide, Australia, but we serve clients worldwide. Geography is never a barrier to great work.",
        "Our home base is Adelaide, South Australia. We collaborate with clients across Australia and internationally through remote workflows."
      ]
    },
    {
      keywords: ['portfolio', 'work', 'projects', 'examples', 'case study', 'case studies', 'showcase', 'previous', 'past work', 'clients'],
      replies: [
        "You can see a selection of our recent builds in the 'Selected Builds' section on this page. Each card showcases a different project. For a deeper dive, feel free to reach out and we can walk you through our portfolio.",
        "Scroll up to the Proof of Work section to see our featured projects. If you'd like to see more or discuss specific case studies, email us at hello@vellumestudio.com.au.",
        "Our selected builds are showcased right on this page. Click through the carousel to explore. For more detailed case studies, get in touch with us directly."
      ]
    },
    {
      keywords: ['brand', 'branding', 'logo', 'identity', 'visual identity', 'brand guide', 'rebrand'],
      replies: [
        "Our branding service covers everything from logomarks and visual identity systems to full brand guidelines, typography, colour theory, and asset packs. We build brands that command attention.",
        "We create complete identity systems -- logos, brand guides, art direction, colour palettes, and typography. Every element is designed to work cohesively across all touchpoints.",
        "Whether you need a fresh brand from scratch or a strategic rebrand, we handle the full identity pipeline. Reach out via our inquiry form to discuss your brand vision."
      ]
    },
    {
      keywords: ['web', 'website', 'develop', 'development', 'build', 'code', 'frontend', 'backend', 'full stack', 'fullstack', 'app', 'application'],
      replies: [
        "We engineer high-performance websites with a focus on 60FPS motion, clean architecture, and blazing speed. Our stack includes modern frontend frameworks, headless CMS integrations, and robust API pipelines.",
        "Web development is our bread and butter. From responsive landing pages to full-stack web applications, we build with performance, SEO, and user experience at the core.",
        "Every site we build is engineered for speed, motion, and precision. We handle frontend, backend, CMS integration, and deployment. Tell us about your project at hello@vellumestudio.com.au."
      ]
    },
    {
      keywords: ['design', 'ui', 'ux', 'user experience', 'user interface', 'wireframe', 'prototype', 'figma', 'mockup'],
      replies: [
        "Our UX/UI design process includes wireframing, prototyping, user flow mapping, and polished interface design. We focus on accessibility, interaction design, and micro-animations that bring interfaces to life.",
        "Design is where strategy meets aesthetics. We create wireframes, high-fidelity prototypes, and production-ready designs with a focus on usability and visual impact.",
        "From initial wireframes to interactive prototypes, our design process is thorough and collaborative. We design for clarity, engagement, and conversion."
      ]
    },
    {
      keywords: ['3d', 'motion', 'animation', 'render', 'video', 'cinematic', 'visual effects', 'vfx', 'graphics'],
      replies: [
        "Our 3D and motion capabilities include modelling, cinematic renders, lighting FX, physics simulations, keyframe animations, and compositing. We bring static brands to life through motion.",
        "We produce high-end 3D renders, motion graphics, and cinematic visual content. Perfect for brand films, product showcases, and immersive web experiences.",
        "From product visualisations to full motion brand films, our 3D and motion team delivers cinematic quality. Let us know your vision at hello@vellumestudio.com.au."
      ]
    },
    {
      keywords: ['seo', 'search engine', 'google', 'ranking', 'organic', 'traffic'],
      replies: [
        "We bake SEO into every build from the ground up -- semantic HTML, structured data, speed optimisation, and clean URL architecture. We also offer dedicated SEO services for ongoing growth.",
        "Our approach to SEO is technical-first: fast load times, proper heading structure, meta optimisation, and crawlable architecture. We build sites that search engines love.",
        "SEO isn't an afterthought for us. Every project includes technical SEO best practices. For ongoing SEO strategy and content optimisation, reach out to discuss a tailored plan."
      ]
    },
    {
      keywords: ['social media', 'instagram', 'socials', 'marketing', 'digital marketing', 'ads', 'advertising', 'campaign'],
      replies: [
        "We offer social media management and digital marketing services to amplify your brand presence. From content strategy to paid campaigns, we help you reach your audience.",
        "Our marketing services include social media management, content creation, and digital ad campaigns. We align every campaign with your brand identity for maximum impact.",
        "Need help with your socials or digital marketing? We manage content calendars, create branded assets, and run targeted campaigns. Email us to discuss your goals."
      ]
    },
    {
      keywords: ['timeline', 'how long', 'turnaround', 'deadline', 'when', 'duration', 'timeframe', 'delivery'],
      replies: [
        "Timelines vary based on project scope. A typical website build takes 4-8 weeks, while branding projects range from 2-4 weeks. We'll provide a detailed timeline in your project proposal.",
        "We move fast without cutting corners. Most web projects are delivered within 4-8 weeks. Branding and design projects typically take 2-4 weeks. Rush timelines are available on request.",
        "Every project gets a clear timeline in the proposal phase. We're transparent about deadlines and keep you updated at every milestone. Reach out to get a timeline estimate for your project."
      ]
    },
    {
      keywords: ['who', 'team', 'about', 'founder', 'studio', 'company', 'agency', 'vellume'],
      replies: [
        "Vellume Studio is a high-end digital infrastructure agency based in Adelaide. We specialise in premium web development, branding, UX/UI design, and 3D motion for ambitious brands.",
        "We're a boutique digital agency focused on crafting premium digital experiences. Our work spans branding, design, development, and motion -- all under one roof.",
        "Vellume Studio was built on the belief that digital should feel premium. We're a team of designers, developers, and strategists who obsess over the details."
      ]
    },
    {
      keywords: ['book', 'booking', 'inquiry', 'inquire', 'start', 'begin', 'project', 'hire', 'work together', 'collaborate'],
      replies: [
        "Ready to start? Head to our booking page by clicking the 'Inquire' button, or email us directly at hello@vellumestudio.com.au with your project details. We'll take it from there.",
        "We'd love to work with you. Submit your project brief through our inquiry form or shoot us an email at hello@vellumestudio.com.au. We'll respond within 24 hours.",
        "Let's build something exceptional. Click the Inquire button on this page to fill out a project brief, or email hello@vellumestudio.com.au to get the conversation started."
      ]
    },
    {
      keywords: ['thank', 'thanks', 'cheers', 'appreciate', 'awesome', 'great', 'perfect', 'cool'],
      replies: [
        "Glad I could help. If you have any other questions, I'm right here. Otherwise, feel free to reach out to the team at hello@vellumestudio.com.au.",
        "Anytime. Don't hesitate to ask if anything else comes to mind. We're always here to help.",
        "You're welcome. If you're ready to move forward, the Inquire button is just a click away. Otherwise, I'm here whenever you need me."
      ]
    },
    {
      keywords: ['bye', 'goodbye', 'later', 'see you', 'cya', 'take care'],
      replies: [
        "Take care. Remember, hello@vellumestudio.com.au is always open if you need us. Until next time.",
        "See you around. When you're ready to start your project, we'll be here. Have a great day.",
        "Until next time. Feel free to come back anytime. The team at Vellume Studio is always ready to help."
      ]
    }
  ];

  const fallbackReplies = [
    "That's a great question. For the most detailed answer, I'd recommend reaching out directly to our team at hello@vellumestudio.com.au -- they'll be able to help you out.",
    "I want to make sure you get the best answer possible. Drop the team an email at hello@vellumestudio.com.au and they'll get back to you within 24 hours.",
    "I appreciate the question. For something this specific, our team can give you a much better answer. Reach out at hello@vellumestudio.com.au or use the Inquire button above.",
    "Good question. While I can handle the basics, our team is best equipped to dive deeper. Email hello@vellumestudio.com.au or submit an inquiry through the booking page."
  ];

  const getReply = (message) => {
    const lower = message.toLowerCase().trim();
    
    // Find matching response category
    for (const category of responses) {
      for (const keyword of category.keywords) {
        if (lower.includes(keyword)) {
          const replies = category.replies;
          return replies[Math.floor(Math.random() * replies.length)];
        }
      }
    }
    
    // Fallback
    return fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
  };

  // --- UI LOGIC ---
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
  
  const handleSend = () => {
    const text = inputField.value;
    if (!text.trim()) return;
    
    // Add user message
    addMessage(text, 'user');
    inputField.value = '';
    
    // Show thinking state
    inputField.disabled = true;
    inputField.placeholder = "VEE IS THINKING...";
    
    // Simulate a natural typing delay (600-1200ms)
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const reply = getReply(text);
      addMessage(reply, 'vee');
      
      inputField.disabled = false;
      inputField.placeholder = "Message Vee...";
      inputField.focus();
    }, delay);
  };
  
  sendBtn.addEventListener('click', handleSend);
  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
