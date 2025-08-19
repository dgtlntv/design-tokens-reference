/**
 * Configuration types for the design token build system.
 * Centralizes all configuration-related type definitions.
 */

/** Configuration interface for the design token build process */
export interface BuildConfig {
    /** Logging level for the build process */
    logLevel: "silent" | "default" | "verbose"
    /** Whether to use DTCG (Design Token Community Group) format */
    useDtcg: boolean
    /** Array of preprocessor names to apply */
    preprocessors: string[]
}

/** Configuration for modes within a token category */
export interface CategoryModeConfig {
    /** Maps mode names to their corresponding file patterns */
    [modeName: string]: string
}

/** Configuration for token categories that support modes */
export interface CategoryModesConfig {
    /** Maps category names to their mode configurations */
    [categoryName: string]: CategoryModeConfig
}

/** Configuration for a single tier in the design token system */
export interface TierConfig {
    /** Display name of the tier */
    name: string
    /**
     * Array of file paths that contain default styles from other tiers.
     * Used as a base collection of design tokens that can be referenced.
     * Tokens from 'source' will overwrite tokens found using 'include'.
     */
    include: string[]
    /**
     * Array of file paths that are the primary token files for this tier.
     * These tokens will be processed, transformed, and output in the final build.
     * Style Dictionary performs a deep merge of all source files.
     */
    source: string[]
    /** Mode configurations specific to this tier */
    modes: CategoryModesConfig
}

/** Collection of all tier configurations keyed by tier name */
export interface TokenPathsConfiguration {
    [tierName: string]: TierConfig
}