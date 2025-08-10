import { usesReferences, getReferences } from "style-dictionary/utils"
import type { TransformedToken, Dictionary } from "style-dictionary/types"
import type { FormatOptions } from "../types/platform.types"
import { COLOR_MODES } from "../config"

export function getTokenValue(
    token: TransformedToken,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: FormatOptions["outputReferences"]
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
            value = value.replace(refValue, `var(--${ref.name})`)
        })

        return value.replace(/"/g, "")
    }

    return String(usesDtcg ? token.$value : token.value)
}

export function stripModeFromName(name: string, mode: string): string {
    const pattern = new RegExp(`-${mode}-`, "g")
    return name.replace(pattern, "-")
}

export function getColorModeFromToken(tokenName: string): string | null {
    const { modes } = COLOR_MODES

    if (tokenName.includes(`-${modes.light}-`)) {
        return modes.light
    }
    if (tokenName.includes(`-${modes.dark}-`)) {
        return modes.dark
    }
    return null
}
