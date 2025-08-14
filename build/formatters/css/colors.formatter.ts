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
    stripAllModesFromTokenPath,
    getSpecificModeFromToken,
    tokenMatchesModes,
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
 * Categorized color tokens grouped by light/dark modes, contrast levels, and regular tokens.
 */
interface TokenGroups {
    /** Tokens for light mode with normal contrast */
    lightNormal: TransformedToken[]
    /** Tokens for light mode with high contrast */
    lightHigh: TransformedToken[]
    /** Tokens for dark mode with normal contrast */
    darkNormal: TransformedToken[]
    /** Tokens for dark mode with high contrast */
    darkHigh: TransformedToken[]
    /** Regular color tokens without mode specificity */
    regular: TransformedToken[]
}

/**
 * Categorizes color tokens into light/dark and normal/high contrast groups based on their mode extensions.
 * This function examines each token's extensions to determine if it belongs to specific color and contrast modes.
 *
 * @param tokens - Array of transformed tokens to categorize
 * @returns Object containing categorized token arrays
 *
 * @example
 * ```typescript
 * const tokens = [lightNormalToken, darkHighToken, regularToken];
 * const groups = categorizeColorTokens(tokens);
 * // groups.lightNormal = [lightNormalToken]
 * // groups.darkHigh = [darkHighToken] 
 * // groups.regular = [regularToken]
 * ```
 */
