/**
 * Configuration interface for the design token build process.
 * Defines the core settings that control how Style Dictionary processes and builds tokens.
 */
export interface BuildConfig {
    logLevel: "silent" | "default" | "verbose"
    useDtcg: boolean
    preprocessors: string[]
}

/**
 * Build configuration for the design token system.
 */
export const BUILD_CONFIG: BuildConfig = {
    logLevel: "verbose",
    useDtcg: true,
    preprocessors: ["extensions-delegate"],
}
