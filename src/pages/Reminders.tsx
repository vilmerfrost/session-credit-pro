import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, Mail, CheckCircle, XCircle } from "lucide-react";

interface ReminderEvent {
  id: string;
  type: "payment_due" | "low_credits" | "renewal";
  status: "sent" | "failed";
  channel: string;
  created_at: string;
  client: { full_name: string } | null;
}

export default function Reminders() {
  const { profile } = useTrainerProfile();

  const { data: reminders, isLoading } = useQuery({
    queryKey: ["reminders", profile?.id],
    queryFn: async () => {
      if (!profile) return [];

      const { data, error } = await supabase
        .from("reminder_events")
        .select("*, clients(full_name)")
        .eq("trainer_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data.map((r) => ({
        ...r,
        client: r.clients,
      })) as ReminderEvent[];
    },
    enabled: !!profile,
  });

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "payment_due":
        return "Payment Due";
      case "low_credits":
        return "Low Credits";
      case "renewal":
        return "Membership Renewal";
      default:
        return type;
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Reminders</h1>
          <p className="text-muted-foreground mt-1">
            Automatic email reminders sent to your clients
          </p>
        </div>

        {/* Info Card */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Automatic Reminders</p>
                <p className="text-sm text-muted-foreground">
                  Reminders are sent automatically based on your settings. You can configure them in{" "}
                  <a href="/settings" className="text-primary hover:underline">Settings</a>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Log */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (reminders?.length || 0) === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Mail className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No reminders sent yet</h3>
              <p className="text-muted-foreground text-center">
                Automatic reminders will appear here once they're sent
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Reminder Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminders?.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{reminder.client?.full_name || "Unknown Client"}</p>
                        <p className="text-sm text-muted-foreground">
                          {getTypeLabel(reminder.type)} • {new Date(reminder.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {reminder.status === "sent" ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="mr-1 h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
