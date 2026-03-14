export type CodeThemeKey = 'github' | 'one-dark';

export type CodeThemeOption = {
  value: CodeThemeKey;
  label: string;
  shiki: { light: string; dark: string };
};

export const codeThemes: Record<CodeThemeKey, CodeThemeOption> = {
  github: {
    value: 'github',
    label: 'GitHub',
    shiki: { light: 'github-light', dark: 'github-dark' }
  },
  'one-dark': {
    value: 'one-dark',
    label: 'One Dark',
    shiki: { light: 'one-light', dark: 'one-dark-pro' }
  }
};

export const codeThemeOptions = Object.values(codeThemes).map(({ value, label }) => ({
  value,
  label
}));

export function resolveCodeTheme(key?: string): CodeThemeOption {
  if (key === 'one-dark') return codeThemes['one-dark'];
  return codeThemes.github;
}

export function resolveShikiTheme(
  theme?: string | { light: string; dark: string }
): { light: string; dark: string } {
  if (!theme) return codeThemes.github.shiki;
  if (typeof theme === 'string') {
    if (theme === 'one-dark') return codeThemes['one-dark'].shiki;
    if (theme === 'github') return codeThemes.github.shiki;
    return { light: theme, dark: theme };
  }
  return theme;
}
