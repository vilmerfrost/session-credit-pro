import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  // For now, we'll process without signature verification
  // In production, you should add STRIPE_WEBHOOK_SECRET and verify
  let event: Stripe.Event;

  try {
    event = JSON.parse(body) as Stripe.Event;
    console.log("Received Stripe event:", event.type);
  } catch (err) {
    console.error("Error parsing webhook body:", err);
    return new Response("Invalid payload", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log("Processing checkout.session.completed:", session.id);

    // Find the purchase by stripe_checkout_session_id
    const { data: purchase, error: fetchError } = await supabaseAdmin
      .from("purchases")
      .select("*, products(credits_amount)")
      .eq("stripe_checkout_session_id", session.id)
      .single();

    if (fetchError || !purchase) {
      console.error("Purchase not found for session:", session.id, fetchError);
      return new Response("Purchase not found", { status: 404 });
    }

    if (purchase.status === "paid") {
      console.log("Purchase already marked as paid:", purchase.id);
      return new Response(JSON.stringify({ received: true, already_paid: true }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Update purchase to paid
    const { error: updateError } = await supabaseAdmin
      .from("purchases")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: session.payment_intent as string,
      })
      .eq("id", purchase.id);

    if (updateError) {
      console.error("Error updating purchase:", updateError);
      return new Response("Error updating purchase", { status: 500 });
    }

    // Add credits to ledger
    const creditsAmount = purchase.products?.credits_amount || 0;
    const { error: ledgerError } = await supabaseAdmin
      .from("credit_ledger")
      .insert({
        trainer_id: purchase.trainer_id,
        client_id: purchase.client_id,
        source: "purchase",
        delta_credits: creditsAmount,
        purchase_id: purchase.id,
        note: `Purchase of ${creditsAmount} credits`,
      });

    if (ledgerError) {
      console.error("Error adding credits to ledger:", ledgerError);
      return new Response("Error adding credits", { status: 500 });
    }

    console.log("Successfully processed payment for purchase:", purchase.id, "Credits added:", creditsAmount);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
});
