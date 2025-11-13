import React from "react";
import { AddApplicationButton } from "./AddApplicationButton";

interface EmptyStateProps {
  onAddClick: () => void;
  isFiltered?: boolean;
}

/**
 * User-friendly empty state component for applications list
 * Shows different messages based on whether the list is filtered or completely empty
 * Includes SVG illustration and CTA button
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ onAddClick, isFiltered = false }) => {
  const title = isFiltered ? "Brak wyników filtru" : "Brak aplikacji";
  const message = isFiltered
    ? "Żadne aplikacje nie pasują do wybranego filtru. Spróbuj zmienić ustawienia filtra."
    : "Nie dodałeś jeszcze żadnej aplikacji o pracę. Rozpocznij śledzenie swoich postępów, dodając pierwszą aplikację już teraz!";

  return (
    <div
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
      aria-live="polite"
      role="status"
      data-testid="applications-empty-state"
    >
      <div className="mb-6">
        <svg
          className="h-16 w-16 text-gray-400 mx-auto"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 mb-8 max-w-md">{message}</p>

      <AddApplicationButton onClick={onAddClick} />
    </div>
  );
};
