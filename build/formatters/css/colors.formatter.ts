import { kebabCase } from "change-case"
import type {
    Dictionary,
    Format,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { COLOR_MODES, getPlatform } from "../../config"
import type { ColorModeStrategy } from "../../types/platform.types"
import type { ExtendedLocalOptions } from "../../types/shared.types"
import {
    getModeFromTokenExtensions,
    getTokenValue,
    stripModeFromTokenPath,
} from "../../utils/token.util"

/**
 * Result structure for color mode CSS generation.
 * Contains both root-level CSS and media query CSS for different color modes.
 */
interface ColorModeResult {
    /** CSS properties for the root selector (:root) */
    rootCSS: string
    /** CSS media queries for alternate color schemes */
    mediaQueryCSS: string
}

/**
 * Categorized color tokens grouped by light/dark modes and regular tokens.
 */
interface TokenGroups {
    /** Tokens specifically for light mode */
    light: TransformedToken[]
    /** Tokens specifically for dark mode */
    dark: TransformedToken[]
    /** Regular color tokens without mode specificity */
    regular: TransformedToken[]
}

/**
 * Categorizes color tokens into light, dark, and regular groups based on their mode extensions.
 * This function examines each token's extensions to determine if it belongs to a specific color mode.
 *
 * @param tokens - Array of transformed tokens to categorize
 * @returns Object containing categorized token arrays (light, dark, regular)
 *
 * @example
 * ```typescript
 * const tokens = [lightToken, darkToken, regularToken];
 * const groups = categorizeColorTokens(tokens);
 * // groups.light = [lightToken]
 * // groups.dark = [darkToken]
 * // groups.regular = [regularToken]
 * ```
 */
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

            switch (mode) {
                case modes.light:
                    groups.light.push(token)
                    break
                case modes.dark:
                    groups.dark.push(token)
                    break
                default:
                    groups.regular.push(token)
                    break
            }
        }
    })

    return groups
}

/**
 * Generates CSS using the modern light-dark() function for automatic color mode switching.
 * This approach uses the CSS light-dark() function to automatically switch between light and dark colors
 * based on the user's color scheme preference, without requiring media queries.
 *
 * @param tokens - Array of color tokens to process
 * @param dictionary - Style Dictionary dictionary containing all tokens
 * @param usesDtcg - Whether to use DTCG format for token values
 * @param outputReferences - Whether to output CSS custom property references
 * @returns CSS string with light-dark() functions and regular color properties
 *
 * @example
 * ```typescript
 * const css = generateLightDarkFunctionCSS(colorTokens, dictionary, true, true);
 * // Output: --color-primary: light-dark(#ffffff, #000000);
 * ```
 */
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
        const strippedName = kebabCase(pathArray.join(" "))
        lightTokenMap.set(strippedName, token)
    })

    dark.forEach((token) => {
        const pathArray = stripModeFromTokenPath(token, modes.dark)
        const strippedName = kebabCase(pathArray.join(" "))
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

/**
 * Generates CSS using media queries for color mode switching.
 * This approach uses @media (prefers-color-scheme: dark) to provide alternate colors
 * for users with dark mode preferences.
 *
 * @param tokens - Array of color tokens to process
 * @param selector - CSS selector to use (typically ':root')
 * @param dictionary - Style Dictionary dictionary containing all tokens
 * @param usesDtcg - Whether to use DTCG format for token values
 * @param outputReferences - Whether to output CSS custom property references
 * @returns ColorModeResult containing both root CSS and media query CSS
 *
 * @example
 * ```typescript
 * const result = generateMediaQueryCSS(tokens, ':root', dictionary, true, true);
 * // result.rootCSS: ':root { --color: #ffffff; }'
 * // result.mediaQueryCSS: '@media (prefers-color-scheme: dark) { :root { --color: #000000; } }'
 * ```
 */
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
        const strippedName = kebabCase(pathArray.join(" "))
        rootCSS += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    // Add dark tokens to media query
    if (dark.length > 0) {
        mediaQueryCSS += "@media (prefers-color-scheme: dark) {\n"
        mediaQueryCSS += `  ${selector} {\n`
        dark.forEach((token) => {
            const pathArray = stripModeFromTokenPath(token, modes.dark)
            const strippedName = kebabCase(pathArray.join(" "))
            mediaQueryCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }

    return { rootCSS, mediaQueryCSS }
}

/**
 * Generates color mode CSS using the specified strategy.
 * This is the main function that routes to different color mode generation strategies.
 *
 * @param tokens - Array of color tokens to process
 * @param selector - CSS selector to use (typically ':root')
 * @param dictionary - Style Dictionary dictionary containing all tokens
 * @param usesDtcg - Whether to use DTCG format for token values
 * @param outputReferences - Whether to output CSS custom property references
 * @param strategy - Color mode strategy ('light-dark-function' or 'media-query')
 * @returns ColorModeResult containing the generated CSS
 *
 * @example
 * ```typescript
 * const result = generateColorModeCSS(
 *   colorTokens,
 *   ':root',
 *   dictionary,
 *   true,
 *   true,
 *   'light-dark-function'
 * );
 * ```
 */
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

/**
 * Standard file header for generated CSS color files.
 */
const FILE_HEADER =
    "/**\n * Color tokens\n * Do not edit directly, this file was auto-generated.\n */\n\n"

/**
 * This formatter generates CSS custom properties for color tokens with support for
 * both light-dark() function and media query-based color mode switching strategies.
 * It automatically handles light/dark mode variants and can output either modern
 * CSS light-dark() functions or traditional media query-based approaches.
 */
export const cssColorsFormat: Format = {
    name: "css/colors",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: ExtendedLocalOptions
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
        const categoryFilter = options?.categoryFilter
        const colorTokens = categoryFilter
            ? dictionary.allTokens.filter(categoryFilter)
            : dictionary.allTokens.filter(
                  (token) => token.$type === "color" || token.type === "color"
              )

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
