import type {
    Dictionary,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { getReferences, usesReferences } from "style-dictionary/utils"
import type { PlatformTokenConfig } from "../types/platform.types"
import type { TokenExtensions } from "../types/tokens.types"

export function getTokenValue(
    token: TransformedToken,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    platformConfig?: PlatformTokenConfig
): string {
    const originalValue = usesDtcg
        ? token.original.$value
        : token.original.value

    const shouldOutputRef =
        usesReferences(originalValue) &&
        (typeof outputReferences === "function"
            ? outputReferences(token, { dictionary, usesDtcg })
            : outputReferences)

    if (shouldOutputRef) {
        const refs = getReferences(originalValue, dictionary.tokens, {
            usesDtcg,
        })
        let value = JSON.stringify(usesDtcg ? token.$value : token.value)

        refs.forEach((ref: TransformedToken) => {
            const refValue = JSON.stringify(usesDtcg ? ref.$value : ref.value)
            const referenceFormat =
                platformConfig?.referenceFormat || "var(--{name})"
            const formattedRef = referenceFormat.replace("{name}", ref.name)
            value = value.replace(refValue, formattedRef)
        })

        return value.replace(/"/g, "")
    }

    return String(usesDtcg ? token.$value : token.value)
}

export function stripModeFromTokenPath(
    token: TransformedToken,
    mode: string
): string[] {
    const path = token.path || []

    // Find the index of the mode in the path
    const modeIndex = path.indexOf(mode)

    if (modeIndex === -1) {
        // Mode not found in path, return original path
        return path
    }

    // Create a new path without the mode segment
    return [...path.slice(0, modeIndex), ...path.slice(modeIndex + 1)]
}

export function getModeFromTokenExtensions(
    token: TransformedToken
): string | null {
    const extensions = token.$extensions as TokenExtensions | undefined
    if (extensions && extensions["canonical.modes"]) {
        return extensions["canonical.modes"].mode || null
    }
    return null
}
