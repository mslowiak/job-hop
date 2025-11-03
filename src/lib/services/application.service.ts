import { supabaseClient } from "../../db/supabase.client";
import type {
  ApplicationDto,
  ApplicationStatus,
  ApplicationListResponseDto,
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
}
