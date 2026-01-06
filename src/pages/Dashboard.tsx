import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  DollarSign,
  Clock,
  Users,
  Calendar,
  Plus,
  UserPlus,
  ArrowRight,
  Package,
} from "lucide-react";

export default function Dashboard() {
  const { profile } = useTrainerProfile();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats", profile?.id],
    queryFn: async () => {
      if (!profile) return null;

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get revenue this month
      const { data: purchases } = await supabase
        .from("purchases")
        .select("amount_cents")
        .eq("trainer_id", profile.id)
        .eq("status", "paid")
        .gte("paid_at", startOfMonth.toISOString());

      const revenueThisMonth = purchases?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      // Get outstanding payments
      const { data: pending } = await supabase
        .from("purchases")
        .select("amount_cents")
        .eq("trainer_id", profile.id)
        .eq("status", "pending");

      const outstandingPayments = pending?.reduce((sum, p) => sum + p.amount_cents, 0) || 0;

      // Get active clients count
      const { count: activeClients } = await supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("trainer_id", profile.id)
        .eq("status", "active");

      // Get sessions this month
      const { count: sessionsThisMonth } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("trainer_id", profile.id)
        .gte("occurred_at", startOfMonth.toISOString());

      return {
        revenueThisMonth,
        outstandingPayments,
        activeClients: activeClients || 0,
        sessionsThisMonth: sessionsThisMonth || 0,
      };
    },
    enabled: !!profile,
  });

  const formatCurrency = (cents: number) => {
    const currency = profile?.currency || "USD";
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      CAD: "$",
      AUD: "$",
    };
    return `${symbols[currency]}${(cents / 100).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back{profile?.business_name ? `, ${profile.business_name}` : ""}!
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link to="/clients/new">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Link>
            </Button>
            <Button asChild>
              <Link to="/sessions/new">
                <Plus className="mr-2 h-4 w-4" />
                Log Session
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Revenue This Month
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">
                  {formatCurrency(stats?.revenueThisMonth || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Outstanding Payments
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold text-warning">
                  {formatCurrency(stats?.outstandingPayments || 0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sessions This Month
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{stats?.sessionsThisMonth || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <Link to="/clients" className="block p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Manage Clients</h3>
                    <p className="text-sm text-muted-foreground">View and edit your client roster</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Link to="/products" className="block p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <Package className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Session Packages</h3>
                    <p className="text-sm text-muted-foreground">Create packages & memberships</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <Link to="/payments" className="block p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <DollarSign className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Collect Payments</h3>
                    <p className="text-sm text-muted-foreground">Send payment links to clients</p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
