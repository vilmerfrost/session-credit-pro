import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSessions, Session } from "@/hooks/useSessions";
import { useClients } from "@/hooks/useClients";
import { sessionSchema, SessionFormData } from "@/lib/validations";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Calendar, Loader2, Trash2 } from "lucide-react";

export default function Sessions() {
  const { sessions, isLoading, createSession, deleteSession } = useSessions();
  const { clients } = useClients();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeClients = clients.filter((c) => c.status === "active");

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      client_id: "",
      occurred_at: new Date().toISOString().slice(0, 16),
      duration_minutes: 60,
      credits_used: 1,
      notes: "",
    },
  });

  const handleSubmit = async (data: SessionFormData) => {
    setIsSubmitting(true);
    try {
      await createSession.mutateAsync({
        client_id: data.client_id,
        occurred_at: new Date(data.occurred_at).toISOString(),
        duration_minutes: data.duration_minutes,
        credits_used: data.credits_used,
        notes: data.notes || null,
      });
      toast.success("Session logged");
      setDialogOpen(false);
      form.reset({
        client_id: "",
        occurred_at: new Date().toISOString().slice(0, 16),
        duration_minutes: 60,
        credits_used: 1,
        notes: "",
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (session: Session) => {
    try {
      await deleteSession.mutateAsync(session);
      toast.success("Session deleted and credits refunded");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Sessions</h1>
            <p className="text-muted-foreground mt-1">
              Log training sessions and track credit usage
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Session
          </Button>
        </div>

        {/* Session List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Log your first training session
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Log Session
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{session.client?.full_name || "Unknown Client"}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.occurred_at).toLocaleDateString()} • {session.duration_minutes} min
                        </p>
                        {session.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{session.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        -{session.credits_used} credit{session.credits_used !== 1 ? "s" : ""}
                      </Badge>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete session?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will delete the session and refund {session.credits_used} credit(s) to the client.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(session)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Log Session Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Session</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_id">Client *</Label>
                <Select
                  value={form.watch("client_id")}
                  onValueChange={(value) => form.setValue("client_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name} ({client.credit_balance} credits)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.client_id && (
                  <p className="text-sm text-destructive">{form.formState.errors.client_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="occurred_at">Date & Time *</Label>
                <Input
                  id="occurred_at"
                  type="datetime-local"
                  {...form.register("occurred_at")}
                />
                {form.formState.errors.occurred_at && (
                  <p className="text-sm text-destructive">{form.formState.errors.occurred_at.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (min)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="1"
                    {...form.register("duration_minutes", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credits_used">Credits Used</Label>
                  <Input
                    id="credits_used"
                    type="number"
                    min="1"
                    {...form.register("credits_used", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Session notes..."
                  {...form.register("notes")}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Log Session
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
