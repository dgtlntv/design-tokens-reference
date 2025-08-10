import type {
    PlatformConfig as StyleDictionaryPlatformConfig,
    OutputReferences,
} from "style-dictionary/types"

export interface PlatformConfig extends StyleDictionaryPlatformConfig {
    defaultFormat?: string
}

export type ColorModeStrategy = "light-dark-function" | "media-query"

export interface CSSPlatformOptions {
    defaultSelector: string
    outputReferences: OutputReferences
    preserveReferences: boolean
    useCustomProperties: boolean
    generateUtilities: boolean
    colorModeStrategy: ColorModeStrategy
}

