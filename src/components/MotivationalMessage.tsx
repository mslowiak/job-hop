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
        <p className="text-gray-500 italic text-center h-12 bg-gray-200 rounded animate-pulse" />
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
