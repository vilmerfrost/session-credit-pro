import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePurchases, Purchase } from "@/hooks/usePurchases";
import { useClients } from "@/hooks/useClients";
import { useProducts } from "@/hooks/useProducts";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, CreditCard, Loader2, ExternalLink, CheckCircle } from "lucide-react";

export default function Payments() {
  const [searchParams] = useSearchParams();
  const { purchases, isLoading, createPurchase, markPurchasePaid } = usePurchases();
  const { clients } = useClients();
  const { products } = useProducts();
  const { profile } = useTrainerProfile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(searchParams.get("client") || "");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeClients = clients.filter((c) => c.status === "active");
  const activeProducts = products.filter((p) => p.active);

  const formatCurrency = (cents: number) => {
    const currency = profile?.currency || "USD";
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$" };
    return `${symbols[currency]}${(cents / 100).toFixed(2)}`;
  };

  const handleCreateCheckout = async () => {
    if (!selectedClient || !selectedProduct) {
      toast.error("Please select a client and product");
      return;
    }

    setIsSubmitting(true);
    try {
      const product = products.find((p) => p.id === selectedProduct);
      if (!product) throw new Error("Product not found");

      // Create a pending purchase
      const purchase = await createPurchase.mutateAsync({
        client_id: selectedClient,
        product_id: selectedProduct,
        amount_cents: product.price_cents,
        status: "pending",
      });

      // Call edge function to create Stripe checkout
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          purchase_id: purchase.id,
          product_id: selectedProduct,
          client_id: selectedClient,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        toast.success("Checkout link opened in new tab");
      }

      setDialogOpen(false);
      setSelectedClient("");
      setSelectedProduct("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkPaid = async (purchase: Purchase) => {
    try {
      await markPurchasePaid.mutateAsync({
        purchaseId: purchase.id,
        creditsAmount: purchase.product?.credits_amount || 0,
      });
      toast.success("Purchase marked as paid and credits added");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-success text-success-foreground">Paid</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "refunded":
        return <Badge variant="outline">Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Payments</h1>
            <p className="text-muted-foreground mt-1">
              Create payment links and track purchases
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Payment Link
          </Button>
        </div>

        {/* Purchases List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : purchases.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-muted rounded-full mb-4">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create a payment link to start collecting payments
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Payment Link
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CreditCard className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{purchase.client?.full_name || "Unknown Client"}</p>
                        <p className="text-sm text-muted-foreground">
                          {purchase.product?.name || "Unknown Product"} • {new Date(purchase.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{formatCurrency(purchase.amount_cents)}</span>
                      {getStatusBadge(purchase.status)}
                      {purchase.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => handleMarkPaid(purchase)}>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Payment Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Payment Link</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.price_cents)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {products.find((p) => p.id === selectedProduct)?.credits_amount} credits will be added when paid
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCheckout} disabled={isSubmitting || !selectedClient || !selectedProduct}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Create & Open Link
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
