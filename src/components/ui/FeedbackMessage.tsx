import React from "react";
import { Toaster, toast } from "sonner";

interface FeedbackMessageProps {
  message: string;
  type: "success" | "error";
}

export const FeedbackMessage: React.FC<FeedbackMessageProps> = ({
  message,
  type,
}) => {
  React.useEffect(() => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, [message, type]);

  return null; // This component doesn't render anything, just triggers toasts
};

// Toaster component that should be placed at the app root
export const FeedbackToaster: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "white",
          color: "black",
          border: "1px solid #e5e7eb",
        },
      }}
    />
  );
};

// Utility functions for showing feedback
export const showSuccessMessage = (message: string) => {
  toast.success(message);
};

export const showErrorMessage = (message: string) => {
  toast.error(message);
};
