import { useEffect } from 'react';

/**
 * Automatically resets a value after a specified timeout
 */
export const useAutoReset = <T>(
  value: T,
  resetValue: T,
  onReset: (resetVal: T) => void,
  timeoutMs: number,
) => {
  useEffect(() => {
    if (value === resetValue) {
      return undefined;
    }
    const timeout = window.setTimeout(() => onReset(resetValue), timeoutMs);
    return () => window.clearTimeout(timeout);
  }, [value, resetValue, onReset, timeoutMs]);
};
