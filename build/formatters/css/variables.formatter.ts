import type { Dictionary, Format, LocalOptions } from "style-dictionary/types"
import { getPlatform } from "../../config"
import type { CSSPlatformOptions } from "../../types/platform.types"
import { getTokenValue } from "../../utils/token.util"
import { generateColorModeCSS } from "./color-mode.formatter"
import { generateDimensionModeCSS } from "./dimension-mode.formatter"

const FILE_HEADER =
    "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

export const cssVariablesCombinedFormat: Format = {
    name: "css/variables-combined",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: LocalOptions
    }) => {
        const cssConfig = getPlatform("css")
        const defaultOptions: Partial<CSSPlatformOptions> =
            cssConfig?.options || {}

        const {
            selector = defaultOptions.defaultSelector || ":root",
            outputReferences = defaultOptions.outputReferences || false,
            usesDtcg = false,
        } = options || {}

        const colorModeStrategy =
            defaultOptions.colorModeStrategy || "light-dark-function"

        let css = FILE_HEADER
        css += `${selector} {\n`

        // Add non-color, non-dimension tokens
        const tokenConfig = cssConfig?.options?.tokenConfig
        dictionary.allTokens.forEach((token) => {
            if (token.$type !== "color" && token.$type !== "dimension") {
                css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
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
                colorModeStrategy
            )
        css += colorRootCSS

        // Add dimension tokens
        const {
            rootCSS: dimensionRootCSS,
            mediaQueriesCSS: dimensionMediaQueriesCSS,
        } = generateDimensionModeCSS(
            dictionary.allTokens,
            selector,
            dictionary,
            usesDtcg,
            outputReferences
        )
        css += dimensionRootCSS

        css += "}\n\n"

        // Add media queries or data attribute styles
        css += colorMediaQueryCSS
        css += dimensionMediaQueriesCSS

        return css
    },
}
