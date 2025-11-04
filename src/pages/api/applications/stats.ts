import type { APIRoute } from "astro";
import { ApplicationService } from "../../../lib/services/application.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import type { ApiErrorResponse } from "../../../types";

export const prerender = false;

/**
 * Helper function to create consistent error responses
 */
function createErrorResponse(status: number, message: string): Response {
  const errorResponse: ApiErrorResponse = { error: message };
  return new Response(JSON.stringify(errorResponse), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET: APIRoute = async () => {
  try {
    // Use hardcoded user ID for MVP (authentication will be added later)
    const userId = DEFAULT_USER_ID;

    // Call service layer to get application statistics
    const applicationService = new ApplicationService();
    const stats = await applicationService.getApplicationStats(userId);

    // Return the statistics data
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log unexpected errors with context
    console.error("API /api/applications/stats GET error:", {
      method: "GET",
      endpoint: "/api/applications/stats",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
    });

    return createErrorResponse(500, "Internal server error");
  }
};
