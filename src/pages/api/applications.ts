import { z } from "zod";
import type { APIRoute } from "astro";
import { ApplicationService } from "../../lib/services/application.service";
import { createSupabaseServerInstance } from "../../db/supabase.client";
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

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    // Extract and validate query parameters
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);

    const validationResult = applicationsQuerySchema.safeParse(queryParams);

    if (!validationResult.success) {
      return createErrorResponse(400, "Invalid query parameters.");
    }

    const validatedParams = validationResult.data;

    // Create authenticated Supabase client for this request
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Ensure session is loaded properly for RLS
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      return createErrorResponse(401, "Invalid session.");
    }

    // Get authenticated user
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser.user) {
      return createErrorResponse(401, "Authentication required.");
    }

    const user = {
      id: authUser.user.id,
      email: authUser.user.email,
    };

    const filters = {
      ...validatedParams,
      userId: user.id,
    };

    // Call service layer
    const applicationService = new ApplicationService(supabase);
    const result = await applicationService.getApplications(filters);

    // Return successful response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(500, "Internal server error.");
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Parse and validate request body using Zod schema
    const body = await request.json();

    const validationResult = CreateApplicationRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return createErrorResponse(
        400,
        "Validation failed. Please check your input data.",
      );
    }

    const validatedData = validationResult.data;

    // Create authenticated Supabase client for this request
    const supabase = createSupabaseServerInstance({
      cookies,
      headers: request.headers,
    });

    // Ensure session is loaded properly for RLS
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      return createErrorResponse(401, "Invalid session.");
    }

    // Get authenticated user
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser.user) {
      return createErrorResponse(401, "Authentication required.");
    }

    const user = {
      id: authUser.user.id,
      email: authUser.user.email,
    };

    // Create command with authenticated user ID
    // Ensure application_date is a string for CreateApplicationCommand
    const command: CreateApplicationCommand = {
      user_id: user.id,
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
    const applicationService = new ApplicationService(supabase);
    const result = await applicationService.createApplication(command);

    // Return successful response with 201 Created
    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return createErrorResponse(500, "Internal server error.");
  }
};
