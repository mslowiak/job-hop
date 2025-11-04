import React from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "./ui/button";

interface RefreshButtonProps {
  onRefresh: () => void;
  disabled?: boolean;
}

/**
 * Button component to manually refresh statistics data
 */
export const RefreshButton: React.FC<RefreshButtonProps> = ({ onRefresh, disabled = false }) => {
  return (
    <Button
      onClick={onRefresh}
      variant="outline"
      className="flex items-center gap-2"
      aria-label="Refresh statistics"
      disabled={disabled}
    >
      <RefreshCw className="h-4 w-4" />
      Odśwież
    </Button>
  );
};
