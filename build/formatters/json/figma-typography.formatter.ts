import type { Dictionary, Format, TransformedToken } from "style-dictionary/types"
import { usesReferences } from "style-dictionary/utils"
import type { JsonNestedReferencesOptions } from "../../types/formatters.types"

// Configuration for Figma/Tokens Studio font weight conversion
const FONT_WEIGHT_MAP: Record<string | number, string> = {
    // Numeric to string conversion for Tokens Studio
    100: 'Thin',
    200: 'Extra Light',
    300: 'Light', 
    400: 'Regular',
    500: 'Medium',
    600: 'Semibold',
    700: 'Bold',
    800: 'Extra Bold',
    900: 'Black',
    950: 'Extra Black',
    
    // String mappings for consistency
    'thin': 'Thin',
    'extraLight': 'Extra Light',
    'light': 'Light',
    'regular': 'Regular',
    'medium': 'Medium',
    'semiBold': 'Semibold',
    'bold': 'Bold',
    'extraBold': 'Extra Bold',
    'black': 'Black'
}

// Helper function to determine if a typography token is a base style (complete typography definition)
function isBaseStyle(token: any): boolean {
    if (!token || typeof token !== 'object' || !token.$value) return false
    const value = token.$value
    if (typeof value !== 'object') return false
    
    // Base styles should have fontFamily, fontSize, fontWeight, lineHeight, letterSpacing
    const requiredProps = ['fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing']
    return requiredProps.every(prop => prop in value)
}

// Helper function to determine if a typography token is a modifier (single property override)
function isModifier(token: any): boolean {
    if (!token || typeof token !== 'object' || !token.$value) return false
    const value = token.$value
    if (typeof value !== 'object') return false
    
    // Modifiers are incomplete typography definitions - they don't have the core required properties
    // but they have 1-3 modifier properties like fontStyle, textDecoration, letterCase, etc.
    const props = Object.keys(value)
    return props.length <= 3 && !isBaseStyle(token)
}

// Helper function to resolve references and convert to Figma-compatible values
function convertToFigmaCompatibleFormat(value: Record<string, unknown>, allTokens?: Record<string, unknown>): Record<string, unknown> {
    const converted = { ...value }
    
    // Convert letterCase to textCase and resolve references
    if ('letterCase' in converted) {
        const letterCaseValue = converted.letterCase as string
        if (typeof letterCaseValue === 'string' && letterCaseValue.includes('letterCase')) {
            // This is a reference to letterCase category - resolve it
            const resolvedValue = resolveTokenReference(letterCaseValue, allTokens)
            converted.textCase = resolvedValue || letterCaseValue
        } else {
            converted.textCase = letterCaseValue
        }
        delete converted.letterCase
    }
    
    // Convert textDecoration references and fix values for Figma
    if ('textDecoration' in converted && typeof converted.textDecoration === 'string') {
        const textDec = converted.textDecoration as string
        if (textDec.includes('textDecoration')) {
            // This is a reference to textDecoration category - resolve it
            let resolvedValue = resolveTokenReference(textDec, allTokens) || textDec
            // Fix resolved values for Figma compatibility
            if (resolvedValue === 'underline solid') {
                resolvedValue = 'underline'
            } else if (resolvedValue === 'line-through') {
                resolvedValue = 'strike-through'
            }
            converted.textDecoration = resolvedValue
        } else if (textDec === 'underline solid') {
            converted.textDecoration = 'underline'
        } else if (textDec === 'line-through') {
            converted.textDecoration = 'strike-through'
        }
    }
    
    return converted
}

// Helper function to resolve token references
function resolveTokenReference(reference: string, allTokens?: Record<string, unknown>): string | null {
    if (!allTokens || !reference.startsWith('{') || !reference.endsWith('}')) {
        return null
    }
    
    const path = reference.slice(1, -1).split('.')
    let current = allTokens
    
    for (const segment of path) {
        if (current && typeof current === 'object' && segment in current) {
            current = (current as Record<string, unknown>)[segment]
        } else {
            return null
        }
    }
    
    if (current && typeof current === 'object' && ('$value' in current || 'value' in current)) {
        return (current as any).$value || (current as any).value
    }
    
    return null
}

