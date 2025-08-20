export const TOKEN_PATHS = {
    sites: {
        color: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/color.tokens.json",
            },
            light: {
                source: "./tokens/canonical/sites/semantic/color/light.tokens.json",
            },
            dark: {
                source: "./tokens/canonical/sites/semantic/color/dark.tokens.json",
            },
        },
        dimension: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/dimension.tokens.json",
            },
            small: {
                source: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
            },
            medium: {
                source: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
            },
            large: {
                source: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
            },
            xLarge: {
                source: "./tokens/canonical/sites/semantic/dimension/xLarge.tokens.json",
            },
        },
        typography: {
            source: [
                "./tokens/canonical/sites/primitive/dimension.tokens.json",
                "./tokens/canonical/sites/primitive/typography.tokens.json",
                "./tokens/canonical/sites/semantic/typography.tokens.json",
            ],
        },
    },
    docs: {
        color: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/color.tokens.json",
            },
            light: {
                source: "./tokens/canonical/sites/semantic/color/light.tokens.json",
            },
            dark: {
                source: "./tokens/canonical/sites/semantic/color/dark.tokens.json",
            },
        },
        dimension: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/dimension.tokens.json",
            },
            small: {
                source: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
            },
            medium: {
                source: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
            },
            large: {
                source: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
            },
            xLarge: {
                source: "./tokens/canonical/sites/semantic/dimension/xLarge.tokens.json",
            },
        },
        typography: {
            include: [
                "./tokens/canonical/sites/primitive/dimension.tokens.json",
                "./tokens/canonical/sites/primitive/typography.tokens.json",
                "./tokens/canonical/sites/semantic/typography.tokens.json",
            ],
            source: "./tokens/canonical/docs/semantic/typography.tokens.json",
        },
    },
    apps: {
        color: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/color.tokens.json",
            },
            light: {
                source: "./tokens/canonical/sites/semantic/color/light.tokens.json",
            },
            dark: {
                source: "./tokens/canonical/sites/semantic/color/dark.tokens.json",
            },
        },
        dimension: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/dimension.tokens.json",
            },
            small: {
                source: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
            },
            medium: {
                source: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
            },
            large: {
                source: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
            },
            xLarge: {
                source: "./tokens/canonical/sites/semantic/dimension/xLarge.tokens.json",
            },
        },
        typography: {
            include: [
                "./tokens/canonical/sites/primitive/dimension.tokens.json",
                "./tokens/canonical/sites/primitive/typography.tokens.json",
                "./tokens/canonical/sites/semantic/typography.tokens.json",
            ],
            source: "./tokens/canonical/apps/semantic/typography.tokens.json",
        },
    },
}
