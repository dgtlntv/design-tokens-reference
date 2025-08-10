# Design Token Build System

## 📁 Project Structure

```
.
├── builder/
│   ├── main.ts                    # Main entry point
│   ├── builder/
│   │   └── token-builder.ts      # Core builder logic
│   ├── config/                   # All configuration in one place
│   │   ├── index.ts
│   │   ├── platforms/
│   │   │   ├── index.ts
│   │   │   ├── css.config.ts
│   │   │   └── platform.registry.ts
│   │   ├── breakpoint.config.ts
│   │   ├── build.config.ts
│   │   ├── color-modes.config.ts
│   │   ├── config.factory.ts
│   │   ├── environment.config.ts
│   │   └── tiers.config.ts
│   ├── formatters/
│   │   ├── index.ts
│   │   ├── css/
│   │   │   ├── color-mode.formatter.ts
│   │   │   ├── dimension-breakpoint.formatter.ts
│   │   │   └── variables.formatter.ts
│   ├── platforms/
│   │   ├── index.ts
│   │   └── css.platform.ts
│   ├── services/
│   │   └── tier.services.ts
│   ├── transforms/
│   │   ├── index.ts
│   │   ├── css/
│   │   │   ├── color.transform.ts
│   │   │   └── dimension.transform.ts
│   ├── types/
│   │   ├── platform.types.ts
│   │   ├── shared.types.ts
│   │   └── tokens.types.ts
│   ├── utils/
│   │   └── token-helpers.ts
├── dist/
│   └── css/
└── tokens/
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

All configuration is centralized in the `config/` directory.
