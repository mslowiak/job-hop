import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import type { ApplicationStatus } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";

interface MockQuery {
  select: Mock;
  eq: Mock;
  mockReturnThis: () => MockQuery;
}

// Mock the Supabase client creation to prevent real initialization
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn(),
  }),
}));

vi.mock("../../db/supabase.client");

import { ApplicationService } from "./application.service";

describe("ApplicationService", () => {
  let service: ApplicationService;
  let mockQuery: MockQuery;
  let supabaseClient: SupabaseClient;

  beforeEach(async () => {
    const { supabaseClient: client } = await import("../../db/supabase.client");
    supabaseClient = client;

    const selectMock = vi.fn().mockReturnThis();
    const eqMock = vi.fn().mockResolvedValue({ data: [], error: null });

    mockQuery = {
      select: selectMock,
      eq: eqMock,
      mockReturnThis: () => mockQuery,
    };

    // @ts-expect-error Mock return type for test
    vi.spyOn(supabaseClient, "from").mockReturnValue(mockQuery);

    service = new ApplicationService(supabaseClient);
  });

  describe("getApplicationStats", () => {
    const userId = "test-user-id";

    it("should return statistics with correct counts when applications exist", async () => {
      // Arrange
      const mockData = [
        { status: "planned" as ApplicationStatus },
        { status: "sent" as ApplicationStatus },
        { status: "planned" as ApplicationStatus },
        { status: "interview" as ApplicationStatus },
        { status: "rejected" as ApplicationStatus },
      ];
      mockQuery.eq.mockResolvedValueOnce({
        data: mockData,
        error: null,
      });

      // Act
      const result = await service.getApplicationStats(userId);

      // Assert
      expect(result.stats).toEqual({
        planned: 2,
        sent: 1,
        in_progress: 0,
        interview: 1,
        rejected: 1,
        offer: 0,
      });
      expect(result.total).toBe(5);
      expect(supabaseClient.from).toHaveBeenCalledWith("applications");
      expect(mockQuery.eq).toHaveBeenCalledWith("user_id", userId);
      expect(mockQuery.select).toHaveBeenCalledWith("status");
    });

    it("should return empty statistics when no applications for the user", async () => {
      // Arrange
      mockQuery.eq.mockResolvedValueOnce({
        data: [],
        error: null,
      });

      // Act
      const result = await service.getApplicationStats(userId);

      // Assert
      expect(result.stats).toEqual({
        planned: 0,
        sent: 0,
        in_progress: 0,
        interview: 0,
        rejected: 0,
        offer: 0,
      });
      expect(result.total).toBe(0);
    });

    it("should throw error when Supabase query fails", async () => {
      // Arrange
      const errorMessage = "Database connection failed";
      mockQuery.eq.mockResolvedValueOnce({
        data: null,
        error: { message: errorMessage },
      });

      // Act & Assert
      await expect(service.getApplicationStats(userId)).rejects.toThrow(
        `Failed to fetch application statistics: ${errorMessage}`,
      );
    });

    it("should ignore unknown statuses and count only known ones", async () => {
      // Arrange
      const mockData = [
        { status: "planned" as ApplicationStatus },
        { status: "unknown" as string },
        { status: "sent" as ApplicationStatus },
      ];
      mockQuery.eq.mockResolvedValueOnce({
        data: mockData,
        error: null,
      });

      // Act
      const result = await service.getApplicationStats(userId);

      // Assert
      expect(result.stats.planned).toBe(1);
      expect(result.stats.sent).toBe(1);
      expect(result.total).toBe(2); // ignores unknown
    });
  });
});
