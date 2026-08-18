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
  
  // --- INTELLIGENT CLIENT-SIDE RESPONSE ENGINE ---
  // Tracks used replies to avoid repetition within a session
  const usedReplies = new Set();
  let lastCategory = null;
  
  // Intent patterns - detect what the user WANTS to do vs asking about
  const intentPatterns = [
    {
      id: 'want_website',
      patterns: [/i want .*(website|site|web|page|landing)/, /i need .*(website|site|web|page|landing)/, /make .*(website|site|web|page)/, /build .*(website|site|web|page)/, /create .*(website|site|web|page)/, /looking for .*(website|site|web)/, /get .*(website|site|web|page)/, /new (website|site|web|page)/],
      replies: [
        "You're in the right place. We build high-performance websites tailored to your brand and goals. To get started, submit a brief through our booking page or email hello@vellumestudio.com.au with details about your project -- what industry you're in, what you need, and your timeline. We'll come back with a proposal.",
        "We'd love to build that for you. Every website we create is engineered for speed, design excellence, and conversion. The first step is a quick project brief -- head to our Inquire page or email hello@vellumestudio.com.au and tell us about your vision.",
        "Let's make it happen. Whether it's a single landing page or a full-scale web application, we handle the entire process from design to deployment. Email us at hello@vellumestudio.com.au or click Inquire to kick things off.",
        "That's what we do best. We'll work with you from concept to launch -- strategy, design, development, and beyond. Share your project details via the Inquire button or email hello@vellumestudio.com.au to start the conversation.",
        "Perfect -- web development is at the core of what we do. Tell us more about what you're envisioning. You can submit a project brief through our booking page, or simply email hello@vellumestudio.com.au with the details."
      ]
    },
    {
      id: 'want_branding',
      patterns: [/i want .*(brand|logo|identity|rebrand)/, /i need .*(brand|logo|identity|rebrand)/, /make .*(brand|logo|identity)/, /create .*(brand|logo|identity)/, /design .*(brand|logo|identity)/, /looking for .*(brand|logo)/, /new (brand|logo|identity)/],
      replies: [
        "We build brand identities that command attention. From logomarks to full brand systems, we handle the entire pipeline. Email hello@vellumestudio.com.au or click Inquire to share your vision, and we'll craft a proposal.",
        "A strong brand is the foundation of everything. We create complete identity systems -- logos, colour palettes, typography, brand guides, and more. Let's discuss your vision at hello@vellumestudio.com.au.",
        "We'd love to bring your brand to life. Our process covers research, strategy, visual identity, and a complete brand guide you can use across all touchpoints. Start by reaching out at hello@vellumestudio.com.au.",
        "Branding is one of our specialities. Whether you're building from scratch or refreshing an existing identity, we'll create something that stands out. Submit a brief through our Inquire page to get started."
      ]
    },
    {
      id: 'want_design',
      patterns: [/i want .*(design|redesign|mockup|prototype|ui|ux)/, /i need .*(design|redesign|mockup|prototype|ui|ux)/, /looking for .*(designer|design help)/],
      replies: [
        "Great -- design is where we really shine. We create wireframes, prototypes, and polished interfaces that look stunning and convert. Tell us about your project at hello@vellumestudio.com.au.",
        "We approach design strategically -- every pixel serves a purpose. From user research to high-fidelity prototypes, we'll design something that exceeds your expectations. Reach out via the Inquire button to get started.",
        "Whether it's a full UX overhaul or a fresh UI for an existing product, we've got you covered. Submit your project details through our booking page and we'll put together a design proposal.",
        "Design is at the heart of what we do. Our process is collaborative and thorough -- wireframes, user flows, prototypes, and final polished designs. Email hello@vellumestudio.com.au with your project details."
      ]
    },
    {
      id: 'want_help',
      patterns: [/can you help/, /i need help/, /help me/, /assist me/, /i'm looking for help/, /need assistance/],
      replies: [
        "Absolutely. Tell me more about what you need and I'll point you in the right direction. We cover web development, branding, UX/UI design, 3D motion, SEO, and digital marketing.",
        "Of course. What kind of project are you working on? I can give you an overview of how Vellume Studio can help, or you can go straight to the Inquire page to submit a brief.",
        "That's what I'm here for. Give me a bit more detail about what you're after and I'll guide you from there. Or if you already know what you need, hit the Inquire button to get started."
      ]
    }
  ];

  const responses = [
    {
      id: 'greeting',
      keywords: ['hello', 'hi', 'hey', 'howdy', 'sup', 'yo', 'g\'day', 'gday', 'good morning', 'good afternoon', 'good evening', 'whats up', 'what\'s up'],
      weight: 2,
      replies: [
        "Welcome to Vellume Studio. I'm Vee, your digital concierge. Ask me anything about our services, process, or how to get started with a project.",
        "Hey there. I'm Vee -- here to help you navigate everything Vellume Studio has to offer. What's on your mind?",
        "Hello. Great to have you here. Whether you're exploring our services or ready to start a project, I'm here to guide you.",
        "Welcome. I'm Vee, your guide to Vellume Studio. How can I help you today? Feel free to ask about anything -- services, pricing, timelines, or getting started."
      ]
    },
    {
      id: 'pricing',
      keywords: ['price', 'pricing', 'cost', 'how much', 'budget', 'quote', 'rate', 'rates', 'package', 'packages', 'affordable', 'expensive', 'cheap', 'investment', 'fee', 'fees', 'charge', 'charges', 'pay', 'payment'],
      weight: 3,
      replies: [
        "Every project is scoped individually based on complexity, features, and timeline. We don't do generic packages -- each proposal is tailored to you. Email hello@vellumestudio.com.au for a custom quote.",
        "Pricing depends on the scope of your project. A branding package differs from a full-stack web build. Reach out via the Inquire button and we'll provide a detailed, transparent proposal within 48 hours.",
        "We believe in transparent, value-based pricing. Once we understand your goals and scope, we'll put together a detailed proposal with clear deliverables and costs. Start the conversation at hello@vellumestudio.com.au.",
        "We price based on the value we deliver, not by the hour. Share your project details through our Inquire page and we'll come back with a tailored proposal that breaks everything down clearly.",
        "Our pricing is project-based and depends on what you need. Simple landing pages will differ from complex web applications. The best way to get accurate pricing is to submit a brief through the Inquire page."
      ]
    },
    {
      id: 'services_general',
      keywords: ['service', 'services', 'offer', 'what do you do', 'capabilities', 'what can you', 'help with', 'what do you offer', 'specialise', 'specialize'],
      weight: 2,
      replies: [
        "We specialise in four core areas: Branding and Identity, UX/UI Design, Web Development, and 3D / Motion. On top of that, we offer Social Media Management, Digital Marketing, SEO, and Video Production.",
        "Vellume Studio is a full-service digital agency. We handle branding, UX/UI design, high-performance web development, 3D motion graphics, SEO, digital marketing, social media, and video production.",
        "Our capabilities span the full digital spectrum. We design, build, brand, and market -- all under one roof. Scroll down to the Services section for a detailed breakdown of each offering.",
        "We build digital infrastructure for ambitious brands. That includes everything from brand identity systems and web development to 3D renders and ongoing digital marketing. Want to know more about a specific service?"
      ]
    },
    {
      id: 'contact',
      keywords: ['contact', 'email', 'reach', 'get in touch', 'talk to someone', 'call', 'phone', 'speak', 'message you', 'reach out'],
      weight: 2,
      replies: [
        "The best way to reach us is at hello@vellumestudio.com.au. You can also submit a detailed project brief through our booking page. We respond within 24 hours.",
        "You can contact us directly at hello@vellumestudio.com.au or use the Inquire button on our site. We're responsive and typically get back within one business day.",
        "Drop us an email at hello@vellumestudio.com.au with your project details. If you prefer, click the Inquire button to fill out a structured brief. Either way, we'll be in touch quickly.",
        "Email is the fastest way to reach us: hello@vellumestudio.com.au. For a more structured approach, use the Inquire form on our booking page."
      ]
    },
    {
      id: 'location',
      keywords: ['location', 'where are you', 'based', 'adelaide', 'australia', 'office', 'address', 'local', 'remote', 'in person'],
      weight: 2,
      replies: [
        "We're based in Adelaide, South Australia, but we work with clients across Australia and globally. Remote collaboration is seamless for us.",
        "Adelaide is our home base, but distance is never a barrier. We've built projects for clients across multiple time zones using streamlined remote workflows.",
        "Vellume Studio operates out of Adelaide, SA. We work both locally and remotely, so wherever you are, we can collaborate effectively.",
        "Our studio is in Adelaide, Australia. That said, many of our clients are interstate or international -- we're built for remote collaboration."
      ]
    },
    {
      id: 'portfolio',
      keywords: ['portfolio', 'examples', 'case study', 'case studies', 'showcase', 'previous work', 'past work', 'clients', 'show me', 'samples', 'see your work'],
      weight: 2,
      replies: [
        "Check out our Selected Builds section on this page -- each card showcases a real project. For a deeper portfolio walkthrough, email hello@vellumestudio.com.au and we'll share more.",
        "Scroll to the Proof of Work section to see featured projects. We can also share detailed case studies privately -- just reach out at hello@vellumestudio.com.au.",
        "Our featured work is displayed in the carousel on this page. For industry-specific examples or a more comprehensive portfolio review, get in touch and we'll set something up.",
        "You can browse our selected builds right here on the site. If you'd like to see projects specific to your industry, let us know at hello@vellumestudio.com.au."
      ]
    },
    {
      id: 'branding',
      keywords: ['brand', 'branding', 'logo', 'identity', 'visual identity', 'brand guide', 'rebrand', 'brand strategy', 'colour palette', 'color palette', 'typography'],
      weight: 2,
      replies: [
        "Our branding service covers the full identity pipeline: research, strategy, logomarks, typography, colour systems, brand guidelines, and asset production. We build brands that command attention and stay consistent across every touchpoint.",
        "We create complete identity systems from the ground up. That includes logos, brand guides, art direction, colour palettes, typography, and digital asset packs -- everything you need to present a unified brand.",
        "Whether it's a fresh brand or a strategic rebrand, we approach identity design with intent. Every element -- from your logomark to your brand voice -- is designed to work together and resonate with your audience.",
        "Branding is about more than a logo. We develop full brand ecosystems: visual identity, brand guidelines, tone of voice, and application across digital and print. It's identity built to last."
      ]
    },
    {
      id: 'webdev',
      keywords: ['website', 'web development', 'develop', 'frontend', 'backend', 'full stack', 'fullstack', 'coding', 'programming', 'html', 'css', 'javascript', 'react', 'next', 'wordpress', 'shopify', 'ecommerce', 'e-commerce', 'online store', 'landing page'],
      weight: 2,
      replies: [
        "We engineer websites with obsessive attention to performance, motion, and user experience. Our builds are fast, responsive, and built on modern architecture. We work with frameworks, headless CMS, and custom solutions.",
        "Web development is our core strength. From simple landing pages to complex web applications and e-commerce platforms, we build everything with speed, SEO, and scalability in mind.",
        "Every site we ship is optimised for 60FPS motion, fast load times, and conversion. We handle frontend, backend, CMS integration, deployment, and ongoing support.",
        "Whether you need a sleek single-page site, a full e-commerce platform, or a custom web application, we engineer it from the ground up. Our builds prioritise performance, accessibility, and design excellence.",
        "We work across the stack -- from GSAP-powered frontends to serverless backends. Every project is custom-built, not template-based. We don't cut corners on quality."
      ]
    },
    {
      id: 'design',
      keywords: ['design', 'ui design', 'ux design', 'user experience', 'user interface', 'wireframe', 'prototype', 'figma', 'mockup', 'layout', 'responsive', 'mobile design'],
      weight: 2,
      replies: [
        "Our design process starts with understanding your users and goals. We create wireframes, user flows, interactive prototypes, and polished high-fidelity designs that are ready for development.",
        "We design interfaces that are both beautiful and functional. Our process includes user research, wireframing, prototyping, design system creation, and final UI delivery with developer handoff.",
        "From initial concept to pixel-perfect handoff, our design team handles every stage. We focus on usability, accessibility, micro-animations, and creating experiences that delight users.",
        "Great design solves problems while looking stunning. We create responsive, accessible interfaces with carefully crafted interactions and animations that make your product feel alive."
      ]
    },
    {
      id: 'motion_3d',
      keywords: ['3d', 'motion', 'animation', 'render', 'cinematic', 'visual effects', 'vfx', 'motion graphics', 'modelling', 'modeling', 'shader', 'texture', 'compositing'],
      weight: 2,
      replies: [
        "Our 3D and motion team creates everything from product visualisations and brand animations to cinematic renders and full motion sequences. We bring static concepts to life with stunning visual fidelity.",
        "We produce high-end 3D content including modelling, texturing, lighting, animation, physics simulations, and compositing. Perfect for brand films, product showcases, social content, and immersive web experiences.",
        "Motion is what sets premium brands apart. We create 3D renders, motion graphics, animated logos, product visualisations, and cinematic content that elevates your brand presence.",
        "From keyframe animations to full cinematic sequences, our motion capabilities are built for brands that want to stand out. Tell us your vision and we'll bring it to life."
      ]
    },
    {
      id: 'video',
      keywords: ['video', 'video production', 'film', 'filming', 'shoot', 'content creation', 'videography', 'editing'],
      weight: 2,
      replies: [
        "We offer video production services including concept development, filming, editing, and post-production. From brand films to social media content, we create video that captures attention.",
        "Our video production covers the full pipeline: scripting, shooting, editing, colour grading, and delivery. We create content optimised for web, social, and presentations.",
        "Need video content? We handle everything from short-form social clips to longer brand films. Every video is crafted to align with your brand identity and marketing goals."
      ]
    },
    {
      id: 'seo',
      keywords: ['seo', 'search engine', 'google ranking', 'ranking', 'organic traffic', 'search results', 'visibility', 'indexing'],
      weight: 3,
      replies: [
        "SEO is built into every project we deliver -- semantic HTML, structured data, speed optimisation, and clean URL architecture. We also offer dedicated, ongoing SEO services for sustained organic growth.",
        "Our approach to SEO is technical-first: fast load times, proper heading hierarchy, meta tags, schema markup, and crawlable architecture. We build websites that search engines love from day one.",
        "We don't treat SEO as an afterthought. Every build includes technical SEO fundamentals. For ongoing keyword strategy, content optimisation, and analytics, we offer dedicated SEO services.",
        "SEO is core to how we build. We handle the technical foundation and can also support your long-term growth with keyword research, content strategy, and performance monitoring."
      ]
    },
    {
      id: 'social_marketing',
      keywords: ['social media', 'instagram', 'socials', 'marketing', 'digital marketing', 'ads', 'advertising', 'campaign', 'tiktok', 'facebook', 'linkedin', 'content calendar'],
      weight: 2,
      replies: [
        "We manage social media presence and digital marketing campaigns that align with your brand. From content calendars and asset creation to paid ads and analytics -- we cover it all.",
        "Our marketing services include social media management, content strategy, branded asset creation, paid advertising campaigns, and performance reporting. Everything is designed to amplify your brand.",
        "Need to grow your digital presence? We create and manage content across platforms, run targeted ad campaigns, and provide monthly analytics. Email us to discuss a marketing strategy.",
        "Social media and digital marketing are natural extensions of the brands we build. We ensure consistency across every platform with strategic content, scheduling, and paid campaigns."
      ]
    },
    {
      id: 'timeline',
      keywords: ['timeline', 'how long', 'turnaround', 'deadline', 'duration', 'timeframe', 'delivery', 'when will', 'how fast', 'speed', 'rush', 'urgent', 'asap'],
      weight: 3,
      replies: [
        "Timelines depend on scope. A typical website build runs 4-8 weeks, branding projects 2-4 weeks, and smaller deliverables can be faster. Rush timelines are available on request. We'll outline everything in your proposal.",
        "We move efficiently without cutting corners. Most web projects ship in 4-8 weeks. Branding and design work typically takes 2-4 weeks. We'll give you a clear timeline in the proposal phase.",
        "Every project gets a detailed timeline with milestones. We're transparent about delivery dates and keep you updated throughout. Reach out with your project details and we'll estimate turnaround.",
        "Speed depends on complexity. A landing page might take 2-3 weeks, while a full platform build could be 8-12 weeks. We always communicate timelines upfront and stick to them."
      ]
    },
    {
      id: 'about',
      keywords: ['who are you', 'about you', 'about vellume', 'tell me about', 'what is vellume', 'the studio', 'the company', 'the agency', 'your team', 'your story', 'founded'],
      weight: 2,
      replies: [
        "Vellume Studio is a high-end digital agency based in Adelaide. We specialise in crafting premium digital experiences -- web development, branding, UX/UI design, and 3D motion for ambitious brands that demand excellence.",
        "We're a boutique digital agency obsessed with quality. Our work spans branding, design, development, and motion -- all delivered with a level of craft that sets us apart. We believe digital should feel premium.",
        "Vellume Studio was built on the belief that every brand deserves exceptional digital infrastructure. We're a team of designers, developers, and strategists who pour detail into every project.",
        "We're a small, focused studio that punches above our weight. Based in Adelaide, we serve clients across Australia and beyond with high-end web development, branding, design, and motion services."
      ]
    },
    {
      id: 'booking',
      keywords: ['book', 'booking', 'inquiry', 'inquire', 'start a project', 'begin', 'hire', 'work together', 'collaborate', 'get started', 'kick off', 'onboard', 'sign up'],
      weight: 3,
      replies: [
        "Ready to start? Click the Inquire button at the top of the page, or email us directly at hello@vellumestudio.com.au with your project details. We'll review and respond within 24 hours with a tailored proposal.",
        "Let's build something exceptional. Head to our booking page via the Inquire button, or shoot us an email at hello@vellumestudio.com.au. Include your goals, timeline, and any inspiration -- we'll take it from there.",
        "The first step is a project brief. Submit one through the Inquire page or email hello@vellumestudio.com.au. Tell us what you need, your timeline, and your budget range. We'll come back with a clear plan.",
        "We'd love to work with you. Click Inquire to fill out a brief, or email hello@vellumestudio.com.au directly. The more detail you can share upfront, the better our initial proposal will be."
      ]
    },
    {
      id: 'process',
      keywords: ['process', 'how do you work', 'workflow', 'approach', 'methodology', 'steps', 'phases', 'how does it work', 'what happens next', 'how it works'],
      weight: 3,
      replies: [
        "Our process is straightforward: Discovery (understanding your goals), Strategy (defining the approach), Design (creating the visuals), Development (building it), and Launch (deploying and refining). We keep you involved at every step.",
        "We follow a structured process: brief, research, strategy, design, development, testing, and launch. Communication is constant throughout -- you'll always know where your project stands.",
        "It starts with a conversation. We learn about your business, define the scope, then move through design, development, and launch phases. Every milestone includes a review point so nothing moves forward without your sign-off.",
        "Our workflow is collaborative. We start with discovery and strategy, move to wireframes and design, then into development and testing. You'll have visibility and input at every stage."
      ]
    },
    {
      id: 'tech_stack',
      keywords: ['tech stack', 'technology', 'technologies', 'what tools', 'frameworks', 'platform', 'cms', 'hosting', 'infrastructure', 'languages', 'stack'],
      weight: 3,
      replies: [
        "We work across modern technologies: HTML5, CSS3, JavaScript, React, Next.js, Node.js, and more. For CMS, we integrate with headless solutions. We deploy on Vercel, Netlify, or custom infrastructure depending on the project.",
        "Our tech stack is chosen per project. We use modern frameworks like React and Next.js, animation libraries like GSAP, headless CMS platforms, and deploy on high-performance hosting. We pick the right tool for the job.",
        "We're not locked into one stack. We use React, Next.js, vanilla JS, Tailwind, GSAP, Three.js, and various backend solutions. Our CMS integrations include headless options like Sanity, Strapi, and Contentful.",
        "Technology choices are driven by your project needs. We specialise in modern web technologies, high-performance hosting, headless CMS, and animation-first development. We'll recommend the best stack for your goals."
      ]
    },
    {
      id: 'support',
      keywords: ['support', 'maintenance', 'ongoing', 'after launch', 'updates', 'manage', 'hosting', 'upkeep', 'retainer'],
      weight: 2,
      replies: [
        "We offer ongoing support and maintenance packages to keep your site running smoothly after launch. This includes updates, security patches, performance monitoring, and content changes.",
        "Post-launch support is available on a retainer basis. We handle hosting management, security updates, content changes, performance optimisation, and any feature additions you need over time.",
        "We don't disappear after launch. Our maintenance packages cover everything from security and performance to content updates and new features. Ask us about our support plans.",
        "After deployment, we can provide ongoing technical support, hosting management, and iterative improvements. We treat post-launch as an extension of the project, not an afterthought."
      ]
    },
    {
      id: 'thanks',
      keywords: ['thank', 'thanks', 'cheers', 'appreciate', 'awesome', 'great', 'perfect', 'cool', 'amazing', 'brilliant', 'nice', 'helpful', 'legend'],
      weight: 1,
      replies: [
        "Glad I could help. If anything else comes up, I'm right here. Otherwise, the team at hello@vellumestudio.com.au is ready when you are.",
        "Anytime. Don't hesitate to come back if you think of anything else. We're always here.",
        "You're welcome. When you're ready to take the next step, hit the Inquire button or email us directly. We look forward to it.",
        "Happy to help. If you have more questions later, just open this chat again. Good luck with your project."
      ]
    },
    {
      id: 'goodbye',
      keywords: ['bye', 'goodbye', 'later', 'see you', 'cya', 'take care', 'gotta go', 'that\'s all', 'that is all', 'nothing else'],
      weight: 1,
      replies: [
        "Take care. Remember, hello@vellumestudio.com.au is always open when you're ready. Until next time.",
        "See you around. When you're ready to start your project, we'll be right here. Have a great day.",
        "Until next time. Feel free to come back anytime. The Vellume team is always ready to help.",
        "Goodbye for now. We hope to work with you soon. Don't hesitate to reach out when the time is right."
      ]
    },
    {
      id: 'who_is_vee',
      keywords: ['who is vee', 'what is vee', 'are you a bot', 'are you real', 'are you ai', 'are you human', 'chatbot', 'robot', 'artificial'],
      weight: 4,
      replies: [
        "I'm Vee -- Vellume Studio's digital assistant. I'm here to answer questions about our services, process, and how to get started. For complex project discussions, I'll connect you with the human team.",
        "I'm an AI assistant built for Vellume Studio. Think of me as your first point of contact -- I can answer common questions and guide you toward the right next step. For detailed project conversations, the team is at hello@vellumestudio.com.au.",
        "I'm Vee, a digital concierge for Vellume Studio. I handle initial questions about services, pricing, timelines, and more. For deeper conversations, the team is always available at hello@vellumestudio.com.au."
      ]
    },
    {
      id: 'comparison',
      keywords: ['why vellume', 'why should i', 'what makes you different', 'why choose', 'compared to', 'vs', 'versus', 'better than', 'stand out', 'unique', 'advantage'],
      weight: 3,
      replies: [
        "What sets us apart is our obsession with craft. We don't use templates -- every project is custom-built with performance, motion, and design excellence at the core. We treat every brand like our own.",
        "We combine design thinking with engineering precision. Our builds are fast, animated, and built to last. We're a boutique studio, which means you get direct access to the people doing the work -- no middlemen.",
        "Most agencies deliver functional. We deliver exceptional. 60FPS motion, pixel-perfect design, and robust architecture aren't optional for us -- they're the baseline. That's the Vellume difference.",
        "We're selective about the projects we take on, which means every client gets our full attention. Our work speaks for itself -- premium design, high-performance builds, and a process that keeps you in control."
      ]
    },
    {
      id: 'fun_questions',
      keywords: ['joke', 'funny', 'tell me a joke', 'laugh', 'humor', 'bored', 'entertain', 'fun fact'],
      weight: 4,
      replies: [
        "I'm better with code than comedy, but here's one: Why do programmers prefer dark mode? Because light attracts bugs. Now, anything I can actually help with?",
        "My humour runs on CSS -- it's mostly about spacing and alignment. But seriously, how can I help you today?",
        "I'll leave the entertainment to our 3D motion team -- they make things move. I'm here for the practical stuff. What can I help you with?"
      ]
    },
    {
      id: 'negative',
      keywords: ['bad', 'terrible', 'worst', 'hate', 'sucks', 'awful', 'horrible', 'disappointed', 'unhappy', 'frustrated', 'angry', 'complaint', 'problem with'],
      weight: 3,
      replies: [
        "I'm sorry to hear that. We take every concern seriously. Please email hello@vellumestudio.com.au with the details and the team will address it directly and promptly.",
        "That's not the experience we aim for. Please reach out to hello@vellumestudio.com.au so we can understand what happened and make it right.",
        "I appreciate you sharing that. The best way to resolve any concerns is directly with our team. Please email hello@vellumestudio.com.au and we'll prioritise your feedback."
      ]
    }
  ];

  const fallbackReplies = [
    "That's a good question. I cover a range of topics -- services, pricing, timelines, our process, tech stack, and more. Could you rephrase or ask about something specific?",
    "I'm not sure I caught that one. Try asking about our services, pricing, how to get started, or anything related to web development, branding, and design.",
    "I want to give you a useful answer. Could you be a bit more specific? I can help with questions about our services, pricing, process, portfolio, or how to start a project.",
    "Hmm, I'm not quite sure how to answer that. Feel free to ask about what we do, how much it costs, our timeline, or how to get started. Or email hello@vellumestudio.com.au for anything else.",
    "I might not have a perfect answer for that one, but the team at hello@vellumestudio.com.au definitely will. Feel free to ask me something else in the meantime."
  ];

  const getReply = (message) => {
    const lower = message.toLowerCase().trim();
    
    // 1. Check intent patterns first (highest priority -- user expressing a WANT/NEED)
    for (const intent of intentPatterns) {
      for (const pattern of intent.patterns) {
        if (pattern.test(lower)) {
          return pickUnused(intent.replies, intent.id);
        }
      }
    }
    
    // 2. Score all keyword categories and pick the best match
    let bestMatch = null;
    let bestScore = 0;
    
    for (const category of responses) {
      let score = 0;
      for (const keyword of category.keywords) {
        if (lower.includes(keyword)) {
          // Longer keyword matches are more specific = higher score
          score += keyword.length * (category.weight || 1);
        }
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = category;
      }
    }
    
    if (bestMatch && bestScore > 0) {
      lastCategory = bestMatch.id;
      return pickUnused(bestMatch.replies, bestMatch.id);
    }
    
    // 3. Fallback
    lastCategory = null;
    return pickUnused(fallbackReplies, 'fallback');
  };
  
  // Pick a reply that hasn't been used recently
  const pickUnused = (replies, categoryId) => {
    const available = replies.filter((r, i) => !usedReplies.has(categoryId + '_' + i));
    
    // If all have been used, reset this category
    if (available.length === 0) {
      replies.forEach((r, i) => usedReplies.delete(categoryId + '_' + i));
      const idx = Math.floor(Math.random() * replies.length);
      usedReplies.add(categoryId + '_' + idx);
      return replies[idx];
    }
    
    // Pick random from available
    const pick = available[Math.floor(Math.random() * available.length)];
    const idx = replies.indexOf(pick);
    usedReplies.add(categoryId + '_' + idx);
    return pick;
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
    
    // Simulate a natural typing delay (600-1400ms)
    const delay = 600 + Math.random() * 800;
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

