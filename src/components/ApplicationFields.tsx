import React from "react";
import type { ApplicationViewModel } from "../types";

interface ApplicationFieldsProps {
  application: ApplicationViewModel;
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
}

export const ApplicationFields: React.FC<ApplicationFieldsProps> = ({
  application,
  isEditing,
  onChange,
}) => {
  return (
    <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Company Name */}
      <div className="md:col-span-2">
        <dt className="block text-sm font-medium text-gray-700 mb-1">Firma</dt>
        <dd>
          <p className="text-gray-900 py-2 px-1">{application.company_name}</p>
        </dd>
      </div>

      {/* Position Name */}
      <div className="md:col-span-2">
        <dt className="block text-sm font-medium text-gray-700 mb-1">
          Stanowisko
        </dt>
        <dd>
          <p className="text-gray-900 py-2 px-1">{application.position_name}</p>
        </dd>
      </div>

      {/* Application Date */}
      <div>
        <dt className="block text-sm font-medium text-gray-700 mb-1">
          Data aplikacji
        </dt>
        <dd>
          <p className="text-gray-900 py-2 px-1">{application.formattedDate}</p>
        </dd>
      </div>

      {/* Status */}
      <div>
        <dt className="block text-sm font-medium text-gray-700 mb-1">Status</dt>
        <dd className="py-2 px-1">
          <span
            className={`inline-flex px-3 py-1.5 text-sm font-semibold rounded-full ${
              application.status === "offer"
                ? "bg-green-100 text-green-800"
                : application.status === "interview"
                  ? "bg-blue-100 text-blue-800"
                  : application.status === "in_progress"
                    ? "bg-yellow-100 text-yellow-800"
                    : application.status === "sent"
                      ? "bg-purple-100 text-purple-800"
                      : application.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
            }`}
          >
            {application.statusLabel}
          </span>
        </dd>
      </div>

      {/* Link */}
      <div className="md:col-span-2">
        <dt className="block text-sm font-medium text-gray-700 mb-1">Link</dt>
        <dd className="py-2 px-1">
          {application.link ? (
            <a
              href={application.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {application.link}
            </a>
          ) : (
            <span className="text-gray-500">Brak linku</span>
          )}
        </dd>
      </div>

      {/* Notes */}
      <div className="md:col-span-2">
        <dt className="block text-sm font-medium text-gray-700 mb-1">
          Notatki
        </dt>
        <dd className="py-2 px-1">
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {application.notes || "Brak notatek"}
          </p>
        </dd>
      </div>

      {/* Created At */}
      <div>
        <dt className="block text-sm font-medium text-gray-700 mb-1">
          Utworzone
        </dt>
        <dd className="py-2 px-1">
          <p className="text-gray-600 text-sm">
            {new Date(application.created_at).toLocaleDateString("pl-PL")}
          </p>
        </dd>
      </div>

      {/* Updated At */}
      <div>
        <dt className="block text-sm font-medium text-gray-700 mb-1">
          Zaktualizowane
        </dt>
        <dd className="py-2 px-1">
          <p className="text-gray-600 text-sm">
            {new Date(application.updated_at).toLocaleDateString("pl-PL")}
          </p>
        </dd>
      </div>
    </dl>
  );
};
