import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CreateTestUser = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const createUser = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-test-user', {
        body: {}
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: `Test user created: test@simplificator.dev`,
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create test user",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Test User</CardTitle>
          <CardDescription>Click to create the test user account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm">
            <p><strong>Email:</strong> test@simplificator.dev</p>
            <p><strong>Password:</strong> Test1234!</p>
          </div>
          <Button onClick={createUser} className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Test User"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full">
            Back to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTestUser;
