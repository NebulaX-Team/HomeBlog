"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { cx } from './utils';

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  value?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
};

export function Select({
  value,
  options,
  placeholder = '请选择',
  onChange,
  className,
  disabled,
  name,
  id
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cx('hb-select', open ? 'hb-select--open' : '', disabled ? 'hb-select--disabled' : '', className)}
    >
      <input type="hidden" name={name} value={value ?? ''} readOnly />
      <button
        id={id}
        type="button"
        className="hb-select__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="hb-select__value">{selected?.label ?? placeholder}</span>
        <span className="hb-select__chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div role="listbox" className="hb-select__menu">
          {options.map((option) => {
            const isActive = option.value === value;
            return (
              <button
                key={option.value}
                role="option"
                type="button"
                aria-selected={isActive}
                className={cx('hb-select__option', isActive ? 'hb-select__option--active' : '')}
                onClick={() => {
                  onChange?.(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
