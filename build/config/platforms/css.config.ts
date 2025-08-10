import type {
    PlatformConfig,
    CSSPlatformOptions,
} from "../../types/platform.types"

export const CSS_PLATFORM_CONFIG: PlatformConfig & {
    options: CSSPlatformOptions
} = {
    enabled: true,
    prefix: "canonical",
    buildPath: "dist/css/",
    transforms: [
        "name/kebab",
        "dimension/w3c-css",
        "color/w3c-css",
        "fontFamily/css",
    ],
    fileConfig: {
        extension: ".css",
        format: "css/variables-combined",
    },
    options: {
        defaultSelector: ":root",
        useMediaQuery: false,
        outputReferences: true,
        preserveReferences: true,
        useCustomProperties: true,
        generateUtilities: false,
    },
}
