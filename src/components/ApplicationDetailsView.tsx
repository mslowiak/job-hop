import React, { useState, useRef, useEffect } from "react";
import { useApplication } from "../hooks/useApplication";
import { ApplicationFields } from "./ApplicationFields";
import { EditApplicationForm } from "./EditApplicationForm";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { Button } from "./ui/button";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { UpdateApplicationCommand } from "../types";

interface ApplicationDetailsViewProps {
  id: string;
}

export const ApplicationDetailsView: React.FC<ApplicationDetailsViewProps> = ({
  id,
}) => {
  const {
    data: application,
    viewModel,
    loading,
    error,
    refetch,
  } = useApplication(id);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Focus management when switching modes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async (formData: Partial<UpdateApplicationCommand>) => {
    if (!application) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      toast.success("Aplikacja została pomyślnie zaktualizowana");
      setIsEditing(false);
      refetch();
    } catch (err) {
      console.error("Save failed:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas zapisywania";
      toast.error(errorMessage);
      throw err; // Re-throw to let EditApplicationForm handle the error
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      toast.success("Aplikacja została pomyślnie usunięta");
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Delete failed:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Wystąpił błąd podczas usuwania";
      toast.error(errorMessage);
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Ładowanie aplikacji...</p>
        </div>
      </div>
    );
  }

  if (error || !application || !viewModel) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Błąd ładowania
          </h2>
          <p className="text-gray-600 mb-4">
            {error || "Nie udało się załadować aplikacji"}
          </p>
          <div className="space-x-4">
            <Button onClick={refetch} variant="outline">
              Spróbuj ponownie
            </Button>
            <Button onClick={handleBackToDashboard}>Powrót do dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center hover:bg-gray-100 transition-colors"
                aria-label="Powrót do dashboard"
              >
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Powrót do dashboard</span>
                <span className="sm:hidden">Powrót</span>
              </Button>
            </div>
            <div
              className="flex items-center space-x-2"
              role="toolbar"
              aria-label="Akcje aplikacji"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
                disabled={saving || deleting}
                className="flex items-center hover:bg-gray-50 transition-colors"
                aria-label={
                  isEditing ? "Anuluj edycję aplikacji" : "Edytuj aplikację"
                }
              >
                <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">
                  {isEditing ? "Anuluj" : "Edytuj"}
                </span>
                <span className="sm:hidden">
                  {isEditing ? "Anuluj" : "Edytuj"}
                </span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                disabled={saving || deleting}
                className="flex items-center"
                aria-label="Usuń aplikację"
              >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Usuń</span>
                <span className="sm:hidden">Usuń</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div
          ref={mainContentRef}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          role="main"
          aria-labelledby="application-title"
          tabIndex={-1}
        >
          <h1
            id="application-title"
            className="text-2xl font-bold text-gray-900 mb-6"
          >
            Szczegóły aplikacji
          </h1>

          {/* Application Fields or Edit Form */}
          {isEditing ? (
            <EditApplicationForm
              application={application}
              onSubmit={handleSave}
              onCancel={handleEditToggle}
              disabled={saving}
            />
          ) : (
            <ApplicationFields application={viewModel} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDeleteConfirm}
        applicationName={application.company_name}
        isDeleting={deleting}
      />
    </div>
  );
};
