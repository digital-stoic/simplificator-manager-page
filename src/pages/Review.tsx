import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const reviewSchema = z.object({
  code: z.string().trim().min(10, { message: "Code snippet must be at least 10 characters" }).max(5000, { message: "Code snippet must be less than 5000 characters" }),
  description: z.string().trim().min(10, { message: "Description must be at least 10 characters" }).max(1000, { message: "Description must be less than 1000 characters" })
});

const Review = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [aiResult, setAiResult] = useState<{ score: number; title: string; suggestions: string[] } | null>(null);
  const [errors, setErrors] = useState<{ code?: string; description?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const result = reviewSchema.safeParse({ code, description });
    
    if (!result.success) {
      const formErrors: { code?: string; description?: string } = {};
      result.error.errors.forEach((err) => {
        if (err.path[0] === "code") formErrors.code = err.message;
        if (err.path[0] === "description") formErrors.description = err.message;
      });
      setErrors(formErrors);
      toast({
        title: "Validation Error",
        description: "Please check your inputs and try again.",
        variant: "destructive"
      });
      return;
    }
    
    setErrors({});

    toast({
      title: "Analyzing...",
      description: "The Simplificator Manager is reviewing your code..."
    });

    try {
      console.log('Calling simplify-code edge function...');
      
      // Call the edge function
      const { data: functionResult, error: functionError } = await supabase.functions.invoke('simplify-code', {
        body: { code, description }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        setErrors({ general: 'AI analysis failed. Please try again.' });
        toast({
          title: "Error",
          description: "Failed to analyze code. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('AI result:', functionResult);
      setAiResult(functionResult);

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('reviews')
        .insert({
          title: functionResult.title || description.substring(0, 100),
          code_snippet: code,
          description: description,
          score: functionResult.score
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast({
          title: "Warning",
          description: "Analysis complete but failed to save to database.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Review Complete!",
          description: "Your code has been analyzed by the Simplificator Manager."
        });
      }

      setShowResult(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error('Unexpected error:', error);
      setErrors({ general: 'An unexpected error occurred.' });
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setShowResult(false);
    setAiResult(null);
    setCode("");
    setDescription("");
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            AI Code Review
          </h1>
          <p className="text-xl text-muted-foreground">
            Let's see if you're building a spaceship when you need a skateboard 🛹
          </p>
        </div>

        {/* AI Result */}
        {showResult && aiResult && (
          <Card className={`mb-8 animate-in fade-in slide-in-from-top-4 duration-500 ${
            aiResult.score >= 7 ? 'border-destructive/50' : aiResult.score >= 4 ? 'border-yellow-500/50' : 'border-green-500/50'
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={aiResult.score >= 7 ? "destructive" : aiResult.score >= 4 ? "secondary" : "default"}
                      className="text-lg px-4 py-1"
                    >
                      Score: {aiResult.score}/10 {aiResult.score >= 7 ? '🔴' : aiResult.score >= 4 ? '🟡' : '✅'}
                    </Badge>
                  </div>
                  <CardTitle className="text-3xl flex items-center gap-2">
                    <AlertCircle className={`w-8 h-8 ${
                      aiResult.score >= 7 ? 'text-destructive' : aiResult.score >= 4 ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                    {aiResult.title}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">
                  {aiResult.score >= 7 
                    ? "Respect pour l'ambition, but let's talk simplicity:" 
                    : aiResult.score >= 4 
                    ? "Pas mal, but could be simpler:"
                    : "C'est du lourd! Simple and effective. 😎"}
                </h3>
                <div className="space-y-4">
                  {aiResult.suggestions.map((suggestion, index) => (
                    <Card key={index} className="bg-muted/50">
                      <CardContent className="pt-6">
                        <p className="text-foreground font-medium mb-2">
                          {index === 0 ? '💡' : index === 1 ? '🎯' : '🌊'} Suggestion #{index + 1}:
                        </p>
                        <p className="text-muted-foreground">{suggestion}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-lg font-semibold text-foreground mb-2">
                  {aiResult.score >= 7 ? 'YAGNI Reminder: You Ain\'t Gonna Need It' : 'Keep Riding the Wave 🏄'}
                </p>
                <p className="text-muted-foreground">
                  {aiResult.score >= 7 
                    ? 'Easy, relax. Build what you need today, not what you might need tomorrow. Et ouais. 😎'
                    : 'Ship fast, learn fast. Focus on customer value. C\'est du lourd.'}
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={resetForm} size="lg">
                  Review Another Project
                </Button>
                <Button variant="outline" onClick={() => navigate("/")} size="lg">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Form */}
        {!showResult && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Your Code for Review</CardTitle>
              <CardDescription>
                Share your architecture or code snippet and get instant feedback
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Snippet */}
                <div className="space-y-2">
                  <Label htmlFor="code">Code Snippet or Architecture</Label>
                  <Textarea
                    id="code"
                    placeholder="Paste your code or architecture description..."
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className={`min-h-[200px] font-mono ${errors.code ? "border-destructive" : ""}`}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">What are you trying to build?</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project, goals, and current user count..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={`min-h-[120px] ${errors.description ? "border-destructive" : ""}`}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Submit Button */}
                <Button type="submit" size="lg" className="w-full">
                  Get Simplification Score 🏄
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Review;
