import type { LocalOptions, TransformedToken } from "style-dictionary/types"

export interface ResolvedTokenPaths {
    include: string[]
    source: string[]
}

export interface BuildResult {
    tier: string
    success: boolean
    error?: Error
    duration?: number
}

export interface ModeConfig<Modes extends Record<string, string>> {
    modes: Modes
    defaultMode?: keyof Modes
}

// Extended LocalOptions interface to properly type the additional categoryFilter option
export interface ExtendedLocalOptions extends LocalOptions {
    categoryFilter?: (token: TransformedToken) => boolean
}
