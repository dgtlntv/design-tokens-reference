import StyleDictionary from "style-dictionary"
import type { Config } from "style-dictionary/types"
import { getAllTierNames, getTokenPathsForTier } from "./tiers.utils.ts"

// Register custom value transform to handle W3C DTWG dimension format
StyleDictionary.registerTransform({
    name: "dimension/w3c-css",
    type: "value",
    filter: (token: any) => {
        // Check if token is a dimension type AND has the W3C structure
        /** const isDimension =
            token.$type === "dimension" ||
            token.type === "dimension" ||
            token.original?.$type === "dimension"
        */
        const hasUnitStructure =
            token.original &&
            "value" in token.original &&
            "unit" in token.original

        return /** isDimension && */ hasUnitStructure
    },
    transform: (token: any) => {
        // Concatenate the value and unit from the original object
        return `${token.original.value}${token.original.unit}`
    },
})

/**
// Register custom value transform to handle W3C DTCG color format
StyleDictionary.registerTransform({
    name: "color/w3c-css",
    type: "value",
    filter: (token: any) => {
        // Check if token is a color type AND has the W3C DTCG structure
        const isColor =
            token.$type === "color" ||
            token.type === "color" ||
            token.original?.$type === "color"

        const hasColorSpaceStructure =
            token.original &&
            typeof token.original === "object" &&
            "colorSpace" in token.original &&
            "components" in token.original

        return isColor && hasColorSpaceStructure
    },
    transform: (token: any) => {
        const { colorSpace, components, alpha = 1 } = token.original

        if (colorSpace === "oklch") {
            const [l, c, h] = components
            return `oklch(${l} ${c} ${h}${alpha !== 1 ? ` / ${alpha}` : ""})`
        }

        if (colorSpace === "srgb") {
            const [r, g, b] = components.map((c: number) =>
                Math.round(c * 255)
            )
            return alpha !== 1
                ? `rgba(${r}, ${g}, ${b}, ${alpha})`
                : `rgb(${r}, ${g}, ${b})`
        }

        // Fallback for unsupported color spaces
        console.warn(`Unsupported color space: ${colorSpace}`)
        return token.original
    },
})

 */

interface BuildResult {
    tier: string
    success: boolean
    error?: Error
}

function createConfig(tier: string): Config {
    const { include, source } = getTokenPathsForTier(tier)
    return {
        include,
        source,
        log: {
            verbosity: "verbose",
        },
        usesDtcg: true,
        platforms: {
            css: {
                prefix: `canonical-${tier}`,
                buildPath: "dist/css/",
                transforms: ["dimension/w3c-css"],
                files: [
                    {
                        destination: `${tier}.css`,
                        format: "css/variables",
                        options: {
                            selector: ":root",
                        },
                    },
                ],
            },
        },
    }
}

async function buildTokens(): Promise<void> {
    const tier: string = process.argv[2]
    const availableTiers: string[] = getAllTierNames()

    if (tier === "all") {
        console.log("Building tokens for all tiers...")
        const results: BuildResult[] = await Promise.all(
            availableTiers.map(
                async (tierName: string): Promise<BuildResult> => {
                    console.log(`Building tokens for tier: ${tierName}`)
                    try {
                        const sd = new StyleDictionary(createConfig(tierName))
                        await sd.buildAllPlatforms()
                        console.log(`✅ Built ${tierName}.css`)
                        return { tier: tierName, success: true }
                    } catch (error) {
                        console.error(
                            `❌ Failed to build ${tierName}.css:`,
                            (error as Error).message
                        )
                        return {
                            tier: tierName,
                            success: false,
                            error: error as Error,
                        }
                    }
                }
            )
        )

        const failed: BuildResult[] = results.filter(
            (r: BuildResult) => !r.success
        )
        if (failed.length > 0) {
            console.error(`❌ ${failed.length} tier(s) failed to build:`)
            failed.forEach((f: BuildResult) =>
                console.error(`  - ${f.tier}: ${f.error?.message}`)
            )
            process.exit(1)
        } else {
            console.log("🎉 All tiers built successfully!")
        }
    } else if (availableTiers.includes(tier)) {
        console.log(`Building tokens for tier: ${tier}`)
        try {
            const sd = new StyleDictionary(createConfig(tier))
            await sd.buildAllPlatforms()
            console.log(`✅ Built ${tier}.css`)
        } catch (error) {
            console.error(
                `❌ Failed to build ${tier}.css:`,
                (error as Error).message
            )
            process.exit(1)
        }
    } else {
        console.log("Usage: node config/css.config.js <tier|all>")
        console.log(`Available tiers: ${availableTiers.join(", ")}, all`)
        process.exit(1)
    }
}

buildTokens().catch((error: Error) => {
    console.error("❌ Build failed:", error)
    process.exit(1)
})
