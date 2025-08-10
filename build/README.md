# Design Token Build System

A scalable, type-safe design token build system using Style Dictionary with
support for multiple platforms (CSS, Figma, Flutter).

## 📁 Project Structure

```
.
├── cli.ts                    # Main entry point
├── builder/
│   └── token-builder.ts      # Core builder logic
├── config/                   # All configuration in one place
│   ├── app.config.ts         # Application settings (breakpoints, platforms, build)
│   └── tiers.config.ts       # Tier definitions and token paths
├── services/
│   └── tier.service.ts       # Tier management service
├── types/
│   ├── tokens.types.ts       # Token type definitions
│   ├── style-dictionary.types.ts # Style Dictionary types
│   └── config.types.ts       # Configuration types
├── transforms/
│   ├── dimension.transform.ts # Dimension token transformations
│   ├── color.transform.ts     # Color token transformations
│   └── index.ts               # Transform registration
├── formatters/
│   ├── css/                   # CSS-specific formatters
│   │   ├── color-mode.formatter.ts
│   │   ├── dimension-breakpoint.formatter.ts
│   │   └── variables.formatter.ts
│   └── index.ts               # Formatter registration
├── platforms/
│   ├── css.platform.ts        # CSS platform configuration
│   └── index.ts               # Platform factory
├── utils/
│   └── token-helpers.ts       # Shared utility functions
├── tokens/                    # Token source files
│   └── canonical/
│       ├── sites/
│       │   ├── primitive/
│       │   └── semantic/
│       ├── docs/
│       │   └── semantic/
│       └── apps/
└── dist/                      # Build output
    ├── css/
    ├── figma/                 # Future
    └── flutter/               # Future
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Building Tokens

Build tokens for a specific tier:

```bash
npm run build:tokens sites
npm run build:tokens docs
npm run build:tokens apps
```

Build all tiers:

```bash
npm run build:tokens all
```

## ⚙️ Configuration

All configuration is centralized in the `config/` directory using TypeScript for
type safety and consistency.

### Application Configuration (`config/app.config.ts`)

Controls application-wide settings:

```typescript
export const APP_CONFIG: AppConfiguration = {
    breakpoints: {
        small: "460px",
        medium: "620px",
        large: "1036px",
        "x-large": "1681px",
    },
    colorModes: {
        light: "light",
        dark: "dark",
        defaultMode: "light",
    },
    platforms: {
        css: {
            prefix: "canonical",
            defaultSelector: ":root",
            useMediaQuery: true,
            outputReferences: true,
        },
    },
    build: {
        outputPath: "dist",
        logLevel: "verbose",
        useDtcg: true,
    },
}
```

### Tier Configuration (`config/tiers.config.ts`)

Defines token tiers and their relationships:

```typescript
export const TIERS_CONFIG: TiersConfiguration = {
    basePaths: {
        sites: {
            primitive: "./tokens/canonical/sites/primitive/**/*.tokens.json",
            semantic: "./tokens/canonical/sites/semantic/**/*.tokens.json",
        },
    },
    tiers: {
        sites: {
            name: "sites",
            description: "Base design system tokens",
            include: [],
            source: ["sites.primitive", "sites.semantic"],
        },
    },
}
```

#### Tier Properties

- **`name`**: Tier identifier
- **`description`**: Human-readable description
- **`include`**: Token sets to include but not process (inheritance)
- **`source`**: Token sets to process and transform

## 🏗️ Architecture

### Services Layer

The `TierService` provides a clean API for tier management:

```typescript
const tierService = new TierService()

// Get token paths for a tier
const { include, source } = tierService.getTokenPaths("sites")

// Check if tier exists
if (tierService.tierExists("sites")) {
    // Get tier configuration
    const config = tierService.getTierConfig("sites")
}
```

### Builder Pattern

The `TokenBuilder` class encapsulates the build logic:

```typescript
const builder = new TokenBuilder()
await builder.build({
    tier: "sites",
    platform: "css", // optional, defaults to 'css'
})
```

## 🎨 Token Types

### Color Tokens

Supports all W3C color spaces with DRY factory functions for similar formats:

- RGB-based: `srgb`, `display-p3`, `a98-rgb`, `prophoto-rgb`, `rec2020`
- Cylindrical: `hsl`, `hwb`, `lch`, `oklch`
- Lab: `lab`, `oklab`
- XYZ: `xyz-d65`, `xyz-d50`

### Dimension Tokens

Responsive dimension tokens with breakpoint-based values.

### Color Modes

Two strategies for dark mode:

1. **CSS `light-dark()` function** (default)
2. **Media queries** (configurable via `useMediaQuery: true`)

## 🔧 Customization

### Adding a New Platform

1. Create platform configuration in `platforms/[platform].platform.ts`
2. Update `platforms/index.ts` to include the new platform
3. Add platform-specific settings to `config/app.config.ts`

Example:

```typescript
// platforms/figma.platform.ts
export function createFigmaPlatform(tier: string): PlatformConfig {
    return {
        buildPath: "dist/figma/",
        transforms: ["name/camel"],
        files: [
            /* ... */
        ],
    }
}
```

### Adding Custom Transforms

1. Create transform in `transforms/[name].transform.ts`
2. Register in `transforms/index.ts`

### Adding Custom Formatters

1. Create formatter in `formatters/[platform]/[name].formatter.ts`
2. Register in `formatters/index.ts`
