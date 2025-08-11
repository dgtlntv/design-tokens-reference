import type {
    Dictionary,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { kebabCase } from "change-case"
import { DIMENSION_MODES } from "../../config/dimension-modes.config"
import { getPlatform } from "../../config"
import {
    getModeFromTokenExtensions,
    getTokenValue,
    stripModeFromTokenPath,
} from "../../utils/token.util"

interface DimensionModeResult {
    rootCSS: string
    mediaQueriesCSS: string
}

interface DimensionTokensBySize {
    [key: string]: TransformedToken[]
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
            const mode = getModeFromTokenExtensions(token)

            if (mode && mode in bySize) {
                bySize[mode as keyof typeof bySize].push(token)
            } else {
                regular.push(token)
            }
        }
    })

    return { bySize, regular }
}


export function generateDimensionModeCSS(
    tokens: TransformedToken[],
    selector: string,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences
): DimensionModeResult {
    const { bySize, regular } = categorizeDimensionTokens(tokens)
    const dimensionModeEntries = Object.entries(DIMENSION_MODES) as Array<
        [keyof typeof DIMENSION_MODES, string]
    >

    let rootCSS = ""
    const tokenConfig = getPlatform("css")?.options?.tokenConfig
    regular.forEach((token) => {
        rootCSS += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
    })

    let mediaQueriesCSS = ""
    dimensionModeEntries.forEach(([sizeName, modeValue]) => {
        const tokensForSize = bySize[sizeName]
        if (tokensForSize && tokensForSize.length > 0) {
            mediaQueriesCSS += `@media (min-width: ${modeValue}) {\n`
            mediaQueriesCSS += `  ${selector} {\n`
            tokensForSize.forEach((token) => {
                const mode = getModeFromTokenExtensions(token)
                const strippedName = mode
                    ? kebabCase(stripModeFromTokenPath(token, mode).join(' '))
                    : token.name
                mediaQueriesCSS += `    --${strippedName}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
            })
            mediaQueriesCSS += "  }\n"
            mediaQueriesCSS += "}\n\n"
        }
    })

    return { rootCSS, mediaQueriesCSS }
}
