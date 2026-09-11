import { useEffect, useState } from "react";

export function useNow(ms = 250) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function useHydratedFlag() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
