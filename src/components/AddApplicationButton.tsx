import React from "react";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

interface AddApplicationButtonProps {
  onClick?: () => void;
}

/**
 * Prominent button component for adding new applications
 * Uses Shadcn Button with icon and navigation to creation form
 */
export const AddApplicationButton: React.FC<AddApplicationButtonProps> = ({ onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    // Default navigation handled by parent component
  };

  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      aria-label="Add new application"
      data-testid="add-application-btn"
    >
      <Plus className="h-4 w-4" />
      Dodaj aplikację
    </Button>
  );
};
