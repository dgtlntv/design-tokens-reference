import type {
    Dictionary,
    Format,
    LocalOptions,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { kebabCase } from "change-case"
import { COLOR_MODES } from "../../config"
import { getPlatform } from "../../config"
import type { ColorModeStrategy } from "../../types/platform.types"
import {
    getModeFromTokenExtensions,
    getTokenValue,
    stripModeFromTokenPath,
} from "../../utils/token.util"

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
            const mode = getModeFromTokenExtensions(token)

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
    outputReferences: OutputReferences
): string {
    const { modes } = COLOR_MODES
    const { light, dark, regular } = categorizeColorTokens(tokens)

    let css = ""

    // Add regular color tokens
    const tokenConfig = getPlatform("css")?.options?.tokenConfig
    regular.forEach((token) => {
        css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    // Create maps for easier lookup
    const lightTokenMap = new Map<string, TransformedToken>()
    const darkTokenMap = new Map<string, TransformedToken>()

    light.forEach((token) => {
        const pathArray = stripModeFromTokenPath(token, modes.light)
        const strippedName = kebabCase(pathArray.join(' '))
        lightTokenMap.set(strippedName, token)
    })

    dark.forEach((token) => {
        const pathArray = stripModeFromTokenPath(token, modes.dark)
        const strippedName = kebabCase(pathArray.join(' '))
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
                outputReferences,
                tokenConfig
            )
            const darkValue = getTokenValue(
                darkToken,
                dictionary,
                usesDtcg,
                outputReferences,
                tokenConfig
            )
            css += `  --${strippedName}: light-dark(${lightValue}, ${darkValue});\n`
        } else {
            css += `  --${strippedName}: ${getTokenValue(lightToken, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        }
        processedTokens.add(strippedName)
    })

    // Add dark tokens without light counterparts
    darkTokenMap.forEach((darkToken, strippedName) => {
        if (!processedTokens.has(strippedName)) {
            css += `  --${strippedName}: ${getTokenValue(darkToken, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        }
    })

    return css
}

function generateMediaQueryCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences
): ColorModeResult {
    const { modes } = COLOR_MODES
    const { light, dark, regular } = categorizeColorTokens(tokens)

    let rootCSS = ""
    let mediaQueryCSS = ""

    // Add regular color tokens
    const tokenConfig = getPlatform("css")?.options?.tokenConfig
    regular.forEach((token) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    // Add light tokens to root
    light.forEach((token) => {
        const pathArray = stripModeFromTokenPath(token, modes.light)
        const strippedName = kebabCase(pathArray.join(' '))
        rootCSS += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    // Add dark tokens to media query
    if (dark.length > 0) {
        mediaQueryCSS += "@media (prefers-color-scheme: dark) {\n"
        mediaQueryCSS += `  ${selector} {\n`
        dark.forEach((token) => {
            const pathArray = stripModeFromTokenPath(token, modes.dark)
            const strippedName = kebabCase(pathArray.join(' '))
            mediaQueryCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }

    return { rootCSS, mediaQueryCSS }
}

export function generateColorModeCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    strategy: ColorModeStrategy
): ColorModeResult {
    switch (strategy) {
        case "media-query":
            return generateMediaQueryCSS(
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

const FILE_HEADER =
    "/**\n * Color tokens\n * Do not edit directly, this file was auto-generated.\n */\n\n"

export const cssColorsFormat: Format = {
    name: "css/colors",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: LocalOptions
    }) => {
        const cssConfig = getPlatform("css")
        const defaultOptions = cssConfig?.options || {}

        const {
            selector = defaultOptions.defaultSelector || ":root",
            outputReferences = defaultOptions.outputReferences || false,
            usesDtcg = false,
        } = options || {}

        const colorModeStrategy =
            defaultOptions.colorModeStrategy || "light-dark-function"

        // Get category filter from options
        const categoryFilter = (options as any)?.categoryFilter
        const colorTokens = categoryFilter ? 
            dictionary.allTokens.filter(categoryFilter) : 
            dictionary.allTokens.filter(token => token.$type === "color" || token.type === "color")

        if (colorTokens.length === 0) {
            return FILE_HEADER + `/* No color tokens found */\n`
        }

        let css = FILE_HEADER

        const { rootCSS, mediaQueryCSS } = generateColorModeCSS(
            colorTokens,
            selector,
            dictionary,
            usesDtcg,
            outputReferences,
            colorModeStrategy
        )

        css += `${selector} {\n${rootCSS}}\n\n`

        if (mediaQueryCSS) {
            css += mediaQueryCSS
        }

        return css
    },
}
