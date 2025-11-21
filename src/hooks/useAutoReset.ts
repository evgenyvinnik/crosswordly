import { useEffect } from 'react';

/**
 * Automatically resets a value after a specified timeout.
 * Useful for clearing temporary states like error messages or success indicators.
 *
 * @param value - The current value to monitor
 * @param resetValue - The value to reset to after the timeout
 * @param onReset - Callback function to execute the reset
 * @param timeoutMs - Duration in milliseconds before resetting
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
