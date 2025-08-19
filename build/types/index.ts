/**
 * Centralized type exports for the design token build system.
 * Import types from here to maintain clean dependency paths.
 */

// Build process types
export type {
    BuildOptions,
    BuildResult,
} from "./build.types"

// Configuration types
export type {
    BuildConfig,
    CategoryModeConfig,
    CategoryModesConfig,
    TierConfig,
    TokenPathsConfiguration,
} from "./config.types"

// CSS-specific types
export type {
    CSSFileConfig,
    TypographySemanticElement,
    TypographyCustomElement,
    TypographySemanticElements,
    TypographyUtilities,
    TypographyBoldVariants,
    CSSTypographyConfig,
    TypographyValue,
    TypographyToken,
} from "./css.types"

// Platform types
export type {
    PlatformConfig,
    PlatformTokenConfig,
    CSSPlatformOptions,
    Platform,
} from "./platform.types"

// Shared types
export type {
    ResolvedTokenPaths,
    ModeConfig,
    ExtendedLocalOptions,
} from "./shared.types"

// Token types
export type {
    ColorValue,
    ColorSpace,
    DimensionValue,
} from "./tokens.types"