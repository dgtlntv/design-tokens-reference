import type { Dictionary, Format } from "style-dictionary/types"
import { getPlatform } from "../../config"
import type { CSSPlatformOptions } from "../../types/platform.types"
import type { ExtendedLocalOptions } from "../../types/shared.types"
import { getTokenValue } from "../../utils/token.util"

const FILE_HEADER =
    "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

export const cssGenericFormat: Format = {
    name: "css/generic",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: ExtendedLocalOptions
    }) => {
        const cssConfig = getPlatform("css")
        const defaultOptions: Partial<CSSPlatformOptions> =
            cssConfig?.options || {}

        const {
            selector = defaultOptions.defaultSelector || ":root",
            outputReferences = defaultOptions.outputReferences || false,
            usesDtcg = false,
        } = options || {}

        // Get category filter from options  
        const categoryFilter = options?.categoryFilter
        const categoryTokens = categoryFilter ? 
            dictionary.allTokens.filter(categoryFilter) : 
            dictionary.allTokens

        if (categoryTokens.length === 0) {
            return FILE_HEADER + `/* No tokens found for this category */\n`
        }

        let css = FILE_HEADER
        css += `${selector} {\n`

        const tokenConfig = cssConfig?.options?.tokenConfig
        categoryTokens.forEach((token) => {
            css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
        })

        css += "}\n"

        return css
    },
}