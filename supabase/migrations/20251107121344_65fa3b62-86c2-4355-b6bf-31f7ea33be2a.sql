-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code_snippet TEXT NOT NULL,
  description TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);

-- Allow anyone to insert reviews
CREATE POLICY "Anyone can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (true);

-- Seed 5 fun review examples
INSERT INTO public.reviews (title, code_snippet, description, score) VALUES
(
  'Microservices for Todo App',
  'const todoService = new KafkaProducer();
const userService = new EventBus();
const notificationService = new RabbitMQ();',
  'Building a simple todo app with 10 microservices, event sourcing, and CQRS. We have 3 users so far.',
  9
),
(
  'Custom Framework Before First User',
  'class MyCustomReactFramework {
  // 5000 lines of abstraction
  render() { /* magic */ }
}',
  'Spent 6 months building a custom React framework before writing any features. Zero customers yet, but the architecture is "scalable".',
  10
),
(
  'Simple Landing Page',
  '<html>
  <body>
    <h1>Welcome</h1>
    <button>Sign Up</button>
  </body>
</html>',
  'Just HTML and CSS for our MVP landing page. Shipped in 2 hours, got first 50 signups.',
  2
),
(
  'Kubernetes for Side Project',
  'apiVersion: v1
kind: Pod
metadata:
  name: my-blog
spec:
  containers:
  - name: wordpress
    image: wordpress',
  'Set up Kubernetes cluster with 15 services for my personal blog. Traffic: 10 visitors/month. DevOps complexity: infinite.',
  8
),
(
  'Spreadsheet MVP',
  '=IF(A1>0, "Customer wants it", "Do not build it")',
  'Used Google Sheets to validate our SaaS idea. Got 100 paying customers before writing any code.',
  1
);