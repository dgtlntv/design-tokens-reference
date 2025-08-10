import StyleDictionary from "style-dictionary"
import type { Config } from "style-dictionary/types"
import { registerTransforms } from "./transforms"
import { registerFormatters } from "./formatters"
import { registerPreprocessors } from "./preprocessors"
import { createPlatformConfig, type Platform } from "./platforms"
import { BUILD_CONFIG, getPlatform, TIERS_CONFIG } from "./config"
import type { ResolvedTokenPaths } from "./types/shared.types"

interface BuildOptions {
    tier: string
    platform?: Platform
}

function registerExtensions(): void {
    registerPreprocessors()
    registerTransforms()
    registerFormatters()
}

function resolveSourcePath(sourceRef: string): string | null {
    const [tier, type] = sourceRef.split(".")
    return TIERS_CONFIG.basePaths[tier]?.[type] || null
}

function getTokenPaths(tierName: string): ResolvedTokenPaths {
    const tier = TIERS_CONFIG.tiers[tierName]
    if (!tier) {
        throw new Error(`Tier "${tierName}" not found`)
    }

    const include = tier.include
        .map((ref) => resolveSourcePath(ref))
        .filter((path): path is string => path !== null)

    const source = tier.source
        .map((ref) => resolveSourcePath(ref))
        .filter((path): path is string => path !== null)

    return { include, source }
}

function createConfig(options: BuildOptions): Config {
    const { tier, platform = "css" } = options
    const { include, source } = getTokenPaths(tier)
    const buildConfig = BUILD_CONFIG

    return {
        include,
        source,
        log: {
            verbosity: buildConfig.logLevel,
        },
        usesDtcg: buildConfig.useDtcg,
        preprocessors: ["extensions-delegate"],
        platforms: createPlatformConfig(platform, tier),
    }
}

async function buildTokens(options: BuildOptions): Promise<void> {
    const { platform = "css" } = options

    // Validate platform exists
    const platformConfig = getPlatform(platform)
    if (!platformConfig) {
        throw new Error(`Platform "${platform}" is not configured`)
    }

    const config = createConfig(options)
    const sd = new StyleDictionary(config)

    await sd.buildAllPlatforms()
}

function printUsage(): void {
    const availableTiers = Object.keys(TIERS_CONFIG.tiers)
    console.log("Usage: tsx build/build.ts <tier>")
    console.log(`Available tiers: ${availableTiers.join(", ")}`)
    console.log("\nEnvironment variables:")
    console.log("  NODE_ENV=development|production|test")
}

async function run(): Promise<void> {
    const tier = process.argv[2]

    if (!tier) {
        printUsage()
        process.exit(1)
    }

    if (!(tier in TIERS_CONFIG.tiers)) {
        printUsage()
        process.exit(1)
    }

    registerExtensions()

    const tierConfig = TIERS_CONFIG.tiers[tier]
    console.log(`Building tokens for tier: ${tier}`)
    console.log(`  Description: ${tierConfig.description}`)

    const startTime = Date.now()

    try {
        await buildTokens({ tier })
        const duration = Date.now() - startTime
        console.log(`✅ Built ${tier}.css (${duration}ms)`)
    } catch (error) {
        const err = error as Error
        console.error(`❌ Failed to build ${tier}.css:`, err.message)
        process.exit(1)
    }
}

// Main execution
if (require.main === module) {
    run().catch((error: Error) => {
        console.error("❌ Build failed:", error)
        process.exit(1)
    })
}

export { buildTokens, createConfig }