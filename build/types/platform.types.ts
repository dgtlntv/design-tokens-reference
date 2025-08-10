import type {
    LocalOptions,
    PlatformConfig as StyleDictionaryPlatformConfig,
    OutputReferences,
} from "style-dictionary/types"

export interface PlatformConfig extends StyleDictionaryPlatformConfig {
    enabled: boolean
    defaultFormat?: string
}

export interface CSSPlatformOptions {
    defaultSelector: string
    useMediaQuery: boolean
    outputReferences: OutputReferences
    preserveReferences: boolean
    useCustomProperties: boolean
    generateUtilities: boolean
}

export interface FormatOptions extends LocalOptions {
    useMediaQuery?: boolean
}
