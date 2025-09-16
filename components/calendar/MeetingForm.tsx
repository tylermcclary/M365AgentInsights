"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
} from "lucide-react";
import { clients, type SampleClient, type MeetingType } from "@/data/sampleData";
import Button from "@/components/ui/Button";
import { triggerAnalysisForClient } from "@/services/contextAnalyzer";

interface MeetingFormData {
  clientId: string;
  subject: string;
  description: string;
  agenda: string;
  startTime: string;
  endTime: string;
  location: string;
  meetingUrl: string;
  meetingType: MeetingType;
  notes: string;
}

interface MeetingFormProps {
  onSave: (meeting: Partial<MeetingFormData>) => void;
  onCancel: () => void;
  initialData?: Partial<MeetingFormData>;
}

export default function MeetingForm({ onSave, onCancel, initialData }: MeetingFormProps) {
  const [formData, setFormData] = useState<MeetingFormData>({
    clientId: "",
    subject: "",
    description: "",
    agenda: "",
    startTime: "",
    endTime: "",
    location: "",
    meetingUrl: "",
    meetingType: "scheduled_call",
    notes: "",
    ...initialData,
  });

  const [clientSearch, setClientSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SampleClient | null>(null);
  const clientInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Handle client selection
  const handleClientSelect = (client: SampleClient) => {
    setSelectedClient(client);
    setFormData(prev => ({ ...prev, clientId: client.id }));
    setClientSearch(client.name);
    setShowClientDropdown(false);
  };

  // Handle form field changes
  const handleFieldChange = (field: keyof MeetingFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle start time change and auto-calculate end time
  const handleStartTimeChange = (value: string) => {
    setFormData(prev => ({ ...prev, startTime: value }));
    
    if (value) {
      const startDate = new Date(value);
      const duration = getDurationByType(formData.meetingType);
      const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
      setFormData(prev => ({ ...prev, endTime: endDate.toISOString().slice(0, 16) }));
    }
  };

  // Get duration based on meeting type
  const getDurationByType = (type: MeetingType): number => {
    switch (type) {
      case "urgent_consultation":
        return 0.5; // 30 minutes
      case "portfolio_review":
        return 1.5; // 1.5 hours
      default:
        return 1; // 1 hour
    }
  };

  // Handle meeting type change and update duration
  const handleMeetingTypeChange = (type: MeetingType) => {
    setFormData(prev => ({ ...prev, meetingType: type }));
    
    if (formData.startTime) {
      const startDate = new Date(formData.startTime);
      const duration = getDurationByType(type);
      const endDate = new Date(startDate.getTime() + duration * 60 * 60 * 1000);
      setFormData(prev => ({ ...prev, endTime: endDate.toISOString().slice(0, 16) }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientId || !formData.subject || !formData.startTime) {
      alert("Please fill in all required fields");
      return;
    }

    // Trigger AI analysis for the client after scheduling
    const client = clients.find(c => c.id === formData.clientId);
    if (client) {
      try {
        await triggerAnalysisForClient(client.email);
      } catch (error) {
        console.error("Failed to trigger client analysis:", error);
      }
    }

    onSave(formData);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !clientInputRef.current?.contains(event.target as Node)
      ) {
        setShowClientDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set default start time to next hour
  useEffect(() => {
    if (!formData.startTime) {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      nextHour.setMinutes(0, 0, 0);
      setFormData(prev => ({ ...prev, startTime: nextHour.toISOString().slice(0, 16) }));
    }
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Client Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Client <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            ref={clientInputRef}
            type="text"
            placeholder="Search for client..."
            value={clientSearch}
            onChange={(e) => {
              setClientSearch(e.target.value);
              setShowClientDropdown(true);
              if (!e.target.value) {
                setSelectedClient(null);
                setFormData(prev => ({ ...prev, clientId: "" }));
              }
            }}
            onFocus={() => setShowClientDropdown(true)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {selectedClient && (
            <button
              type="button"
              onClick={() => {
                setSelectedClient(null);
                setClientSearch("");
                setFormData(prev => ({ ...prev, clientId: "" }));
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {showClientDropdown && filteredClients.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            >
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => handleClientSelect(client)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Meeting Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Meeting Type <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.meetingType}
          onChange={(e) => handleMeetingTypeChange(e.target.value as MeetingType)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="scheduled_call">Scheduled Call</option>
          <option value="portfolio_review">Portfolio Review</option>
          <option value="planning_session">Planning Session</option>
          <option value="urgent_consultation">Urgent Consultation</option>
        </select>
      </div>

      {/* Subject */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => handleFieldChange("subject", e.target.value)}
          placeholder="Enter meeting subject..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Date and Time */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Start Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => handleStartTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            End Time <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => handleFieldChange("endTime", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleFieldChange("location", e.target.value)}
          placeholder="Office, conference room, etc."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Meeting URL */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Meeting URL</label>
        <input
          type="url"
          value={formData.meetingUrl}
          onChange={(e) => handleFieldChange("meetingUrl", e.target.value)}
          placeholder="https://teams.microsoft.com/l/meetup-join/..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          placeholder="Brief description of the meeting..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Agenda */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Agenda</label>
        <textarea
          value={formData.agenda}
          onChange={(e) => handleFieldChange("agenda", e.target.value)}
          placeholder="Meeting agenda items..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleFieldChange("notes", e.target.value)}
          placeholder="Additional notes..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
        >
          Schedule Meeting
        </Button>
      </div>
    </form>
  );
}
