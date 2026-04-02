"use client";

import { useTheme } from "next-themes";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const MultiplePostsSkeleton = () => {
  const { theme } = useTheme();
  
  // Default theme colors
  const baseColor = theme === "dark" ? "#202020" : "#ebebeb";
  const highlightColor = theme === "dark" ? "#444" : "#f5f5f5";

  return (
    <SkeletonTheme
      baseColor={baseColor}
      highlightColor={highlightColor}
    >
      <div className="m-4 h-screen">
        <Skeleton className="my-2 h-28 w-full" count={5} />
      </div>
    </SkeletonTheme>
  );
};

export default MultiplePostsSkeleton;
