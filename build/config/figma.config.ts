import type { ExtendedPlatformConfig } from "../types/config.types"

export const FIGMA_PLATFORM_CONFIG: ExtendedPlatformConfig = {
    transforms: ["color/figma/hex", "dimension/w3c"],
    fileExtension: "json",
    defaultFormat: "json/nested-references",
    options: {
        outputReferences: true,
    },
    prefix: "canonical",
    buildPath: "dist/figma/",
    categoryOverrides: {},
}
