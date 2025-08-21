import type { Dictionary, Format, TransformedToken } from "style-dictionary/types"
import { usesReferences } from "style-dictionary/utils"
import type { JsonNestedReferencesOptions } from "../../types/formatters.types"

function minifyDictionaryOriginal(obj: Record<string, unknown>, usesDtcg: boolean): Record<string, unknown> | unknown {
    if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
        return obj
    }

    const result: Record<string, unknown> = {}

    if (obj.hasOwnProperty(usesDtcg ? '$value' : 'value')) {
        // This is a token, check if it uses references
        const token = obj as TransformedToken
        const originalValue = usesDtcg 
            ? token.original?.$value 
            : token.original?.value
        
        // Only return the original reference if it actually contains references
        if (originalValue !== undefined && usesReferences(originalValue)) {
            return originalValue
        }
        
        // Otherwise return the resolved/transformed value
        return usesDtcg ? token.$value : token.value
    } else {
        // This is a group, recurse through its children
        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                result[name] = minifyDictionaryOriginal(obj[name] as Record<string, unknown>, usesDtcg)
            }
        }
    }
    return result
}

export const jsonNestedReferencesFormat: Format = {
    name: "json/nested-references",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: JsonNestedReferencesOptions
    }) => {
        const { usesDtcg = false } = options || {}
        
        return JSON.stringify(
            minifyDictionaryOriginal(dictionary.tokens, usesDtcg), 
            null, 
            2
        ) + '\n'
    },
}