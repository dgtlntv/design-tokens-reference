import type { StyleDictionaryPlatformConfig } from "../types/platform.types"
import { configFactory } from "../config"

export function createCSSPlatform(tier: string): StyleDictionaryPlatformConfig {
    const cssConfig = configFactory.getPlatformConfig("css")
    const buildConfig = configFactory.getBuildConfig()

    if (!cssConfig) {
        throw new Error("CSS platform configuration not found")
    }

    return {
        prefix: `${cssConfig.prefix}-${tier}`,
        buildPath: cssConfig.buildPath,
        transforms: cssConfig.transforms,
        files: [
            {
                destination: `${tier}.css`,
                format:
                    cssConfig.fileConfig?.format || "css/variables-combined",
                options: cssConfig.options,
            },
        ],
    }
}
