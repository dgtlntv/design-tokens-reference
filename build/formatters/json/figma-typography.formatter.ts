import type { Dictionary, Format, TransformedToken } from "style-dictionary/types"
import { usesReferences } from "style-dictionary/utils"
import type { JsonNestedReferencesOptions } from "../../types/formatters.types"

function minifyDictionaryFigmaTypography(obj: Record<string, unknown>, usesDtcg: boolean, allTokens?: Record<string, unknown>): Record<string, unknown> | unknown {
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
        } else if (token.$type === "typography") {
            // Handle typography tokens with special inheritance logic
            tokenResult[usesDtcg ? '$type' : 'type'] = token.$type
            
            const valueKey = usesDtcg ? '$value' : 'value'
            let tokenValue = originalValue !== undefined && usesReferences(originalValue) 
                ? originalValue 
                : (usesDtcg ? token.$value : token.value)

            // Check if this is a variant token that should inherit from default
            if (allTokens && token.path) {
                const path = token.path
                const lastSegment = path[path.length - 1]
                
                // If this is not a "default" token and there's a corresponding "default" token
                if (lastSegment !== "default" && path.length > 1) {
                    const defaultPath = [...path.slice(0, -1), "default"]
                    
                    // Navigate to the default token in allTokens
                    let defaultTokenObj = allTokens
                    let found = true
                    
                    for (const segment of defaultPath) {
                        if (defaultTokenObj && typeof defaultTokenObj === 'object' && segment in defaultTokenObj) {
                            defaultTokenObj = (defaultTokenObj as Record<string, unknown>)[segment] as Record<string, unknown>
                        } else {
                            found = false
                            break
                        }
                    }
                    
                    // If we found the default token and it has a value
                    if (found && defaultTokenObj && typeof defaultTokenObj === 'object' && 
                        defaultTokenObj.hasOwnProperty(usesDtcg ? '$value' : 'value')) {
                        
                        const defaultToken = defaultTokenObj as TransformedToken
                        const defaultOriginalValue = usesDtcg 
                            ? defaultToken.original?.$value 
                            : defaultToken.original?.value
                        
                        const defaultValue = defaultOriginalValue !== undefined && usesReferences(defaultOriginalValue)
                            ? defaultOriginalValue
                            : (usesDtcg ? defaultToken.$value : defaultToken.value)
                        
                        // If both are objects, merge them (inherit from default, override with variant)
                        if (typeof defaultValue === 'object' && typeof tokenValue === 'object' && 
                            defaultValue !== null && tokenValue !== null) {
                            
                            // Merge default properties (with references) with variant overrides
                            tokenValue = {
                                ...defaultValue,
                                ...tokenValue
                            }
                        }
                    }
                }
            }
            
            tokenResult[valueKey] = tokenValue
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
                const processed = minifyDictionaryFigmaTypography(obj[name] as Record<string, unknown>, usesDtcg, allTokens)
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
            minifyDictionaryFigmaTypography(dictionary.tokens, usesDtcg, dictionary.tokens), 
            null, 
            2
        ) + '\n'
    },
}