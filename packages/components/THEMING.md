# Theming `@clan/framework-components`

## How apps apply a theme

Apps should import **exactly one** theme CSS file (plus the base component styles):

```ts
import '@clan/framework-components/styles';
import '@clan/framework-components/themes/dark.css';
// or: import '@clan/framework-components/themes/light.css';
```

The base styles in `@clan/framework-components/styles` **never contain literal colors**. All styling is expressed via CSS variables, and each shipped theme provides the variable values.

## Variable contract

Theme files must define the following variables on `:root`:

### Core surfaces

- `--theme-bg-primary`
- `--theme-bg-secondary`
- `--theme-bg-tertiary`
- `--theme-surface-1`
- `--theme-surface-2`

### Text

- `--theme-text-primary`
- `--theme-text-muted`
- `--theme-text-accent`

### Borders

- `--theme-border-primary`
- `--theme-border-strong`

### Buttons

- `--theme-button-primary-solid-bg`
- `--theme-button-primary-solid-text`
- `--theme-button-primary-gradient-bg` (may be a `linear-gradient(...)`)
- `--theme-button-unhovered-gradient-bg` (may be a `linear-gradient(...)`)

### Tabs

- `--theme-tab-readable-bg`
- `--theme-tab-unreadable-bg`

### Token / asset selector

- `--theme-asset-surface`
- `--theme-asset-border-selected`
- `--theme-asset-border-active`
- `--theme-asset-name`
- `--theme-asset-amount-muted`
- `--theme-asset-remove-icon`

### Status

- `--theme-status-claimable`
- `--theme-status-unclaimable`

## Mapping (GenWealth dark palette → variables)

The shipped `themes/dark.css` maps the designer palette to the contract above:

- Background → `--theme-bg-primary`
- Gray square frames → `--theme-surface-1`
- White text → `--theme-text-primary`
- Purple letters → `--theme-text-accent`
- Square borders → `--theme-border-primary`
- Borders on assets selector (tokens+amount selected) → `--theme-border-strong`
- Purple buttons (solid) → `--theme-button-primary-solid-bg`
- Gradient buttons purple → `--theme-button-primary-gradient-bg`
- Unhovered buttons gray → `--theme-button-unhovered-gradient-bg`
- Readable tab → `--theme-tab-readable-bg`
- Unreadable tab → `--theme-tab-unreadable-bg`
- Asset-selectors token div → `--theme-asset-surface`
- Borders on tokens selected of send → `--theme-asset-border-selected`
- Token selector asset name → `--theme-asset-name`
- Token selector grayed out amounts → `--theme-asset-amount-muted`
- Token selector remove “x” → `--theme-asset-remove-icon`
- Claimable → `--theme-status-claimable`
- Unclaimable → `--theme-status-unclaimable`