function categorizeColorTokens(tokens: TransformedToken[]): TokenGroups {
    const { modes, contrastModes } = COLOR_MODES
    const groups: TokenGroups = {
        lightNormal: [],
        lightHigh: [],
        darkNormal: [],
        darkHigh: [],
        regular: [],
    }

    tokens.forEach((token) => {
        if (token.$type === "color") {
            const colorScheme = getSpecificModeFromToken(token, 'colorScheme')
            const contrastMode = getSpecificModeFromToken(token, 'contrast')
            
            if (colorScheme && contrastMode) {
                if (colorScheme === modes.light && contrastMode === contrastModes.normalContrast) {
                    groups.lightNormal.push(token)
                } else if (colorScheme === modes.light && contrastMode === contrastModes.highContrast) {
                    groups.lightHigh.push(token)
                } else if (colorScheme === modes.dark && contrastMode === contrastModes.normalContrast) {
                    groups.darkNormal.push(token)
                } else if (colorScheme === modes.dark && contrastMode === contrastModes.highContrast) {
                    groups.darkHigh.push(token)
                } else {
                    groups.regular.push(token)
                }
            } else if (colorScheme) {
                // Legacy support for tokens with only color scheme (no contrast)
                if (colorScheme === modes.light) {
                    groups.lightNormal.push(token)
                } else if (colorScheme === modes.dark) {
                    groups.darkNormal.push(token)
                } else {
                    groups.regular.push(token)
                }
            } else {
                groups.regular.push(token)
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
    const { lightNormal, lightHigh, darkNormal, darkHigh, regular } = categorizeColorTokens(tokens)

    let css = ""

    // Add regular color tokens
    const tokenConfig = getPlatform("css")?.options?.tokenConfig
    regular.forEach((token) => {
        css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    // Create maps for easier lookup - group by base name
    const tokenMap = new Map<string, {
        lightNormal?: TransformedToken
        lightHigh?: TransformedToken
        darkNormal?: TransformedToken
        darkHigh?: TransformedToken
    }>()

    // Helper function to add token to map
    const addToMap = (token: TransformedToken, type: 'lightNormal' | 'lightHigh' | 'darkNormal' | 'darkHigh') => {
        const pathArray = stripAllModesFromTokenPath(token)
        const baseName = kebabCase(pathArray.join(" "))
        
        if (!tokenMap.has(baseName)) {
            tokenMap.set(baseName, {})
        }
        const entry = tokenMap.get(baseName)!
        entry[type] = token
    }

    lightNormal.forEach(token => addToMap(token, 'lightNormal'))
    lightHigh.forEach(token => addToMap(token, 'lightHigh'))
    darkNormal.forEach(token => addToMap(token, 'darkNormal'))
    darkHigh.forEach(token => addToMap(token, 'darkHigh'))

    // Generate CSS for each token group
    tokenMap.forEach((tokens, baseName) => {
        const { lightNormal, lightHigh, darkNormal, darkHigh } = tokens
        
        // For normal contrast tokens, use light-dark() function
        if (lightNormal && darkNormal) {
            const lightValue = getTokenValue(lightNormal, dictionary, usesDtcg, outputReferences, tokenConfig)
            const darkValue = getTokenValue(darkNormal, dictionary, usesDtcg, outputReferences, tokenConfig)
            css += `  --${baseName}: light-dark(${lightValue}, ${darkValue});\n`
        } else if (lightNormal) {
            css += `  --${baseName}: ${getTokenValue(lightNormal, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        } else if (darkNormal) {
            css += `  --${baseName}: ${getTokenValue(darkNormal, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        }
        
        // For high contrast tokens, use light-dark() function with high contrast suffix
        if (lightHigh && darkHigh) {
            const lightValue = getTokenValue(lightHigh, dictionary, usesDtcg, outputReferences, tokenConfig)
            const darkValue = getTokenValue(darkHigh, dictionary, usesDtcg, outputReferences, tokenConfig)
            css += `  --${baseName}-high-contrast: light-dark(${lightValue}, ${darkValue});\n`
        } else if (lightHigh) {
            css += `  --${baseName}-high-contrast: ${getTokenValue(lightHigh, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        } else if (darkHigh) {
            css += `  --${baseName}-high-contrast: ${getTokenValue(darkHigh, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        }
    })

    return css
}

/**
 * Generates comprehensive CSS with data attribute selectors and media queries for theme and contrast control.
 * This creates a complete theme system like the HTML example with both manual control (data attributes)
 * and automatic system preference detection (media queries).
 *
 * @param tokens - Array of color tokens to process
 * @param selector - CSS selector to use (typically ':root')
 * @param dictionary - Style Dictionary dictionary containing all tokens
 * @param usesDtcg - Whether to use DTCG format for token values
 * @param outputReferences - Whether to output CSS custom property references
 * @returns ColorModeResult containing both root CSS and comprehensive theme CSS
 */
function generateMediaQueryCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences
): ColorModeResult {
    const { lightNormal, lightHigh, darkNormal, darkHigh, regular } = categorizeColorTokens(tokens)

    let rootCSS = ""
    let mediaQueryCSS = ""

    // Add regular color tokens to root
    const tokenConfig = getPlatform("css")?.options?.tokenConfig
    regular.forEach((token) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    // Create maps for easier lookup
    const tokenMap = new Map<string, {
        lightNormal?: TransformedToken
        lightHigh?: TransformedToken
        darkNormal?: TransformedToken
        darkHigh?: TransformedToken
    }>()

    // Helper function to add token to map
    const addToMap = (token: TransformedToken, type: 'lightNormal' | 'lightHigh' | 'darkNormal' | 'darkHigh') => {
        const pathArray = stripAllModesFromTokenPath(token)
        const baseName = kebabCase(pathArray.join(" "))
        
        if (!tokenMap.has(baseName)) {
            tokenMap.set(baseName, {})
        }
        const entry = tokenMap.get(baseName)!
        entry[type] = token
    }

    lightNormal.forEach(token => addToMap(token, 'lightNormal'))
    lightHigh.forEach(token => addToMap(token, 'lightHigh'))
    darkNormal.forEach(token => addToMap(token, 'darkNormal'))
    darkHigh.forEach(token => addToMap(token, 'darkHigh'))

    // Add default (light normal contrast) tokens to root
    tokenMap.forEach((tokens, baseName) => {
        const { lightNormal } = tokens
        if (lightNormal) {
            rootCSS += `  --${baseName}: ${getTokenValue(lightNormal, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        }
    })

    // DATA ATTRIBUTE SELECTORS for manual theme control
    
    // Dark theme - normal contrast: [data-theme="dark"]
    const darkNormalTokens = Array.from(tokenMap.entries()).filter(([_, tokens]) => tokens.darkNormal)
    if (darkNormalTokens.length > 0) {
        mediaQueryCSS += `[data-theme="dark"] {\n`
        darkNormalTokens.forEach(([baseName, tokens]) => {
            const token = tokens.darkNormal!
            mediaQueryCSS += `  --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "}\n\n"
    }

    // Light theme - high contrast: [data-theme="light"][data-contrast="high"]
    const lightHighTokens = Array.from(tokenMap.entries()).filter(([_, tokens]) => tokens.lightHigh)
    if (lightHighTokens.length > 0) {
        mediaQueryCSS += `[data-theme="light"][data-contrast="high"] {\n`
        lightHighTokens.forEach(([baseName, tokens]) => {
            const token = tokens.lightHigh!
            mediaQueryCSS += `  --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "}\n\n"
    }

    // Dark theme - high contrast: [data-theme="dark"][data-contrast="high"]
    const darkHighTokens = Array.from(tokenMap.entries()).filter(([_, tokens]) => tokens.darkHigh)
    if (darkHighTokens.length > 0) {
        mediaQueryCSS += `[data-theme="dark"][data-contrast="high"] {\n`
        darkHighTokens.forEach(([baseName, tokens]) => {
            const token = tokens.darkHigh!
            mediaQueryCSS += `  --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "}\n\n"
    }

    // MEDIA QUERIES for system preference detection
    
    // Respect system dark mode preference when no manual theme is set
    if (darkNormalTokens.length > 0) {
        mediaQueryCSS += `@media (prefers-color-scheme: dark) {\n`
        mediaQueryCSS += `  ${selector}:not([data-theme]) {\n`
        darkNormalTokens.forEach(([baseName, tokens]) => {
            const token = tokens.darkNormal!
            mediaQueryCSS += `    --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }
    
    // Respect system high contrast preference when no manual contrast is set
    if (lightHighTokens.length > 0) {
        mediaQueryCSS += `@media (prefers-contrast: high) {\n`
        mediaQueryCSS += `  ${selector}:not([data-contrast]):not([data-theme]) {\n`
        lightHighTokens.forEach(([baseName, tokens]) => {
            const token = tokens.lightHigh!
            mediaQueryCSS += `    --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }
    
    // Combined: system dark + high contrast when no manual preferences are set
    if (darkHighTokens.length > 0) {
        mediaQueryCSS += `@media (prefers-contrast: high) and (prefers-color-scheme: dark) {\n`
        mediaQueryCSS += `  ${selector}:not([data-contrast]):not([data-theme]) {\n`
        darkHighTokens.forEach(([baseName, tokens]) => {
            const token = tokens.darkHigh!
            mediaQueryCSS += `    --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }

    // Additional selectors for high contrast preference with specific themes
    if (lightHighTokens.length > 0) {
        mediaQueryCSS += `@media (prefers-contrast: high) {\n`
        mediaQueryCSS += `  [data-theme="light"]:not([data-contrast]) {\n`
        lightHighTokens.forEach(([baseName, tokens]) => {
            const token = tokens.lightHigh!
            mediaQueryCSS += `    --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })
        mediaQueryCSS += "  }\n"
        mediaQueryCSS += "}\n\n"
    }

    if (darkHighTokens.length > 0) {
        mediaQueryCSS += `@media (prefers-contrast: high) {\n`
        mediaQueryCSS += `  [data-theme="dark"]:not([data-contrast]) {\n`
        darkHighTokens.forEach(([baseName, tokens]) => {
            const token = tokens.darkHigh!
            mediaQueryCSS += `    --${baseName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
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
