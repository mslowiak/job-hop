import type { APIRoute } from "astro";
import { ApplicationService } from "../../../lib/services/application.service";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";
import {
  type ApiErrorResponse,
  DeleteApplicationCommandSchema,
  type DeleteApplicationCommand,
  UpdateApplicationRequestSchema,
  NotFoundError,
} from "../../../types";

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
    // Extract id from dynamic route parameters
    const { id } = context.params;

    if (!id) {
      return createErrorResponse(400, "Application ID is required");
    }

    // Call service layer to get application by ID
    const applicationService = new ApplicationService();
    const application = await applicationService.getApplicationById(
      id,
      DEFAULT_USER_ID,
    );

    // Return the application data
    return new Response(JSON.stringify(application), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof NotFoundError) {
      return createErrorResponse(404, "Application not found");
    }

    // Log unexpected errors with context
    console.error("API /api/applications/[id] GET error:", {
      method: "GET",
      endpoint: "/api/applications/{id}",
      error: error instanceof Error ? error.message : String(error),
      params: context.params,
      timestamp: new Date(),
    });

    return createErrorResponse(500, "Internal server error");
  }
};

export const PATCH: APIRoute = async (context) => {
  try {
    // Extract id from dynamic route parameters
    const { id } = context.params;

    if (!id) {
      return createErrorResponse(400, "Application ID is required");
    }

    // Parse request body
    let requestBody;
    try {
      requestBody = await context.request.json();
    } catch (error) {
      return createErrorResponse(400, "Invalid JSON in request body");
    }

    // Validate request body using Zod schema
    const validationResult =
      UpdateApplicationRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      // Extract and log validation errors
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      console.error("PATCH /api/applications/[id] validation errors:", {
        method: "PATCH",
        endpoint: "/api/applications/{id}",
        errors,
        params: { id },
        timestamp: new Date(),
      });

      return createErrorResponse(400, "Invalid request data");
    }

    const validatedData = validationResult.data;

    // Call service layer to update application
    const applicationService = new ApplicationService();
    const updatedApplication = await applicationService.updateApplication(
      id,
      DEFAULT_USER_ID,
      validatedData,
    );

    // Return the updated application data
    return new Response(JSON.stringify(updatedApplication), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof NotFoundError) {
      return createErrorResponse(404, "Application not found");
    }

    // Log unexpected errors with context
    console.error("API /api/applications/[id] PATCH error:", {
      method: "PATCH",
      endpoint: "/api/applications/{id}",
      error: error instanceof Error ? error.message : String(error),
      params: context.params,
      timestamp: new Date(),
    });

    return createErrorResponse(500, "Internal server error");
  }
};

export const DELETE: APIRoute = async (context) => {
  try {
    // Extract id from dynamic route parameters
    const { id } = context.params;

    if (!id) {
      return createErrorResponse(400, "Application ID is required");
    }

    // Validate id as UUID using Zod schema
    const validationResult = DeleteApplicationCommandSchema.safeParse({
      id,
      user_id: DEFAULT_USER_ID, // Use hardcoded user ID for development
    });

    if (!validationResult.success) {
      // Extract and log validation errors
      const errors = validationResult.error.errors.map((err) => ({
        field: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      console.error("DELETE /api/applications/[id] validation errors:", {
        method: "DELETE",
        endpoint: "/api/applications/{id}",
        errors,
        params: { id },
        timestamp: new Date(),
      });

      return createErrorResponse(400, "Invalid application ID format");
    }

    const validatedData = validationResult.data;

    // Build command for service layer
    const command: DeleteApplicationCommand = {
      id: validatedData.id,
      user_id: validatedData.user_id,
    };

    // Call service layer
    const applicationService = new ApplicationService();
    await applicationService.deleteApplication(command);

    // Return 204 No Content on successful deletion
    return new Response(null, { status: 204 });
  } catch (error) {
    // Handle specific error types
    if (error instanceof NotFoundError) {
      return createErrorResponse(404, "Application not found");
    }

    // Log unexpected errors with context
    console.error("API /api/applications/[id] DELETE error:", {
      method: "DELETE",
      endpoint: "/api/applications/{id}",
      error: error instanceof Error ? error.message : String(error),
      params: context.params,
      timestamp: new Date(),
    });

    return createErrorResponse(500, "Internal server error");
  }
};
