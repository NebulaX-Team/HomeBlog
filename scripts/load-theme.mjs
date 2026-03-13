import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');

const siteConfigPath = path.join(repoRoot, 'site.config.ts');
const packagesDir = path.join(repoRoot, 'packages');
const appDir = path.join(repoRoot, 'apps', 'web', 'app');

const fallbackThemeName = '@homeblog/theme-pack';
const outTokensPath = path.join(appDir, 'theme.tokens.css');
const outThemePath = path.join(appDir, 'theme.css');

function readActiveThemeName() {
  if (!fs.existsSync(siteConfigPath)) return null;
  const content = fs.readFileSync(siteConfigPath, 'utf8');
  const match = content.match(/activeTheme\s*:\s*['"`]([^'"`]+)['"`]/);
  return match ? match[1].trim() : null;
}

function findWorkspacePackageDir(pkgName) {
  if (!fs.existsSync(packagesDir)) return null;
  const entries = fs.readdirSync(packagesDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const pkgJsonPath = path.join(packagesDir, entry.name, 'package.json');
    if (!fs.existsSync(pkgJsonPath)) continue;
    try {
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
      if (pkgJson.name === pkgName) {
        return path.join(packagesDir, entry.name);
      }
    } catch {
      continue;
    }
  }
  return null;
}

function resolvePackageDir(pkgName) {
  const workspaceDir = findWorkspacePackageDir(pkgName);
  if (workspaceDir) return workspaceDir;
  try {
    const pkgJsonPath = require.resolve(`${pkgName}/package.json`, {
      paths: [repoRoot]
    });
    return path.dirname(pkgJsonPath);
  } catch {
    return null;
  }
}

function loadThemeFromDir(dir) {
  const themeJsonPath = path.join(dir, 'theme.json');
  const tokensPath = path.join(dir, 'tokens.css');
  const themePath = path.join(dir, 'theme.css');

  if (!fs.existsSync(themeJsonPath)) {
    throw new Error('missing theme.json');
  }
  if (!fs.existsSync(tokensPath)) {
    throw new Error('missing tokens.css');
  }

  const themeJson = JSON.parse(fs.readFileSync(themeJsonPath, 'utf8'));
  const requiredFields = ['name', 'version', 'author', 'description'];
  const missing = requiredFields.filter(
    (field) => typeof themeJson[field] !== 'string' || themeJson[field].trim() === ''
  );
  if (missing.length > 0) {
    throw new Error(`theme.json missing fields: ${missing.join(', ')}`);
  }

  const tokensCss = fs.readFileSync(tokensPath, 'utf8');
  const themeCss = fs.existsSync(themePath) ? fs.readFileSync(themePath, 'utf8') : '';

  return {
    meta: themeJson,
    tokensCss,
    themeCss
  };
}

function writeThemeFiles(tokensCss, themeCss) {
  if (!fs.existsSync(appDir)) {
    fs.mkdirSync(appDir, { recursive: true });
  }
  fs.writeFileSync(outTokensPath, tokensCss, 'utf8');
  fs.writeFileSync(outThemePath, themeCss, 'utf8');
}

function loadThemeOrFallback(themeName) {
  let primaryError = null;
  const themeDir = resolvePackageDir(themeName);
  if (!themeDir) {
    primaryError = new Error(`cannot resolve theme package: ${themeName}`);
  } else {
    try {
      const theme = loadThemeFromDir(themeDir);
      return { theme, source: themeName };
    } catch (error) {
      primaryError = error;
    }
  }

  const fallbackDir = resolvePackageDir(fallbackThemeName);
  if (!fallbackDir) {
    throw new Error(
      `failed to load theme "${themeName}" and fallback "${fallbackThemeName}" is missing`
    );
  }
  const fallbackTheme = loadThemeFromDir(fallbackDir);
  console.warn(
    `[theme-loader] failed to load "${themeName}", fallback to "${fallbackThemeName}". reason: ${primaryError?.message}`
  );
  return { theme: fallbackTheme, source: fallbackThemeName };
}

function main() {
  const activeTheme = readActiveThemeName() || fallbackThemeName;
  const { theme, source } = loadThemeOrFallback(activeTheme);
  writeThemeFiles(theme.tokensCss, theme.themeCss);
  console.log(`[theme-loader] loaded theme: ${source} (${theme.meta.name}@${theme.meta.version})`);
}

main();
