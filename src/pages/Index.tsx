const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight text-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Simplificator Manager
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-primary to-accent mx-auto rounded-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150" />
        </div>
        <p className="text-xl text-muted-foreground max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          Streamline your workflow with elegance and efficiency
        </p>
      </div>
    </div>
  );
};

export default Index;
