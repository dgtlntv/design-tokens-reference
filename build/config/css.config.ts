import type { ExtendedPlatformConfig } from "../types/config.types"

export const CSS_PLATFORM_CONFIG: ExtendedPlatformConfig = {
    transforms: [
        "name/kebab",
        "dimension/w3c",
        "color/css/w3c",
        "fontFamily/css",
    ],
    fileExtension: "css",
    defaultFormat: "css/variables",
    options: {
        outputReferences: true,
    },
    prefix: "canonical",
    buildPath: "dist/css",
    categoryOverrides: {
        typography: {
            format: "css/typography",
        },
    },
}
