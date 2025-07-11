"use client"

import { useState, useEffect } from "react";

export const ConversationSkeleton = () => {
  const widthRanges = [
    { min: 50, max: 100 },
    { min: 80, max: 100 },
    { min: 50, max: 100 },
    { min: 70, max: 100 },
    { min: 60, max: 100 },
    { min: 60, max: 100 },
  ];

  const [currentWidths, setCurrentWidths] = useState(
    widthRanges.map((w) => w.min + Math.random() * (w.max - w.min))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWidths(
        widthRanges.map((w) => {
          return w.min + Math.random() * (w.max - w.min);
        })
      );
    }, 1300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto space-y-3">
      <div className="flex items-center space-x-3 p-3 bg-accent rounded-xl !mb-4">
        <div className="size-8 rounded-full bg-sidebar animate-pulse" />
        <div className="w-full h-6 bg-sidebar rounded-md animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="flex justify-end">
          <div
            className="bg-accent animate-pulse h-4 md:h-5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[0]}%` }}
          />
        </div>
        <div className="flex justify-end">
          <div
            className="bg-accent animate-pulse h-2 md:h-2.5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[1]}%` }}
          />
        </div>
        <div className="flex justify-end">
          <div
            className="bg-accent animate-pulse h-2 md:h-2.5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[2]}%` }}
          />
        </div>
        <div className="flex justify-end">
          <div
            className="bg-accent animate-pulse h-2 md:h-2.5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[3]}%` }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent animate-pulse h-4 md:h-5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[1]}%` }}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent animate-pulse h-2 md:h-2.5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[2]}%` }}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent animate-pulse h-2 md:h-2.5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[3]}%` }}
          />
        </div>
        <div className="flex flex-col justify-start">
          <div
            className="bg-accent animate-pulse h-2 md:h-2.5 rounded-md transition-all duration-1000 ease-in-out"
            style={{ width: `${currentWidths[4]}%` }}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <div
          className="bg-accent animate-pulse h-4 md:h-5 rounded-md transition-all duration-1000 ease-in-out"
          style={{ width: `${currentWidths[2]}%` }}
        />
      </div>
      <div className="flex flex-col justify-start">
        <div
          className="bg-accent animate-pulse h-4 md:h-5 rounded-md transition-all duration-1000 ease-in-out"
          style={{ width: `${currentWidths[3]}%` }}
        />
      </div>
      <div className="absolute -bottom-[20px] h-[300px] w-full bg-gradient-to-t from-background via-transparent to-transparent" />
    </div>
  );
};