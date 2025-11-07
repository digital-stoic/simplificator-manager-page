import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, description } = await req.json();
    console.log('Analyzing code submission:', { descriptionLength: description?.length, codeLength: code?.length });

    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not configured');
    }

    // Create prompt based on Simplificator Manager persona
    const prompt = `You are "Simplificator Manager", a French surf-vibe technical coach who challenges complexity with kindness.

Analyze this code project and respond ONLY with a JSON object (no markdown, no extra text):

Project: ${description}
Code: ${code}

Check for over-engineering signals:
- Microservices, Kubernetes, Kafka for small scale
- Custom frameworks before validation
- GraphQL when REST works
- Event Sourcing, CQRS without need
- Premature abstraction

Respond with this exact JSON structure:
{
  "score": <number 0-10, where 0-3=simple, 4-6=medium, 7-10=over-engineered>,
  "title": "<short title like 'Microservices for Todo App'>",
  "suggestions": ["<garage mode alternative 1>", "<garage mode alternative 2>", "<garage mode alternative 3>"]
}`;

    console.log('Calling Hugging Face API...');
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-2.7B',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Hugging Face API error:', response.status, errorText);
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const hfResult = await response.json();
    console.log('Hugging Face raw response:', JSON.stringify(hfResult));

    let generatedText = '';
    if (Array.isArray(hfResult) && hfResult[0]?.generated_text) {
      generatedText = hfResult[0].generated_text;
    } else if (hfResult.generated_text) {
      generatedText = hfResult.generated_text;
    }

    console.log('Generated text:', generatedText);

    // Try to extract JSON from the response
    let result;
    try {
      // Look for JSON object in the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      
      // Fallback: Create a response based on keywords
      const overEngineeringKeywords = [
        'microservice', 'kubernetes', 'kafka', 'graphql', 'event sourcing',
        'cqrs', 'saga', 'redis', 'elasticsearch', 'docker', 'k8s'
      ];
      
      const textLower = (description + ' ' + code).toLowerCase();
      const keywordCount = overEngineeringKeywords.filter(kw => 
        textLower.includes(kw)
      ).length;
      
      const score = Math.min(10, 3 + (keywordCount * 2));
      
      result = {
        score,
        title: description.split('\n')[0].slice(0, 50) || 'Code Review',
        suggestions: [
          'Start with a simple monolith - you can always split later when you have real scale problems',
          'Use managed services (Vercel, Supabase) instead of building complex infrastructure',
          'Ship an MVP first, get real users, then optimize based on actual needs'
        ]
      };
    }

    // Validate and sanitize the result
    const finalResult = {
      score: Math.max(0, Math.min(10, Number(result.score) || 5)),
      title: (result.title || description.slice(0, 50)).slice(0, 100),
      suggestions: Array.isArray(result.suggestions) 
        ? result.suggestions.slice(0, 5).map((s: any) => String(s).slice(0, 200))
        : ['Focus on shipping value to customers first', 'Keep it simple - YAGNI', 'Use proven tools instead of building from scratch']
    };

    console.log('Final result:', finalResult);

    return new Response(
      JSON.stringify(finalResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in simplify-code function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        score: 5,
        title: 'Error analyzing code',
        suggestions: ['Please try again or contact support']
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
