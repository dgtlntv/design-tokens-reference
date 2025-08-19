/**
 * Configuration for modes within a token category.
 * Maps mode names to their corresponding file patterns.
 */
export interface CategoryModeConfig {
    [modeName: string]: string
}

/**
 * Configuration for token categories that support modes.
 * Maps category names to their mode configurations.
 */
export interface CategoryModesConfig {
    [categoryName: string]: CategoryModeConfig
}

/**
 * Configuration for a single tier in the design token system.
 * Defines how tokens are included and sourced for a specific tier.
 */
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

/**
 * Collection of all tier configurations keyed by tier name.
 */
export interface TiersConfiguration {
    [tierName: string]: TierConfig
}

/**
 * Configuration for design token tiers and their relationships.
 */
export const TIERS_CONFIG: TiersConfiguration = {
    sites: {
        name: "sites",
        include: [],
        source: [
            "./tokens/canonical/sites/primitive/**/*.tokens.json",
            "./tokens/canonical/sites/semantic/**/*.tokens.json",
        ],
        modes: {
            color: {
                light: "./tokens/canonical/sites/semantic/color/light.tokens.json",
                dark: "./tokens/canonical/sites/semantic/color/dark.tokens.json",
            },
            dimension: {
                small: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
                medium: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
                large: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
                xLarge: "./tokens/canonical/sites/semantic/dimension/xLarge.tokens.json",
            },
        },
    },
    docs: {
        name: "docs",
        include: [
            "./tokens/canonical/sites/primitive/**/*.tokens.json",
            "./tokens/canonical/sites/semantic/**/*.tokens.json",
        ],
        source: ["./tokens/canonical/docs/semantic/**/*.tokens.json"],
        modes: {
            color: {
                light: "./tokens/canonical/sites/semantic/color/light.tokens.json",
                dark: "./tokens/canonical/sites/semantic/color/dark.tokens.json",
            },
            dimension: {
                small: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
                medium: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
                large: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
                xLarge: "./tokens/canonical/sites/semantic/dimension/xLarge.tokens.json",
            },
        },
    },
    apps: {
        name: "apps",
        include: [
            "./tokens/canonical/sites/primitive/**/*.tokens.json",
            "./tokens/canonical/sites/semantic/**/*.tokens.json",
        ],
        source: ["./tokens/canonical/apps/semantic/**/*.tokens.json"],
        modes: {
            color: {
                light: "./tokens/canonical/sites/semantic/color/light.tokens.json",
                dark: "./tokens/canonical/sites/semantic/color/dark.tokens.json",
            },
            dimension: {
                small: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
                medium: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
                large: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
                xLarge: "./tokens/canonical/sites/semantic/dimension/xLarge.tokens.json",
            },
        },
    },
}
