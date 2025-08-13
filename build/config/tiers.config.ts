/**
 * Mapping of tier names to their token file paths organized by type.
 * Each tier can have different types of token files (primitive, semantic).
 */
export interface BasePaths {
    [tierName: string]: {
        /** Token type (e.g., 'primitive', 'semantic') mapped to file glob pattern */
        [type: string]: string
    }
}

/**
 * Configuration for a single tier in the design token system.
 * Defines how tokens are included and sourced for a specific tier.
 */
export interface TierConfig {
    /** Display name of the tier */
    name: string
    /**
     * Array of tier.type combinations that contain default styles from other tiers.
     * Used as a base collection of design tokens that can be referenced.
     * Tokens from 'source' will overwrite tokens found using 'include'.
     */
    include: string[]
    /**
     * Array of tier.type combinations that are the primary token files for this tier.
     * These tokens will be processed, transformed, and output in the final build.
     * Style Dictionary performs a deep merge of all source files.
     */
    source: string[]
}

/**
 * Collection of all tier configurations keyed by tier name.
 */
export interface TiersDefinition {
    [tierName: string]: TierConfig
}

/**
 * Complete tiers configuration including base paths and tier definitions.
 */
export interface TiersConfiguration {
    /** Base file path patterns for each tier and type */
    basePaths: BasePaths
    /** Individual tier configurations */
    tiers: TiersDefinition
}

/**
 * Configuration for design token tiers and their relationships.
 */
export const TIERS_CONFIG: TiersConfiguration = {
    basePaths: {
        sites: {
            primitive: "./tokens/canonical/sites/primitive/**/*.tokens.json",
            semantic: "./tokens/canonical/sites/semantic/**/*.tokens.json",
        },
        docs: {
            semantic: "./tokens/canonical/docs/semantic/**/*.tokens.json",
        },
        apps: {
            semantic: "./tokens/canonical/apps/semantic/**/*.tokens.json",
        },
    },
    tiers: {
        sites: {
            name: "sites",
            include: [],
            source: ["sites.primitive", "sites.semantic"],
        },
        docs: {
            name: "docs",
            include: ["sites.primitive", "sites.semantic"],
            source: ["docs.semantic"],
        },
        apps: {
            name: "apps",
            include: ["sites.primitive", "sites.semantic"],
            source: ["apps.semantic"],
        },
    },
}
