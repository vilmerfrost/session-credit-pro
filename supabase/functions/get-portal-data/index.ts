import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const { token } = await req.json();

    if (!token) {
      throw new Error("Token is required");
    }

    console.log("[GET-PORTAL-DATA] Looking up token:", token);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get portal token data
    const { data: portalToken, error: tokenError } = await supabaseClient
      .from("client_portal_tokens")
      .select("*, clients(*), trainer_profiles(*)")
      .eq("token", token)
      .single();

    if (tokenError || !portalToken) {
      console.log("[GET-PORTAL-DATA] Token not found:", tokenError);
      throw new Error("Invalid portal token");
    }

    console.log("[GET-PORTAL-DATA] Found token for client:", portalToken.clients?.full_name);

    // Get credit balance
    const { data: ledger } = await supabaseClient
      .from("credit_ledger")
      .select("delta_credits")
      .eq("client_id", portalToken.client_id);

    const credits = ledger?.reduce((sum, e) => sum + e.delta_credits, 0) || 0;

    // Get active products
    const { data: products } = await supabaseClient
      .from("products")
      .select("*")
      .eq("trainer_id", portalToken.trainer_id)
      .eq("active", true)
      .order("price_cents", { ascending: true });

    // Get purchase history
    const { data: purchases } = await supabaseClient
      .from("purchases")
      .select("*, products(name)")
      .eq("client_id", portalToken.client_id)
      .order("created_at", { ascending: false })
      .limit(20);

    const response = {
      trainer: {
        business_name: portalToken.trainer_profiles?.business_name || "",
        logo_url: portalToken.trainer_profiles?.logo_url || null,
        currency: portalToken.trainer_profiles?.currency || "USD",
      },
      client: {
        full_name: portalToken.clients?.full_name || "",
        email: portalToken.clients?.email || null,
      },
      credits,
      products: products || [],
      purchases: (purchases || []).map((p: any) => ({
        id: p.id,
        product_name: p.products?.name || "Unknown",
        amount_cents: p.amount_cents,
        currency: p.currency,
        status: p.status,
        created_at: p.created_at,
      })),
    };

    console.log("[GET-PORTAL-DATA] Returning data for portal");

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("[GET-PORTAL-DATA] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
