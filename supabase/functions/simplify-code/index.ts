import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, description } = await req.json();
    console.log("Analyzing code submission:", { descriptionLength: description?.length, codeLength: code?.length });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // MFB 20251112
    // Simplificator Manager persona prompt
    const systemPrompt = `You are "Simplificator Manager" - a French surf-vibe technical coach who challenges complexity with kindness.

Your mission: Help developers avoid over-engineering by focusing on customer value and simplicity.

Principles you follow:
- YAGNI (You Ain't Gonna Need It)
- KISS (Keep It Simple)
- MVP (Minimum Viable Product)
- Garage mode = scrappy, resourceful, customer-first

Scoring guide:
- 0-3 (Simple ✅): Monolith, Postgres, REST, managed services, MVP mindset
- 4-6 (Medium 🟡): Could simplify, some unnecessary complexity
- 7-10 (Over-engineered 🔴): Microservices for small scale, Kubernetes, Kafka, custom frameworks, premature optimization

Over-engineering signals:
- Microservices, Kubernetes, Kafka for small teams
- GraphQL when REST works fine
- Event Sourcing, CQRS without banking/trading needs
- Custom framework before 3+ uses
- Redis, Elasticsearch before proven need`;

    const userPrompt = `Analyze this project for over-engineering:

Project Description: ${description}

Code/Architecture:
${code}

Provide a complexity score (0-10) and 3 specific "garage mode" suggestions for simplification.`;

    console.log("Calling Lovable AI Gateway...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_review",
              description: "Provide code review with complexity score and simplification suggestions",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Complexity score from 0-10 where 0-3=simple, 4-6=medium, 7-10=over-engineered",
                  },
                  title: {
                    type: "string",
                    description: 'Short descriptive title like "Microservices for Todo App" or "Simple Landing Page"',
                  },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Exactly 3 specific garage mode alternatives with concrete recommendations",
                  },
                },
                required: ["score", "title", "suggestions"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "provide_review" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
            score: 5,
            title: "Rate Limited",
            suggestions: ["Please wait a moment and try again"],
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits depleted. Please add credits to your workspace.",
            score: 5,
            title: "Credits Required",
            suggestions: ["Please add credits to continue using AI features"],
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResult = await response.json();
    console.log("AI response:", JSON.stringify(aiResult));

    // Extract tool call result
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Parsed result:", result);

    // Validate and sanitize
    const finalResult = {
      score: Math.max(0, Math.min(10, Math.round(Number(result.score) || 5))),
      title: String(result.title || description.slice(0, 50)).slice(0, 100),
      suggestions: Array.isArray(result.suggestions)
        ? result.suggestions.slice(0, 3).map((s: any) => String(s).slice(0, 300))
        : [
            "Start with a monolith on Vercel or Railway - simple deployment",
            "Use Postgres + Supabase instead of complex infrastructure",
            "Ship MVP first, optimize later when you have real users",
          ],
    };

    console.log("Final result:", finalResult);

    return new Response(JSON.stringify(finalResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in simplify-code function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        score: 5,
        title: "Error analyzing code",
        suggestions: [
          "Start simple - monolith first, split later if needed",
          "Use managed services to avoid infrastructure complexity",
          "Focus on shipping value to customers, not perfect architecture",
        ],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
