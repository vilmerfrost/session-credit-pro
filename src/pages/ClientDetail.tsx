import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClient, useClients } from "@/hooks/useClients";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { AppLayout } from "@/components/layout/AppLayout";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
import {
  ArrowLeft,
  Edit,
  Trash2,
  CreditCard,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Copy,
} from "lucide-react";

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { deleteClient } = useClients();
  const { profile } = useTrainerProfile();
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteClient.mutateAsync(id);
      toast.success("Client deleted");
      navigate("/clients");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatCurrency = (cents: number) => {
    const currency = profile?.currency || "USD";
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$" };
    return `${symbols[currency]}${(cents / 100).toFixed(2)}`;
  };

  const getPortalUrl = () => {
    if (!client?.portal_token) return null;
    return `${window.location.origin}/portal/${client.portal_token}`;
  };

  const copyPortalLink = () => {
    const url = getPortalUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      toast.success("Portal link copied to clipboard");
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <p className="text-muted-foreground">Client not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/clients")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold">{client.full_name}</h1>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                {client.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {client.email}
                  </span>
                )}
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {client.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete client?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {client.full_name} and all their data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Credit Balance */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Credit Balance</p>
                      <p className={`text-3xl font-bold ${(client.credit_balance || 0) <= 2 ? "text-warning" : ""}`}>
                        {client.credit_balance || 0} credits
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => navigate(`/payments?client=${client.id}`)}>
                    Add Credits
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Purchase History */}
            <Card>
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
              </CardHeader>
              <CardContent>
                {client.purchases.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No purchases yet</p>
                ) : (
                  <div className="space-y-3">
                    {client.purchases.map((purchase: any) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{purchase.products?.name || "Unknown Product"}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(purchase.amount_cents)}</p>
                          <Badge
                            variant={
                              purchase.status === "paid"
                                ? "default"
                                : purchase.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {purchase.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session History */}
            <Card>
              <CardHeader>
                <CardTitle>Session History</CardTitle>
              </CardHeader>
              <CardContent>
                {client.sessions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No sessions yet</p>
                ) : (
                  <div className="space-y-3">
                    {client.sessions.map((session: any) => (
                      <div key={session.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {new Date(session.occurred_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.duration_minutes} min
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">-{session.credits_used} credit{session.credits_used !== 1 ? "s" : ""}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Portal Link */}
            <Card>
              <CardHeader>
                <CardTitle>Client Portal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Share this link with your client so they can view their balance and purchase sessions.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={copyPortalLink}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button variant="outline" asChild>
                    <a href={getPortalUrl() || "#"} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <ClientFormDialog open={editOpen} onOpenChange={setEditOpen} client={client as any} />
      </div>
    </AppLayout>
  );
}
