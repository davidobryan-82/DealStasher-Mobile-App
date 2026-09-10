/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#F6F3EE',
    tint: '#FF6B57',

    // Core surfaces
    background: '#111419',
    foreground: '#F6F3EE',

    // Cards / elevated surfaces
    card: '#1A1F27',
    cardForeground: '#F6F3EE',

    // Primary action color (buttons, links, active states)
    primary: '#FF6B57',
    primaryForeground: '#171A20',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#242B35',
    secondaryForeground: '#F6F3EE',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#222933',
    mutedForeground: '#9BA4B2',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F5C76A',
    accentForeground: '#171A20',

    // Destructive actions (delete, error states)
    destructive: '#FF5C73',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#303845',
    input: '#303845',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 14,
};

export default colors;
