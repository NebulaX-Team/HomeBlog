"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';

type ConfigEditorProps = {
  initialConfig: unknown;
  codeThemeOptions?: { value: string; label: string }[];
};

export function ConfigEditor({ initialConfig, codeThemeOptions = [] }: ConfigEditorProps) {
  const initialState = useMemo(
    () => JSON.parse(JSON.stringify(initialConfig ?? {})) as any,
    [initialConfig]
  );
  const [config, setConfig] = useState<any>(initialState);
  const latestConfig = useRef<any>(initialState);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const updateRoot = (key: string, value: unknown) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const updateHome = (key: string, value: unknown) => {
    setConfig((prev: any) => ({
      ...prev,
      home: {
        ...prev.home,
        [key]: value
      }
    }));
  };

  const updateProfile = (key: string, value: unknown) => {
    setConfig((prev: any) => ({
      ...prev,
      home: {
        ...prev.home,
        profile: {
          ...prev.home?.profile,
          [key]: value
        }
      }
    }));
  };

  const updateQuoteCard = (key: string, value: unknown) => {
    setConfig((prev: any) => ({
      ...prev,
      home: {
        ...prev.home,
        quoteCard: {
          ...prev.home?.quoteCard,
          [key]: value
        }
      }
    }));
  };

  const updateSocial = (index: number, key: string, value: unknown) => {
    setConfig((prev: any) => {
      const socials = [...(prev.home?.profile?.socials ?? [])];
      socials[index] = { ...socials[index], [key]: value };
      return {
        ...prev,
        home: {
          ...prev.home,
          profile: {
            ...prev.home?.profile,
            socials
          }
        }
      };
    });
  };

  const addSocial = () => {
    setConfig((prev: any) => ({
      ...prev,
      home: {
        ...prev.home,
        profile: {
          ...prev.home?.profile,
          socials: [...(prev.home?.profile?.socials ?? []), { label: '', href: '', icon: '' }]
        }
      }
    }));
  };

  const removeSocial = (index: number) => {
    setConfig((prev: any) => {
      const socials = [...(prev.home?.profile?.socials ?? [])];
      socials.splice(index, 1);
      return {
        ...prev,
        home: {
          ...prev.home,
          profile: {
            ...prev.home?.profile,
            socials
          }
        }
      };
    });
  };

  const updateNavCard = (index: number, key: string, value: unknown) => {
    setConfig((prev: any) => {
      const navCards = [...(prev.home?.navCards ?? [])];
      navCards[index] = { ...navCards[index], [key]: value };
      return {
        ...prev,
        home: {
          ...prev.home,
          navCards
        }
      };
    });
  };

  const addNavCard = () => {
    setConfig((prev: any) => ({
      ...prev,
      home: {
        ...prev.home,
        navCards: [
          ...(prev.home?.navCards ?? []),
          { title: '', description: '', href: '', variant: 'default' }
        ]
      }
    }));
  };

  const removeNavCard = (index: number) => {
    setConfig((prev: any) => {
      const navCards = [...(prev.home?.navCards ?? [])];
      navCards.splice(index, 1);
      return {
        ...prev,
        home: {
          ...prev.home,
          navCards
        }
      };
    });
  };

  const onSave = async () => {
    setStatus('saving');
    setErrorMessage('');
    try {
      const res = await fetch('/api/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(latestConfig.current)
      });
      if (!res.ok) {
        throw new Error('保存失败');
      }
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 1500);
    } catch (error) {
      setStatus('error');
      setErrorMessage('保存失败，请检查服务端权限。');
    }
  };

  const onReset = () => {
    setConfig(initialState);
    setStatus('idle');
    setErrorMessage('');
  };

  useEffect(() => {
    latestConfig.current = config;
  }, [config]);

  useEffect(() => {
    const saveHandler = () => {
      onSave();
    };
    const resetHandler = () => {
      onReset();
    };
    window.addEventListener('config:save', saveHandler);
    window.addEventListener('config:reset', resetHandler);
    return () => {
      window.removeEventListener('config:save', saveHandler);
      window.removeEventListener('config:reset', resetHandler);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('config:status', {
        detail: { status, errorMessage }
      })
    );
  }, [status, errorMessage]);

  return (
    <div className="config-stack">
      <section id="console-theme" className="config-section">
        <div className="config-section__header">
          <div>
            <h3>主题</h3>
            <p className="muted">基础视觉与圆角风格。</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="form-field">
            <span>主题包</span>
            <Input
              value={config?.activeTheme ?? ''}
              onChange={(event) => updateRoot('activeTheme', event.target.value)}
              placeholder="@homeblog/theme-pack"
            />
          </label>
          {codeThemeOptions.length ? (
            <label className="form-field">
              <span>代码高亮主题</span>
              <Select
                value={config?.codeTheme ?? 'github'}
                options={codeThemeOptions}
                onChange={(value) => updateRoot('codeTheme', value)}
              />
            </label>
          ) : null}
          <label className="form-field">
            <span>圆角半径</span>
            <Input
              type="number"
              value={config?.home?.radius ?? 0}
              onChange={(event) => updateHome('radius', Number(event.target.value))}
            />
          </label>
        </div>
      </section>

      <section id="console-home" className="config-section">
        <div className="config-section__header">
          <div>
            <h3>主页信息</h3>
            <p className="muted">头像、名称与简介。</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="form-field">
            <span>名称</span>
            <Input
              value={config?.home?.profile?.name ?? ''}
              onChange={(event) => updateProfile('name', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>Handle</span>
            <Input
              value={config?.home?.profile?.handle ?? ''}
              onChange={(event) => updateProfile('handle', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>头像文字</span>
            <Input
              value={config?.home?.profile?.avatarText ?? ''}
              onChange={(event) => updateProfile('avatarText', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>头像图片</span>
            <Input
              value={config?.home?.profile?.avatarUrl ?? ''}
              onChange={(event) => updateProfile('avatarUrl', event.target.value)}
              placeholder="/avatars/avatar.png"
            />
          </label>
          <label className="form-field form-field--full">
            <span>一句话</span>
            <Textarea
              value={config?.home?.profile?.bio ?? ''}
              onChange={(event) => updateProfile('bio', event.target.value)}
              rows={3}
            />
          </label>
        </div>
      </section>

      <section id="console-socials" className="config-section">
        <div className="config-section__header">
          <div>
            <h3>社交按钮</h3>
            <p className="muted">主页社交链接与图标。</p>
          </div>
          <button className="button button--sm" type="button" onClick={addSocial}>
            添加社交
          </button>
        </div>
        <div className="list-stack">
          {(config?.home?.profile?.socials ?? []).map((social: any, index: number) => (
            <div key={`${social.label}-${index}`} className="list-row">
              <Input
                placeholder="标题"
                value={social.label ?? ''}
                onChange={(event) => updateSocial(index, 'label', event.target.value)}
              />
              <Input
                placeholder="链接"
                value={social.href ?? ''}
                onChange={(event) => updateSocial(index, 'href', event.target.value)}
              />
              <Input
                placeholder="icon"
                value={social.icon ?? ''}
                onChange={(event) => updateSocial(index, 'icon', event.target.value)}
              />
              <div className="list-row__actions">
                <button
                  className="button button--ghost"
                  type="button"
                  onClick={() => removeSocial(index)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="console-nav" className="config-section">
        <div className="config-section__header">
          <div>
            <h3>内容导航</h3>
            <p className="muted">主页卡片列表。</p>
          </div>
          <button className="button button--sm" type="button" onClick={addNavCard}>
            添加卡片
          </button>
        </div>
        <div className="nav-config">
          {(config?.home?.navCards ?? []).map((card: any, index: number) => (
            <div key={`${card.title}-${index}`} className="nav-config__item">
              <div className="nav-config__meta">
                <div>
                  <div className="nav-config__title">卡片 {index + 1}</div>
                  <div className="muted">首页内容导航卡片。</div>
                </div>
                <button
                  className="button button--ghost button--sm"
                  type="button"
                  onClick={() => removeNavCard(index)}
                >
                  删除
                </button>
              </div>
              <div className="nav-config__fields">
                <label className="form-field">
                  <span>标题</span>
                  <Input
                    value={card.title ?? ''}
                    onChange={(event) => updateNavCard(index, 'title', event.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>描述</span>
                  <Input
                    value={card.description ?? ''}
                    onChange={(event) => updateNavCard(index, 'description', event.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>链接</span>
                  <Input
                    value={card.href ?? ''}
                    onChange={(event) => updateNavCard(index, 'href', event.target.value)}
                  />
                </label>
                <label className="form-field">
                  <span>样式</span>
                  <Select
                    value={card.variant ?? 'default'}
                    options={[
                      { value: 'default', label: '默认' },
                      { value: 'primary', label: '主卡' }
                    ]}
                    onChange={(next) => updateNavCard(index, 'variant', next)}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="console-quote" className="config-section">
        <div className="config-section__header">
          <div>
            <h3>一言卡片</h3>
            <p className="muted">接口地址与文案设置。</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="form-field form-field--full">
            <span>接口地址</span>
            <Input
              value={config?.home?.quoteCard?.apiUrl ?? ''}
              onChange={(event) => updateQuoteCard('apiUrl', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>加载文案</span>
            <Input
              value={config?.home?.quoteCard?.loadingText ?? ''}
              onChange={(event) => updateQuoteCard('loadingText', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>加载署名</span>
            <Input
              value={config?.home?.quoteCard?.loadingAuthor ?? ''}
              onChange={(event) => updateQuoteCard('loadingAuthor', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>失败文案</span>
            <Input
              value={config?.home?.quoteCard?.errorText ?? ''}
              onChange={(event) => updateQuoteCard('errorText', event.target.value)}
            />
          </label>
          <label className="form-field">
            <span>失败署名</span>
            <Input
              value={config?.home?.quoteCard?.errorAuthor ?? ''}
              onChange={(event) => updateQuoteCard('errorAuthor', event.target.value)}
            />
          </label>
        </div>
      </section>
    </div>
  );
}
