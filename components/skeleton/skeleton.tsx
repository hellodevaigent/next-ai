"use client"

import React from "react";

type SkeletonProps = {
  as?: React.ElementType;
  className?: string;
};

export const Skeleton: React.FC<SkeletonProps> = ({
  as: Component = "div",
  className = "",
}) => {
  return (
    <Component
      className={`bg-gradient-to-r from-accent via-accent/50 to-accent animate-pulse bg-[length:400%_100%] rounded ${className}`}
      style={{
        animation: "shimmer 3s ease-in-out infinite",
      }}
    />
  );
};
