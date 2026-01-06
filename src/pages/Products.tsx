import { useState } from "react";
import { useProducts, Product } from "@/hooks/useProducts";
import { useTrainerProfile } from "@/hooks/useTrainerProfile";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductFormDialog } from "@/components/products/ProductFormDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Package, Edit, Trash2, CreditCard, RefreshCcw } from "lucide-react";

export default function Products() {
  const { products, isLoading, updateProduct, deleteProduct } = useProducts();
  const { profile } = useTrainerProfile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatCurrency = (cents: number) => {
    const currency = profile?.currency || "USD";
    const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", CAD: "$", AUD: "$" };
    return `${symbols[currency]}${(cents / 100).toFixed(2)}`;
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, active: !product.active });
      toast.success(`Product ${product.active ? "deactivated" : "activated"}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (product: Product) => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success("Product deleted");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const packages = products.filter((p) => p.type === "package");
  const memberships = products.filter((p) => p.type === "membership");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your session packages and memberships
            </p>
          </div>
          <Button onClick={() => { setEditingProduct(null); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="p-4 bg-muted rounded-full mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create session packages and memberships for your clients
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Session Packages */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Session Packages
              </h2>
              {packages.length === 0 ? (
                <p className="text-muted-foreground">No session packages</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      formatCurrency={formatCurrency}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Memberships */}
            <div>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <RefreshCcw className="h-5 w-5" />
                Memberships
              </h2>
              {memberships.length === 0 ? (
                <p className="text-muted-foreground">No memberships</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {memberships.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      formatCurrency={formatCurrency}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <ProductFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setEditingProduct(null);
          }}
          product={editingProduct}
        />
      </div>
    </AppLayout>
  );
}

interface ProductCardProps {
  product: Product;
  formatCurrency: (cents: number) => string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleActive: (product: Product) => void;
}

function ProductCard({ product, formatCurrency, onEdit, onDelete, onToggleActive }: ProductCardProps) {
  return (
    <Card className={!product.active ? "opacity-60" : ""}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(product.price_cents)}
              {product.type === "membership" && <span className="text-sm text-muted-foreground">/mo</span>}
            </p>
          </div>
          <Badge variant={product.type === "package" ? "default" : "secondary"}>
            {product.type}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p>{product.credits_amount} credits</p>
          {product.expiry_days && <p>Expires in {product.expiry_days} days</p>}
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            <Switch
              checked={product.active}
              onCheckedChange={() => onToggleActive(product)}
            />
            <span className="text-sm text-muted-foreground">
              {product.active ? "Active" : "Inactive"}
            </span>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete product?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete "{product.name}". Existing purchases will not be affected.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(product)}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
