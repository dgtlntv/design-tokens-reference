import StyleDictionary from "style-dictionary"
import type { Config } from "style-dictionary/types"
import {
    formattedVariables,
    usesReferences,
    getReferences,
} from "style-dictionary/utils"
import { getAllTierNames, getTokenPathsForTier } from "./tiers.utils.ts"

StyleDictionary.registerTransform({
    name: "dimension/w3c-css",
    type: "value",
    filter: (token: any) => {
        return (
            token.$type === "dimension" &&
            token.$value &&
            token.$value !== null &&
            typeof token.$value === "object" &&
            "value" in token.$value &&
            "unit" in token.$value
        )
    },
    transform: (token: any) => {
        return `${token.$value.value}${token.$value.unit}`
    },
})

StyleDictionary.registerTransform({
    name: "color/w3c-css",
    type: "value",
    filter: (token: any) => {
        return (
            token.$type === "color" &&
            token.$value &&
            token.$value !== null &&
            typeof token.$value === "object" &&
            "colorSpace" in token.$value &&
            "components" in token.$value
        )
    },
    transform: (token: any) => {
        const { colorSpace, components, alpha = 1 } = token.$value
        const alphaString = alpha !== 1 ? ` / ${alpha}` : ""

        switch (colorSpace) {
            case "srgb": {
                const [r, g, b] = components.map((c: number | string) =>
                    c === "none" ? "none" : Math.round((c as number) * 255)
                )
                return alpha !== 1
                    ? `rgba(${r}, ${g}, ${b}, ${alpha})`
                    : `rgb(${r}, ${g}, ${b})`
            }

            case "srgb-linear": {
                const [r, g, b] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `color(srgb-linear ${r} ${g} ${b}${alphaString})`
            }

            case "hsl": {
                const [h, s, l] = components.map(
                    (c: number | string, index: number) => {
                        if (c === "none") return "none"
                        return index === 0 ? c : `${c}%`
                    }
                )
                return `hsl(${h} ${s} ${l}${alphaString})`
            }

            case "hwb": {
                const [h, w, b] = components.map(
                    (c: number | string, index: number) => {
                        if (c === "none") return "none"
                        return index === 0 ? c : `${c}%`
                    }
                )
                return `hwb(${h} ${w} ${b}${alphaString})`
            }

            case "lab": {
                const [l, a, b] = components.map(
                    (c: number | string, index: number) => {
                        if (c === "none") return "none"
                        return index === 0 ? `${c}%` : c
                    }
                )
                return `lab(${l} ${a} ${b}${alphaString})`
            }

            case "lch": {
                const [l, c, h] = components.map(
                    (comp: number | string, index: number) => {
                        if (comp === "none") return "none"
                        return index === 0 ? `${comp}%` : comp
                    }
                )
                return `lch(${l} ${c} ${h}${alphaString})`
            }

            case "oklab": {
                const [l, a, b] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `oklab(${l} ${a} ${b}${alphaString})`
            }

            case "oklch": {
                const [l, c, h] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `oklch(${l} ${c} ${h}${alphaString})`
            }

            case "display-p3": {
                const [r, g, b] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `color(display-p3 ${r} ${g} ${b}${alphaString})`
            }

            case "a98-rgb": {
                const [r, g, b] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `color(a98-rgb ${r} ${g} ${b}${alphaString})`
            }

            case "prophoto-rgb": {
                const [r, g, b] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `color(prophoto-rgb ${r} ${g} ${b}${alphaString})`
            }

            case "rec2020": {
                const [r, g, b] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `color(rec2020 ${r} ${g} ${b}${alphaString})`
            }

            case "xyz-d65": {
                const [x, y, z] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `color(xyz-d65 ${x} ${y} ${z}${alphaString})`
            }

            case "xyz-d50": {
                const [x, y, z] = components.map((c: number | string) =>
                    c === "none" ? "none" : c
                )
                return `color(xyz-d50 ${x} ${y} ${z}${alphaString})`
            }

            default:
                console.warn(`Unsupported color space: ${colorSpace}`)
                return token.$value
        }
    },
})

