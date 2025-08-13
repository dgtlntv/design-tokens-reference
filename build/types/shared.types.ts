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
