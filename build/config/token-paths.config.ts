export const TOKEN_PATHS = {
    sites: {
        color: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/color.tokens.json",
            },
            light: {
                highContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/light/highContrast.tokens.json",
                },
                normalContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/light/normalContrast.tokens.json",
                },
            },
            dark: {
                highContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/dark/highContrast.tokens.json",
                },
                normalContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/dark/normalContrast.tokens.json",
                },
            },
        },
        dimension: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/dimension.tokens.json",
            },
            small: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
            },
            medium: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
            },
            large: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
            },
            xLarge: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/xLarge.tokens.json",
            },
        },
        typography: {
            include:
                "./tokens/canonical/sites/primitive/dimension.tokens.json",
            source: [
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
                highContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/light/highContrast.tokens.json",
                },
                normalContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/light/normalContrast.tokens.json",
                },
            },
            dark: {
                highContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/dark/highContrast.tokens.json",
                },
                normalContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/dark/normalContrast.tokens.json",
                },
            },
        },
        dimension: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/dimension.tokens.json",
            },
            small: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
            },
            medium: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
            },
            large: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
            },
            xLarge: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
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
                highContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/light/highContrast.tokens.json",
                },
                normalContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/light/normalContrast.tokens.json",
                },
            },
            dark: {
                highContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/dark/highContrast.tokens.json",
                },
                normalContrast: {
                    reference:
                        "./tokens/canonical/sites/primitive/color.tokens.json",
                    source: "./tokens/canonical/sites/semantic/color/dark/normalContrast.tokens.json",
                },
            },
        },
        dimension: {
            primitive: {
                source: "./tokens/canonical/sites/primitive/dimension.tokens.json",
            },
            small: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/small.tokens.json",
            },
            medium: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/medium.tokens.json",
            },
            large: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
                source: "./tokens/canonical/sites/semantic/dimension/large.tokens.json",
            },
            xLarge: {
                reference:
                    "./tokens/canonical/sites/primitive/dimension.tokens.json",
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
