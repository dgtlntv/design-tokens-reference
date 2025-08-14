# Design tokens reference

This repository houses a reference of how I think token files can be structued and how [Style Dictionary](https://styledictionary.com/) can be used to transform them into platform-specific formats. I created this reference while I was exploring design tokens at Canonical. The tokens are organized to support multiple tiers within the Canonical ecosystem, each with slightly different token needs while maintaining consistency through shared base tokens.

## Repository Structure

```
├── build/                   # Style Dictionary configuration and custom extensions
│   ├── config/              # Central configuration for build process
│   ├── formatters/          # Custom output formatters
│   ├── platforms/           # Platform-specific configurations
│   ├── preprocessors/       # Token preprocessing logic
│   ├── transforms/          # Custom token transformations
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
├── tokens/                  # Design token definitions
│   └── canonical/           # Canonical brand tokens
│       ├── apps/            # App-specific semantic tokens
│       ├── docs/            # Documentation-specific semantic tokens
│       └── sites/           # Base tier tokens (primitive + semantic)
├── dist/                    # Generated platform-specific output
│   └── css/                 # CSS custom properties
└── package.json             # Project configuration and scripts
```

## Design Token Tiers

At Canonical, we organize our design system into different **tiers** that represent different product categories with varying token requirements:

- **`sites`** - The base tier for marketing websites and landing pages
- **`docs`** - Documentation and technical content platforms
- **`apps`** - Application interfaces and dashboards

Each tier has its own semantic token overrides while inheriting from the shared base tokens in the `sites` tier.

### Tier Configuration

Tiers are configured in `build/config/tiers.config.ts`:

- `sites` contains both primitive and semantic tokens and serves as the foundation
- `docs` and `apps` inherit `sites` tokens and add their own semantic overrides
- Each tier can include tokens from other tiers and define its own source tokens

## Build System

The build system is **configuration-driven** and built on Style Dictionary. The `build/config/` folder is the central place to configure all aspects of the token transformation process.

### Configuration Files

- **`build.config.ts`** - Global build settings (log level, DTCG compliance, preprocessors)
- **`tiers.config.ts`** - Defines tier structure and token source paths
- **`color-modes.config.ts`** - Color mode configurations (light/dark themes)
- **`dimension-modes.config.ts`** - Responsive dimension configurations
- **`platforms/`** - Platform-specific output configurations

### Style Dictionary Extensions

Style Dictionary's build architecture is organized around several key concepts - each serving a specific role in the token transformation pipeline. While Style Dictionary provides default implementations for common use cases, it allows for custom extensions to adapt to specific requirements. 

Our build system leverages this extensibility with custom implementations tailored to Canonical's design system needs. The `build/` folder structure mirrors Style Dictionary's architectural concepts:

- **`formatters/`** - Custom output formats ([Style Dictionary Formatters](https://styledictionary.com/reference/hooks/formats/))
- **`platforms/`** - Platform definitions ([Style Dictionary Platforms](https://styledictionary.com/reference/config/#platform))
- **`preprocessors/`** - Token preprocessing logic ([Style Dictionary Preprocessors](https://styledictionary.com/reference/hooks/preprocessors/))
- **`transforms/`** - Custom token transformations ([Style Dictionary Transforms](https://styledictionary.com/reference/hooks/transforms/))
- **`types/`** - TypeScript type definitions for better development experience
- **`utils/`** - Shared utility functions

## Token Structure

### Primitive Tokens

Located in `tokens/canonical/sites/primitive/`, these are the foundational values:

- `color.tokens.json` - Base color palette
- `dimension.tokens.json` - Spacing, sizing, and layout values
- `typography.tokens.json` - Font families, sizes, and text styles
- `assets.tokens.json` - Icons, images, and other assets
- `grid.tokens.json` - Grid system definitions
- `motion.tokens.json` - Animation and transition values
- `shadows.tokens.json` - Shadow and elevation styles

### Semantic Tokens

Located in `tokens/canonical/{tier}/semantic/`, these are contextual tokens that reference primitive values:

- Organized by the same categories as primitive tokens
- Support theming through mode-specific files (e.g., `color/light.tokens.json`, `color/dark.tokens.json`)
- Define responsive variations through size-specific files (e.g., `dimension/small.tokens.json`)

## Platform Support

Currently building for:

- ✅ **CSS** - CSS custom properties for web platforms

Planned platform support:

- 🔄 **Figma** - Design tool integration
- 🔄 **Flutter** - Mobile application development

## Usage

### Building Tokens

```bash
# Install dependencies
npm ci

# Build all tiers for CSS
npm run build:css

# Build specific tiers
npm run build:css:sites
npm run build:css:docs
npm run build:css:apps
```

### Using Generated Tokens

The generated CSS files are output to `dist/css/` with tier-specific naming:

```css
/* Example: dist/css/sites-colors.css */
:root {
    --canonical-sites-color-orange-500: oklch(0 0 0);
    --canonical-sites-color-teal-600: oklch(0 0 0);
    --canonical-sites-color-blue-500: oklch(0 0 0);
    --color-background-default: var(--canonical-sites-color-gray-100);
}

@media (prefers-color-scheme: dark) {
    :root {
        --color-background-default: var(--canonical-sites-color-gray-800);
    }
}
```

```css
/* Example: dist/css/sites-dimensions.css */
:root {
    --canonical-sites-dimension-100: 0.5rem;
    --canonical-sites-dimension-200: 1rem;
    --canonical-sites-dimension-300: 1.5rem;
    --canonical-sites-dimension-size-font-size-350: 1rem;
    --canonical-sites-dimension-size-font-size-500: 1.5rem;
    --dimension-size-root-font-size: var(--canonical-sites-dimension-200);
}

@media (min-width: 1681px) {
    :root {
        --dimension-size-root-font-size: var(--canonical-sites-dimension-225);
    }
}
```

```css
/* Example: dist/css/sites-typography.css */
:root {
    --canonical-sites-typography-font-family-sans-serif:
        "Ubuntu Sans", Ubuntu, Cantarell, sans-serif;
    --canonical-sites-typography-font-family-monospace:
        "Ubuntu Sans Mono", "Ubuntu Mono", monospace;
    --canonical-sites-typography-weight-regular: 400;
    --canonical-sites-typography-weight-medium: 500;
    --canonical-sites-typography-weight-bold: 700;
}

h1 {
    font-family: var(--canonical-sites-typography-font-family-default);
    font-size: var(--canonical-sites-dimension-size-font-size-700);
    font-weight: var(--canonical-sites-typography-weight-medium);
}
```

Import the generated CSS files in your projects:

```css
@import "./dist/css/sites-colors.css";
@import "./dist/css/sites-dimensions.css";
@import "./dist/css/sites-typography.css";
```

### Extending the System

To add new platforms or customize the build process:

1. **New Platform**: Add configuration in `build/config/platforms/`
2. **Custom Transforms**: Add to `build/transforms/` following [Style Dictionary transform patterns](https://styledictionary.com/reference/hooks/transforms/)
3. **Custom Formatters**: Add to `build/formatters/` following [Style Dictionary formatter patterns](https://styledictionary.com/reference/hooks/formats/)
4. **New Tiers**: Update `build/config/tiers.config.ts` with new tier definitions

## Development

This project uses:

- **TypeScript** for type safety and better developer experience
- **Style Dictionary 5.x** for token transformation
- **DTCG Format** compliance for [W3C Design Tokens Community Group](https://www.designtokens.org/tr/drafts/format/) standards

For detailed information about Style Dictionary concepts and APIs, refer to the [official Style Dictionary documentation](https://styledictionary.com/getting-started/installation/).
