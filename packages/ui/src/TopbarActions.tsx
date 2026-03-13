"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type StatusState = {
  status: 'idle' | 'saving' | 'saved' | 'error';
  errorMessage?: string;
};

export function TopbarActions() {
  const pathname = usePathname();
  const isSiteConfig = pathname === '/console/site';
  const [status, setStatus] = useState<StatusState>({ status: 'idle' });

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent).detail as StatusState;
      if (detail) setStatus(detail);
    };
    window.addEventListener('config:status', handler);
    return () => window.removeEventListener('config:status', handler);
  }, []);

  if (!isSiteConfig) return null;

  const toastMessage =
    status.status === 'saving'
      ? '保存中…'
      : status.status === 'saved'
        ? '已保存'
        : status.status === 'error'
          ? status.errorMessage ?? '保存失败'
          : '';

  return (
    <>
      <div className="topbar-actions">
        <button
          className="button button--primary button--sm"
          type="button"
          onClick={() => window.dispatchEvent(new Event('config:save'))}
        >
          保存
        </button>
        <button
          className="button button--ghost button--sm"
          type="button"
          onClick={() => window.dispatchEvent(new Event('config:reset'))}
        >
          重置
        </button>
      </div>
      {toastMessage ? (
        <div className={`config-toast config-toast--${status.status}`}>{toastMessage}</div>
      ) : null}
    </>
  );
}
