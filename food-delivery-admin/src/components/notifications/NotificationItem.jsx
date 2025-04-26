import React from "react";
import { Button } from "../ui/Button";

const NotificationItem = ({
  id,
  type,
  title,
  message,
  timestamp,
  status,
  onApprove,
  onReject,
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case "restaurant":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 9V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
            <rect x="9" y="9" width="13" height="10" rx="2" ry="2" />
          </svg>
        );
      case "driver":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="1" y="3" width="15" height="13" />
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        );
      case "system":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4 dark:border-gray-800">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary">
        {getTypeIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">{title}</h4>
          {getStatusBadge()}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        <p className="mt-1 text-xs text-muted-foreground">{timestamp}</p>
      </div>
      {status === "pending" && (
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApprove(id)}
            className="text-green-600 border-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-900/20"
          >
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(id)}
            className="text-red-600 border-red-600 hover:bg-red-50 dark:text-red-400 dark:border-red-400 dark:hover:bg-red-900/20"
          >
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};


export default NotificationItem;