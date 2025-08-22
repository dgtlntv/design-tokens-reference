import StyleDictionary from "style-dictionary"
import type { Config } from "style-dictionary/types"
import { CSS_PLATFORM_CONFIG, getTokenPathsForTier } from "./config"
import { FIGMA_PLATFORM_CONFIG } from "./config/figma.config"
import { registerFormatters } from "./formatters"
import { registerTransforms } from "./transforms"
import { registerActions } from "./actions"
import type { ExtendedConfig, ExtendedPlatformConfig } from "./types"
import { generateStyleDictionaryConfigs } from "./utils/config-builder.util"

/**
 * Registers all custom Style Dictionary extensions.
 * Must be called before building tokens.
 */
function registerExtensions(): void {
    registerTransforms()
    registerFormatters()
    registerActions()
}

// Get platform and tier arguments from command line
const platform = process.argv[2]
const tier = process.argv[3]
const validPlatforms = ["css", "figma", "all"]
const validTiers = ["sites", "docs", "apps", "all"]

if (!platform || !validPlatforms.includes(platform)) {
    console.error(`Please specify a valid platform: ${validPlatforms.join(", ")}`)
    console.error(`Example: npm run build:css:sites`)
    process.exit(1)
}

if (!tier || !validTiers.includes(tier)) {
    console.error(`Please specify a valid tier: ${validTiers.join(", ")}`)
    console.error(`Example: npm run build:css:sites`)
    process.exit(1)
}

// Assemble the base configuration from platform configs
const getPlatformsConfig = (platform: string): Record<string, ExtendedPlatformConfig> => {
    switch (platform) {
        case "css":
            return { css: CSS_PLATFORM_CONFIG }
        case "figma":
            return { figma: FIGMA_PLATFORM_CONFIG }
        case "all":
        default:
            return {
                css: CSS_PLATFORM_CONFIG,
                figma: FIGMA_PLATFORM_CONFIG,
            }
    }
}

const baseConfig: ExtendedConfig = {
    usesDtcg: true,
    log: {
        verbosity: "silent",
    },
    platforms: getPlatformsConfig(platform),
}

async function buildTokens() {
    const buildTier = tier === "all" ? "all tiers" : `${tier} tier`
    const buildPlatform = platform === "all" ? "all platforms" : `${platform} platform`
    console.log(`Starting token build process for ${buildTier} on ${buildPlatform}...\n`)

    registerExtensions()

    // Get token paths for the specified tier
    const tokenPaths = getTokenPathsForTier(tier)

    // Generate all configurations
    const configs = generateStyleDictionaryConfigs(tokenPaths, baseConfig)

    console.log(`Generated ${configs.length} configurations\n`)

    // Clean function for a single configuration
    async function cleanConfig(config: Config) {
        const sd = new StyleDictionary(config)
        await sd.cleanAllPlatforms()
    }

    // Build function for a single configuration
    async function buildConfig(config: Config) {
        // Get destinations for logging
        const platforms = Object.keys(config.platforms || {})
        const destinations = platforms.flatMap(
            (p) =>
                config.platforms![p].files?.map((f) => f.destination || "") ||
                []
        )

        console.log(`Building: ${destinations.join(", ")}`)

        try {
            // Create StyleDictionary instance and build
            const sd = new StyleDictionary(config)
            await sd.buildAllPlatforms()

            console.log(`✓ Built successfully: ${destinations.join(", ")}`)
            return { success: true, destinations }
        } catch (error) {
            console.error(
                `✗ Build failed for ${destinations.join(", ")}:`,
                error
            )
            return { success: false, destinations, error }
        }
    }

    // Clean all configurations first
    await Promise.all(configs.map(cleanConfig))

    // Then build all configurations in parallel
    const results = await Promise.all(configs.map(buildConfig))

    // Check if any builds failed
    const failures = results.filter((r) => !r.success)

    if (failures.length > 0) {
        console.error(`\n${failures.length} build(s) failed`)
        process.exit(1)
    }

    console.log("\nToken build completed successfully!")
}

// Run the build
buildTokens().catch((error) => {
    console.error("Build process failed:", error)
    process.exit(1)
})
