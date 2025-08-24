# Design Token System

A comprehensive design token system built with
[Style Dictionary 5.x](https://styledictionary.com/) that transforms design
tokens into platform-specific formats. Created while exploring design tokens at
Canonical, this system supports multiple tiers within the Canonical ecosystem,
each with slightly different token needs while maintaining consistency through
shared base tokens.

## Repository Structure

```
├── build/                   # Style Dictionary configuration and custom extensions
│   ├── actions/             # Post-build actions (CSS index generation, Figma metadata)
│   ├── config/              # Central configuration for build process
│   ├── formatters/          # Custom output formatters
│   ├── transforms/          # Custom token transformations
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Utility functions
│   └── build.ts             # Main build script
├── tokens/                  # Design token definitions
│   └── canonical/           # Canonical brand tokens
│       ├── apps/            # App-specific semantic tokens
│       ├── docs/            # Documentation-specific semantic tokens
│       └── sites/           # Base tier tokens (primitive + semantic)
├── dist/                    # Generated platform-specific output
│   ├── css/                 # CSS custom properties with responsive/theme handling
│   └── figma/               # Figma token format with metadata
└── package.json             # Project configuration and scripts
```

## Design Token Tiers

At Canonical, we organize our design system into different **tiers** that
represent different product categories with varying token requirements:

- **`sites`** - The base tier for marketing websites and landing pages
- **`docs`** - Documentation and technical content platforms
- **`apps`** - Application interfaces and dashboards

Each tier has its own semantic token overrides while inheriting from the shared
base tokens in the `sites` tier.

### Tier Configuration

Tiers are configured in `build/config/token-paths.config.ts` with their
categories having three key properties:

- **`source`** - Main tokens that will be built into the final output
- **`include`** - Additional tokens that become final tokens unless overridden
  by source tokens (tokens files under include will not throw a token collision
  error if overridden)
- **`reference`** - Tokens needed as references for source/include tokens but
  excluded from final build output

The tier hierarchy:

- `sites` contains both primitive and semantic tokens and serves as the
  foundation
- `docs` and `apps` inherit `sites` tokens and add their own semantic overrides

## Build System

The build system is **configuration-driven** and built on Style Dictionary 5.x.
It uses a modular architecture with custom actions, transforms, and formatters.

### Key Components

- **`build/build.ts`** - Main build script that orchestrates the entire process
- **`build/config/`** - Configuration files for platforms and token paths
- **`build/actions/`** - Post-build actions (CSS index file generation, Figma
  metadata)
- **`build/transforms/`** - Custom token transformations for CSS and Figma
- **`build/formatters/`** - Custom output formatters

### Architecture

The system uses a command-line interface that takes platform and tier arguments:

```bash
tsx build/build.ts <platform> <tier>
```

Where:

- **Platform**: `css`, `figma`, or `all`
- **Tier**: `sites`, `docs`, `apps`, or `all`

The build process:

1. Registers custom transforms, formatters, and actions
2. Generates configurations based on token paths for the specified tier
3. Processes tokens through Style Dictionary
4. Executes post-build actions (index file generation, metadata creation)

## Token Structure

### Primitive Tokens

Located in `tokens/canonical/{tier}/primitive/`, these are the foundational
values:

- `color.tokens.json` - Base color palette
- `dimension.tokens.json` - Spacing, sizing, and layout values
- `typography.tokens.json` - Font families, sizes, and text styles
- `assets.tokens.json` - Icons, images, and other assets
- `grid.tokens.json` - Grid system definitions
- `motion.tokens.json` - Animation and transition values
- `shadows.tokens.json` - Shadow and elevation styles

### Semantic Tokens

Located in `tokens/canonical/{tier}/semantic/`, these are contextual tokens that
reference primitive values:

- Organized by the same categories as primitive tokens
- Support theming through mode-specific files (e.g., `color/light.tokens.json`,
  `color/dark.tokens.json`)
- Define responsive variations through size-specific files (e.g.,
  `dimension/small.tokens.json`)

## Platform Support

Currently building for:

- ✅ **CSS** - CSS custom properties with responsive breakpoints, color modes,
  and contrast preferences
- ✅ **Figma** - Figma Variables format with metadata and theme configuration

## Usage

### Building Tokens

```bash
# Install dependencies
npm ci

# Build all platforms and tiers
npm run build

# Build all tiers for CSS
npm run build:css

# Build all tiers for Figma
npm run build:figma

# Build specific tiers for CSS
npm run build:css:sites
npm run build:css:docs
npm run build:css:apps

# Build specific tiers for Figma
npm run build:figma:sites
npm run build:figma:docs
npm run build:figma:apps
```

### Using Generated Tokens

#### CSS Output Structure

The generated CSS files are organized by tier and category in
`dist/css/{tier}/`:

```
dist/css/
├── sites/
│   ├── index.css                    # Main index file with imports and media queries
│   ├── color/
│   │   ├── primitive.css            # Base color tokens
│   │   ├── light/
│   │   │   ├── normalContrast.css   # Light theme tokens
│   │   │   └── highContrast.css     # High contrast light theme
│   │   └── dark/
│   │       ├── normalContrast.css   # Dark theme tokens
│   │       └── highContrast.css     # High contrast dark theme
│   ├── dimension/
│   │   ├── primitive.css            # Base dimension tokens
│   │   ├── small.css                # Small breakpoint overrides
│   │   ├── medium.css               # Medium breakpoint overrides
│   │   ├── large.css                # Large breakpoint overrides
│   │   └── xLarge.css               # Extra large breakpoint overrides
│   └── typography.css               # Typography tokens
```

#### Example Generated Content

```css
/* dist/css/sites/color/primitive.css */
:root {
    --canonical-color-orange-500: oklch(0 0 0);
    --canonical-color-teal-500: oklch(0 0 0);
    --canonical-color-blue-500: oklch(0 0 0);
}
```

```css
/* dist/css/sites/dimension/primitive.css */
:root {
    --canonical-dimension-100: 0.5rem;
    --canonical-dimension-200: 1rem;
    --canonical-dimension-300: 1.5rem;
}
```

```css
/* dist/css/sites/typography.css */
:root {
    --canonical-typography-font-family-sans-serif:
        "Ubuntu Sans", Ubuntu, Cantarell, sans-serif;
    --canonical-typography-weight-regular: 400;
    --canonical-typography-weight-medium: 500;
}
```

#### Using the Tokens

**Option 1: Use the index file (recommended)**

```css
@import "./dist/css/sites/index.css";
```

The index file automatically handles:

- Color mode switching (light/dark)
- Contrast preferences (normal/high)
- Responsive dimension tokens
- Data attribute overrides

**Option 2: Import individual files**

```css
@import "./dist/css/sites/color/primitive.css";
@import "./dist/css/sites/dimension/primitive.css";
@import "./dist/css/sites/typography.css";
```

### Extending the System

To add new platforms or customize the build process:

1. **New Platform**: Add configuration in `build/config/` (e.g.,
   `android.config.ts`)
2. **Custom Transforms**: Add to `build/transforms/` following
   [Style Dictionary transform patterns](https://styledictionary.com/reference/hooks/transforms/)
3. **Custom Formatters**: Add to `build/formatters/` following
   [Style Dictionary formatter patterns](https://styledictionary.com/reference/hooks/formats/)
4. **Post-build Actions**: Add to `build/actions/`
5. **New Tiers**: Update `build/config/token-paths.config.ts` with new tier
   token paths

## Development

This project uses:

- **TypeScript** for type safety and better developer experience
- **Style Dictionary 5.x** for token transformation
- **DTCG Format** compliance for
  [W3C Design Tokens Community Group](https://www.designtokens.org/tr/drafts/format/)
  standards

For detailed information about Style Dictionary concepts and APIs, refer to the
[official Style Dictionary documentation](https://styledictionary.com/getting-started/installation/).
