import type { APIRoute } from "astro";
import type { DailyMotivationResponse } from "../../../types";
import { motivationalMessages } from "../../../lib/constants/motivational-messages";

export const prerender = false;

/**
 * GET /api/messages/daily-motivation
 * Retrieves the daily motivational message for the authenticated user.
 * If no message exists for today, selects a random one from predefined list,
 * saves it to the database, and returns it. Idempotent: calling multiple times
 * on the same day returns the same message.
 *
 * @returns {Promise<Response>} JSON response with { message: string } or error
 */
export const GET: APIRoute = async ({ locals }) => {
  try {
    // Step 1: Authentication check - Ensure user is authenticated via middleware
    if (!locals.user) {
      return new Response(JSON.stringify({ error: "Authentication required." } as { error: string }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = locals.supabase; // Supabase client from middleware

    // Step 2: Get current UTC date for consistency across timezones
    // Format: YYYY-MM-DD to match database display_date column
    const currentDate = new Date().toISOString().split("T")[0];

    // Step 3: Idempotent logic - Query for existing message for this user and date
    // Using .single() to get exactly one row or error if multiple (shouldn't happen due to unique constraint)
    const { data: existingMessage, error: queryError } = await supabase
      .from("daily_user_messages")
      .select("message_text")
      .eq("user_id", locals.user.id)
      .eq("display_date", currentDate)
      .single();

    // Handle query error: Ignore 'no rows' (PGRST116), throw others (e.g., DB connection issues)
    if (queryError && queryError.code !== "PGRST116") {
      throw queryError;
    }

    let message: string;

    if (existingMessage) {
      // Existing message found - return it (idempotency)
      message = existingMessage.message_text;
    } else {
      // No existing message - Select random from predefined list and insert new record
      const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
      message = motivationalMessages[randomIndex];

      // Insert new record with user_id, message, and display_date
      // Assumes unique constraint on (user_id, display_date) prevents duplicates
      const { error: insertError } = await supabase.from("daily_user_messages").insert({
        user_id: locals.user.id,
        message_text: message,
        display_date: currentDate,
      });

      if (insertError) {
        // Could be unique violation if race condition, but log and throw
        throw insertError;
      }
    }

    // Step 4: Prepare and return success response
    // Typed as DailyMotivationResponse for safety
    return new Response(JSON.stringify({ message } as DailyMotivationResponse), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Catch all unexpected errors (DB, auth, etc.) and return generic 500
    // Log for debugging; do not expose details to client
    return new Response(JSON.stringify({ error: "An unexpected error occurred." } as { error: string }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