StyleDictionary.registerFormat({
    name: "css/variables-with-dark-mode",
    format: function ({ dictionary, options = {}, file }) {
        const {
            selector = ":root",
            outputReferences,
            outputReferenceFallbacks,
            usesDtcg,
            formatting,
        } = options

        // Separate tokens into light, dark, and regular tokens
        const lightTokens: any[] = []
        const darkTokens: any[] = []
        const regularTokens: any[] = []

        dictionary.allTokens.forEach((token: any) => {
            if (token.name.includes("-light-")) {
                lightTokens.push(token)
            } else if (token.name.includes("-dark-")) {
                darkTokens.push(token)
            } else {
                regularTokens.push(token)
            }
        })

        // Helper function to strip light/dark from token names
        const stripModeFromName = (name: string): string => {
            return name.replace(/-light-/, "-").replace(/-dark-/, "-")
        }

        // Create modified dictionaries for each mode
        const lightDictionary = {
            ...dictionary,
            allTokens: [
                ...regularTokens,
                ...lightTokens.map((token) => ({
                    ...token,
                    name: stripModeFromName(token.name),
                })),
            ],
        }

        const darkDictionary = {
            ...dictionary,
            allTokens: darkTokens.map((token) => ({
                ...token,
                name: stripModeFromName(token.name),
            })),
        }

        // Generate CSS
        let css =
            "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

        // Root selector with regular tokens and light mode tokens
        css += `${selector} {\n`
        css += formattedVariables({
            format: "css",
            dictionary: lightDictionary,
            outputReferences,
            outputReferenceFallbacks,
            formatting: {
                ...formatting,
                indentation: "  ",
            },
            usesDtcg,
        })
        css += "}\n\n"

        // Dark mode media query with dark tokens
        if (darkTokens.length > 0) {
            css += "@media (prefers-color-scheme: dark) {\n"
            css += `  ${selector} {\n`
            css += formattedVariables({
                format: "css",
                dictionary: darkDictionary,
                outputReferences,
                outputReferenceFallbacks,
                formatting: {
                    ...formatting,
                    indentation: "    ",
                },
                usesDtcg,
            })
            css += "  }\n"
            css += "}\n"
        }

        return css
    },
})

StyleDictionary.registerFormat({
    name: "css/variables-with-light-dark",
    format: function ({ dictionary, options = {}, file }) {
        const {
            selector = ":root",
            outputReferences,
            outputReferenceFallbacks,
            usesDtcg,
            formatting,
        } = options

        // Helper function to get token value with reference support
        const getTokenValue = (token: any): string => {
            const originalValue = usesDtcg
                ? token.original.$value
                : token.original.value
            const shouldOutputRef =
                usesReferences(originalValue) &&
                (typeof outputReferences === "function"
                    ? outputReferences(token, { dictionary, usesDtcg })
                    : outputReferences)

            if (shouldOutputRef) {
                const refs = getReferences(originalValue, dictionary.tokens, {
                    usesDtcg,
                })
                let value = JSON.stringify(
                    usesDtcg ? token.$value : token.value
                )
                refs.forEach((ref: any) => {
                    const refValue = JSON.stringify(
                        usesDtcg ? ref.$value : ref.value
                    )
                    value = value.replace(refValue, `var(--${ref.name})`)
                })
                return value.replace(/"/g, "")
            }
            return usesDtcg ? token.$value : token.value
        }

        // Separate tokens into light, dark, and regular tokens
        const lightTokens: any[] = []
        const darkTokens: any[] = []
        const regularTokens: any[] = []

        dictionary.allTokens.forEach((token: any) => {
            if (token.name.includes("-light-")) {
                lightTokens.push(token)
            } else if (token.name.includes("-dark-")) {
                darkTokens.push(token)
            } else {
                regularTokens.push(token)
            }
        })

        // Helper function to strip light/dark from token names
        const stripModeFromName = (name: string): string => {
            return name.replace(/-light-/, "-").replace(/-dark-/, "-")
        }

        // Create maps for easier lookup
        const lightTokenMap = new Map()
        const darkTokenMap = new Map()

        lightTokens.forEach((token: any) => {
            const strippedName = stripModeFromName(token.name)
            lightTokenMap.set(strippedName, token)
        })

        darkTokens.forEach((token: any) => {
            const strippedName = stripModeFromName(token.name)
            darkTokenMap.set(strippedName, token)
        })

        // Generate CSS
        let css =
            "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

        css += `${selector} {\n`

        // Add regular tokens (non-light/dark)
        regularTokens.forEach((token: any) => {
            css += `  --${token.name}: ${getTokenValue(token)};\n`
        })

        // Create light-dark() functions for tokens that have both light and dark variants
        const processedTokens = new Set()

        lightTokens.forEach((token: any) => {
            const strippedName = stripModeFromName(token.name)
            if (!processedTokens.has(strippedName)) {
                const lightToken = lightTokenMap.get(strippedName)
                const darkToken = darkTokenMap.get(strippedName)

                if (lightToken && darkToken) {
                    const lightValue = getTokenValue(lightToken)
                    const darkValue = getTokenValue(darkToken)
                    css += `  --${strippedName}: light-dark(${lightValue}, ${darkValue});\n`
                } else {
                    // Only light variant exists
                    css += `  --${strippedName}: ${getTokenValue(lightToken)};\n`
                }
                processedTokens.add(strippedName)
            }
        })

        // Add dark tokens that don't have light counterparts
        darkTokens.forEach((token: any) => {
            const strippedName = stripModeFromName(token.name)
            if (!processedTokens.has(strippedName)) {
                css += `  --${strippedName}: ${getTokenValue(token)};\n`
                processedTokens.add(strippedName)
            }
        })

        css += "}\n"

        return css
    },
})

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
        preprocessors: [],
        usesDtcg: true,
        platforms: {
            css: {
                prefix: `canonical-${tier}`,
                buildPath: "dist/css/",
                transforms: [
                    "name/kebab",
                    "dimension/w3c-css",
                    "color/w3c-css",
                    "fontFamily/css",
                ],
                files: [
                    {
                        destination: `${tier}.css`,
                        format: "css/variables-with-light-dark",
                        options: {
                            selector: ":root",
                            outputReferences: true,
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
