import StyleDictionary from "style-dictionary"
import type { Config } from "style-dictionary/types"
import { BUILD_CONFIG, getPlatform, TIERS_CONFIG } from "./config"
import { registerFormatters } from "./formatters"
import { createPlatformConfig } from "./platforms"
import { registerTransforms } from "./transforms"
import type { BuildOptions, Platform, ResolvedTokenPaths } from "./types"

/**
 * Registers all custom Style Dictionary extensions.
 * Must be called before building tokens.
 */
function registerExtensions(): void {
    registerTransforms()
    registerFormatters()
}

/**
 * Resolves include and source paths for a given tier.
 * @param tierName - Name of the tier to get paths for
 * @returns Object containing resolved include and source paths
 * @throws Error if tier is not found
 */
function getTokenPaths(tierName: string): ResolvedTokenPaths {
    const tier = TIERS_CONFIG[tierName]
    if (!tier) {
        throw new Error(`Tier "${tierName}" not found`)
    }

    return {
        include: tier.include,
        source: tier.source,
    }
}

/**
 * Resolves token paths for a mode-specific build.
 * @param tierName - Name of the tier to get paths for
 * @param categoryName - Name of the category (e.g., 'color', 'dimension')
 * @param modeName - Name of the mode (e.g., 'light', 'dark')
 * @returns Object containing resolved include and source paths for the mode
 * @throws Error if tier, category, or mode is not found
 */
