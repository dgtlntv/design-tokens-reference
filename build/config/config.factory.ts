import { BREAKPOINTS, type BreakpointConfig } from "./breakpoints.config"
import { COLOR_MODES, type ColorModeConfig } from "./color-modes.config"
import { BUILD_CONFIG, type BuildConfig } from "./build.config"
import { platformRegistry } from "./platforms"
import type { PlatformConfig } from "../types/platform.types"

export interface ComposedConfig {
    breakpoints: BreakpointConfig
    colorModes: ColorModeConfig
    build: BuildConfig
    platforms: Map<string, PlatformConfig>
}

export class ConfigFactory {
    getBreakpoints(): BreakpointConfig {
        return BREAKPOINTS
    }

    getColorModes(): ColorModeConfig {
        return COLOR_MODES
    }

    getBuildConfig(): BuildConfig {
        return BUILD_CONFIG
    }

    getPlatformConfig(platformName: string): PlatformConfig | undefined {
        return platformRegistry.get(platformName)
    }

    getAllPlatforms(): Map<string, PlatformConfig> {
        return platformRegistry.getAll()
    }

    getEnabledPlatforms(): string[] {
        return platformRegistry.getEnabledPlatforms()
    }

    compose(): ComposedConfig {
        return {
            breakpoints: this.getBreakpoints(),
            colorModes: this.getColorModes(),
            build: this.getBuildConfig(),
            platforms: this.getAllPlatforms(),
        }
    }
}

// Default factory instance
export const configFactory = new ConfigFactory()

// Convenience function for getting config
export function getConfig(): ComposedConfig {
    return configFactory.compose()
}
