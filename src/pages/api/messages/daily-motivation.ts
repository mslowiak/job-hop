import type { APIRoute } from "astro";
import { MotivationalMessageProvider } from "../../../lib/services/motivational-message-provider.service";

interface DailyMotivationResponse {
  message: string;
}

export const prerender = false;

// GET: Fetch or generate today's motivation (idempotent)
export const GET: APIRoute = async ({ locals }) => {
  const { user } = locals;
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = locals.supabase;

    // Get current UTC date for consistency
    const currentDate = new Date().toISOString().split("T")[0];

    // Check for existing message
    const { data: existingMessage, error: queryError } = await supabase
      .from("daily_user_messages")
      .select("message_text")
      .eq("user_id", user.id)
      .eq("display_date", currentDate)
      .single();

    if (queryError && queryError.code !== "PGRST116") {
      throw new Error(`Query error: ${queryError.message}`);
    }

    if (existingMessage) {
      // Return existing
      return new Response(
        JSON.stringify({
          message: existingMessage.message_text,
        } as DailyMotivationResponse),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // No existing: Generate via provider and save
    const generator = MotivationalMessageProvider.getImplementation();
    const message = await generator.generate();

    // Save to DB
    const { error: insertError } = await supabase.from("daily_user_messages").insert({
      user_id: user.id,
      display_date: currentDate,
      message_text: message,
    });

    if (insertError) {
      throw new Error(`Failed to save motivation: ${insertError.message}`);
    }

    // Return generated
    return new Response(
      JSON.stringify({
        message,
      } as DailyMotivationResponse),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    // eslint-disable-next-line no-console
    console.error("Daily motivation GET error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
