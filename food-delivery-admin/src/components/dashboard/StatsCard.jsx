import React from "react";

const StatsCard = ({ title, value, icon, trend, trendValue }) => {
  const isTrendPositive = trend === "up";
  const trendColor = isTrendPositive ? "text-green-600" : "text-red-600";
  const trendBg = isTrendPositive ? "bg-green-100" : "bg-red-100";
  const trendIcon = isTrendPositive ? (
    <svg
      className="h-3 w-3"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2.5L9.5 6L8.5 7L6.5 5L6.5 9.5L5.5 9.5L5.5 5L3.5 7L2.5 6L6 2.5Z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg
      className="h-3 w-3"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 9.5L2.5 6L3.5 5L5.5 7L5.5 2.5L6.5 2.5L6.5 7L8.5 5L9.5 6L6 9.5Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm dark:border-gray-800">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-800">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <div className="mt-2 flex items-center">
          <div
            className={`flex items-center rounded-sm px-1.5 ${trendBg} ${trendColor}`}
          >
            {trendIcon}
            <span className="ml-1 text-xs font-medium">{trendValue}</span>
          </div>
          <span className="ml-2 text-xs text-muted-foreground">
            vs. last period
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
