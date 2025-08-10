import type { TransformedToken, Dictionary } from "style-dictionary/types"
import type { FormatOptions } from "../../types/platform.types"
import { COLOR_MODES } from "../../config"
import {
    getTokenValue,
    stripModeFromName,
    getColorModeFromToken,
} from "../../utils/token-helpers"

interface ColorModeResult {
    rootCSS: string
    mediaQueryCSS: string
}

interface TokenGroups {
    light: TransformedToken[]
    dark: TransformedToken[]
    regular: TransformedToken[]
}

function categorizeColorTokens(tokens: TransformedToken[]): TokenGroups {
    const { modes } = COLOR_MODES
    const groups: TokenGroups = {
        light: [],
        dark: [],
        regular: [],
    }

    tokens.forEach((token) => {
        if (token.$type === "color") {
            const mode = getColorModeFromToken(token.name)

            if (mode === modes.light) {
                groups.light.push(token)
            } else if (mode === modes.dark) {
                groups.dark.push(token)
            } else {
                groups.regular.push(token)
            }
        }
    })

    return groups
}

function generateLightDarkFunctionCSS(
    tokens: TransformedToken[],
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: FormatOptions["outputReferences"]
): string {
    const { modes } = COLOR_MODES
    const { light, dark, regular } = categorizeColorTokens(tokens)

    let css = ""

    // Add regular color tokens
    regular.forEach((token) => {
        css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Create maps for easier lookup
    const lightTokenMap = new Map<string, TransformedToken>()
    const darkTokenMap = new Map<string, TransformedToken>()

    light.forEach((token) => {
        const strippedName = stripModeFromName(token.name, modes.light)
        lightTokenMap.set(strippedName, token)
    })

    dark.forEach((token) => {
        const strippedName = stripModeFromName(token.name, modes.dark)
        darkTokenMap.set(strippedName, token)
    })

    // Create light-dark() functions
    const processedTokens = new Set<string>()

    lightTokenMap.forEach((lightToken, strippedName) => {
        const darkToken = darkTokenMap.get(strippedName)

        if (darkToken) {
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
            css += `  --${strippedName}: ${getTokenValue(lightToken, dictionary, usesDtcg, outputReferences)};\n`
        }
        processedTokens.add(strippedName)
    })

    // Add dark tokens without light counterparts
    darkTokenMap.forEach((darkToken, strippedName) => {
        if (!processedTokens.has(strippedName)) {
            css += `  --${strippedName}: ${getTokenValue(darkToken, dictionary, usesDtcg, outputReferences)};\n`
        }
    })

    return css
}

function generateMediaQueryCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: FormatOptions["outputReferences"]
): ColorModeResult {
    const { modes } = COLOR_MODES
    const { light, dark, regular } = categorizeColorTokens(tokens)

    let rootCSS = ""
    let mediaQueryCSS = ""

    // Add regular color tokens
    regular.forEach((token) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Add light tokens to root
    light.forEach((token) => {
        const strippedName = stripModeFromName(token.name, modes.light)
        rootCSS += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Add dark tokens to media query
    if (dark.length > 0) {
        mediaQueryCSS += "@media (prefers-color-scheme: dark) {\n"
        mediaQueryCSS += `  ${selector} {\n`
        dark.forEach((token) => {
            const strippedName = stripModeFromName(token.name, modes.dark)
            mediaQueryCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }

    return { rootCSS, mediaQueryCSS }
}

function generateDataAttributeCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: FormatOptions["outputReferences"]
): ColorModeResult {
    const { modes, dataAttributeName = "data-theme" } = COLOR_MODES
    const { light, dark, regular } = categorizeColorTokens(tokens)

    let rootCSS = ""
    let mediaQueryCSS = "" // Reusing this for data attribute CSS

    // Add regular color tokens
    regular.forEach((token) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Add light tokens to root
    light.forEach((token) => {
        const strippedName = stripModeFromName(token.name, modes.light)
        rootCSS += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    // Add dark tokens with data attribute
    if (dark.length > 0) {
        mediaQueryCSS += `[${dataAttributeName}="dark"] {\n`
        dark.forEach((token) => {
            const strippedName = stripModeFromName(token.name, modes.dark)
            mediaQueryCSS += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
        })
        mediaQueryCSS += "}\n\n"
    }

    return { rootCSS, mediaQueryCSS }
}

export function generateColorModeCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: FormatOptions["outputReferences"]
): ColorModeResult {
    const { strategy } = COLOR_MODES

    switch (strategy) {
        case "media-query":
            return generateMediaQueryCSS(
                tokens,
                selector,
                dictionary,
                usesDtcg,
                outputReferences
            )

        case "data-attribute":
            return generateDataAttributeCSS(
                tokens,
                selector,
                dictionary,
                usesDtcg,
                outputReferences
            )

        case "light-dark-function":
        default:
            const rootCSS = generateLightDarkFunctionCSS(
                tokens,
                dictionary,
                usesDtcg,
                outputReferences
            )
            return { rootCSS, mediaQueryCSS: "" }
    }
}
