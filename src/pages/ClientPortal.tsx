import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useState } from "react";
import { CreditCard, Package, Loader2, CheckCircle } from "lucide-react";

export default function ClientPortal() {
  const { token } = useParams<{ token: string }>();
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["portal", token],
    queryFn: async () => {
      if (!token) throw new Error("No token");

      const { data, error } = await supabase.functions.invoke("get-portal-data", {
        body: { token },
      });

      if (error) throw error;
      if (!data) throw new Error("Portal not found");
      return data;
    },
    enabled: !!token,
  });

  const handleCheckout = async (productId: string) => {
    setIsCheckingOut(productId);
    try {
      const { data: checkoutData, error } = await supabase.functions.invoke("create-portal-checkout", {
        body: { token, product_id: productId },
      });

      if (error) throw error;
      if (checkoutData?.url) {
        window.location.href = checkoutData.url;
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsCheckingOut(null);
    }
  };

  const formatCurrency = (cents: number, currency: string) => {
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$" };
    return `${symbols[currency] || "$"}${(cents / 100).toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Portal Not Found</h2>
            <p className="text-muted-foreground">
              This link may be invalid or expired. Please contact your trainer.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { trainer, client, credits, products, purchases } = data;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-2xl mx-auto p-4">
          <div className="flex items-center gap-4">
            {trainer.logo_url && (
              <img
                src={trainer.logo_url}
                alt={trainer.business_name}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold">{trainer.business_name || "My Trainer"}</h1>
              <p className="text-muted-foreground">Client Portal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Welcome */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground">Welcome back,</p>
                <h2 className="text-2xl font-bold">{client.full_name}</h2>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-sm">Credit Balance</p>
                <p className={`text-3xl font-bold ${credits <= 2 ? "text-warning" : "text-primary"}`}>
                  {credits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buy Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Buy Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {products.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No packages available at the moment.
              </p>
            ) : (
              products.map((product: any) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.credits_amount} credits
                      {product.type === "membership" && " / month"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">
                      {formatCurrency(product.price_cents, product.currency)}
                      {product.type === "membership" && <span className="text-sm font-normal">/mo</span>}
                    </span>
                    <Button
                      onClick={() => handleCheckout(product.id)}
                      disabled={isCheckingOut === product.id}
                    >
                      {isCheckingOut === product.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Buy"
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Purchase History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Purchase History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No purchases yet.
              </p>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase: any) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{purchase.product_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatCurrency(purchase.amount_cents, purchase.currency)}
                      </span>
                      {purchase.status === "paid" ? (
                        <Badge className="bg-success text-success-foreground">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Paid
                        </Badge>
                      ) : (
                        <Badge variant="secondary">{purchase.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <footer className="py-8 text-center text-sm text-muted-foreground">
        Powered by SessionPay
      </footer>
    </div>
  );
}
