import { useMemo } from "react";
import type { StatusOption, ApplicationStatus } from "../types/view.types";

/**
 * Hook that provides memoized status options with Polish labels for UI components
 * Bridges English data enums to user-facing Polish labels for internationalization
 */
export const useStatusOptions = (): StatusOption[] => {
  return useMemo(
    () => [
      { value: "all", label: "Wszystkie" },
      { value: "planned", label: "Zaplanowane do wysłania" },
      { value: "sent", label: "Wysłane" },
      { value: "in_progress", label: "W trakcie" },
      { value: "interview", label: "Rozmowa" },
      { value: "rejected", label: "Odrzucone" },
      { value: "offer", label: "Oferta" },
    ],
    [],
  );
};

/**
 * Helper function to get Polish label for a specific status
 */
export const getStatusLabel = (status: ApplicationStatus | "all"): string => {
  const options: StatusOption[] = [
    { value: "all", label: "Wszystkie" },
    { value: "planned", label: "Zaplanowane do wysłania" },
    { value: "sent", label: "Wysłane" },
    { value: "in_progress", label: "W trakcie" },
    { value: "interview", label: "Rozmowa" },
    { value: "rejected", label: "Odrzucone" },
    { value: "offer", label: "Oferta" },
  ];

  const option = options.find((opt) => opt.value === status);
  return option?.label || status;
};


