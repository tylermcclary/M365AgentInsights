"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  Video,
  Plus,
  Search,
} from "lucide-react";
import { meetings, clients, type SampleMeeting, type MeetingType } from "@/data/sampleData";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import MeetingForm from "./MeetingForm";

type ViewMode = "list" | "week" | "month";

interface CalendarViewProps {
  onMeetingSelect?: (meeting: SampleMeeting) => void;
  onCreateMeeting?: () => void;
}

export default function CalendarView({ onMeetingSelect, onCreateMeeting }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<MeetingType | "all">("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filter meetings based on search and type
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    if (searchQuery) {
      filtered = filtered.filter(meeting =>
        meeting.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meeting.attendees.some(attendee => 
          attendee.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (filterType !== "all") {
      filtered = filtered.filter(meeting => meeting.meetingType === filterType);
    }

    return filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [searchQuery, filterType]);


  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMeetingTypeIcon = (type: MeetingType) => {
    switch (type) {
      case "scheduled_call":
        return <Clock className="h-4 w-4" />;
      case "portfolio_review":
        return <Calendar className="h-4 w-4" />;
      case "planning_session":
        return <Users className="h-4 w-4" />;
      case "urgent_consultation":
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getClientInfo = (meeting: SampleMeeting) => {
    const client = clients.find(c => c.id === meeting.clientId);
    return client ? { name: client.name, email: client.email } : null;
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">Calendar</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "list" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              variant={viewMode === "week" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("week")}
            >
              Week
            </Button>
            <Button
              variant={viewMode === "month" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("month")}
            >
              Month
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as MeetingType | "all")}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="scheduled_call">Scheduled Calls</option>
            <option value="portfolio_review">Portfolio Reviews</option>
            <option value="planning_session">Planning Sessions</option>
            <option value="urgent_consultation">Urgent Consultations</option>
          </select>
          
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setShowCreateModal(true)}
          >
            New Meeting
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === "list" && (
          <div className="p-4">
            <div className="space-y-3">
              {filteredMeetings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery || filterType !== "all" 
                      ? "Try adjusting your search or filter criteria."
                      : "Schedule your first meeting with a client."
                    }
                  </p>
                  <Button
                    variant="primary"
                    leftIcon={<Plus className="h-4 w-4" />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Schedule Meeting
                  </Button>
                </div>
              ) : (
                filteredMeetings.map((meeting) => {
                  const clientInfo = getClientInfo(meeting);
                  return (
                    <div
                      key={meeting.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => onMeetingSelect?.(meeting)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getMeetingTypeIcon(meeting.meetingType)}
                            <h3 className="font-medium text-gray-900">{meeting.subject}</h3>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(meeting.status)}`}>
                              {meeting.status}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{formatDate(meeting.startTime)} at {formatTime(meeting.startTime)}</span>
                            </div>
                            {meeting.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{meeting.location}</span>
                              </div>
                            )}
                            {meeting.meetingUrl && (
                              <div className="flex items-center space-x-1">
                                <Video className="h-4 w-4" />
                                <span>Online</span>
                              </div>
                            )}
                          </div>
                          
                          {clientInfo && (
                            <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                              <Users className="h-4 w-4" />
                              <span>{clientInfo.name} ({clientInfo.email})</span>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-600 line-clamp-2">{meeting.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {viewMode === "week" && (
          <div className="p-4">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Week View</h3>
              <p className="text-gray-500">Week view coming soon...</p>
            </div>
          </div>
        )}

        {viewMode === "month" && (
          <div className="p-4">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Month View</h3>
              <p className="text-gray-500">Month view coming soon...</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Meeting Modal */}
      <Modal
        open={showCreateModal}
        title="Schedule New Meeting"
        onClose={() => setShowCreateModal(false)}
      >
        <MeetingForm
          onSave={(meeting) => {
            console.log("Meeting saved:", meeting);
            setShowCreateModal(false);
            onCreateMeeting?.();
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>
    </div>
  );
}
