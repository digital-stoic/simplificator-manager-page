import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Waves } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const PRESET_QA = [
  {
    keywords: ["graphql", "graph", "rest", "api"],
    question: "Should I use GraphQL?",
    answer: "For your small app? REST is simpler. GraphQL adds complexity you don't need yet. Ship first, optimize later. 🚀"
  },
  {
    keywords: ["kubernetes", "k8s", "docker", "container", "deploy"],
    question: "Do I need Kubernetes?",
    answer: "Probably not. Start with Vercel/Render. One-click deploy. K8s when you have the problem, not before. Easy, relax. 😎"
  },
  {
    keywords: ["mvp", "minimum", "simple", "start", "begin"],
    question: "What's the simplest MVP approach?",
    answer: "Monolith + Postgres + Deploy. That's it. Add complexity when customers demand it, not sooner. Faut savoir rider la vague du simple. 🌊"
  }
];

const FALLBACK_RESPONSE = "Great question! The simplest approach is usually the best. What problem are you really solving? Remember: YAGNI = You Ain't Gonna Need It. 😎";

const Chat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Salut! I'm the Simplificator chatbot. Ask me about keeping things simple. 🏄",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findMatchingResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    for (const qa of PRESET_QA) {
      if (qa.keywords.some(keyword => lowerMessage.includes(keyword))) {
        return qa.answer;
      }
    }
    
    return FALLBACK_RESPONSE;
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simulate thinking delay
    setTimeout(() => {
      const response = findMatchingResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <div className="flex items-center gap-2 text-primary">
            <Waves className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Simplificator Chat</h1>
          </div>
        </div>

        {/* Chat Container */}
        <Card className="h-[600px] flex flex-col">
          {/* Messages Area */}
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about simplifying your architecture..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Try asking: "Should I use GraphQL?" or "Do I need Kubernetes?"
            </p>
          </div>
        </Card>

        {/* Preset Questions */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-foreground mb-3">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_QA.map((qa, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(qa.question);
                  setTimeout(() => handleSend(), 100);
                }}
              >
                {qa.question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
