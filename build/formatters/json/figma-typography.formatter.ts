import type { Dictionary, Format, TransformedToken } from "style-dictionary/types"
import { usesReferences } from "style-dictionary/utils"
import type { JsonNestedReferencesOptions } from "../../types/formatters.types"

function minifyDictionaryFigmaTypography(obj: Record<string, unknown>, usesDtcg: boolean): Record<string, unknown> | unknown {
    if (typeof obj !== "object" || Array.isArray(obj) || obj === null) {
        return obj
    }

    const result: Record<string, unknown> = {}

    if (obj.hasOwnProperty(usesDtcg ? '$value' : 'value')) {
        // This is a token, check if it should be filtered out or needs special handling
        const token = obj as TransformedToken
        const originalValue = usesDtcg 
            ? token.original?.$value 
            : token.original?.value
        
        // Filter out dimension tokens
        if (token.$type === "dimension") {
            return null // Signal that this token should be excluded
        }
        
        // Create token object with type and value
        const tokenResult: Record<string, unknown> = {}
        
        // Handle fontFamily tokens specially
        if (token.$type === "fontFamily") {
            if (originalValue !== undefined && !usesReferences(originalValue)) {
                // If it's a fontFamily token with an array value (not a reference)
                if (Array.isArray(originalValue)) {
                    // Take only the first value from the array and change type to fontFamilies
                    // For some odd reason Tokens Studio expects fontFamily tokens to have type "fontFamilies"
                    tokenResult[usesDtcg ? '$type' : 'type'] = 'fontFamilies'
                    tokenResult[usesDtcg ? '$value' : 'value'] = originalValue[0]
                } else {
                    // If it's not an array, change type to fontFamilies
                    // For some odd reason Tokens Studio expects fontFamily tokens to have type "fontFamilies"
                    tokenResult[usesDtcg ? '$type' : 'type'] = 'fontFamilies'
                    tokenResult[usesDtcg ? '$value' : 'value'] = originalValue
                }
            } else {
                // For fontFamily tokens with references, change type to fontFamilies but keep reference
                // For some odd reason Tokens Studio expects fontFamily tokens to have type "fontFamilies"
                tokenResult[usesDtcg ? '$type' : 'type'] = 'fontFamilies'
                const valueKey = usesDtcg ? '$value' : 'value'
                if (originalValue !== undefined && usesReferences(originalValue)) {
                    tokenResult[valueKey] = originalValue
                } else {
                    tokenResult[valueKey] = usesDtcg ? token.$value : token.value
                }
            }
        } else if (token.$type === "fontWeight") {
            // Handle fontWeight tokens - change type to fontWeights
            // For some odd reason Tokens Studio expects fontWeight tokens to have type "fontWeights"
            tokenResult[usesDtcg ? '$type' : 'type'] = 'fontWeights'
            
            // Add the value (original reference if it uses references, otherwise resolved)
            const valueKey = usesDtcg ? '$value' : 'value'
            if (originalValue !== undefined && usesReferences(originalValue)) {
                tokenResult[valueKey] = originalValue
            } else {
                tokenResult[valueKey] = usesDtcg ? token.$value : token.value
            }
        } else {
            // For all other tokens or fontFamily tokens with references, use existing logic
            tokenResult[usesDtcg ? '$type' : 'type'] = token.$type
            
            // Add the value (original reference if it uses references, otherwise resolved)
            const valueKey = usesDtcg ? '$value' : 'value'
            if (originalValue !== undefined && usesReferences(originalValue)) {
                tokenResult[valueKey] = originalValue
            } else {
                tokenResult[valueKey] = usesDtcg ? token.$value : token.value
            }
        }
        
        return tokenResult
    } else {
        // This is a group, recurse through its children
        for (const name in obj) {
            if (obj.hasOwnProperty(name)) {
                const processed = minifyDictionaryFigmaTypography(obj[name] as Record<string, unknown>, usesDtcg)
                // Only include non-null results (excludes filtered dimension tokens)
                if (processed !== null) {
                    result[name] = processed
                }
            }
        }
        
        // If the result is empty after processing, return null to exclude this group
        if (Object.keys(result).length === 0) {
            return null
        }
    }
    return result
}

export const jsonFigmaTypographyFormat: Format = {
    name: "json/figma-typography",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: JsonNestedReferencesOptions
    }) => {
        const { usesDtcg = false } = options || {}
        
        return JSON.stringify(
            minifyDictionaryFigmaTypography(dictionary.tokens, usesDtcg), 
            null, 
            2
        ) + '\n'
    },
}