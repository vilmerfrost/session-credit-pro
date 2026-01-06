import { useState } from "react";
import { Link } from "react-router-dom";
import { useClients, Client } from "@/hooks/useClients";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientFormDialog } from "@/components/clients/ClientFormDialog";
import { Plus, Search, Users, CreditCard } from "lucide-react";

export default function Clients() {
  const { clients, isLoading } = useClients();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.full_name.toLowerCase().includes(search.toLowerCase()) ||
      client.email?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Clients</h1>
            <p className="text-muted-foreground mt-1">
              Manage your client roster
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Client List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {search || statusFilter !== "all" ? "No clients found" : "No clients yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {search || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Add your first client to get started"}
              </p>
              {!search && statusFilter === "all" && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Client
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client) => (
              <ClientCard key={client.id} client={client} />
            ))}
          </div>
        )}

        <ClientFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </div>
    </AppLayout>
  );
}

function ClientCard({ client }: { client: Client }) {
  return (
    <Link to={`/clients/${client.id}`}>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {client.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{client.full_name}</h3>
                <Badge variant={client.status === "active" ? "default" : "secondary"}>
                  {client.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {client.email || client.phone || "No contact info"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span className={`font-semibold ${(client.credit_balance || 0) <= 2 ? "text-warning" : ""}`}>
              {client.credit_balance || 0} credits
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
