import type { PlatformConfig } from "../../types/platform.types"
import { CSS_PLATFORM_CONFIG } from "./css.config.ts"

/**
 * Registry of all available platform configurations.
 * Currently includes CSS platform with future extensibility for other platforms.
 */
export const PLATFORMS = {
    css: CSS_PLATFORM_CONFIG,
} as const

/**
 * Retrieves a platform configuration by name.
 * 
 * @param name - Name of the platform to retrieve ('css', etc.)
 * @returns Platform configuration if found, undefined otherwise
 * 
 * @example
 * ```typescript
 * const cssConfig = getPlatform('css');
 * if (cssConfig) {
 *   console.log(cssConfig.prefix); // 'canonical'
 * }
 * ```
 */
export const getPlatform = (name: string): PlatformConfig | undefined => {
    return PLATFORMS[name as keyof typeof PLATFORMS]
}

/**
 * Retrieves all available platform configurations.
 * 
 * @returns Record of all platform configurations keyed by platform name
 * 
 * @example
 * ```typescript
 * const allPlatforms = getAllPlatforms();
 * Object.keys(allPlatforms).forEach(platformName => {
 *   console.log(`Platform: ${platformName}`);
 * });
 * ```
 */
export const getAllPlatforms = (): Record<string, PlatformConfig> => {
    return PLATFORMS
}

/**
 * Type representing all available platform names.
 * Automatically derived from the PLATFORMS constant.
 */
export type Platform = keyof typeof PLATFORMS

export type {
    CSSPlatformOptions,
    PlatformConfig,
} from "../../types/platform.types"
