import React from "react";

interface TotalDisplayProps {
  total: number;
}

/**
 * Displays the total number of applications in a prominent format
 */
export const TotalDisplay: React.FC<TotalDisplayProps> = ({ total }) => {
  // Ensure total is a valid non-negative integer
  const validTotal = Number.isInteger(total) && total >= 0 ? total : 0;

  return (
    <div className="text-center">
      <div className="text-4xl font-bold text-gray-900 mb-2">{validTotal}</div>
      <div className="text-lg text-gray-600">
        {validTotal === 1 ? "aplikacja" : validTotal < 5 ? "aplikacje" : "aplikacji"}
      </div>
    </div>
  );
};
