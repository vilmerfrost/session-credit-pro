import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, product_id } = await req.json();

    console.log("[CREATE-PORTAL-CHECKOUT] Creating portal checkout:", { token, product_id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify portal token
    const { data: portalToken, error: tokenError } = await supabaseClient
      .from("client_portal_tokens")
      .select("*, clients(*), trainer_profiles(*)")
      .eq("token", token)
      .single();

    if (tokenError || !portalToken) {
      throw new Error("Invalid portal token");
    }

    // Get product
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("*")
      .eq("id", product_id)
      .eq("trainer_id", portalToken.trainer_id)
      .eq("active", true)
      .single();

    if (productError || !product) {
      throw new Error("Product not found or not available");
    }

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from("purchases")
      .insert({
        trainer_id: portalToken.trainer_id,
        client_id: portalToken.client_id,
        product_id: product_id,
        amount_cents: product.price_cents,
        currency: product.currency,
        status: "pending",
      })
      .select()
      .single();

    if (purchaseError) {
      throw new Error("Failed to create purchase");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const client = portalToken.clients;
    let customerId = client?.stripe_customer_id;

    if (!customerId && client?.email) {
      const customers = await stripe.customers.list({ email: client.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        await supabaseClient
          .from("clients")
          .update({ stripe_customer_id: customerId })
          .eq("id", portalToken.client_id);
      }
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: product.type === "membership" ? "subscription" : "payment",
      success_url: `${origin}/portal/${token}?success=true`,
      cancel_url: `${origin}/portal/${token}`,
      customer: customerId || undefined,
      customer_email: customerId ? undefined : client?.email || undefined,
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: `${product.credits_amount} session credits`,
            },
            unit_amount: product.price_cents,
            ...(product.type === "membership" ? { recurring: { interval: "month" } } : {}),
          },
          quantity: 1,
        },
      ],
      metadata: {
        purchase_id: purchase.id,
        product_id,
        client_id: portalToken.client_id,
        trainer_id: portalToken.trainer_id,
        credits_amount: product.credits_amount.toString(),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    await supabaseClient
      .from("purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", purchase.id);

    console.log("[CREATE-PORTAL-CHECKOUT] Session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[CREATE-PORTAL-CHECKOUT] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
