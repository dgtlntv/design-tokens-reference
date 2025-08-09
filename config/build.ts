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

// Helper function to get token value with reference support
function getTokenValue(
    token: any,
    dictionary: any,
    usesDtcg: boolean,
    outputReferences: any
): string {
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
        let value = JSON.stringify(usesDtcg ? token.$value : token.value)
        refs.forEach((ref: any) => {
            const refValue = JSON.stringify(usesDtcg ? ref.$value : ref.value)
            value = value.replace(refValue, `var(--${ref.name})`)
        })
        return value.replace(/"/g, "")
    }
    return usesDtcg ? token.$value : token.value
}

// Function to generate light-dark() CSS for color tokens
function generateLightDarkCSS(
    tokens: any[],
    dictionary: any,
    usesDtcg: boolean,
    outputReferences: any
): string {
    // Separate color tokens into light, dark, and regular tokens
    const lightTokens: any[] = []
    const darkTokens: any[] = []
    const regularTokens: any[] = []

    tokens.forEach((token: any) => {
        if (token.$type === "color") {
            if (token.name.includes("-light-")) {
                lightTokens.push(token)
            } else if (token.name.includes("-dark-")) {
                darkTokens.push(token)
            } else {
                regularTokens.push(token)
            }
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

    let css = ""

    // Add regular color tokens (non-light/dark)
    regularTokens.forEach((token: any) => {
        css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Create light-dark() functions for tokens that have both light and dark variants
    const processedTokens = new Set()

    lightTokens.forEach((token: any) => {
        const strippedName = stripModeFromName(token.name)
        if (!processedTokens.has(strippedName)) {
            const lightToken = lightTokenMap.get(strippedName)
            const darkToken = darkTokenMap.get(strippedName)

            if (lightToken && darkToken) {
                const lightValue = getTokenValue(
                    lightToken,
                    dictionary,
                    usesDtcg,
                    outputReferences
                )
                const darkValue = getTokenValue(
                    darkToken,
                    dictionary,
                    usesDtcg,
                    outputReferences
                )
                css += `  --${strippedName}: light-dark(${lightValue}, ${darkValue});\n`
            } else {
                // Only light variant exists
                css += `  --${strippedName}: ${getTokenValue(lightToken, dictionary, usesDtcg, outputReferences)};\n`
            }
            processedTokens.add(strippedName)
        }
    })

    // Add dark tokens that don't have light counterparts
    darkTokens.forEach((token: any) => {
        const strippedName = stripModeFromName(token.name)
        if (!processedTokens.has(strippedName)) {
            css += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
            processedTokens.add(strippedName)
        }
    })

    return css
}

// Function to generate media query CSS for color tokens
function generateMediaQueryCSS(
    tokens: any[],
    selector: string,
    dictionary: any,
    usesDtcg: boolean,
    outputReferences: any
): { rootCSS: string; mediaQueryCSS: string } {
    // Separate color tokens into light, dark, and regular tokens
    const lightTokens: any[] = []
    const darkTokens: any[] = []
    const regularTokens: any[] = []

    tokens.forEach((token: any) => {
        if (token.$type === "color") {
            if (token.name.includes("-light-")) {
                lightTokens.push(token)
            } else if (token.name.includes("-dark-")) {
                darkTokens.push(token)
            } else {
                regularTokens.push(token)
            }
        }
    })

    // Helper function to strip light/dark from token names
    const stripModeFromName = (name: string): string => {
        return name.replace(/-light-/, "-").replace(/-dark-/, "-")
    }

    let rootCSS = ""
    let mediaQueryCSS = ""

    // Add regular color tokens (non-light/dark)
    regularTokens.forEach((token: any) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Add light tokens to root
    lightTokens.forEach((token: any) => {
        const strippedName = stripModeFromName(token.name)
        rootCSS += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Add dark tokens to media query
    if (darkTokens.length > 0) {
        mediaQueryCSS += "@media (prefers-color-scheme: dark) {\n"
        mediaQueryCSS += `  ${selector} {\n`
        darkTokens.forEach((token: any) => {
            const strippedName = stripModeFromName(token.name)
            mediaQueryCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }

    return { rootCSS, mediaQueryCSS }
}

// Function to handle color tokens - switches between light-dark() and media query approaches
function generateColorModeCSS(
    tokens: any[],
    selector: string,
    dictionary: any,
    usesDtcg: boolean,
    outputReferences: any,
    useMediaQuery: boolean = false
): { rootCSS: string; mediaQueryCSS: string } {
    if (useMediaQuery) {
        return generateMediaQueryCSS(
            tokens,
            selector,
            dictionary,
            usesDtcg,
            outputReferences
        )
    } else {
        const rootCSS = generateLightDarkCSS(
            tokens,
            dictionary,
            usesDtcg,
            outputReferences
        )
        return { rootCSS, mediaQueryCSS: "" }
    }
}

// Function to handle dimension tokens with breakpoint modes
function generateDimensionBreakpointCSS(
    tokens: any[],
    selector: string,
    dictionary: any,
    usesDtcg: boolean,
    outputReferences: any
): { rootCSS: string; mediaQueriesCSS: string } {
    // Breakpoint definitions
    const breakpoints = {
        small: "460px",
        medium: "620px",
        large: "1036px",
        "x-large": "1681px",
    }

    // Filter only dimension tokens and separate by size modes
    const dimensionTokensBySize: { [key: string]: any[] } = {
        small: [],
        medium: [],
        large: [],
        "x-large": [],
    }
    const regularDimensionTokens: any[] = []

    tokens.forEach((token: any) => {
        if (token.$type === "dimension") {
            let foundSize = false
            if (token.name.includes("-x-large-size-")) {
                dimensionTokensBySize["x-large"].push(token)
                foundSize = true
            } else if (token.name.includes("-large-size-")) {
                dimensionTokensBySize["large"].push(token)
                foundSize = true
            } else if (token.name.includes("-medium-size-")) {
                dimensionTokensBySize["medium"].push(token)
                foundSize = true
            } else if (token.name.includes("-small-size-")) {
                dimensionTokensBySize["small"].push(token)
                foundSize = true
            }

            if (!foundSize) {
                regularDimensionTokens.push(token)
            }
        }
    })

    // Helper function to strip size from token names
    const stripSizeFromName = (name: string): string => {
        return name
            .replace(/-x-large-size-/, "-size-")
            .replace(/-large-size-/, "-size-")
            .replace(/-medium-size-/, "-size-")
            .replace(/-small-size-/, "-size-")
    }

    // Generate root CSS for regular dimension tokens
    let rootCSS = ""
    regularDimensionTokens.forEach((token: any) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Generate media queries CSS
    let mediaQueriesCSS = ""
    Object.entries(breakpoints).forEach(([sizeName, breakpointValue]) => {
        const tokensForSize = dimensionTokensBySize[sizeName]
        if (tokensForSize.length > 0) {
            mediaQueriesCSS += `@media (min-width: ${breakpointValue}) {\n`
            mediaQueriesCSS += `  ${selector} {\n`
            tokensForSize.forEach((token: any) => {
                const strippedName = stripSizeFromName(token.name)
                mediaQueriesCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
            })
            mediaQueriesCSS += "  }\n"
            mediaQueriesCSS += "}\n\n"
        }
    })

    return { rootCSS, mediaQueriesCSS }
}

// Combined formatter
StyleDictionary.registerFormat({
    name: "css/variables-combined",
    format: function ({ dictionary, options = {}, file }) {
        const {
            selector = ":root",
            outputReferences,
            outputReferenceFallbacks,
            usesDtcg,
            formatting,
            useMediaQuery = false, // Option to switch between light-dark() and media query
        } = options

        // Generate CSS
        let css =
            "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

        // Root selector
        css += `${selector} {\n`

        // Add non-color, non-dimension tokens
        dictionary.allTokens.forEach((token: any) => {
            if (token.$type !== "color" && token.$type !== "dimension") {
                css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
            }
        })

        // Add color tokens
        const { rootCSS: colorRootCSS, mediaQueryCSS: colorMediaQueryCSS } =
            generateColorModeCSS(
                dictionary.allTokens,
                selector,
                dictionary,
                usesDtcg,
                outputReferences,
                useMediaQuery
            )
        css += colorRootCSS

        // Add dimension tokens
        const {
            rootCSS: dimensionRootCSS,
            mediaQueriesCSS: dimensionMediaQueriesCSS,
        } = generateDimensionBreakpointCSS(
            dictionary.allTokens,
            selector,
            dictionary,
            usesDtcg,
            outputReferences
        )
        css += dimensionRootCSS

        css += "}\n\n"

        // Add media queries
        css += colorMediaQueryCSS
        css += dimensionMediaQueriesCSS

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
                        format: "css/variables-combined",
                        options: {
                            selector: ":root",
                            outputReferences: true,
                            useMediaQuery: true, // Set to true to use media queries instead of light-dark()
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
