# Dark Mode Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add light/dark/system theme switching using next-themes with a dropdown toggle in the header.

**Architecture:** next-themes `ThemeProvider` wraps the app and manages theme state via `class` attribute on `<html>`. A `ThemeToggle` dropdown in the header lets users pick light/dark/system. The existing Tailwind CSS dark mode variables in `globals.css` handle all styling automatically.

**Tech Stack:** next-themes, shadcn/ui DropdownMenu, lucide-react (Sun/Moon/Monitor icons), Tailwind CSS dark mode

---

### Task 1: Install dependencies and add DropdownMenu component

**Files:**
- Modify: `package.json`
- Create: `src/components/ui/dropdown-menu.tsx` (via shadcn CLI)

**Step 1: Install next-themes**

```bash
pnpm add next-themes
```

**Step 2: Add shadcn/ui DropdownMenu component**

```bash
npx shadcn@latest add dropdown-menu
```

This creates `src/components/ui/dropdown-menu.tsx` using the `radix-ui` package.

**Step 3: Verify installation**

Run: `pnpm build`
Expected: Build succeeds with no errors.

**Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml src/components/ui/dropdown-menu.tsx
git commit -m "chore: next-themesとDropdownMenuコンポーネントを追加"
```

---

### Task 2: Create ThemeProvider wrapper

**Files:**
- Create: `src/components/layout/theme-provider.tsx`

**Step 1: Create the ThemeProvider component**

Create `src/components/layout/theme-provider.tsx`:

```tsx
'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

export function ThemeProvider({ children }: { readonly children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  )
}
```

Key props:
- `attribute="class"`: Adds `class="dark"` to `<html>`, which Tailwind CSS uses
- `defaultTheme="system"`: Default to OS preference
- `enableSystem`: Enable system theme detection
- `disableTransitionOnChange`: Prevent color transition flash on toggle

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds (component is created but not yet used).

**Step 3: Commit**

```bash
git add src/components/layout/theme-provider.tsx
git commit -m "feat: ThemeProviderラッパーコンポーネントを作成"
```

---

### Task 3: Add translation keys for theme toggle

**Files:**
- Modify: `messages/ja.json`
- Modify: `messages/en.json`

**Step 1: Add theme translation keys to ja.json**

Add a new `"theme"` section after the `"common"` section:

```json
"theme": {
  "light": "ライト",
  "dark": "ダーク",
  "system": "システム",
  "toggle": "テーマ切替"
}
```

**Step 2: Add theme translation keys to en.json**

```json
"theme": {
  "light": "Light",
  "dark": "Dark",
  "system": "System",
  "toggle": "Toggle theme"
}
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 4: Commit**

```bash
git add messages/ja.json messages/en.json
git commit -m "feat: テーマ切替の翻訳キーを追加"
```

---

### Task 4: Create ThemeToggle component

**Files:**
- Create: `src/components/layout/theme-toggle.tsx`

**Step 1: Create the ThemeToggle dropdown component**

Create `src/components/layout/theme-toggle.tsx`:

```tsx
'use client'

import { useTheme } from 'next-themes'
import { useTranslations } from 'next-intl'
import { Moon, Sun, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const t = useTranslations('theme')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t('toggle')}>
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 size-4" />
          {t('light')}
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 size-4" />
          {t('dark')}
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 size-4" />
          {t('system')}
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

**Step 2: Verify build**

Run: `pnpm build`
Expected: Build succeeds (component created but not yet mounted).

**Step 3: Commit**

```bash
git add src/components/layout/theme-toggle.tsx
git commit -m "feat: テーマ切替ドロップダウンコンポーネントを作成"
```

---

### Task 5: Integrate ThemeProvider into layout and ThemeToggle into header

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/header.tsx`

**Step 1: Add ThemeProvider to layout.tsx**

In `src/app/layout.tsx`:

1. Add import: `import { ThemeProvider } from '@/components/layout/theme-provider'`
2. Add `suppressHydrationWarning` to `<html>` tag (required by next-themes to avoid hydration mismatch)
3. Wrap body content with `<ThemeProvider>` — place it **inside** `<body>` and **outside** `<I18nProvider>`

The `<html>` tag should become:
```tsx
<html lang="ja" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
```

The `<body>` content should become:
```tsx
<body className="min-h-screen bg-background antialiased">
  <ThemeProvider>
    <I18nProvider>
      <HtmlLangSync />
      <Header />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </I18nProvider>
  </ThemeProvider>
</body>
```

**Step 2: Add ThemeToggle to header.tsx**

In `src/components/layout/header.tsx`:

1. Add import: `import { ThemeToggle } from '@/components/layout/theme-toggle'`
2. Wrap the language button and theme toggle in a `<div className="flex items-center gap-2">`:

```tsx
<div className="flex items-center gap-2">
  <ThemeToggle />
  <Button
    variant="outline"
    size="sm"
    onClick={() => setLocale(locale === 'ja' ? 'en' : 'ja')}
    className="gap-1.5"
  >
    <Globe className="size-4" />
    {locale === 'ja' ? 'EN' : '日本語'}
  </Button>
</div>
```

**Step 3: Verify build**

Run: `pnpm build`
Expected: Build succeeds.

**Step 4: Manual verification**

Run: `pnpm dev`
1. Open http://localhost:3000
2. Click the sun/moon icon in the header
3. Verify dropdown shows Light/Dark/System options
4. Select "Dark" — page should switch to dark theme
5. Select "Light" — page should switch to light theme
6. Select "System" — should follow OS preference
7. Refresh page — theme preference should persist

**Step 5: Commit**

```bash
git add src/app/layout.tsx src/components/layout/header.tsx
git commit -m "feat: ダークモード切替をヘッダーに統合"
```

---

### Task 6: Run all tests and verify

**Files:** None (test-only task)

**Step 1: Run unit tests**

Run: `pnpm test`
Expected: All 59 tests pass.

**Step 2: Run E2E tests**

Run: `pnpm test:e2e`
Expected: All 25 tests pass. The dark mode changes should not affect E2E tests since they test functionality, not visual appearance.

**Step 3: Run build**

Run: `pnpm build`
Expected: Build succeeds with no warnings related to theme.
