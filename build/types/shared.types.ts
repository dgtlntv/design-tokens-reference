import type { LocalOptions, TransformedToken } from "style-dictionary/types"

/**
 * Resolved file paths for token processing.
 */
export interface ResolvedTokenPaths {
    /** 
     * Array of file path globs to design token files that contain default styles.
     * Used as a base collection of design tokens.
     * Tokens from 'source' will overwrite tokens found using 'include'.
     */
    include: string[]
    /** 
     * Array of file path globs to design token files.
     * Style Dictionary performs a deep merge of all token files.
     * These are the primary token files that will be processed and transformed.
     */
    source: string[]
}

/**
 * Result object returned after a build operation.
 */
export interface BuildResult {
    /** The tier that was built */
    tier: string
    /** Whether the build completed successfully */
    success: boolean
    /** Error object if the build failed */
    error?: Error
    /** Build duration in milliseconds */
    duration?: number
}

/**
 * Configuration for mode-based token variants.
 * @template Modes - Record of mode names to their display labels
 */
export interface ModeConfig<Modes extends Record<string, string>> {
    /** Available modes and their labels */
    modes: Modes
    /** Default mode to use if none specified */
    defaultMode?: keyof Modes
}

/**
 * Extended LocalOptions interface to properly type the additional categoryFilter option.
 * Extends Style Dictionary's LocalOptions with custom filtering capability.
 */
export interface ExtendedLocalOptions extends LocalOptions {
    /** Optional filter function to include/exclude tokens based on custom criteria */
    categoryFilter?: (token: TransformedToken) => boolean
}
