import React from "react";
import { AddApplicationButton } from "./AddApplicationButton";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  onAddClick: () => void;
}

/**
 * User-friendly empty state component for new users with no applications
 * Displays illustration, message, and CTA button to encourage adding first application
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ onAddClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-6">
        <FileText className="h-16 w-16 text-gray-400 mx-auto" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Brak aplikacji
      </h3>

      <p className="text-gray-600 mb-8 max-w-md">
        Nie dodałeś jeszcze żadnej aplikacji o pracę. Rozpocznij śledzenie
        swoich postępów, dodając pierwszą aplikację już teraz!
      </p>

      <AddApplicationButton onClick={onAddClick} />
    </div>
  );
};
