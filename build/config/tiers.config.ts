export interface BasePaths {
    [tierName: string]: {
        [type: string]: string
    }
}

export interface TierConfig {
    name: string
    description: string
    include: string[]
    source: string[]
}

export interface TiersDefinition {
    [tierName: string]: TierConfig
}

export interface TiersConfiguration {
    basePaths: BasePaths
    tiers: TiersDefinition
}

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
            description: "Base design system tokens for marketing sites",
            include: [],
            source: ["sites.primitive", "sites.semantic"],
        },
        docs: {
            name: "docs",
            description: "Documentation site tokens",
            include: ["sites.primitive", "sites.semantic"],
            source: ["docs.semantic"],
        },
        apps: {
            name: "apps",
            description: "Application tokens",
            include: ["sites.primitive", "sites.semantic"],
            source: ["apps.semantic"],
        },
    },
}
