import type { PlatformConfig } from "style-dictionary/types"
import { createCSSPlatform } from "./css.platform"

/**
 * Supported platforms for design token output.
 * Currently supports CSS with plans for Figma and Flutter in the future.
 */
export type Platform = "css" | "figma" | "flutter"

/**
 * Creates a platform configuration for Style Dictionary based on the specified platform and tier.
 * This is a factory function that routes to platform-specific configuration creators.
 *
 * @param platform - The target platform for token output ('css', 'figma', or 'flutter')
 * @param tier - The tier name to use for configuration (e.g., 'sites', 'docs', 'apps')
 * @returns A record mapping platform name to its PlatformConfig
 * @throws {Error} When an unsupported platform is specified
 */
export function createPlatformConfig(
    platform: Platform,
    tier: string
): Record<string, PlatformConfig> {
    switch (platform) {
        case "css":
            return { css: createCSSPlatform(tier) }

        default:
            throw new Error(`Unsupported platform: ${platform}`)
    }
}
