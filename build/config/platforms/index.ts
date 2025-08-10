import { CSS_PLATFORM_CONFIG } from "./css.config.ts"
import type { PlatformConfig } from "../../types/platform.types"

export const PLATFORMS = {
    css: CSS_PLATFORM_CONFIG,
} as const

export const getPlatform = (name: string): PlatformConfig | undefined => {
    return PLATFORMS[name as keyof typeof PLATFORMS]
}

export const getAllPlatforms = (): Record<string, PlatformConfig> => {
    return PLATFORMS
}

export type Platform = keyof typeof PLATFORMS

export type {
    PlatformConfig,
    CSSPlatformOptions,
} from "../../types/platform.types"
