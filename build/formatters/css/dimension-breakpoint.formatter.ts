import type { TransformedToken, Dictionary } from "style-dictionary/types"
import type { FormatOptions } from "../../types/platform.types"
import type { BreakpointSize } from "../../config/breakpoints.config"
import { getBreakpointsInOrder } from "../../config"
import { getTokenValue } from "../../utils/token.util"

interface DimensionBreakpointResult {
    rootCSS: string
    mediaQueriesCSS: string
}

interface DimensionTokensBySize {
    [key: string]: TransformedToken[]
}

function stripSizeFromName(name: string): string {
    return name
        .replace(/-x-large-size-/, "-size-")
        .replace(/-large-size-/, "-size-")
        .replace(/-medium-size-/, "-size-")
        .replace(/-small-size-/, "-size-")
}

function categorizeDimensionTokens(tokens: TransformedToken[]): {
    bySize: DimensionTokensBySize
    regular: TransformedToken[]
} {
    const bySize: DimensionTokensBySize = {
        small: [],
        medium: [],
        large: [],
        "x-large": [],
    }
    const regular: TransformedToken[] = []

    tokens.forEach((token) => {
        if (token.$type === "dimension") {
            let foundSize = false

            const sizePatterns: Array<[BreakpointSize, string]> = [
                ["x-large", "-x-large-size-"],
                ["large", "-large-size-"],
                ["medium", "-medium-size-"],
                ["small", "-small-size-"],
            ]

            for (const [size, pattern] of sizePatterns) {
                if (token.name.includes(pattern)) {
                    bySize[size].push(token)
                    foundSize = true
                    break
                }
            }

            if (!foundSize) {
                regular.push(token)
            }
        }
    })

    return { bySize, regular }
}

export function generateDimensionBreakpointCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: FormatOptions["outputReferences"]
): DimensionBreakpointResult {
    const { bySize, regular } = categorizeDimensionTokens(tokens)
    const breakpoints = getBreakpointsInOrder()

    let rootCSS = ""
    regular.forEach((token) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
    })

    let mediaQueriesCSS = ""
    breakpoints.forEach(([sizeName, breakpointValue]) => {
        const tokensForSize = bySize[sizeName]
        if (tokensForSize && tokensForSize.length > 0) {
            mediaQueriesCSS += `@media (min-width: ${breakpointValue}) {\n`
            mediaQueriesCSS += `  ${selector} {\n`
            tokensForSize.forEach((token) => {
                const strippedName = stripSizeFromName(token.name)
                mediaQueriesCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences)};\n`
            })
            mediaQueriesCSS += "  }\n"
            mediaQueriesCSS += "}\n\n"
        }
    })

    return { rootCSS, mediaQueriesCSS }
}
