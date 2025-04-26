import React from "react";

const RevenueChart = ({ data }) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));

  // Function to calculate the height percentage for the bar
  const calculateHeight = (value) => {
    const range = maxValue - minValue || 1;
    const normalizedValue = (value - minValue) / range;
    return Math.max(10, normalizedValue * 80) + "%"; // Min height of 10%
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm dark:border-gray-800">
      <div className="p-6">
        <h3 className="text-lg font-medium">Revenue Overview</h3>
        <p className="text-sm text-muted-foreground">
          Monthly revenue breakdown
        </p>
      </div>
      <div className="p-6 pt-0">
        <div className="flex h-64 items-end gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="group relative flex flex-1 flex-col items-center"
            >
              <div className="relative flex flex-col items-center">
                <div
                  className="w-full bg-primary hover:bg-primary/90 rounded-t-sm transition-all"
                  style={{ height: calculateHeight(item.value) }}
                ></div>
                <div className="absolute bottom-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded p-1 -translate-y-full">
                  ${item.value.toLocaleString()}
                </div>
              </div>
              <span className="mt-2 text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
