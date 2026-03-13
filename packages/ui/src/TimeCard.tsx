"use client";

import { useEffect, useMemo, useState } from 'react';

type TimeCardProps = {
  title?: string;
  timeZone?: string;
  showSeconds?: boolean;
};

function formatTime(now: Date, timeZone?: string, showSeconds?: boolean) {
  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const timeFormatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined,
    hour12: false
  });

  return {
    date: dateFormatter.format(now).replace(/\//g, '.'),
    time: timeFormatter.format(now)
  };
}

export function TimeCard({
  title = '时间',
  timeZone,
  showSeconds = true
}: TimeCardProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const update = () => {
      setNow(new Date());
      setTick((prev) => prev + 1);
    };
    update();
    const timer = window.setInterval(update, showSeconds ? 1000 : 30 * 1000);
    return () => window.clearInterval(timer);
  }, [showSeconds]);

  const value = useMemo(
    () => (now ? formatTime(now, timeZone, showSeconds) : null),
    [now, timeZone, showSeconds]
  );

  return (
    <div className="nav-card nav-card--time">
      <div className="time-card__header">
        <div className="nav-card__title">{title}</div>
      </div>
      <div className="time-card__time">
        <span key={tick} className="time-card__time-text">
          {value?.time ?? '--:--'}
        </span>
      </div>
      <div className="time-card__date">{value?.date ?? '----.--.--'}</div>
    </div>
  );
}
