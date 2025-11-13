import React, { useState } from "react";
import { Button } from "./ui/button";
import { UpdateApplicationRequestSchema } from "../types";
import type { ApplicationDto, CreateApplicationCommand } from "../types";

interface EditApplicationFormProps {
  application: ApplicationDto;
  onSubmit: (data: Partial<CreateApplicationCommand>) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export const EditApplicationForm: React.FC<EditApplicationFormProps> = ({
  application,
  onSubmit,
  onCancel,
  disabled = false,
}) => {
  const [formData, setFormData] = useState<Partial<CreateApplicationCommand>>({
    company_name: application.company_name,
    position_name: application.position_name,
    application_date: application.application_date,
    link: application.link,
    notes: application.notes,
    status: application.status,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const result = UpdateApplicationRequestSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        const field = error.path.join(".");
        newErrors[field] = error.message;
      });
      setErrors(newErrors);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      // Error handling is done by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company Name */}
      <div>
        <label
          htmlFor="edit_company_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Firma *
        </label>
        <input
          id="edit_company_name"
          type="text"
          value={formData.company_name || ""}
          onChange={(e) => handleInputChange("company_name", e.target.value)}
          disabled={disabled || isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.company_name
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          required
        />
        {errors.company_name && (
          <p className="mt-1 text-sm text-red-600">{errors.company_name}</p>
        )}
      </div>

      {/* Position Name */}
      <div>
        <label
          htmlFor="edit_position_name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Stanowisko *
        </label>
        <input
          id="edit_position_name"
          type="text"
          value={formData.position_name || ""}
          onChange={(e) => handleInputChange("position_name", e.target.value)}
          disabled={disabled || isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.position_name
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          required
        />
        {errors.position_name && (
          <p className="mt-1 text-sm text-red-600">{errors.position_name}</p>
        )}
      </div>

      {/* Application Date */}
      <div>
        <label
          htmlFor="edit_application_date"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Data aplikacji *
        </label>
        <input
          id="edit_application_date"
          type="date"
          value={
            formData.application_date
              ? new Date(formData.application_date).toISOString().split("T")[0]
              : ""
          }
          onChange={(e) =>
            handleInputChange("application_date", e.target.value)
          }
          disabled={disabled || isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.application_date
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          required
        />
        {errors.application_date && (
          <p className="mt-1 text-sm text-red-600">{errors.application_date}</p>
        )}
      </div>

      {/* Status */}
      <div>
        <label
          htmlFor="edit_status"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Status
        </label>
        <select
          id="edit_status"
          value={formData.status || application.status}
          onChange={(e) => handleInputChange("status", e.target.value)}
          disabled={disabled || isSubmitting}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.status
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        >
          <option value="planned">Zaplanowane do wysłania</option>
          <option value="sent">Wysłane</option>
          <option value="in_progress">W trakcie</option>
          <option value="interview">Rozmowa kwalifikacyjna</option>
          <option value="rejected">Odrzucone</option>
          <option value="offer">Oferta pracy</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status}</p>
        )}
      </div>

      {/* Link */}
      <div>
        <label
          htmlFor="edit_link"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Link
        </label>
        <input
          id="edit_link"
          type="url"
          value={formData.link || ""}
          onChange={(e) => handleInputChange("link", e.target.value)}
          disabled={disabled || isSubmitting}
          placeholder="https://example.com"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.link
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
        />
        {errors.link && (
          <p className="mt-1 text-sm text-red-600">{errors.link}</p>
        )}
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="edit_notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Notatki
        </label>
        <textarea
          id="edit_notes"
          value={formData.notes || ""}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          disabled={disabled || isSubmitting}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
            errors.notes
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300"
          }`}
          placeholder="Dodaj notatki..."
        />
        {errors.notes && (
          <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={disabled || isSubmitting}
        >
          Anuluj
        </Button>
        <Button type="submit" disabled={disabled || isSubmitting}>
          {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </form>
  );
};
