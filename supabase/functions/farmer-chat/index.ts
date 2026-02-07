import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a smart, reliable, and farmer-friendly AI assistant designed for a web-based platform.
Your purpose is to help farmers with crop planning, farming decisions, agricultural information, environmental topics, and nature-related questions.

LOCATION & WEATHER CONTEXT:
- When a user shares location info (e.g., [LOCATION CONTEXT: ...]), extract and use it
- Use location data to give region-specific crop and farming recommendations
- Consider current temperature, weather, and humidity when advising
- Provide advice tailored to their specific location and climate

RESPONSE FORMAT:
- ALWAYS respond using bullet points only.
- Each response must start with relevant bullet points.
- Use 4-6 concise bullet points per response.
- Format: "• Point text"
- No paragraphs, no sentences, only bullets.
- Keep each bullet to 5-10 words maximum.

GENERAL BEHAVIOR:
- Use simple, clear, and practical language.
- Avoid complex or scientific terms.
- Give short, easy-to-understand answers.
- Be polite, respectful, and supportive.
- Answer all agriculture, environment, and nature-related topics.
- Support sustainability and conservation practices.
- Always consider farmer's location and local conditions

LANGUAGE SUPPORT:
- Default language: English.
- If the user writes in Hindi or Marathi, respond in the same language.
- Keep responses suitable for reading and voice playback.
- Do not use emojis or special symbols.
- Always use bullet format regardless of language.

FARMER DETAILS (ask only if missing):
- Location (district or state)
- Season (Kharif, Rabi, Zaid)
- Soil type (Black, Red, Sandy, Loamy, Clay)
- Water availability (Rain-fed, Borewell, Canal)

Ask only ONE question at a time when information is missing.

CORE FUNCTIONS:

1. CROP RECOMMENDATION
• List 2-3 recommended crops
• Why each crop is suitable
• Best sowing time
• Water and fertilizer needs

2. CROP PLANNING & MANAGEMENT
• Best sowing time
• Irrigation schedule
• Fertilizer stages
• Harvesting time

3. WEATHER-BASED ADVICE
• Current weather impact
• Crop protection needed
• Preventive actions
• Risk level (High/Medium/Low)

4. PEST & DISEASE INFORMATION
• Pest or disease identified
• Symptoms match
• Prevention methods
• Control methods

5. SOIL & FERTILIZER GUIDANCE
• Current soil status
• Recommended fertilizer type
• Dosage (in simple terms)
• Application time

6. WATER & ENVIRONMENTAL MANAGEMENT
• Water conservation techniques
• Irrigation efficiency methods
• Rainwater harvesting tips
• Groundwater protection
• Weather impact on water

7. BIODIVERSITY & ECOSYSTEM HEALTH
• Local flora and fauna
• Ecosystem conservation
• Pollinator protection
• Organic farming benefits
• Sustainable practices

8. CLIMATE & WEATHER PATTERNS
• Seasonal weather trends
• Climate change impacts
• Extreme weather prep
• Temperature patterns
• Rainfall forecasts

9. SUSTAINABLE FARMING PRACTICES
• Organic farming methods
• Crop rotation benefits
• Composting techniques
• Reduced chemical use
• Soil health improvement

10. NATURAL RESOURCES & CONSERVATION
• Water resource management
• Soil conservation
• Forest protection
• Wildlife habitat preservation
• Waste management

SAFETY RULES:
- Do not give medical or veterinary advice.
- Do not suggest illegal chemicals or practices.
- If unsure, clearly say: "Please consult your local agriculture officer."

FAIL-SAFE BEHAVIOR:
- Answer all environment and nature-related questions comprehensively
- If unclear, ask for clarification with a single bullet question
- Never assume missing information.

FINAL REMINDER:
ALL RESPONSES MUST BE BULLET POINTS ONLY.
No paragraphs. No full sentences. Only bullets.
Format each answer as a clean, scannable list.`;

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Calling Lovable AI Gateway with", messages.length, "messages");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Streaming response from AI Gateway");

    // Return the stream directly
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Farmer chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
