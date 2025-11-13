import type { APIRoute } from "astro";
import { ApplicationService } from "../../../lib/services/application.service";
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

    // Get authenticated user from middleware
    const user = context.locals.user;
    if (!user) {
      return createErrorResponse(401, "Authentication required.");
    }

    // Call service layer to get application by ID
    const applicationService = new ApplicationService(context.locals.supabase);
    const application = await applicationService.getApplicationById(
      id,
      user.id,
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
    } catch {
      return createErrorResponse(400, "Invalid JSON in request body");
    }

    // Validate request body using Zod schema
    const validationResult =
      UpdateApplicationRequestSchema.safeParse(requestBody);

    if (!validationResult.success) {
      return createErrorResponse(400, "Invalid request data");
    }

    const validatedData = validationResult.data;

    // Get authenticated user from middleware
    const user = context.locals.user;
    if (!user) {
      return createErrorResponse(401, "Authentication required.");
    }

    // Call service layer to update application
    const applicationService = new ApplicationService(context.locals.supabase);
    const updatedApplication = await applicationService.updateApplication(
      id,
      user.id,
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

    // Get authenticated user from middleware
    const user = context.locals.user;
    if (!user) {
      return createErrorResponse(401, "Authentication required.");
    }

    // Validate id as UUID using Zod schema
    const validationResult = DeleteApplicationCommandSchema.safeParse({
      id,
      user_id: user.id,
    });

    if (!validationResult.success) {
      return createErrorResponse(400, "Invalid application ID format");
    }

    const validatedData = validationResult.data;

    // Build command for service layer
    const command: DeleteApplicationCommand = {
      id: validatedData.id,
      user_id: validatedData.user_id,
    };

    // Call service layer
    const applicationService = new ApplicationService(context.locals.supabase);
    await applicationService.deleteApplication(command);

    // Return 204 No Content on successful deletion
    return new Response(null, { status: 204 });
  } catch (error) {
    // Handle specific error types
    if (error instanceof NotFoundError) {
      return createErrorResponse(404, "Application not found");
    }

    return createErrorResponse(500, "Internal server error");
  }
};
