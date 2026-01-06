import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("[PROCESS-REMINDERS] Starting reminder processing");

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Get all trainers with reminders enabled
    const { data: trainers } = await supabaseClient
      .from("trainer_profiles")
      .select("*");

    if (!trainers || trainers.length === 0) {
      console.log("[PROCESS-REMINDERS] No trainers found");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let remindersSent = 0;

    for (const trainer of trainers) {
      console.log("[PROCESS-REMINDERS] Processing trainer:", trainer.business_name);

      // 1. Payment due reminders (pending purchases > 3 days)
      if (trainer.reminder_payment_due) {
        const { data: pendingPurchases } = await supabaseClient
          .from("purchases")
          .select("*, clients(full_name, email), products(name)")
          .eq("trainer_id", trainer.id)
          .eq("status", "pending")
          .lt("created_at", threeDaysAgo.toISOString());

        for (const purchase of pendingPurchases || []) {
          if (!purchase.clients?.email) continue;

          // Check if we already sent a reminder recently (within 7 days)
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const { data: existingReminder } = await supabaseClient
            .from("reminder_events")
            .select("id")
            .eq("client_id", purchase.client_id)
            .eq("type", "payment_due")
            .gt("created_at", sevenDaysAgo.toISOString())
            .limit(1);

          if (existingReminder && existingReminder.length > 0) continue;

          const sent = await sendReminder({
            to: purchase.clients.email,
            subject: `Payment Reminder - ${purchase.products?.name || "Purchase"}`,
            html: `
              <h2>Payment Reminder</h2>
              <p>Hi ${purchase.clients.full_name},</p>
              <p>This is a friendly reminder that your payment for <strong>${purchase.products?.name}</strong> is still pending.</p>
              <p>Please complete your payment at your earliest convenience.</p>
              <p>Thank you,<br>${trainer.business_name || "Your Trainer"}</p>
            `,
          });

          await supabaseClient.from("reminder_events").insert({
            trainer_id: trainer.id,
            client_id: purchase.client_id,
            type: "payment_due",
            status: sent ? "sent" : "failed",
            payload_json: { purchase_id: purchase.id },
          });

          if (sent) remindersSent++;
        }
      }

      // 2. Low credits reminders (clients with <= 2 credits)
      if (trainer.reminder_low_credits) {
        const { data: clients } = await supabaseClient
          .from("clients")
          .select("*")
          .eq("trainer_id", trainer.id)
          .eq("status", "active");

        for (const client of clients || []) {
          if (!client.email) continue;

          // Get credit balance
          const { data: ledger } = await supabaseClient
            .from("credit_ledger")
            .select("delta_credits")
            .eq("client_id", client.id);

          const balance = ledger?.reduce((sum, e) => sum + e.delta_credits, 0) || 0;

          if (balance > 2) continue;

          // Check if we already sent a reminder recently (within 7 days)
          const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const { data: existingReminder } = await supabaseClient
            .from("reminder_events")
            .select("id")
            .eq("client_id", client.id)
            .eq("type", "low_credits")
            .gt("created_at", sevenDaysAgo.toISOString())
            .limit(1);

          if (existingReminder && existingReminder.length > 0) continue;

          // Get portal token
          const { data: portalToken } = await supabaseClient
            .from("client_portal_tokens")
            .select("token")
            .eq("client_id", client.id)
            .single();

          const sent = await sendReminder({
            to: client.email,
            subject: `Running Low on Sessions`,
            html: `
              <h2>Running Low on Sessions</h2>
              <p>Hi ${client.full_name},</p>
              <p>You have <strong>${balance} session${balance !== 1 ? "s" : ""}</strong> remaining.</p>
              <p>Purchase more sessions to keep training!</p>
              ${portalToken ? `<p><a href="${Deno.env.get("SUPABASE_URL")?.replace(".supabase.co", ".lovable.app")}/portal/${portalToken.token}">View your account</a></p>` : ""}
              <p>Thank you,<br>${trainer.business_name || "Your Trainer"}</p>
            `,
          });

          await supabaseClient.from("reminder_events").insert({
            trainer_id: trainer.id,
            client_id: client.id,
            type: "low_credits",
            status: sent ? "sent" : "failed",
            payload_json: { balance },
          });

          if (sent) remindersSent++;
        }
      }
    }

    console.log("[PROCESS-REMINDERS] Completed. Reminders sent:", remindersSent);

    return new Response(JSON.stringify({ processed: remindersSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[PROCESS-REMINDERS] Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function sendReminder({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SessionPay <onboarding@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });
    if (!res.ok) throw new Error(await res.text());
    console.log("[PROCESS-REMINDERS] Email sent to:", to);
    return true;
  } catch (error) {
    console.error("[PROCESS-REMINDERS] Email failed:", error);
    return false;
  }
}
