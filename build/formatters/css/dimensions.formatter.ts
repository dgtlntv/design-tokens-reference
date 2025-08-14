import { kebabCase } from "change-case"
import type {
    Dictionary,
    Format,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { getPlatform } from "../../config"
import { DIMENSION_MODES } from "../../config/dimension-modes.config"
import type { ExtendedLocalOptions } from "../../types/shared.types"
import {
    getModeFromTokenExtensions,
    getTokenValue,
    stripModeFromTokenPath,
} from "../../utils/token.util"

/**
 * Result structure for dimension mode CSS generation.
 * Contains both root-level CSS and media query CSS for different responsive breakpoints.
 */
interface DimensionModeResult {
    /** CSS properties for the root selector (:root) */
    rootCSS: string
    /** CSS media queries for responsive breakpoints */
    mediaQueriesCSS: string
}

/**
 * Dimension tokens organized by mode (responsive breakpoint).
 * Keys are mode names (small, medium, large, xLarge), values are token arrays.
 */
interface DimensionTokensByMode {
    [key: string]: TransformedToken[]
}

/**
 * Categorizes dimension tokens into mode-specific and regular groups based on their mode extensions.
 * This function examines each token's extensions to determine if it belongs to a specific responsive breakpoint.
 *
 * @param tokens - Array of transformed tokens to categorize
 * @returns Object containing mode-organized tokens and regular dimension tokens
 *
 * @example
 * ```typescript
 * const tokens = [smallToken, largeToken, regularToken];
 * const groups = categorizeDimensionTokens(tokens);
 * // groups.byMode.small = [smallToken]
 * // groups.byMode.large = [largeToken]
 * // groups.regular = [regularToken]
 * ```
 */
function categorizeDimensionTokens(tokens: TransformedToken[]): {
    byMode: DimensionTokensByMode
    regular: TransformedToken[]
} {
    // Create byMode object dynamically from DIMENSION_MODES config
    const byMode: DimensionTokensByMode = {}
    Object.keys(DIMENSION_MODES.modes).forEach((mode) => {
        byMode[mode] = []
    })
    const regular: TransformedToken[] = []

    tokens.forEach((token) => {
        if (token.$type === "dimension") {
            const mode = getModeFromTokenExtensions(token)

            if (mode && mode in byMode) {
                byMode[mode as keyof typeof byMode].push(token)
            } else {
                regular.push(token)
            }
        }
    })

    return { byMode, regular }
}

/**
 * Generates CSS for dimension tokens with responsive breakpoint support.
 * This function creates CSS custom properties with mobile-first responsive media queries
 * for different breakpoints (small, medium, large, xLarge).
 *
 * @param tokens - Array of dimension tokens to process
 * @param selector - CSS selector to use (typically ':root')
 * @param dictionary - Style Dictionary dictionary containing all tokens
 * @param usesDtcg - Whether to use DTCG format for token values
 * @param outputReferences - Whether to output CSS custom property references
 * @returns DimensionModeResult containing both root CSS and media query CSS
 *
 * @example
 * ```typescript
 * const result = generateDimensionModeCSS(tokens, ':root', dictionary, true, true);
 * // result.rootCSS: ':root { --spacing: 16px; }'
 * // result.mediaQueriesCSS: '@media (min-width: 768px) { :root { --spacing: 24px; } }'
 * ```
 */
export function generateDimensionModeCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences
): DimensionModeResult {
    const { byMode, regular } = categorizeDimensionTokens(tokens)
    const dimensionModeEntries = Object.entries(
        DIMENSION_MODES.modes
    ) as Array<[keyof typeof DIMENSION_MODES.modes, string]>

    let rootCSS = ""
    const tokenConfig = getPlatform("css")?.options?.tokenConfig

    // Add regular dimension tokens
    regular.forEach((token) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    // Add default mode tokens as base values in :root
    const defaultMode = DIMENSION_MODES.defaultMode
    if (defaultMode) {
        const defaultTokens = byMode[defaultMode as keyof typeof byMode]
        if (defaultTokens && defaultTokens.length > 0) {
            defaultTokens.forEach((token) => {
                const mode = getModeFromTokenExtensions(token)
                const strippedName = mode
                    ? kebabCase(stripModeFromTokenPath(token, mode).join(" "))
                    : token.name
                rootCSS += `  --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
            })
        }
    }

    let mediaQueriesCSS = ""
    // Generate media queries for all modes except the default mode
    const mediaQueryModes = dimensionModeEntries.filter(
        ([sizeName]) => sizeName !== defaultMode
    )

    mediaQueryModes.forEach(([sizeName, modeValue]) => {
        const tokensForSize = byMode[sizeName]
        if (tokensForSize && tokensForSize.length > 0) {
            mediaQueriesCSS += `@media (min-width: ${modeValue}) {\n`
            mediaQueriesCSS += `  ${selector} {\n`
            tokensForSize.forEach((token) => {
                const mode = getModeFromTokenExtensions(token)
                const strippedName = mode
                    ? kebabCase(stripModeFromTokenPath(token, mode).join(" "))
                    : token.name
                mediaQueriesCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
            })
            mediaQueriesCSS += "  }\n"
            mediaQueriesCSS += "}\n\n"
        }
    })

    return { rootCSS, mediaQueriesCSS }
}

/**
 * Standard file header for generated CSS dimension files.
 */
const FILE_HEADER =
    "/**\n * Dimension tokens\n * Do not edit directly, this file was auto-generated.\n */\n\n"

/**
 * This formatter generates CSS custom properties for dimension tokens with built-in
 * responsive behavior using media queries. It implements a mobile-first approach where
 * the smallest breakpoint values are set as defaults, and larger breakpoints override
 * them at their respective min-width media query breakpoints.
 */
export const cssDimensionsFormat: Format = {
    name: "css/dimensions",
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

        // Get category filter from options
        const categoryFilter = options?.categoryFilter
        const dimensionTokens = categoryFilter
            ? dictionary.allTokens.filter(categoryFilter)
            : dictionary.allTokens.filter(
                  (token) =>
                      token.$type === "dimension" || token.type === "dimension"
              )

        if (dimensionTokens.length === 0) {
            return FILE_HEADER + `/* No dimension tokens found */\n`
        }

        let css = FILE_HEADER

        const { rootCSS, mediaQueriesCSS } = generateDimensionModeCSS(
            dimensionTokens,
            selector,
            dictionary,
            usesDtcg,
            outputReferences
        )

        css += `${selector} {\n${rootCSS}}\n\n`

        if (mediaQueriesCSS) {
            css += mediaQueriesCSS
        }

        return css
    },
}
