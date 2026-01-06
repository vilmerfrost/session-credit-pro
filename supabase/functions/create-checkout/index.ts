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
    const { purchase_id, product_id, client_id } = await req.json();

    console.log("[CREATE-CHECKOUT] Creating checkout for:", { purchase_id, product_id, client_id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get product details
    const { data: product, error: productError } = await supabaseClient
      .from("products")
      .select("*, trainer_profiles(*)")
      .eq("id", product_id)
      .single();

    if (productError || !product) {
      throw new Error("Product not found");
    }

    // Get client details
    const { data: client, error: clientError } = await supabaseClient
      .from("clients")
      .select("*")
      .eq("id", client_id)
      .single();

    if (clientError || !client) {
      throw new Error("Client not found");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check if client has a Stripe customer ID
    let customerId = client.stripe_customer_id;
    if (!customerId && client.email) {
      const customers = await stripe.customers.list({ email: client.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
        // Update client with Stripe customer ID
        await supabaseClient
          .from("clients")
          .update({ stripe_customer_id: customerId })
          .eq("id", client_id);
      }
    }

    const origin = req.headers.get("origin") || "https://lovable.dev";

    // Create Stripe Checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: product.type === "membership" ? "subscription" : "payment",
      success_url: `${origin}/payment-success?purchase_id=${purchase_id}`,
      cancel_url: `${origin}/payment-canceled`,
      customer: customerId || undefined,
      customer_email: customerId ? undefined : client.email || undefined,
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
        purchase_id,
        product_id,
        client_id,
        trainer_id: product.trainer_id,
        credits_amount: product.credits_amount.toString(),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    console.log("[CREATE-CHECKOUT] Session created:", session.id);

    // Update purchase with checkout session ID
    await supabaseClient
      .from("purchases")
      .update({ stripe_checkout_session_id: session.id })
      .eq("id", purchase_id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[CREATE-CHECKOUT] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
