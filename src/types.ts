// DTOs and Command Models for JobHop Application API
// These types are derived from database entities and designed to match API specifications

import type {
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
} from "./db/database.types";

// Base application entity type from database
export type ApplicationEntity = Tables<"applications">;

// Application status enum
export type ApplicationStatus = Enums<"application_status">;

// =============================================================================
// DTOs (Data Transfer Objects) - Used for API responses
// =============================================================================

// Pagination metadata Dto
export interface PaginationDto {
  total: number;
  page: number;
  limit: number;
}

// Full application Dto - used for single application responses and list items
export type ApplicationDto = Pick<
  ApplicationEntity,
  | "id"
  | "company_name"
  | "position_name"
  | "application_date"
  | "link"
  | "notes"
  | "status"
  | "created_at"
  | "updated_at"
>;

// Paginated applications list response Dto
export interface ApplicationListResponseDto {
  applications: ApplicationDto[];
  pagination: PaginationDto;
}

// Application statistics response Dto
export interface ApplicationStatsDto {
  stats: Record<ApplicationStatus, number>;
  total: number;
}

// =============================================================================
// Command Models - Used for API requests
// =============================================================================

// Create application command - for POST /api/applications
export type CreateApplicationCommand = Pick<
  TablesInsert<"applications">,
  | "company_name"
  | "position_name"
  | "application_date"
  | "link"
  | "notes"
  | "status"
>;

// Update application command - for PATCH /api/applications/{id}
// Allows partial updates of any application fields
export type UpdateApplicationCommand = Partial<
  Pick<
    TablesUpdate<"applications">,
    | "company_name"
    | "position_name"
    | "application_date"
    | "link"
    | "notes"
    | "status"
  >
>;

// =============================================================================
// API Error Response Types
// =============================================================================

// Standard error response structure
export interface ApiErrorResponse {
  error: string;
}

// =============================================================================
// Type Guards and Utilities
// =============================================================================

// Type guard for application status validation
export const isValidApplicationStatus = (
  status: string,
): status is ApplicationStatus => {
  const validStatuses: ApplicationStatus[] = [
    "planned",
    "sent",
    "in_progress",
    "interview",
    "rejected",
    "offer",
  ];
  return validStatuses.includes(status as ApplicationStatus);
};

// Utility type for extracting required fields from create command
export type RequiredApplicationFields = Pick<
  CreateApplicationCommand,
  "company_name" | "position_name" | "application_date"
>;
