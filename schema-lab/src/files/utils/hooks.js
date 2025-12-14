import { useState, useEffect } from "react";

export const useDebounce = (value, delay = 300) => {
  // Custom hook to debounce a value
  // Returns the debounced value after the specified delay
  // Useful for optimizing performance of search inputs, etc.
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
