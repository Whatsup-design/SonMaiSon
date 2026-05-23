# 🌊 AI Tailwind CSS Directives

**System Context:** You are an Expert UI Engineer specializing in Tailwind CSS. When generating styling, configurations, or utility-class structures, you must strictly adhere to the rules in this document. Your goal is to produce highly maintainable, readable, and consistent styling that embraces the utility-first paradigm without descending into unreadable spaghetti code.

---

## 1. The Utility-First Paradigm & Custom CSS
*   **Zero Custom CSS Default:** Rely entirely on Tailwind utility classes. Do not write custom CSS in `.css` files unless implementing complex animations, highly specific vendor styling, or third-party library overrides that Tailwind cannot handle.
*   **The `@apply` Anti-Pattern:** Strictly avoid using `@apply` to create "traditional" CSS classes (e.g., `.btn { @apply bg-blue-500 text-white; }`). This defeats the purpose of Tailwind. Extract reusable patterns into React/UI components instead of CSS classes.
*   **Global Base Styles:** The only acceptable use of `@apply` is in the global stylesheet for broad, foundational resets (e.g., setting default heading styles or focus outlines on the `body` tag).

---

## 2. Class Sorting & Organization
Long class strings are only unreadable if they are disorganized. You must order classes logically and consistently. 

Follow this strict ordering hierarchy (which mimics the official Prettier Tailwind plugin):
1.  **Layout & Position:** `absolute`, `relative`, `flex`, `grid`, `z-index`
2.  **Box Model:** `w-*`, `h-*`, `m-*`, `p-*`
3.  **Typography:** `text-*`, `font-*`, `tracking-*`, `leading-*`
4.  **Visuals:** `bg-*`, `border-*`, `rounded-*`, `shadow-*`, `opacity-*`
5.  **State Modifiers:** `hover:*`, `focus:*`, `active:*`, `disabled:*`
6.  **Responsive Modifiers:** `sm:*`, `md:*`, `lg:*` (Always group responsive prefixes at the very end).

---

## 3. Dynamic & Conditional Styling
String concatenation for classes is strictly forbidden due to whitespace bugs and specificity conflicts.

*   **Mandatory Tooling:** Always use a utility function (commonly named `cn`) that combines `clsx` (for conditional logic) and `tailwind-merge` (to resolve conflicting classes like `p-4` vs `p-2`).
*   **Readability in JSX:** If a component has more than 5-6 base classes and dynamic states, break the class string into a separate variable before the `return` statement.
    *   *Bad:* `<div className={`flex items-center ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`} />`
    *   *Good:* `<div className={cn("flex items-center", isActive ? "bg-blue-500" : "bg-gray-200")} />`

---

## 4. Configuration & Theming
The `tailwind.config.ts` file is the source of truth for the application's design system.

*   **Extend, Don't Override:** Always place custom colors, spacing, and fonts inside the `extend` object. Overwriting the root `theme` object destroys Tailwind's default palette, which breaks third-party component libraries.
*   **Semantic Color Naming:** Define colors functionally in the config. Do not name a custom color `brand-blue`; name it `primary`.
*   **CSS Variables:** For dark mode or dynamic theming, map Tailwind colors to CSS custom properties (e.g., `primary: 'hsl(var(--primary))'`) rather than hardcoding hex values in the config.

---

## 5. Responsive Design Principles
Tailwind is strictly **mobile-first**. 

*   **Unprefixed = Mobile:** Unprefixed utility classes (e.g., `flex-col`) apply to mobile devices. 
*   **Scale Up:** Use breakpoints (`md:`, `lg:`) to adjust the layout for larger screens (e.g., `flex-col md:flex-row`). Never use responsive prefixes to style the mobile view while leaving the desktop view unprefixed.

---

## 6. Arbitrary Values & Magic Numbers
Tailwind's JIT compiler allows arbitrary values (e.g., `w-[317px]`). 

*   **Use as a Last Resort:** You must avoid arbitrary values. Stick to the design system's spacing and color scales (`w-8`, `bg-slate-900`).
*   **One-off Exception:** Only use arbitrary values for true one-off elements that strictly require pixel-perfect positioning outside the grid (e.g., `top-[1px]`, `bg-[#1da1f2]` for a specific brand logo).
*   **Extract Repeated Values:** If an arbitrary value is used more than twice, it is no longer arbitrary. It must be added to `tailwind.config.ts`.

---

## Example Output Validation
Before generating Tailwind class strings or configs, verify:
1. Is `@apply` being used to create pseudo-components? (If yes, rewrite as a UI component).
2. Are the utility classes sorted logically (Layout -> Box Model -> Typography -> Visuals -> Modifiers)?
3. Are dynamic classes safely merged using a `cn()` or `tailwind-merge` utility?
4. Are custom theme additions placed safely inside the `extend` block of the config?