import { createCSSPlatform } from "./css.platform"
import { configFactory } from "../config"
import { PlatformConfig } from "style-dictionary/types"

export type Platform = "css" | "figma" | "flutter"

export function createPlatformConfig(
    platform: Platform,
    tier: string
): Record<string, PlatformConfig> {
    const platformConfig = configFactory.getPlatformConfig(platform)

    if (!platformConfig) {
        throw new Error(`Platform "${platform}" is not configured`)
    }

    if (!platformConfig.enabled) {
        throw new Error(`Platform "${platform}" is not enabled`)
    }

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
