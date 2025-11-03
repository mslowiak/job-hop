import { z } from "zod";
import type { APIRoute } from "astro";
import { ApplicationService } from "../../lib/services/application.service";
import { DEFAULT_USER_ID } from "../../db/supabase.client";
import {
  type ApiErrorResponse,
  CreateApplicationRequestSchema,
  type CreateApplicationCommand,
} from "../../types";

export const prerender = false;

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
    const requestUrl = new URL(context.request.url);
    console.error("API /applications GET error:", {
      method: "GET",
      endpoint: "/api/applications",
      error: error instanceof Error ? error.message : String(error),
      queryParams: Object.fromEntries(requestUrl.searchParams),
      timestamp: new Date(),
    });

    return createErrorResponse(500, "Internal server error.");
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate request body using Zod schema
    const body = await request.json();

    const validationResult = CreateApplicationRequestSchema.safeParse(body);

    if (!validationResult.success) {
      // Extract validation errors and format for safe response
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      console.error("POST /api/applications validation errors:", {
        method: "POST",
        endpoint: "/api/applications",
        errors,
        timestamp: new Date(),
      });

      return createErrorResponse(
        400,
        "Validation failed. Please check your input data.",
      );
    }

    const validatedData = validationResult.data;

    // Create command with hardcoded DEFAULT_USER_ID for MVP
    // Ensure application_date is a string for CreateApplicationCommand
    const command: CreateApplicationCommand = {
      user_id: DEFAULT_USER_ID,
      company_name: validatedData.company_name,
      position_name: validatedData.position_name,
      application_date:
        typeof validatedData.application_date === "string"
          ? validatedData.application_date
          : validatedData.application_date.toISOString(),
      status: validatedData.status ?? "planned",
      link: validatedData.link ?? null,
      notes: validatedData.notes ?? null,
    };

    // Call service layer
    const applicationService = new ApplicationService();
    const result = await applicationService.createApplication(command);

    // Return successful response with 201 Created
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("API /applications POST error:", {
      method: "POST",
      endpoint: "/api/applications",
      error: error instanceof Error ? error.message : String(error),
      user_id: "[REDACTED]", // Redact for security
      timestamp: new Date(),
    });

    return createErrorResponse(500, "Internal server error.");
  }
};
