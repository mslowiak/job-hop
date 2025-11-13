// DTOs and Command Models for JobHop Application API
// These types are derived from database entities and designed to match API specifications

import { z } from "zod";
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
// API Request/Response Types - Used for REST API endpoints
// =============================================================================

// Zod schema for input validation (CreateApplicationRequest)
export const CreateApplicationRequestSchema = z.object({
  company_name: z.string().min(1).max(255),
  position_name: z.string().min(1).max(255),
  application_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .transform((val) => new Date(val)),
  link: z.union([z.string().url(), z.literal("")]).optional(),
  notes: z.string().max(10000).nullable().optional(),
  status: z
    .enum(["planned", "sent", "in_progress", "interview", "rejected", "offer"])
    .default("sent")
    .optional(),
});

// TypeScript type inferred from Zod schema
export type CreateApplicationRequest = z.infer<
  typeof CreateApplicationRequestSchema
>;

// DTO for output, based on DB schema (ApplicationResponse)
export type ApplicationResponse = Pick<
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

// Application view model - extends ApplicationDto with formatted display fields
export interface ApplicationViewModel extends ApplicationDto {
  formattedDate: string; // e.g., 'November 4, 2025'
  statusLabel: string; // Polish display name, e.g., 'Wysłane' for 'sent'
}

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
// Internal model for service layer with hardcoded user_id
export type CreateApplicationCommand = Pick<
  TablesInsert<"applications">,
  | "company_name"
  | "position_name"
  | "application_date"
  | "link"
  | "notes"
  | "status"
> & {
  user_id: string;
};

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

// Delete application command - for DELETE /api/applications/{id}
// Internal model for service layer with hardcoded user_id for ownership verification
export interface DeleteApplicationCommand {
  id: string; // UUID of the application to delete
  user_id: string; // Hardcoded DEFAULT_USER_ID for development (ownership verification)
}

// Zod schema for delete application command validation
export const DeleteApplicationCommandSchema = z.object({
  id: z.string().uuid("Invalid application ID format"),
  user_id: z.string().uuid("Invalid user ID format"),
});

// Zod schema for update application request validation (partial updates)
export const UpdateApplicationRequestSchema = z.object({
  company_name: z.string().min(1).max(255).optional(),
  position_name: z.string().min(1).max(255).optional(),
  application_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  link: z.union([z.string().url(), z.string().length(0), z.null()]).optional(),
  notes: z.string().max(1000).optional(),
  status: z
    .enum(["planned", "sent", "in_progress", "interview", "rejected", "offer"])
    .optional(),
});

// =============================================================================
// API Error Response Types
// =============================================================================

// Standard error response structure
export interface ApiErrorResponse {
  error: string;
}

// Custom error class for not found scenarios
export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
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

// Status label mapping for Polish display names
export const statusLabels: Record<ApplicationStatus, string> = {
  planned: "Zaplanowane do wysłania",
  sent: "Wysłane",
  in_progress: "W trakcie",
  interview: "Rozmowa kwalifikacyjna",
  rejected: "Odrzucone",
  offer: "Oferta pracy",
};

// Stats view model for grid items
export interface StatsItem {
  status: ApplicationStatus;
  label: string; // Polish display name from statusLabels
  count: number;
}

// =============================================================================
// Authentication Types
// =============================================================================

// Auth form modes
export type AuthMode = "login" | "register";

// Auth form data
export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Zod schemas for auth validation
export const LoginSchema = z.object({
  email: z.string().email("Wprowadź prawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
});

export const RegisterSchema = z
  .object({
    email: z.string().email("Wprowadź prawidłowy adres email"),
    password: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
    confirmPassword: z.string().min(8, "Hasło musi mieć co najmniej 8 znaków"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Wprowadź prawidłowy adres email"),
});

// Auth provider context type
export interface AuthContextType {
  user: any; // Supabase user type
  session: any; // Supabase session type
  loading: boolean;
}
