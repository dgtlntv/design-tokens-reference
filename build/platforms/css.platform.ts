import type { PlatformConfig } from "style-dictionary/types"
import { CSS_PLATFORM_CONFIG } from "../config/platforms/css.config"

/**
 * Creates a CSS platform configuration for Style Dictionary based on a specific tier.
 * This function customizes the base CSS platform configuration with tier-specific settings,
 * including prefixed CSS custom property names and tier-specific file destinations.
 *
 * @param tier - The tier name to use for configuration (e.g., 'sites', 'docs', 'apps')
 * @returns A complete PlatformConfig object ready for use with Style Dictionary
 */
export function createCSSPlatform(tier: string): PlatformConfig {
    return {
        prefix: `${CSS_PLATFORM_CONFIG.prefix}-${tier}`,
        buildPath: CSS_PLATFORM_CONFIG.buildPath,
        transforms: CSS_PLATFORM_CONFIG.transforms,
        files: CSS_PLATFORM_CONFIG.files.map((file: any) => ({
            destination: file.destination.replace("{tier}", tier),
            format: file.format,
            options: {
                ...CSS_PLATFORM_CONFIG.options,
                categoryFilter: file.filter,
            },
        })),
    }
}
