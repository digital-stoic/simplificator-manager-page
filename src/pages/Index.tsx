import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, BookOpen, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

// MFB 42
const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Waves className="w-8 h-8" />
            <span className="text-sm font-semibold uppercase tracking-wider">The Simplificator Manager</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            Stop Over-Engineering,
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Start Shipping
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            Your friendly AI coach that challenges complexity with kindness. Easy, relax. 😎
          </p>

          <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Button
              size="lg"
              className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              onClick={() => navigate("/review")}
            >
              Try it now 🏄
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1: AI Code Review */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-400 cursor-pointer"
            onClick={() => navigate("/review")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">AI Code Review</CardTitle>
              <CardDescription className="text-base">Analyzes your architecture</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get instant feedback on your tech stack. We'll tell you if you're building a spaceship when you need a
                skateboard. 🛹
              </p>
            </CardContent>
          </Card>

          {/* Feature 2: Simplificator Chatbot */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 cursor-pointer"
            onClick={() => navigate("/chat")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <MessageCircle className="w-6 h-6 text-accent" />
              </div>
              <CardTitle className="text-2xl">Simplificator Chatbot</CardTitle>
              <CardDescription className="text-base">Answers your questions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Ask anything. Get surf-vibe wisdom. "Faut savoir rider la vague du simple." We keep it real. 🌊
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Start Chat
              </Button>
            </CardContent>
          </Card>

          {/* Feature 3: Community Dashboard */}
          <Card
            className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-600 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Community Dashboard</CardTitle>
              <CardDescription className="text-base">See real reviews & learn</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Browse recent code reviews from the community. Learn from real examples. C'est du lourd. ✅
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to embrace garage mode?</h2>
          <p className="text-lg text-muted-foreground">
            Join developers who choose simplicity over complexity. Et ouais. 😎
          </p>
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
            onClick={() => navigate("/review")}
          >
            Try it now - It's free 🏄
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
