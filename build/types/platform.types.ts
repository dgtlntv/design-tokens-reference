import type {
    OutputReferences,
    PlatformConfig as StyleDictionaryPlatformConfig,
} from "style-dictionary/types"
import type { CSSTypographyConfig } from "../config/platforms/css.config"

/**
 * Extended platform configuration that includes additional options.
 * Extends Style Dictionary's PlatformConfig with custom properties.
 */
export interface PlatformConfig extends StyleDictionaryPlatformConfig {
    /** Default format to use if none specified */
    defaultFormat?: string
}

/**
 * Strategy for handling color mode variants in CSS output.
 */
export type ColorModeStrategy = 
    | "light-dark-function"  // Use CSS light-dark() function
    | "media-query"          // Use @media (prefers-color-scheme) queries

/**
 * Configuration for token reference formatting within a platform.
 */
export interface PlatformTokenConfig {
    /** Format string for token references (e.g., "var(--{name})" for CSS) */
    referenceFormat: string
}

/**
 * Configuration options specific to CSS platform output.
 */
export interface CSSPlatformOptions {
    /** Default CSS selector to apply tokens to */
    defaultSelector: string
    /** Configuration for how token references should be output */
    outputReferences: OutputReferences
    /** Strategy for handling color mode variants */
    colorModeStrategy: ColorModeStrategy
    /** Token-specific configuration for this platform */
    tokenConfig: PlatformTokenConfig
    /** Optional typography-specific configuration */
    typography?: CSSTypographyConfig
}
