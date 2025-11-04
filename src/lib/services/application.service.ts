import { supabaseClient } from "../../db/supabase.client";
import type {
  ApplicationDto,
  ApplicationStatus,
  ApplicationListResponseDto,
  CreateApplicationCommand,
  ApplicationResponse,
  DeleteApplicationCommand,
  UpdateApplicationCommand,
  NotFoundError,
} from "../../types";

export interface GetApplicationsFilters {
  userId: string;
  status?: ApplicationStatus;
  page: number;
  limit: number;
}

export class ApplicationService {
  /**
   * Retrieves a paginated list of applications with optional status filtering
   * @param filters - Filter criteria including user ID, optional status, page number, and limit
   * @returns Promise containing applications array and pagination metadata
   */
  async getApplications(
    filters: GetApplicationsFilters,
  ): Promise<ApplicationListResponseDto> {
    try {
      // Build the base query with user filtering
      let query = supabaseClient
        .from("applications")
        .select("*")
        .eq("user_id", filters.userId)
        .order("created_at", { ascending: false });

      // Apply status filter if provided
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      // Apply pagination
      const from = (filters.page - 1) * filters.limit;
      const to = from + filters.limit - 1;
      query = query.range(from, to);

      // Execute the main query
      const { data: applications, error: applicationsError } = await query;

      if (applicationsError) {
        throw new Error(
          `Failed to fetch applications: ${applicationsError.message}`,
        );
      }

      // Get total count for pagination
      let countQuery = supabaseClient
        .from("applications")
        .select("count", { count: "exact", head: true })
        .eq("user_id", filters.userId);

      if (filters.status) {
        countQuery = countQuery.eq("status", filters.status);
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        throw new Error(
          `Failed to get applications count: ${countError.message}`,
        );
      }

      // Map database entities to DTOs (excluding user_id for security)
      const applicationsDto: ApplicationDto[] = (applications || []).map(
        (app) => ({
          id: app.id,
          company_name: app.company_name,
          position_name: app.position_name,
          application_date: app.application_date,
          link: app.link,
          notes: app.notes,
          status: app.status,
          created_at: app.created_at,
          updated_at: app.updated_at,
        }),
      );

      return {
        applications: applicationsDto,
        pagination: {
          total: count || 0,
          page: filters.page,
          limit: filters.limit,
        },
      };
    } catch (error) {
      console.error("ApplicationService.getApplications error:", {
        error,
        filters,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Creates a new job application entry in the database
   * @param command - The create application command with user_id
   * @returns Promise containing the created application response
   */
  async createApplication(
    command: CreateApplicationCommand,
  ): Promise<ApplicationResponse> {
    try {
      // Prepare data for insertion
      const insertData = {
        user_id: command.user_id,
        company_name: command.company_name,
        position_name: command.position_name,
        application_date: command.application_date,
        link: command.link,
        notes: command.notes,
        status: command.status,
      };

      // Insert into applications table and return the created record
      const { data, error } = await supabaseClient
        .from("applications")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create application: ${error.message}`);
      }

      if (!data) {
        throw new Error("No data returned after application creation");
      }

      // Return the application response (map to ensure correct typing)
      return {
        id: data.id,
        company_name: data.company_name,
        position_name: data.position_name,
        application_date: data.application_date,
        link: data.link,
        notes: data.notes,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      console.error("ApplicationService.createApplication error:", {
        error,
        command: { ...command, user_id: "[REDACTED]" }, // Don't log user_id for security
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Retrieves a single application by ID with ownership verification
   * @param id - The application ID to retrieve
   * @param userId - The user ID for ownership verification
   * @returns Promise containing the application response
   * @throws NotFoundError if application doesn't exist or doesn't belong to the user
   */
  async getApplicationById(
    id: string,
    userId: string,
  ): Promise<ApplicationResponse> {
    try {
      // Fetch application with ownership verification
      const { data, error } = await supabaseClient
        .from("applications")
        .select("*")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new NotFoundError("Application not found");
        }
        throw new Error(`Failed to fetch application: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError("Application not found");
      }

      // Return the application response
      return {
        id: data.id,
        company_name: data.company_name,
        position_name: data.position_name,
        application_date: data.application_date,
        link: data.link,
        notes: data.notes,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      console.error("ApplicationService.getApplicationById error:", {
        error,
        id,
        userId: "[REDACTED]",
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Updates an existing job application entry in the database
   * @param id - The application ID to update
   * @param userId - The user ID for ownership verification
   * @param updates - Partial update data
   * @returns Promise containing the updated application response
   * @throws NotFoundError if application doesn't exist or doesn't belong to the user
   */
  async updateApplication(
    id: string,
    userId: string,
    updates: UpdateApplicationCommand,
  ): Promise<ApplicationResponse> {
    try {
      // Build update data - only include non-undefined fields
      const updateData: Record<string, string | null | undefined> = {};
      if (updates.company_name !== undefined)
        updateData.company_name = updates.company_name;
      if (updates.position_name !== undefined)
        updateData.position_name = updates.position_name;
      if (updates.application_date !== undefined)
        updateData.application_date = updates.application_date;
      if (updates.link !== undefined) updateData.link = updates.link;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.status !== undefined) updateData.status = updates.status;

      // Update the application with ownership verification
      const { data, error } = await supabaseClient
        .from("applications")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new NotFoundError("Application not found");
        }
        throw new Error(`Failed to update application: ${error.message}`);
      }

      if (!data) {
        throw new NotFoundError("Application not found");
      }

      // Return the updated application response
      return {
        id: data.id,
        company_name: data.company_name,
        position_name: data.position_name,
        application_date: data.application_date,
        link: data.link,
        notes: data.notes,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      console.error("ApplicationService.updateApplication error:", {
        error,
        id,
        userId: "[REDACTED]",
        updates,
        timestamp: new Date(),
      });
      throw error;
    }
  }

  /**
   * Deletes a job application entry from the database
   * @param command - The delete application command with id and user_id for ownership verification
   * @returns Promise that resolves when deletion is complete
   * @throws NotFoundError if application doesn't exist or doesn't belong to the user
   */
  async deleteApplication(command: DeleteApplicationCommand): Promise<void> {
    try {
      // Execute delete query with ownership verification (dual filtering)
      const { data, error } = await supabaseClient
        .from("applications")
        .delete()
        .eq("id", command.id)
        .eq("user_id", command.user_id)
        .select();

      // Handle Supabase errors early with guard clause
      if (error) {
        throw new Error(`Failed to delete application: ${error.message}`);
      }

      // Check if any rows were affected (application exists and belongs to user)
      if (!data || data.length === 0) {
        throw new NotFoundError("Application not found");
      }

      // Deletion successful - no return value needed for void operation
    } catch (error) {
      // Re-throw NotFoundError as-is for proper HTTP status mapping
      if (error instanceof NotFoundError) {
        throw error;
      }

      // Log other errors with context
      console.error("ApplicationService.deleteApplication error:", {
        error,
        command: { id: command.id, user_id: "[REDACTED]" }, // Don't log user_id for security
        timestamp: new Date(),
      });
      throw error;
    }
  }
}