function getModeTokenPaths(tierName: string, categoryName: string, modeName: string): ResolvedTokenPaths {
    const tier = TIERS_CONFIG[tierName]
    if (!tier) {
        throw new Error(`Tier "${tierName}" not found`)
    }

    const categoryModes = tier.modes[categoryName]
    if (!categoryModes) {
        throw new Error(`Category "${categoryName}" modes not found for tier "${tierName}"`)
    }

    const modeFilePath = categoryModes[modeName]
    if (!modeFilePath) {
        throw new Error(`Mode "${modeName}" not found for category "${categoryName}" in tier "${tierName}"`)
    }

    // Get base include paths (non-mode specific tokens)
    const include = tier.include

    // Add only primitive tokens and the specific mode file
    const primitiveSource = tier.source.filter(path => path.includes('/primitive/'))

    // For mode-specific builds, we need primitives for reference resolution, but they won't be output
    // because the platform configuration will filter them out
    const source = [...primitiveSource, modeFilePath]

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
 * Creates a Style Dictionary configuration object for a specific mode.
 * @param tier - The tier name
 * @param categoryName - The category name (e.g., 'color', 'dimension')
 * @param modeName - The mode name (e.g., 'light', 'dark')
 * @param platform - The target platform
 * @returns Style Dictionary configuration for the mode
 */
function createModeConfig(tier: string, categoryName: string, modeName: string, platform: Platform = "css"): Config {
    const { include, source } = getModeTokenPaths(tier, categoryName, modeName)
    const buildConfig = BUILD_CONFIG

    return {
        include,
        source,
        log: {
            verbosity: buildConfig.logLevel,
        },
        usesDtcg: buildConfig.useDtcg,
        preprocessors: buildConfig.preprocessors,
        platforms: createPlatformConfig(platform, tier, categoryName, true, `${tier}-${categoryName}-${modeName}`),
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
 * Builds design tokens for a specific mode.
 * @param tier - The tier name
 * @param categoryName - The category name (e.g., 'color', 'dimension')
 * @param modeName - The mode name (e.g., 'light', 'dark')
 * @param platform - The target platform
 * @throws Error if platform is not configured
 */
async function buildModeTokens(tier: string, categoryName: string, modeName: string, platform: Platform = "css"): Promise<void> {
    // Validate platform exists
    const platformConfig = getPlatform(platform)
    if (!platformConfig) {
        throw new Error(`Platform "${platform}" is not configured`)
    }

    const config = createModeConfig(tier, categoryName, modeName, platform)
    const sd = new StyleDictionary(config)

    await sd.buildAllPlatforms()
}

/**
 * Builds all modes for all categories in a tier.
 * @param tier - The tier name
 * @param platform - The target platform
 */
async function buildAllModes(tier: string, platform: Platform = "css"): Promise<void> {
    const tierConfig = TIERS_CONFIG[tier]
    if (!tierConfig) {
        throw new Error(`Tier "${tier}" not found`)
    }
    
    const modes = tierConfig.modes
    const buildPromises: Promise<void>[] = []

    for (const [categoryName, categoryModes] of Object.entries(modes)) {
        for (const modeName of Object.keys(categoryModes)) {
            buildPromises.push(buildModeTokens(tier, categoryName, modeName, platform))
        }
    }

    await Promise.all(buildPromises)
}

/**
 * Builds primitive tokens for a mode category.
 * @param tier - The tier name
 * @param categoryName - The category name (e.g., 'color', 'dimension')
 * @param platform - The target platform
 * @throws Error if platform is not configured
 */
async function buildPrimitiveTokens(tier: string, categoryName: string, platform: Platform = "css"): Promise<void> {
    // Validate platform exists
    const platformConfig = getPlatform(platform)
    if (!platformConfig) {
        throw new Error(`Platform "${platform}" is not configured`)
    }

    const tierConfig = TIERS_CONFIG[tier]
    if (!tierConfig) {
        throw new Error(`Tier "${tier}" not found`)
    }

    // Get base include paths
    const include = tierConfig.include

    // Get only primitive tokens for this tier
    const primitiveSource = tierConfig.source.filter(path => path.includes('/primitive/'))

    if (primitiveSource.length === 0) {
        console.warn(`⚠️ No primitive tokens found for tier ${tier}`)
        return
    }

    const buildConfig = BUILD_CONFIG
    const config: Config = {
        include,
        source: primitiveSource,
        log: {
            verbosity: buildConfig.logLevel,
        },
        usesDtcg: buildConfig.useDtcg,
        preprocessors: buildConfig.preprocessors,
        platforms: createPlatformConfig(platform, tier, categoryName, false, `${tier}-${categoryName}-primitive`),
    }

    const sd = new StyleDictionary(config)
    await sd.buildAllPlatforms()
}

/**
 * Builds tokens for a single category (non-mode specific).
 * @param tier - The tier name
 * @param category - The category name (e.g., 'typography', 'assets')
 * @param platform - The target platform
 * @throws Error if platform is not configured
 */
async function buildCategoryTokens(tier: string, category: string, platform: Platform = "css"): Promise<void> {
    // Validate platform exists
    const platformConfig = getPlatform(platform)
    if (!platformConfig) {
        throw new Error(`Platform "${platform}" is not configured`)
    }

    const tierConfig = TIERS_CONFIG[tier]
    if (!tierConfig) {
        throw new Error(`Tier "${tier}" not found`)
    }

    // Get base include paths
    const include = tierConfig.include

    // Get source paths filtered for this category
    const allSource = tierConfig.source

    // Include all source paths - let the platform filter handle token filtering
    const categorySource = allSource

    if (categorySource.length === 0) {
        console.warn(`⚠️ No tokens found for category ${category}`)
        return
    }

    const buildConfig = BUILD_CONFIG
    const config: Config = {
        include,
        source: categorySource,
        log: {
            verbosity: buildConfig.logLevel,
        },
        usesDtcg: buildConfig.useDtcg,
        preprocessors: buildConfig.preprocessors,
        platforms: createPlatformConfig(platform, tier, category, false, `${tier}-${category}`),
    }

    const sd = new StyleDictionary(config)
    await sd.buildAllPlatforms()
}

/**
 * Prints usage information for the build script.
 */
function printUsage(): void {
    const availableTiers = Object.keys(TIERS_CONFIG)
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

    if (!(tier in TIERS_CONFIG)) {
        printUsage()
        process.exit(1)
    }

    registerExtensions()

    console.log(`Building tokens for tier: ${tier}`)

    const startTime = Date.now()
    const buildPromises: Promise<void>[] = []

    try {
        const tierConfig = TIERS_CONFIG[tier]
        const modes = tierConfig.modes

        // 1. Build primitive files for categories that have modes
        for (const categoryName of Object.keys(modes)) {
            buildPromises.push(buildPrimitiveTokens(tier, categoryName))
        }

        // 2. Build mode-specific files for categories that have modes
        for (const [categoryName, categoryModes] of Object.entries(modes)) {
            for (const modeName of Object.keys(categoryModes)) {
                buildPromises.push(buildModeTokens(tier, categoryName, modeName))
            }
        }

        // 3. Build single files for non-mode categories
        const nonModeCategories = ['typography', 'assets', 'grid', 'motion', 'shadows']
        for (const category of nonModeCategories) {
            buildPromises.push(buildCategoryTokens(tier, category))
        }

        await Promise.all(buildPromises)

        const duration = Date.now() - startTime
        console.log(`✅ Built all ${tier} token files (${duration}ms)`)
    } catch (error) {
        const err = error as Error
        console.error(`❌ Failed to build ${tier} tokens:`, err.message)
        process.exit(1)
    }
}

// Main execution
main().catch((error: Error) => {
    console.error("❌ Build failed:", error)
    process.exit(1)
})
