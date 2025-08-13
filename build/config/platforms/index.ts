import type { PlatformConfig } from "../../types/platform.types"
import { CSS_PLATFORM_CONFIG } from "./css.config.ts"

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
    CSSPlatformOptions,
    PlatformConfig,
} from "../../types/platform.types"
