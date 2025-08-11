import type { PlatformConfig } from "style-dictionary/types"
import { getPlatform } from "../config"

export function createCSSPlatform(tier: string): PlatformConfig {
    const cssConfig = getPlatform("css")

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
                format: cssConfig.defaultFormat || "css/variables-combined",
                options: cssConfig.options,
            },
        ],
    }
}
