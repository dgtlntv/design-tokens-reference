import type { PlatformConfig } from "style-dictionary/types"
import type { Platform } from "../types"
import { createCSSPlatform } from "./css.platform"

/**
 * Creates a platform configuration for Style Dictionary based on the specified platform and tier.
 * This is a factory function that routes to platform-specific configuration creators.
 *
 * @param platform - The target platform for token output ('css', 'figma', or 'flutter')
 * @param tier - The tier name to use for CSS prefixes (e.g., 'sites', 'docs', 'apps')
 * @param category - Optional category to filter for (e.g., 'color', 'dimension', 'typography')
 * @param excludePrimitives - Whether to exclude primitive tokens from output
 * @param filenameTier - Optional separate tier name for filenames
 * @returns A record mapping platform name to its PlatformConfig
 * @throws {Error} When an unsupported platform is specified
 */
export function createPlatformConfig(
    platform: Platform,
    tier: string,
    category?: string,
    excludePrimitives = false,
    filenameTier?: string
): Record<string, PlatformConfig> {
    switch (platform) {
        case "css":
            return { css: createCSSPlatform(tier, category, excludePrimitives, filenameTier) }

        default:
            throw new Error(`Unsupported platform: ${platform}`)
    }
}
