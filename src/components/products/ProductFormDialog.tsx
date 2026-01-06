import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useProducts, Product } from "@/hooks/useProducts";
import { productSchema, ProductFormData } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createProduct, updateProduct } = useProducts();
  const isEditing = !!product;

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      type: "package",
      price_cents: 0,
      credits_amount: 1,
      expiry_days: null,
      active: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        type: product.type,
        price_cents: product.price_cents,
        credits_amount: product.credits_amount,
        expiry_days: product.expiry_days,
        active: product.active,
      });
    } else {
      form.reset({
        name: "",
        type: "package",
        price_cents: 0,
        credits_amount: 1,
        expiry_days: null,
        active: true,
      });
    }
  }, [product, form]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      if (isEditing && product) {
        await updateProduct.mutateAsync({ id: product.id, ...data });
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync({
          type: data.type,
          name: data.name,
          price_cents: data.price_cents,
          credits_amount: data.credits_amount,
          expiry_days: data.expiry_days,
          active: data.active,
        });
        toast.success("Product created");
      }
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const priceInDollars = (form.watch("price_cents") || 0) / 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Product" : "Create Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={form.watch("type")}
              onValueChange={(value: "package" | "membership") => form.setValue("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="package">Session Package</SelectItem>
                <SelectItem value="membership">Membership</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder={form.watch("type") === "package" ? "5 Session Pack" : "Monthly Unlimited"}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Price {form.watch("type") === "membership" && "(per month)"}
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                className="pl-7"
                value={priceInDollars}
                onChange={(e) => form.setValue("price_cents", Math.round(parseFloat(e.target.value || "0") * 100))}
              />
            </div>
            {form.formState.errors.price_cents && (
              <p className="text-sm text-destructive">{form.formState.errors.price_cents.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits_amount">Credits Included</Label>
            <Input
              id="credits_amount"
              type="number"
              min="1"
              {...form.register("credits_amount", { valueAsNumber: true })}
            />
            {form.formState.errors.credits_amount && (
              <p className="text-sm text-destructive">{form.formState.errors.credits_amount.message}</p>
            )}
          </div>

          {form.watch("type") === "package" && (
            <div className="space-y-2">
              <Label htmlFor="expiry_days">Expiry (days)</Label>
              <Input
                id="expiry_days"
                type="number"
                min="1"
                placeholder="Optional"
                value={form.watch("expiry_days") || ""}
                onChange={(e) => form.setValue("expiry_days", e.target.value ? parseInt(e.target.value) : null)}
              />
              <p className="text-xs text-muted-foreground">Leave empty for no expiration</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
