import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState(initialValue);

  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;

    hydrated.current = true;

    try {
      const item = localStorage.getItem(key);

      if (item) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to read localStorage state:", error);
    }
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;

    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to persist localStorage state:", error);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
