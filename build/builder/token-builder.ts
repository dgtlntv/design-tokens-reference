import StyleDictionary from "style-dictionary"
import type { Config } from "style-dictionary/types"
import { registerTransforms } from "../transforms"
import { registerFormatters } from "../formatters"
import { createPlatformConfig, type Platform } from "../platforms"
import { tierService } from "../utils/tier.util"
import { configFactory } from "../config"

export interface BuilderOptions {
    tier: string
    platform?: Platform
}

export class TokenBuilder {
    private config = configFactory
    constructor() {
        this.registerExtensions()
    }

    private registerExtensions(): void {
        registerTransforms()
        registerFormatters()
    }

    createConfig(options: BuilderOptions): Config {
        const { tier, platform = "css" } = options
        const { include, source } = tierService.getTokenPaths(tier)
        const buildConfig = this.config.getBuildConfig()

        return {
            include,
            source,
            log: {
                verbosity: buildConfig.logLevel,
            },
            preprocessors: [],
            usesDtcg: buildConfig.useDtcg,
            platforms: createPlatformConfig(platform, tier),
        }
    }

    async build(options: BuilderOptions): Promise<void> {
        const { tier, platform = "css" } = options
        const buildConfig = this.config.getBuildConfig()

        // Validate platform is enabled
        const platformConfig = this.config.getPlatformConfig(platform)
        if (!platformConfig?.enabled) {
            throw new Error(`Platform "${platform}" is not enabled`)
        }

        const config = this.createConfig(options)
        const sd = new StyleDictionary(config)

        try {
            await sd.buildAllPlatforms()
        } catch (error) {
            if (buildConfig.throwOnBuildError) {
                throw error
            }
            console.error(`Build error for ${tier}:`, error)
        }
    }

    async buildAll(): Promise<void> {
        const tiers = tierService.getAllTierNames()
        const buildConfig = this.config.getBuildConfig()

        if (buildConfig.parallelBuilds) {
            await Promise.all(tiers.map((tier) => this.build({ tier })))
        } else {
            for (const tier of tiers) {
                await this.build({ tier })
            }
        }
    }
}
