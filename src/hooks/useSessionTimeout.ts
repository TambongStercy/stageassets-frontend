import { useState, useEffect, useCallback } from 'react';

interface UseSessionTimeoutOptions {
  /**
   * Time in milliseconds before showing warning
   * Default: 25 minutes (25 * 60 * 1000)
   */
  warningTime?: number;
  /**
   * Time in milliseconds before session expires
   * Default: 30 minutes (30 * 60 * 1000)
   */
  expiryTime?: number;
  /**
   * Callback function when session expires
   */
  onExpire?: () => void;
  /**
   * Callback function to extend session
   */
  onExtend?: () => Promise<void>;
}

export function useSessionTimeout(options: UseSessionTimeoutOptions = {}) {
  const {
    warningTime = 25 * 60 * 1000, // 25 minutes
    expiryTime = 30 * 60 * 1000, // 30 minutes
    onExpire,
    onExtend,
  } = options;

  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExtending, setIsExtending] = useState(false);

  // Reset timers
  const resetTimers = useCallback(() => {
    setShowWarning(false);
    setTimeRemaining(0);
  }, []);

  // Extend session
  const extendSession = useCallback(async () => {
    if (onExtend) {
      setIsExtending(true);
      try {
        await onExtend();
        resetTimers();
      } catch (error) {
        console.error('Failed to extend session:', error);
      } finally {
        setIsExtending(false);
      }
    } else {
      resetTimers();
    }
  }, [onExtend, resetTimers]);

  useEffect(() => {
    // Show warning timer
    const warningTimer = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(expiryTime - warningTime);
    }, warningTime);

    // Expiry timer
    const expiryTimer = setTimeout(() => {
      if (onExpire) {
        onExpire();
      }
    }, expiryTime);

    // Countdown timer when warning is shown
    let countdownInterval: NodeJS.Timeout;
    if (showWarning && timeRemaining > 0) {
      countdownInterval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }

    return () => {
      clearTimeout(warningTimer);
      clearTimeout(expiryTimer);
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [warningTime, expiryTime, showWarning, timeRemaining, onExpire]);

  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    showWarning,
    timeRemaining,
    formatTimeRemaining,
    extendSession,
    isExtending,
    dismissWarning: () => setShowWarning(false),
  };
}