// Helper function to merge base style with modifier
function mergeStyleWithModifier(baseValue: Record<string, unknown>, modifierValue: Record<string, unknown>, allTokens?: Record<string, unknown>): Record<string, unknown> {
    const filteredModifier = { ...modifierValue }
    // Filter out unsupported properties
    delete filteredModifier.figureStyle
    delete filteredModifier.fontPosition
    
    const merged = {
        ...baseValue,
        ...filteredModifier
    }
    
    // Convert to Figma compatible format with resolved references
    return convertToFigmaCompatibleFormat(merged, allTokens)
}

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
        
        // Filter out figureStyle and fontPosition tokens - not supported by Tokens Studio
        if (token.path && (token.path.includes('figureStyle') || token.path.includes('fontPosition'))) {
            return null // Signal that this token should be excluded
        }
        
        // Filter out fontStyle, textDecoration, and letterCase primitive tokens - not used as variables in Figma
        if (token.path && (
            token.path.includes('fontStyle') || 
            token.path.includes('textDecoration') || 
            token.path.includes('letterCase')
        )) {
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
            
            // Filter out figureStyle and fontPosition properties from typography tokens - not supported by Tokens Studio
            if (typeof tokenValue === 'object' && tokenValue !== null) {
                const filteredValue = { ...tokenValue as Record<string, unknown> }
                delete filteredValue.figureStyle
                delete filteredValue.fontPosition
                
                // Convert to Figma compatible format with resolved references
                tokenValue = convertToFigmaCompatibleFormat(filteredValue, allTokens)
                
                // If the token value is now empty after filtering, exclude this token entirely
                if (Object.keys(tokenValue as Record<string, unknown>).length === 0) {
                    return null // Signal that this token should be excluded
                }
            }
            
            tokenResult[valueKey] = tokenValue
        } else {
            // For all other tokens or fontFamily tokens with references, use existing logic
            tokenResult[usesDtcg ? '$type' : 'type'] = token.$type
            
            // Add the value (original reference if it uses references, otherwise resolved)
            const valueKey = usesDtcg ? '$value' : 'value'
            let tokenValue = originalValue !== undefined && usesReferences(originalValue) 
                ? originalValue 
                : (usesDtcg ? token.$value : token.value)
            
            // Apply Tokens Studio format fixes for primitive tokens
            if (typeof tokenValue === 'string') {
                if (tokenValue === 'underline solid') {
                    tokenValue = 'underline'
                } else if (tokenValue === 'line-through') {
                    tokenValue = 'strike-through'
                }
            }
            
            tokenResult[valueKey] = tokenValue
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

// Helper function to convert font weight values to Figma-compatible strings
function convertFontWeight(value: string | number): string {
    if (value in FONT_WEIGHT_MAP) {
        return FONT_WEIGHT_MAP[value]
    }
    return String(value) // Fallback to original value
}

// Function to generate combined font weight + italic tokens for Figma/Tokens Studio
function generateCombinedFontWeights(typography: Record<string, unknown>, usesDtcg: boolean): Record<string, unknown> {
    const weight = typography.weight as Record<string, unknown>
    if (!weight || typeof weight !== 'object') return typography
    
    const newWeights: Record<string, unknown> = {}
    
    // Copy existing weights and convert values
    for (const [name, token] of Object.entries(weight)) {
        if (typeof token === 'object' && token !== null) {
            const tokenValue = (token as any)[usesDtcg ? '$value' : 'value']
            const convertedValue = convertFontWeight(tokenValue)
            
            newWeights[name] = {
                ...token,
                [usesDtcg ? '$value' : 'value']: convertedValue
            }
            
            // Generate italic variant
            newWeights[`${name}Italic`] = {
                [usesDtcg ? '$type' : 'type']: 'fontWeights',
                [usesDtcg ? '$value' : 'value']: `${convertedValue} Italic`
            }
        }
    }
    
    return {
        ...typography,
        weight: newWeights
    }
}

// Function to generate combinations of base styles with modifiers for Figma
function generateFigmaCombinations(tokens: Record<string, unknown>, usesDtcg: boolean, allTokens?: Record<string, unknown>): Record<string, unknown> {
    const result = { ...tokens }
    
    // Find all typography tokens
    const typography = result.typography as Record<string, unknown>
    if (!typography || typeof typography !== 'object') return result
    
    const text = typography.text as Record<string, unknown>
    if (!text || typeof text !== 'object') return result
    
    // Identify base styles and modifiers
    const baseStyles: Array<{ name: string, tokens: Record<string, any> }> = []
    const modifiers: Array<{ name: string, token: any }> = []
    
    for (const [name, token] of Object.entries(text)) {
        if (typeof token === 'object' && token !== null) {
            // Check if this is a direct modifier token
            if (isModifier(token)) {
                modifiers.push({ name, token })
            } else if (typeof token === 'object' && 'default' in token) {
                // This is a base style group (like primary, secondary) with default/bold variants
                baseStyles.push({ name, tokens: token as Record<string, any> })
            }
        }
    }
    
    // Generate combinations for each base style
    const newText: Record<string, unknown> = {}
    
    // Add base styles with their combinations
    for (const { name: baseName, tokens: baseTokens } of baseStyles) {
        const baseGroup: Record<string, unknown> = {}
        
        // Copy existing variants (default, bold, etc.)
        for (const [variantName, variantToken] of Object.entries(baseTokens)) {
            baseGroup[variantName] = variantToken
        }
        
        // Add combinations with each supported modifier for the default version
        const defaultToken = baseTokens.default
        if (defaultToken && typeof defaultToken === 'object') {
            for (const { name: modifierName, token: modifierToken } of modifiers) {
                // Use the original modifier value to preserve references
                const modifierValue = modifierToken.original?.$value || modifierToken.original?.value || modifierToken.$value || modifierToken.value
                
                // Skip modifiers with only unsupported properties
                const filteredModifier = { ...modifierValue }
                delete filteredModifier.figureStyle
                delete filteredModifier.fontPosition
                
                if (Object.keys(filteredModifier).length > 0) {
                    // Use the original value to preserve references for base style too
                    const baseValue = defaultToken.original?.$value || defaultToken.original?.value || defaultToken.$value || defaultToken.value
                    
                    let combinedValue: Record<string, unknown>
                    
                    // Special handling for italic modifier - use combined font weight instead of separate fontStyle
                    if (modifierName === 'italic' && 'fontStyle' in filteredModifier) {
                        combinedValue = { ...baseValue }
                        
                        // Replace fontWeight reference with italic variant
                        if ('fontWeight' in combinedValue) {
                            const fontWeightRef = combinedValue.fontWeight as string
                            if (typeof fontWeightRef === 'string' && fontWeightRef.startsWith('{typography.weight.')) {
                                // Convert {typography.weight.regular} to {typography.weight.regularItalic}
                                const weightName = fontWeightRef.replace('{typography.weight.', '').replace('}', '')
                                combinedValue.fontWeight = `{typography.weight.${weightName}Italic}`
                            }
                        }
                        
                        // Don't add fontStyle property for Figma/Tokens Studio
                        // Still process through conversion in case there are other properties to convert
                        combinedValue = convertToFigmaCompatibleFormat(combinedValue, allTokens)
                    } else {
                        // For non-italic modifiers, use regular merging
                        combinedValue = mergeStyleWithModifier(baseValue, filteredModifier, allTokens)
                    }
                    
                    baseGroup[modifierName] = {
                        [usesDtcg ? '$type' : 'type']: 'typography',
                        [usesDtcg ? '$value' : 'value']: combinedValue,
                        // Preserve original for reference handling
                        original: {
                            [usesDtcg ? '$value' : 'value']: combinedValue
                        }
                    }
                }
            }
        }
        
        newText[baseName] = baseGroup
    }
    
    // Update the text section
    const newTypography = { ...typography, text: newText }
    return { ...result, typography: newTypography }
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
        
        let processedTokens = { ...dictionary.tokens }
        
        // First, generate combined font weight + italic tokens
        if (processedTokens.typography && typeof processedTokens.typography === 'object') {
            processedTokens = {
                ...processedTokens,
                typography: generateCombinedFontWeights(
                    processedTokens.typography as Record<string, unknown>, 
                    usesDtcg
                ) as any
            }
        }
        
        // Then generate combinations with the new font weights
        const tokensWithCombinations = generateFigmaCombinations(processedTokens, usesDtcg, processedTokens)
        
        return JSON.stringify(
            minifyDictionaryFigmaTypography(tokensWithCombinations, usesDtcg, tokensWithCombinations), 
            null, 
            2
        ) + '\n'
    },
}