import type {
    CSSPlatformOptions,
    PlatformConfig,
} from "../../types/platform.types"

export const CSS_PLATFORM_CONFIG: PlatformConfig & {
    options: CSSPlatformOptions
} = {
    prefix: "canonical",
    buildPath: "dist/css/",
    transforms: [
        "name/kebab",
        "dimension/w3c-css",
        "color/w3c-css",
        "fontFamily/css",
    ],
    defaultFormat: "css/variables-combined",
    options: {
        defaultSelector: ":root",
        outputReferences: true,
        preserveReferences: true,
        useCustomProperties: true,
        generateUtilities: false,
        colorModeStrategy: "light-dark-function",
        tokenConfig: {
            referenceFormat: "var(--{name})",
        },
    },
}
