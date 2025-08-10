import type { Format, Dictionary } from "style-dictionary/types"
import type { FormatOptions, CSSPlatformOptions } from "../../types/platform.types"
import { generateColorModeCSS } from "./color-mode.formatter"
import { generateDimensionBreakpointCSS } from "./dimension-breakpoint.formatter"
import { getTokenValue } from "../../utils/token.util"
import { configFactory } from "../../config"

const FILE_HEADER =
    "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

export const cssVariablesCombinedFormat: Format = {
    name: "css/variables-combined",
    format: ({ dictionary, options }: { dictionary: Dictionary; options?: FormatOptions }) => {
        const cssConfig = configFactory.getPlatformConfig("css")
        const defaultOptions: Partial<CSSPlatformOptions> = cssConfig?.options || {}

        const {
            selector = defaultOptions.defaultSelector || ":root",
            outputReferences = defaultOptions.outputReferences,
            usesDtcg = false,
        } = options || {}

        let css = FILE_HEADER
        css += `${selector} {\n`

        // Add non-color, non-dimension tokens
        dictionary.allTokens.forEach((token) => {
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
                outputReferences
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

        // Add media queries or data attribute styles
        css += colorMediaQueryCSS
        css += dimensionMediaQueriesCSS

        return css
    },
}
