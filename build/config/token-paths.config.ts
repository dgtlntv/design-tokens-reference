import type { TokenPathsConfiguration } from "../types"

/**
 * Configuration for design token tiers and their relationships.
 */
export const TOKEN_PATHS_CONFIG: TokenPathsConfiguration = {
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
