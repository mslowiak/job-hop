import { z } from "zod";
import type { APIRoute } from "astro";
import { ApplicationService } from "../../lib/services/application.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import type { ApiErrorResponse } from "../../types";

// Zod schema for query parameter validation
const applicationsQuerySchema = z.object({
  status: z
    .enum(["planned", "sent", "in_progress", "interview", "rejected", "offer"])
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

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
    // Extract and validate query parameters
    const url = new URL(context.request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const validationResult = applicationsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return createErrorResponse(400, "Invalid query parameters.");
    }

    const validatedParams = validationResult.data;

    // Use hardcoded user ID for now (authentication will be added later)
    const filters = {
      ...validatedParams,
      userId: DEFAULT_USER_ID,
    };

    // Call service layer
    const applicationService = new ApplicationService();
    const result = await applicationService.getApplications(filters);

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API /applications GET error:", {
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date(),
    });

    return createErrorResponse(500, "Internal server error.");
  }
};
