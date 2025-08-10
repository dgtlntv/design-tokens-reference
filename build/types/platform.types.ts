import type {
    Config,
    TransformedToken,
    Dictionary,
} from "style-dictionary/types"
import { DesignToken } from "./tokens.types"

export interface PlatformConfig {
    enabled: boolean
    prefix: string
    buildPath: string
    transforms: string[]
    fileConfig?: PlatformFileConfig
    options?: Record<string, unknown>
}

export interface PlatformFileConfig {
    extension: string
    format: string
    options?: Record<string, unknown>
}

// CSS Platform specific types
export interface CSSPlatformOptions {
    defaultSelector: string
    useMediaQuery: boolean
    outputReferences: boolean
    preserveReferences: boolean
    useCustomProperties: boolean
    generateUtilities: boolean
}

// Style Dictionary integration types
export interface StyleDictionaryPlatformConfig {
    prefix?: string
    buildPath: string
    transforms: string[]
    files: StyleDictionaryFileConfig[]
}

export interface StyleDictionaryFileConfig {
    destination: string
    format: string
    options?: FormatOptions
}

export interface FormatOptions {
    selector?: string
    outputReferences?: boolean | OutputReferencesFunction
    outputReferenceFallbacks?: boolean
    usesDtcg?: boolean
    formatting?: unknown
    useMediaQuery?: boolean
}

export type OutputReferencesFunction = (
    token: TransformedToken,
    options: { dictionary: Dictionary; usesDtcg: boolean }
) => boolean

export interface BuildConfig extends Config {
    tier: string
}

export interface TokenDictionary extends Dictionary {
    allTokens: DesignToken[]
}
