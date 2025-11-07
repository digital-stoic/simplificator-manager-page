import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from "lucide-react";

interface Review {
  id: string;
  title: string;
  score: number;
  created_at: string;
}

interface Profile {
  email: string;
  created_at: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("id, title, score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (reviewsData) {
        setReviews(reviewsData);
      }

      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/");
  };

  const getScoreBadge = (score: number) => {
    if (score <= 3) return { variant: "default" as const, emoji: "✅", label: "Simple" };
    if (score <= 6) return { variant: "secondary" as const, emoji: "🟡", label: "Medium" };
    return { variant: "destructive" as const, emoji: "🔴", label: "Over-engineered" };
  };

  const calculateStats = () => {
    if (reviews.length === 0) return { total: 0, average: 0, trend: "none" };
    
    const total = reviews.length;
    const average = reviews.reduce((acc, r) => acc + r.score, 0) / total;
    
    // Calculate trend (first half vs second half)
    if (reviews.length < 2) return { total, average, trend: "none" };
    
    const midPoint = Math.floor(reviews.length / 2);
    const recentReviews = reviews.slice(0, midPoint);
    const olderReviews = reviews.slice(midPoint);
    
    const recentAvg = recentReviews.reduce((acc, r) => acc + r.score, 0) / recentReviews.length;
    const olderAvg = olderReviews.reduce((acc, r) => acc + r.score, 0) / olderReviews.length;
    
    let trend = "stable";
    if (recentAvg < olderAvg - 0.5) trend = "improving";
    if (recentAvg > olderAvg + 0.5) trend = "worsening";
    
    return { total, average, trend };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">Your Simplificator journey</p>
        </div>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email:</span>
              <span className="font-medium">{profile?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since:</span>
              <span className="font-medium">
                {profile?.created_at && new Date(profile.created_at).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Reviews</CardDescription>
              <CardTitle className="text-3xl">{stats.total}</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Score</CardDescription>
              <CardTitle className="text-3xl">{stats.average.toFixed(1)}/10</CardTitle>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Trend</CardDescription>
              <CardTitle className="flex items-center gap-2 text-3xl">
                {stats.trend === "improving" && (
                  <>
                    <TrendingDown className="h-6 w-6 text-green-500" />
                    <span className="text-green-500">Better</span>
                  </>
                )}
                {stats.trend === "worsening" && (
                  <>
                    <TrendingUp className="h-6 w-6 text-red-500" />
                    <span className="text-red-500">Worse</span>
                  </>
                )}
                {stats.trend === "stable" && (
                  <>
                    <Minus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-muted-foreground">Stable</span>
                  </>
                )}
                {stats.trend === "none" && (
                  <span className="text-muted-foreground text-base">N/A</span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Review History */}
        <Card>
          <CardHeader>
            <CardTitle>Review History</CardTitle>
            <CardDescription>All your code reviews</CardDescription>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No reviews yet. Submit your first code review!</p>
                <Button className="mt-4" onClick={() => navigate("/review")}>
                  Submit Review
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => {
                  const badge = getScoreBadge(review.score);
                  return (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{review.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()} at{" "}
                          {new Date(review.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={badge.variant}>
                          {badge.emoji} {review.score}/10
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
