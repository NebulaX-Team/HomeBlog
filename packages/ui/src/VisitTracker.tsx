"use client";

import { useEffect, useRef } from 'react';

const VISIT_KEY = 'homeblog:visit';

export function VisitTracker() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    try {
      if (sessionStorage.getItem(VISIT_KEY)) return;
      sessionStorage.setItem(VISIT_KEY, '1');
    } catch {
      // ignore
    }
    fetch('/api/visit', { method: 'POST' }).catch(() => {});
  }, []);

  return null;
}
