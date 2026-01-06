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
} from "lucide-react";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
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

      {/* Hero */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold max-w-3xl mx-auto leading-tight">
            Stop Chasing Payments.
            <br />
            <span className="text-primary">Start Training.</span>
          </h1>
          <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
            The all-in-one platform for independent personal trainers to manage payments, 
            track session credits, and keep clients happy.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline">
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Designed specifically for independent trainers who want to focus on what they do best
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Payments</h3>
              <p className="text-muted-foreground">
                Accept credit cards with Stripe integration. Send payment links directly to clients.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <div className="p-3 bg-success/10 rounded-lg w-fit mb-4">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Session Credits</h3>
              <p className="text-muted-foreground">
                Sell session packages. Credits are automatically tracked when you log sessions.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <div className="p-3 bg-warning/10 rounded-lg w-fit mb-4">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Management</h3>
              <p className="text-muted-foreground">
                Keep all your clients organized with their balances, purchases, and session history.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Client Portal</h3>
              <p className="text-muted-foreground">
                Clients can view their balance and purchase more sessions via a simple link.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border">
              <div className="p-3 bg-success/10 rounded-lg w-fit mb-4">
                <Bell className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Reminders</h3>
              <p className="text-muted-foreground">
                Automatic emails for unpaid invoices, low credits, and membership renewals.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border">
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold mb-2">Create Packages</h3>
              <p className="text-muted-foreground">
                Set up session packages (5 sessions, 10 sessions) or monthly memberships with your pricing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold mb-2">Clients Pay Online</h3>
              <p className="text-muted-foreground">
                Send payment links. When clients pay, their session credits are automatically added.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
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

      {/* Pricing Placeholder */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-muted-foreground mb-8">Coming soon</p>
          <div className="max-w-md mx-auto bg-card p-8 rounded-xl border shadow-sm">
            <div className="text-4xl font-bold mb-2">Free During Beta</div>
            <p className="text-muted-foreground mb-6">
              Get started today and lock in early adopter benefits
            </p>
            <Button size="lg" className="w-full" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
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
