"use client";

import { useEffect, useMemo, useState } from 'react';

type QuoteApiResponse = {
  hitokoto?: string;
  from?: string;
  from_who?: string | null;
};

type QuoteCardProps = {
  apiUrl?: string;
  fallbackText?: string;
  fallbackAuthor?: string;
  fallbackMode?: 'always' | 'never' | 'no-api';
  loadingText?: string;
  loadingAuthor?: string;
  errorText?: string;
  errorAuthor?: string;
};

function buildAuthor(from?: string, fromWho?: string | null) {
  if (!from && !fromWho) return '';
  if (from && fromWho) return `——《${from}》・${fromWho}`;
  if (from) return `——《${from}》`;
  return `——${fromWho ?? ''}`;
}

export function QuoteCard({
  apiUrl,
  fallbackText,
  fallbackAuthor,
  fallbackMode = 'always',
  loadingText = '加载中...',
  loadingAuthor = '—— HomeBlog',
  errorText = '啊哦，加载失败力',
  errorAuthor = '—— HomeBlog'
}: QuoteCardProps) {
  const shouldSeedFallback =
    !apiUrl && (fallbackMode === 'always' || fallbackMode === 'no-api');
  const [text, setText] = useState(shouldSeedFallback ? fallbackText ?? '' : '');
  const [author, setAuthor] = useState(shouldSeedFallback ? fallbackAuthor ?? '' : '');
  const [loading, setLoading] = useState(Boolean(apiUrl));
  const [error, setError] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (!apiUrl) {
      setLoading(false);
      setError(false);
      if (fallbackMode !== 'never') {
        setText(fallbackText ?? '');
        setAuthor(fallbackAuthor ?? '');
      }
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      if (!cancelled) {
        setLoading(false);
        setError(true);
      }
    }, 5000);

    const useProxy = apiUrl.startsWith('http');
    const targetUrl = useProxy ? '/api/quote' : apiUrl;

    const load = async (url: string) => {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok || res.status === 204) return null;
      return (await res.json()) as QuoteApiResponse;
    };

    (async () => {
      try {
        setLoading(true);
        setError(false);
        setText('');
        setAuthor('');
        const data = await load(targetUrl);
        if (!data || cancelled) {
          setError(true);
          return;
        }
        const nextText = data.hitokoto ?? '';
        const nextAuthor = buildAuthor(data.from, data.from_who);
        if (nextText) setText(nextText);
        if (nextAuthor) setAuthor(nextAuthor);
        setAnimKey((prev) => prev + 1);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
        clearTimeout(timeout);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [apiUrl, fallbackAuthor, fallbackMode, fallbackText]);

  const hasContent = useMemo(
    () => Boolean(text || author || loading || error),
    [text, author, loading, error]
  );

  if (!hasContent) return null;

  return (
    <div className="quote-card quote-card--hero">
      <div key={loading ? 'loading' : error ? 'error' : animKey} className="quote-card__content">
        <p className="quote-card__text">
          {loading ? loadingText : error ? errorText : text}
        </p>
        {loading ? (
          <div className="quote-card__meta">{loadingAuthor}</div>
        ) : error ? (
          <div className="quote-card__meta">{errorAuthor}</div>
        ) : author ? (
          <div className="quote-card__meta">{author}</div>
        ) : null}
      </div>
    </div>
  );
}
