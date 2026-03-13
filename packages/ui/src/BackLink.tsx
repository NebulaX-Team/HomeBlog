'use client';

import { useRouter } from 'next/navigation';

export function BackLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      className="page-nav__back"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back();
        } else {
          router.push('/');
        }
      }}
    >
      返回上一级
    </button>
  );
}
