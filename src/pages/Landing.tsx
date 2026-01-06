import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard,
  Users,
  Calendar,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Bell,
  Shield,
  Zap,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="border-b relative z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Zap className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 bg-primary/20 blur-lg animate-pulse" />
            </div>
            <span className="text-xl font-bold text-primary">SessionPay</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">for Trainers</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero with WOW factor */}
      <section className="py-20 lg:py-32 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Gradient orbs */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-success/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-warning/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "2s" }} />
          
          {/* Floating icons */}
          <div className="absolute top-32 left-[15%] animate-bounce" style={{ animationDuration: "3s" }}>
            <div className="p-3 bg-card rounded-xl shadow-lg border">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="absolute top-48 right-[20%] animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }}>
            <div className="p-3 bg-card rounded-xl shadow-lg border">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
          </div>
          <div className="absolute bottom-32 left-[25%] animate-bounce" style={{ animationDuration: "3.5s", animationDelay: "1s" }}>
            <div className="p-3 bg-card rounded-xl shadow-lg border">
              <Users className="h-6 w-6 text-warning" />
            </div>
          </div>
          <div className="absolute bottom-48 right-[15%] animate-bounce" style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}>
            <div className="p-3 bg-card rounded-xl shadow-lg border">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Now in Beta - Free for Early Adopters</span>
          </div>

          <h1 className="text-4xl lg:text-7xl font-bold max-w-4xl mx-auto leading-tight animate-fade-in">
            Stop Chasing Payments.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-success bg-clip-text text-transparent">
              Start Training.
            </span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            The all-in-one platform for independent personal trainers to manage payments, 
            track session credits, and keep clients happy.
          </p>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap justify-center gap-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">100%</div>
              <div className="text-sm text-muted-foreground">Automated</div>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Client Access</div>
            </div>
            <div className="w-px bg-border hidden sm:block" />
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">$0</div>
              <div className="text-sm text-muted-foreground">During Beta</div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button size="lg" className="group relative overflow-hidden" asChild>
              <Link to="/auth">
                <span className="relative z-10 flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToHowItWorks} className="group">
              See How It Works
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-y-1 rotate-90" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50 relative">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Designed specifically for independent trainers who want to focus on what they do best
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Payments</h3>
              <p className="text-muted-foreground">
                Accept credit cards with Stripe integration. Send payment links directly to clients.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-lg hover:border-success/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-success/10 rounded-lg w-fit mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Session Credits</h3>
              <p className="text-muted-foreground">
                Sell session packages. Credits are automatically tracked when you log sessions.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-lg hover:border-warning/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-warning/10 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Management</h3>
              <p className="text-muted-foreground">
                Keep all your clients organized with their balances, purchases, and session history.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Portal</h3>
              <p className="text-muted-foreground">
                Clients can view their balance and purchase more sessions via a simple link.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-lg hover:border-success/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-success/10 rounded-lg w-fit mb-4">
                <Bell className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Reminders</h3>
              <p className="text-muted-foreground">
                Automatic emails for unpaid invoices, low credits, and membership renewals.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border hover:shadow-lg hover:border-warning/20 transition-all duration-300 hover:-translate-y-1">
              <div className="p-3 bg-warning/10 rounded-lg w-fit mb-4">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Session Logging</h3>
              <p className="text-muted-foreground">
                Quick and easy session logging with notes. Perfect for tracking progress.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 scroll-mt-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Packages</h3>
              <p className="text-muted-foreground">
                Set up session packages (5 sessions, 10 sessions) or monthly memberships with your pricing.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success to-success/80 text-success-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Clients Pay Online</h3>
              <p className="text-muted-foreground">
                Send payment links. When clients pay, their session credits are automatically added.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-warning to-warning/80 text-warning-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-lg font-semibold mb-2">Log Sessions</h3>
              <p className="text-muted-foreground">
                After each session, log it in the app. Credits are deducted automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground mb-8">Coming soon</p>
          <div className="max-w-md mx-auto bg-card p-8 rounded-2xl border shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-success/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                Free
              </div>
              <div className="text-muted-foreground mb-6">During Beta</div>
              <ul className="text-left space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span>Unlimited clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span>Unlimited sessions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span>Stripe payments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span>Client portal</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                  <span>Auto reminders</span>
                </li>
              </ul>
              <Button size="lg" className="w-full" asChild>
                <Link to="/auth">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Shield className="h-5 w-5" />
            <span>Secure payments powered by Stripe</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 SessionPay. Built for independent trainers.</p>
        </div>
      </footer>
    </div>
  );
}
