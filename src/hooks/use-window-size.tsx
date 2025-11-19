"use client";
import { useEffect, useState } from "react";

export function useWindowSize() {
  const [width, setWidth] = useState<number | undefined>(undefined);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const update = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    // initialize and subscribe
    update();
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("resize", update);
    };
  }, []);

  return { width, height, ready: width !== undefined && height !== undefined };
}
