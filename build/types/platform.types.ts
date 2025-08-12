import type {
    OutputReferences,
    PlatformConfig as StyleDictionaryPlatformConfig,
} from "style-dictionary/types"
import type { TypographyConfig } from "./typography.config.types"

export interface PlatformConfig extends StyleDictionaryPlatformConfig {
    defaultFormat?: string
}

export type ColorModeStrategy = "light-dark-function" | "media-query"

export interface PlatformTokenConfig {
    /** Format string for token references (e.g., "var(--{name})" for CSS) */
    referenceFormat: string
}

export interface CSSPlatformOptions {
    defaultSelector: string
    outputReferences: OutputReferences
    colorModeStrategy: ColorModeStrategy
    tokenConfig: PlatformTokenConfig
    typography?: TypographyConfig
}
