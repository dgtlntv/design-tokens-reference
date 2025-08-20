import StyleDictionary from "style-dictionary"
import { Config } from "style-dictionary/types"
import { CSS_PLATFORM_CONFIG, TOKEN_PATHS } from "./config"
import { registerFormatters } from "./formatters"
import { registerTransforms } from "./transforms"
import {
    generateStyleDictionaryConfigs,
    type TokenPaths,
} from "./utils/config-builder.util"
/**
 * Registers all custom Style Dictionary extensions.
 * Must be called before building tokens.
 */
function registerExtensions(): void {
    registerTransforms()
    registerFormatters()
}

// Get tier argument from command line
const tier = process.argv[2]
const validTiers = ["sites", "docs", "apps", "all"]

if (!tier || !validTiers.includes(tier)) {
    console.error(`Please specify a valid tier: ${validTiers.join(", ")}`)
    console.error(`Example: npm run build:css:sites`)
    process.exit(1)
}

// Filter token paths based on tier
function getTokenPathsForTier(tier: string): TokenPaths {
    if (tier === "all") {
        return TOKEN_PATHS
    }

    // Return only the specified tier
    return {
        [tier]: TOKEN_PATHS[tier],
    }
}

// Assemble the base configuration from platform configs
const baseConfig: Config = {
    usesDtcg: true,
    log: {
        verbosity: "verbose",
        errors: {
            brokenReferences: "console",
        },
    },
    platforms: {
        css: CSS_PLATFORM_CONFIG,
    },
}

async function buildTokens() {
    const buildTier = tier === "all" ? "all tiers" : `${tier} tier`
    console.log(`Starting token build process for ${buildTier}...\n`)

    registerExtensions()

    // Get token paths for the specified tier
    const tokenPaths = getTokenPathsForTier(tier)

    // Generate all configurations
    const configs = generateStyleDictionaryConfigs(tokenPaths, baseConfig)

    console.log(`Generated ${configs.length} configurations\n`)

    // Build function for a single configuration
    async function buildConfig(config: any) {
        // Get destinations for logging
        const platforms = Object.keys(config.platforms)
        const destinations = platforms.flatMap((p) =>
            config.platforms[p].files.map((f) => f.destination)
        )

        console.log(`Building: ${destinations.join(", ")}`)

        try {
            // Create StyleDictionary instance and build
            const sd = new StyleDictionary(config)
            await sd.cleanAllPlatforms()
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

    // Build all configurations in parallel
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
