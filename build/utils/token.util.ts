import type {
    Dictionary,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { getReferences, usesReferences } from "style-dictionary/utils"

/**
 * Extracts the final value from a token, handling references and DTCG format.
 *
 * @param token - The transformed token to extract value from
 * @param dictionary - Style Dictionary instance containing all tokens
 * @param usesDtcg - Whether to use DTCG format ($value vs value)
 * @param outputReferences - Configuration for outputting token references
 * @param referenceFormat - Format string for references, e.g. "var(--{name})" for CSS
 * @returns The final string value for the token
 */
export function getTokenValue(
    token: TransformedToken,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    referenceFormat: string = "var(--{name})"
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
            const formattedRef = referenceFormat.replace("{name}", ref.name)
            value = value.replace(refValue, formattedRef)
        })

        return value.replace(/"/g, "")
    }

    return String(usesDtcg ? token.$value : token.value)
}
