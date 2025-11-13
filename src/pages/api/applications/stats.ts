import type { APIRoute } from "astro";
import { ApplicationService } from "../../../lib/services/application.service";
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

export const GET: APIRoute = async (context) => {
  try {
    // Get authenticated user from middleware
    const user = context.locals.user;
    if (!user) {
      return createErrorResponse(401, "Authentication required.");
    }

    // Call service layer to get application statistics
    const applicationService = new ApplicationService(context.locals.supabase);
    const stats = await applicationService.getApplicationStats(user.id);

    // Return the statistics data
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(500, "Internal server error");
  }
};
