import type {
    PlatformConfig,
    FlutterPlatformOptions,
} from "../../types/platform.types"

export const FLUTTER_PLATFORM_CONFIG: PlatformConfig & {
    options: FlutterPlatformOptions
} = {
    enabled: false,
    prefix: "flutter",
    buildPath: "dist/flutter/",
    transforms: ["name/camel", "color/hex8flutter", "dimension/flutter"],
    fileConfig: {
        extension: ".dart",
        format: "flutter/class",
    },
    options: {
        className: "DesignTokens",
        packageName: "design_tokens",
        generateThemeExtensions: true,
    },
}
