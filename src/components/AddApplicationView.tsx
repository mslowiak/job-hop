import React, { useState } from "react";
import { AddApplicationForm } from "./AddApplicationForm";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { CreateApplicationRequest } from "../types";

export const AddApplicationView: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: CreateApplicationRequest) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json(); // We don't need the result data
      toast.success("Aplikacja została pomyślnie dodana!");
      // Navigate back to dashboard after successful creation
      window.location.href = "/dashboard";
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas dodawania aplikacji";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="add-application-view">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="flex items-center hover:bg-gray-100 transition-colors"
              aria-label="Powrót do dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Powrót do dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="add-application-form-title">
              Dodaj nową aplikację
            </h1>
            <p className="text-gray-600">Wypełnij formularz, aby dodać nową aplikację o pracę do swojego dashboard.</p>
          </div>

          <AddApplicationForm onSubmit={handleSubmit} onCancel={handleCancel} disabled={isSubmitting} />
        </div>
      </div>
    </div>
  );
};
