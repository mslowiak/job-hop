import React, { useState, useEffect } from "react";
import type { DailyMotivationResponse } from "../types";

const MotivationalMessageComponent: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await fetch("/api/messages/daily-motivation");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DailyMotivationResponse = await response.json();
        if (data.message) {
          setMessage(data.message);
        } else {
          setError(true);
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMessage();
  }, []);

  if (loading) {
    return (
      <blockquote className="p-6 bg-gray-50 border border-gray-200 rounded-lg my-6">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <p className="text-gray-500 italic text-sm">Generating your daily motivation...</p>
        </div>
      </blockquote>
    );
  }

  if (error || !message) {
    return null;
  }

  return (
    <blockquote role="status" aria-live="polite" className="p-6 bg-gray-50 border border-gray-200 rounded-lg my-6">
      <p className="text-gray-600 italic text-center text-lg leading-relaxed">{message}</p>
    </blockquote>
  );
};

const MotivationalMessage = React.memo(MotivationalMessageComponent);
MotivationalMessage.displayName = "MotivationalMessage";

export { MotivationalMessage };
