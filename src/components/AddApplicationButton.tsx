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
export const AddApplicationButton: React.FC<AddApplicationButtonProps> = ({
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default navigation - for now, just log (will implement proper routing later)
      console.log("Navigate to /applications/new");
      // In a real implementation, this would use:
      // window.location.href = '/applications/new';
      // or React Router's navigate('/applications/new');
    }
  };

  return (
    <Button
      variant="default"
      size="lg"
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
      aria-label="Add new application"
    >
      <Plus className="h-4 w-4" />
      Dodaj aplikację
    </Button>
  );
};
