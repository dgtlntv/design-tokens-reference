import type {
    PlatformConfig,
    FigmaPlatformOptions,
} from "../../types/platform.types"

export const FIGMA_PLATFORM_CONFIG: PlatformConfig & {
    options: FigmaPlatformOptions
} = {
    enabled: false,
    prefix: "figma",
    buildPath: "dist/figma/",
    transforms: ["name/camel", "color/rgb"],
    fileConfig: {
        extension: ".json",
        format: "json/figma",
    },
    options: {
        generateComponents: true,
        includeStyleGuide: true,
        syncMode: "manual",
    },
}
