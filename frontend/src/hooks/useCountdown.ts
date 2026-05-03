import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  overdue: boolean;
  invalid: boolean;
}

export function useCountdown(targetIso: string): Countdown {
  const compute = (): Countdown => {
    const date = new Date(targetIso);
    if (Number.isNaN(date.getTime())) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        overdue: false,
        invalid: true,
      };
    }

    const diff = date.getTime() - Date.now();
    const overdue = diff < 0;
    const abs = Math.abs(diff);
    return {
      days: Math.floor(abs / 86400000),
      hours: Math.floor((abs / 3600000) % 24),
      minutes: Math.floor((abs / 60000) % 60),
      seconds: Math.floor((abs / 1000) % 60),
      totalMs: diff,
      overdue,
      invalid: false,
    };
  };
  const [c, setC] = useState<Countdown>(compute);
  useEffect(() => {
    const t = setInterval(() => setC(compute()), 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIso]);
  return c;
}
