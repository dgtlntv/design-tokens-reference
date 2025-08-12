import type { PlatformConfig } from "style-dictionary/types"
import { CSS_PLATFORM_CONFIG } from "../config/platforms/css.config"

export function createCSSPlatform(tier: string): PlatformConfig {
    return {
        prefix: `${CSS_PLATFORM_CONFIG.prefix}-${tier}`,
        buildPath: CSS_PLATFORM_CONFIG.buildPath,
        transforms: CSS_PLATFORM_CONFIG.transforms,
        files: CSS_PLATFORM_CONFIG.files.map((file: any) => ({
            destination: file.destination.replace("{tier}", tier),
            format: file.format,
            // Don't filter at file level - let formatters handle their own filtering
            // This allows cross-references between token types (e.g. typography -> dimensions)
            options: {
                ...CSS_PLATFORM_CONFIG.options,
                categoryFilter: file.filter, // Pass filter to formatter via options
            },
        })),
    }
}
