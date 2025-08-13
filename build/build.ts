import StyleDictionary from "style-dictionary"
import type { Config } from "style-dictionary/types"
import { BUILD_CONFIG, getPlatform, TIERS_CONFIG } from "./config"
import { registerFormatters } from "./formatters"
import { createPlatformConfig, type Platform } from "./platforms"
import { registerPreprocessors } from "./preprocessors"
import { registerTransforms } from "./transforms"
import type { ResolvedTokenPaths } from "./types/shared.types"

/**
 * Options for building design tokens.
 */
interface BuildOptions {
    /** The tier name to build (e.g., "primitive", "semantic") */
    tier: string
    /** The target platform (defaults to "css") */
    platform?: Platform
}

/**
 * Registers all custom Style Dictionary extensions.
 * Must be called before building tokens.
 */
function registerExtensions(): void {
    registerPreprocessors()
    registerTransforms()
    registerFormatters()
}

/**
 * Resolves a source reference to an absolute file path.
 * @param sourceRef - Reference in format "tier.type" (e.g., "primitive.color")
 * @returns Resolved file path or null if not found
 */
function resolveSourcePath(sourceRef: string): string | null {
    const [tier, type] = sourceRef.split(".")
    return TIERS_CONFIG.basePaths[tier]?.[type] || null
}

/**
 * Resolves include and source paths for a given tier.
 * @param tierName - Name of the tier to get paths for
 * @returns Object containing resolved include and source paths
 * @throws Error if tier is not found
 */
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

/**
 * Creates a Style Dictionary configuration object.
 * @param options - Build options containing tier and platform
 * @returns Style Dictionary configuration
 */
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
        preprocessors: buildConfig.preprocessors,
        platforms: createPlatformConfig(platform, tier),
    }
}

/**
 * Builds design tokens for the specified options.
 * @param options - Build options containing tier and platform
 * @throws Error if platform is not configured
 */
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

/**
 * Prints usage information for the build script.
 */
function printUsage(): void {
    const availableTiers = Object.keys(TIERS_CONFIG.tiers)
    console.log("Usage: npm run build:<platform>:<tier>")
    console.log(`Available tiers: ${availableTiers.join(", ")}`)
}

/**
 * Main entry point for the build script.
 * Parses command line arguments and initiates the token build process.
 */
async function main(): Promise<void> {
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

    console.log(`Building tokens for tier: ${tier}`)

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
main().catch((error: Error) => {
    console.error("❌ Build failed:", error)
    process.exit(1)
})
