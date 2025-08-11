import type { PlatformConfig } from "style-dictionary/types"
import { createCSSPlatform } from "./css.platform"

export type Platform = "css" | "figma" | "flutter"

export function createPlatformConfig(
    platform: Platform,
    tier: string
): Record<string, PlatformConfig> {
    switch (platform) {
        case "css":
            return { css: createCSSPlatform(tier) }

        // Future platform support
        // case 'figma':
        //     return { figma: createFigmaPlatform(tier) };
        // case 'flutter':
        //     return { flutter: createFlutterPlatform(tier) };

        default:
            throw new Error(`Unsupported platform: ${platform}`)
    }
}
