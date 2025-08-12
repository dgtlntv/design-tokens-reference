import type { Dictionary, Format, LocalOptions, TransformedToken, OutputReferences } from "style-dictionary/types"
import { getPlatform } from "../../config"
import type { CSSPlatformOptions } from "../../types/platform.types"
import { getTokenValue } from "../../utils/token.util"

const FILE_HEADER =
    "/**\n * Typography utilities and semantic styling\n * Do not edit directly, this file was auto-generated.\n */\n\n"

interface TypographyValue {
    fontFamily?: string
    fontSize?: string
    fontWeight?: string
    lineHeight?: string
    letterSpacing?: string
    fontStyle?: string
    textDecoration?: string
    letterCase?: string
    figureStyle?: string
    fontPosition?: string
}

interface TypographyToken extends TransformedToken {
    $value: TypographyValue
    value: TypographyValue
}

function isTypographyToken(token: TransformedToken): token is TypographyToken {
    return token.$type === "typography" || token.type === "typography"
}

function isPrimitiveTypographyToken(token: TransformedToken): boolean {
    return (
        token.$type === "fontFamily" || token.type === "fontFamily" ||
        token.$type === "fontWeight" || token.type === "fontWeight" ||
        token.$type === "fontStyle" || token.type === "fontStyle" ||
        // Check path for other typography primitives
        (token.path && token.path.length > 0 && token.path[0] === "typography" && 
         (token.path.includes("textDecoration") || 
          token.path.includes("letterCase") || 
          token.path.includes("fontPosition") || 
          token.path.includes("figureStyle") || 
          token.path.includes("fontStyle")))
    )
}

function isCompositeTypographyToken(token: TypographyToken): boolean {
    const value = token.$value || token.value
    return typeof value === 'object' && value !== null
}


function expandTypographyProperties(
    token: TypographyToken, 
    dictionary: Dictionary, 
    usesDtcg: boolean, 
    outputReferences: OutputReferences
): string {
    const value = token.$value || token.value
    const properties: string[] = []
    const tokenConfig = getPlatform("css")?.options?.tokenConfig
    
    // Property mappings for CSS output
    const propertyMappings: Record<string, string> = {
        fontFamily: 'font-family',
        fontSize: 'font-size',
        fontWeight: 'font-weight',
        lineHeight: 'line-height',
        letterSpacing: 'letter-spacing',
        fontStyle: 'font-style',
        textDecoration: 'text-decoration',
        letterCase: 'font-variant-caps',
        figureStyle: 'font-variant-numeric',
        fontPosition: 'vertical-align'
    }
    
    for (const [tokenProp, cssProperty] of Object.entries(propertyMappings)) {
        if (value[tokenProp as keyof TypographyValue]) {
            const propValue = value[tokenProp as keyof TypographyValue]!
            
            // Create a temporary token for this property with the original reference value
            const originalPropValue = usesDtcg 
                ? token.original.$value?.[tokenProp as keyof TypographyValue]
                : token.original.value?.[tokenProp as keyof TypographyValue]
            
            const propToken: TransformedToken = {
                ...token,
                $value: propValue,
                value: propValue,
                original: {
                    ...token.original,
                    $value: originalPropValue || propValue,
                    value: originalPropValue || propValue
                }
            }
            
            // Use getTokenValue like other formatters to respect outputReferences
            const cssValue = getTokenValue(propToken, dictionary, usesDtcg, outputReferences, tokenConfig)
            properties.push(`${cssProperty}: ${cssValue}`)
        }
    }
    
    return properties.join(';\n  ')
}

function generateUtilityClass(
    token: TypographyToken, 
    dictionary: Dictionary, 
    usesDtcg: boolean, 
    outputReferences: OutputReferences
): string {
    // Simple class name from token name  
    const className = token.name.replace(/^.*?-typography-/, '')
    
    return `.${className} {\n  ${expandTypographyProperties(token, dictionary, usesDtcg, outputReferences)};\n}\n`
}

export const cssTypographyFormat: Format = {
    name: "css/typography",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: LocalOptions
    }) => {
        const cssConfig = getPlatform("css")
        const defaultOptions: Partial<CSSPlatformOptions> =
            cssConfig?.options || {}

        const {
            outputReferences = defaultOptions.outputReferences || false,
            usesDtcg = false,
        } = options || {}

        // Filter for composite typography tokens and primitive typography tokens
        const typographyTokens = dictionary.allTokens
            .filter(isTypographyToken) as TypographyToken[]
        
        const primitiveTypographyTokens = dictionary.allTokens
            .filter(isPrimitiveTypographyToken)

        if (typographyTokens.length === 0 && primitiveTypographyTokens.length === 0) {
            return ""
        }

        let css = FILE_HEADER
        const tokenConfig = cssConfig?.options?.tokenConfig
        
        // Generate CSS custom properties for primitive typography tokens
        if (primitiveTypographyTokens.length > 0) {
            css += ":root {\n"
            primitiveTypographyTokens.forEach(token => {
                css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
            })
            css += "}\n\n"
        }
        
        // Generate utility classes for composite tokens
        css += "/* Typography utility classes */\n"
        typographyTokens
            .filter(token => isCompositeTypographyToken(token))
            .forEach(token => {
                css += generateUtilityClass(token, dictionary, usesDtcg, outputReferences)
            })

        return css
    },
}