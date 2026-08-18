exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  try {
    const { message } = JSON.parse(event.body);
    // Securely reading the API key from environment variables (set in Netlify Dashboard)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 
    
    // Safety regulations and persona
    const systemInstruction = `You are Vee, the professional AI assistant for Vellume Studio (a high-end digital infrastructure and web development agency based in Adelaide). 
Your tone is sleek, confident, and highly professional, but you must speak using simple, highly understandable vocabulary since you are talking to everyday humans. Avoid overly complex technical jargon unless specifically asked. Do not use emojis. Do not use profanity or generate explicit content. 
If asked to write code, provide high-level advice but encourage the user to email hello@vellumestudio.com.au for development services. 
Keep your answers concise, punchy, and strictly related to web development, branding, or the agency.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents: [{
          parts: [{ text: message }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 250,
        }
      })
    });
    
    const data = await response.json();
    
    let reply = "I am currently experiencing interference. Please email hello@vellumestudio.com.au.";
    if (data.candidates && data.candidates.length > 0) {
      reply = data.candidates[0].content.parts[0].text;
    } else if (data.error) {
      console.error("Gemini API Error:", data.error);
      reply = "My core systems are offline due to an API error. Please try again later.";
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (error) {
    console.error("Function Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};
