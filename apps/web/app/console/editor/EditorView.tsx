'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, Input } from '@homeblog/ui/client';
import { MDXEditorWrapper } from './MDXEditorWrapper';
import type { MDXEditorMethods } from '@mdxeditor/editor';

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  tags?: string[];
  draft?: boolean;
};

type PostRecord = {
  meta: PostMeta;
  content: string;
};

const today = () => new Date().toISOString().slice(0, 10);

export function EditorView({
  slug: initialSlug,
  mode,
  codeTheme
}: {
  slug: string | null;
  mode: 'new' | 'edit';
  codeTheme?: string;
}) {
  const [slug, setSlug] = useState(initialSlug ?? '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(today());
  const [summary, setSummary] = useState('');
  const [tagsStr, setTagsStr] = useState('');
  const [draft, setDraft] = useState(false);
  const [content, setContent] = useState('');
  const [contentVersion, setContentVersion] = useState(0);
  const [loading, setLoading] = useState(Boolean(mode === 'edit' && initialSlug));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const editorRef = useRef<MDXEditorMethods>(null);

  const fetchPost = useCallback(async (s: string) => {
    const res = await fetch(`/api/posts/${encodeURIComponent(s)}`);
    if (!res.ok) return;
    const record: PostRecord = await res.json();
    setSlug(record.meta.slug);
    setTitle(record.meta.title);
    setDate(record.meta.date);
    setSummary(record.meta.summary ?? '');
    setTagsStr(record.meta.tags?.join(', ') ?? '');
    setDraft(Boolean(record.meta.draft));
    setContent(record.content);
    setContentVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initialSlug) {
      setLoading(true);
      fetchPost(initialSlug).finally(() => setLoading(false));
    }
  }, [mode, initialSlug, fetchPost]);

  const save = useCallback(async () => {
    setSaveStatus('saving');
    setErrorMsg('');
    const bodyContent = editorRef.current?.getMarkdown() ?? content;
    const tags = tagsStr.split(/[,，]/).map((s) => s.trim()).filter(Boolean);
    const payload = {
      slug: slug.trim() || 'untitled',
      title: title.trim() || '未命名',
      date: date || today(),
      summary: summary.trim() || undefined,
      tags: tags.length ? tags : undefined,
      draft,
      content: bodyContent
    };

    try {
      if (mode === 'edit' && initialSlug) {
        const res = await fetch(`/api/posts/${encodeURIComponent(initialSlug)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data?.error || '更新失败');
          setSaveStatus('error');
          return;
        }
        setSaveStatus('saved');
        setContent(bodyContent);
        if (payload.slug !== initialSlug) {
          window.history.replaceState(null, '', `/console/editor/${encodeURIComponent(payload.slug)}`);
        }
      } else {
        const res = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data?.error || '创建失败');
          setSaveStatus('error');
          return;
        }
        setSaveStatus('saved');
        setContent(bodyContent);
        window.history.replaceState(null, '', `/console/editor/${encodeURIComponent(payload.slug)}`);
      }
    } catch {
      setErrorMsg('网络错误');
      setSaveStatus('error');
    }
  }, [mode, initialSlug, slug, title, date, summary, tagsStr, draft, content]);

  if (loading) {
    return (
      <div className="editor-view editor-view--loading">
        <p className="muted">加载中…</p>
      </div>
    );
  }

  return (
    <div className="editor-view">
      <header className="editor-view-header">
        <div className="editor-view-header__left">
          <Link href="/console/editor" className="editor-view-back muted">
            ← 返回列表
          </Link>
          <h1 className="editor-view-title">
            {mode === 'new' ? '新建文章' : `编辑：${title || '未命名'}`}
          </h1>
        </div>
        <div className="editor-view-header__actions">
          <Button
            variant="primary"
            onClick={save}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? '保存中…' : saveStatus === 'saved' ? '已保存' : '保存'}
          </Button>
        </div>
      </header>

      <div className="editor-view-body editor-view-body--with-sidebar">
        <div className="editor-main-area">
          <div
            className="editor-wysiwyg-wrap"
            key={`editor-${initialSlug ?? 'new'}-${contentVersion}`}
          >
            <MDXEditorWrapper
              ref={editorRef}
              markdown={content}
              codeTheme={codeTheme}
              placeholder="在此输入正文。使用工具栏设置格式，代码块语言选 Mermaid 可绘制流程图，选 Math 可输入数学公式。工具栏右侧可切换源码模式。"
            />
          </div>
        </div>

        <aside className={`editor-settings-sidebar ${sidebarOpen ? 'is-open' : 'is-collapsed'}`}>
          <button
            type="button"
            className="editor-sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            title={sidebarOpen ? '收起设置' : '展开设置'}
            aria-label={sidebarOpen ? '收起设置' : '展开设置'}
          >
            {sidebarOpen ? '›' : '‹'}
          </button>
          <div className="editor-sidebar-content">
            <h3 className="editor-sidebar-title">设置</h3>
            <div className="editor-sidebar-fields">
              <div className="form-field">
                <label>Slug（URL 路径）</label>
                <Input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="my-post"
                  disabled={mode === 'edit'}
                />
              </div>
              <div className="form-field">
                <label>标题</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="文章标题"
                />
              </div>
              <div className="form-field">
                <label>日期</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="form-field form-field--inline">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={draft}
                    onChange={(e) => setDraft(e.target.checked)}
                  />
                  草稿（不在博客列表显示）
                </label>
              </div>
              <div className="form-field">
                <label>摘要（可选）</label>
                <Input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="简短摘要"
                />
              </div>
              <div className="form-field">
                <label>标签（逗号分隔）</label>
                <Input
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  placeholder="tag1, tag2"
                />
              </div>
            </div>
            {errorMsg && <p className="editor-error muted">{errorMsg}</p>}
            <p className="editor-hint muted">
              保存后可在 <Link href={slug ? `/blog/${encodeURIComponent(slug)}` : '/blog'} target="_blank" rel="noopener noreferrer">博客页</Link> 查看。
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
