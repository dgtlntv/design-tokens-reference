import { BREAKPOINTS, type BreakpointConfig } from "./breakpoints.config"
import { COLOR_MODES, type ColorModeConfig } from "./color-modes.config"
import {
    BUILD_CONFIG,
    DEV_BUILD_CONFIG,
    PROD_BUILD_CONFIG,
    TEST_BUILD_CONFIG,
    type BuildConfig,
} from "./build.config"
import {
    getEnvironmentConfig,
    type Environment,
    type EnvironmentConfig,
} from "./environment.config"
import { platformRegistry } from "./platforms"
import type { PlatformConfig } from "../types/platform.types"

export interface ComposedConfig {
    breakpoints: BreakpointConfig
    colorModes: ColorModeConfig
    build: BuildConfig
    platforms: Map<string, PlatformConfig>
    environment: EnvironmentConfig
}

export class ConfigFactory {
    private environment: Environment

    constructor(environment?: Environment) {
        this.environment = environment || getEnvironmentConfig().name
    }

    setEnvironment(env: Environment): void {
        this.environment = env
    }

    getBreakpoints(): BreakpointConfig {
        return BREAKPOINTS
    }

    getColorModes(): ColorModeConfig {
        return COLOR_MODES
    }

    getBuildConfig(): BuildConfig {
        const baseConfig = { ...BUILD_CONFIG }

        switch (this.environment) {
            case "development":
                return { ...baseConfig, ...DEV_BUILD_CONFIG }
            case "production":
                return { ...baseConfig, ...PROD_BUILD_CONFIG }
            case "test":
                return { ...baseConfig, ...TEST_BUILD_CONFIG }
            default:
                return baseConfig
        }
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
            environment: getEnvironmentConfig(),
        }
    }
}

// Default factory instance
export const configFactory = new ConfigFactory()

// Convenience function for getting config
export function getConfig(): ComposedConfig {
    return configFactory.compose()
}
