import type {
    Dictionary,
    Format,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import type {
    FormatterOptions,
    TypographyConfig,
    TypographyToken,
    TypographyValue,
} from "../../types/typography.types"
import { getTokenValue } from "../../utils/token.util"

const DEFAULT_TYPOGRAPHY_CONFIG: TypographyConfig = {
    semanticRules: [
        // Headings h1-h6
        {
            selector: "h1",
            condition: (t) => hasTypographyVariant(t, ["heading", "1"]),
        },
        {
            selector: "h2",
            condition: (t) => hasTypographyVariant(t, ["heading", "2"]),
        },
        {
            selector: "h3",
            condition: (t) => hasTypographyVariant(t, ["heading", "3"]),
        },
        {
            selector: "h4",
            condition: (t) => hasTypographyVariant(t, ["heading", "4"]),
        },
        {
            selector: "h5",
            condition: (t) => hasTypographyVariant(t, ["heading", "5"]),
        },
        {
            selector: "h6",
            condition: (t) => hasTypographyVariant(t, ["heading", "6"]),
        },

        // Display heading
        {
            selector: "h1.display",
            condition: (t) => hasTypographyVariant(t, ["heading", "display"]),
        },

        // Text variants
        { selector: "p", condition: (t) => hasTypographyVariant(t, ["text", "primary"]) },
        {
            selector: "p.text-secondary",
            condition: (t) => hasTypographyVariant(t, ["text", "secondary"]),
        },
        {
            selector: "p.text-tertiary",
            condition: (t) => hasTypographyVariant(t, ["text", "tertiary"]),
        },
    ],
    utilityPrefix: "typography",
}

// Helper function to check if token has a typography variant in its path
function hasTypographyVariant(token: TransformedToken, variantParts: string[]): boolean {
    const path = token.path || []
    
    // Find if the variant parts exist consecutively in the path
    for (let i = 0; i <= path.length - variantParts.length; i++) {
        const matches = variantParts.every((part, idx) => path[i + idx] === part)
        if (matches) {
            const variantEndIndex = i + variantParts.length - 1
            
            // Case 1: variant is at the end (e.g., text.primary) - single token, no variants
            if (variantEndIndex === path.length - 1) {
                return true
            }
            
            // Case 2: variant is followed by "default" (e.g., text.primary.default) - base of variant group
            if (variantEndIndex === path.length - 2 && path[path.length - 1] === "default") {
                return true
            }
        }
    }
    
    return false
}

// Function to separate default tokens and variant tokens
function separateTokensByType(tokens: TypographyToken[]): {
    baseTokens: TypographyToken[]
    variantTokens: TypographyToken[]
} {
    const baseTokens: TypographyToken[] = []
    const variantTokens: TypographyToken[] = []
    
    for (const token of tokens) {
        const path = token.path || []
        if (path.length === 0) continue
        
        const lastSegment = path[path.length - 1]
        
        if (lastSegment === "default") {
            // This is a default token - create base token without "default" suffix
            const baseToken: TypographyToken = {
                ...token,
                name: token.name.replace('-default', ''),
                path: path.slice(0, -1)
            }
            baseTokens.push(baseToken)
        } else if (path.length > 1) {
            // Check if this is a variant of a nested group (has a corresponding default)
            const defaultPath = [...path.slice(0, -1), "default"]
            const hasDefault = tokens.some(t => 
                t.path?.length === defaultPath.length &&
                t.path.every((segment, i) => segment === defaultPath[i])
            )
            
            if (hasDefault) {
                // This is a variant token
                variantTokens.push(token)
            } else {
                // Single token (no variants)
                baseTokens.push(token)
            }
        } else {
            // Single token (no variants)
            baseTokens.push(token)
        }
    }
    
    return { baseTokens, variantTokens }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const FILE_HEADER =
    "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

const CSS_PROPERTY_MAP: Record<string, string> = {
    fontFamily: "font-family",
    fontSize: "font-size",
    fontWeight: "font-weight",
    lineHeight: "line-height",
    letterSpacing: "letter-spacing",
    fontStyle: "font-style",
    textDecoration: "text-decoration",
    letterCase: "font-variant-caps",
    figureStyle: "font-variant-numeric",
    fontPosition: "vertical-align",
}

// ============================================================================
// TOKEN CLASSIFICATION
// ============================================================================

class TokenClassifier {
    static isTypography(token: TransformedToken): token is TypographyToken {
        return token.$type === "typography"
    }

    static isPrimitive(token: TransformedToken): boolean {
        // Check if the token comes from a primitive file path
        // but exclude dimension tokens (they're included for references only)
        return (
            token.filePath.includes("/primitive/") &&
            token.$type !== "dimension"
        )
    }

    static isComposite(token: TypographyToken): boolean {
        return typeof token.$value === "object" && token.$value !== null
    }

}

// ============================================================================
// CSS GENERATORS
// ============================================================================

class CSSGenerator {
    private readonly CSS_REFERENCE_FORMAT = "var(--{name})"

    constructor(
        private dictionary: Dictionary,
        private usesDtcg: boolean,
        private outputReferences: OutputReferences
    ) {}

    // Generate CSS properties from a typography token
    expandProperties(token: TypographyToken): string {
        const properties: string[] = []
        const value = token.$value

        for (const [tokenProp, cssProp] of Object.entries(CSS_PROPERTY_MAP)) {
            const propValue = value[tokenProp as keyof TypographyValue]
            if (!propValue) continue

            const originalValue = this.usesDtcg
                ? token.original.$value?.[tokenProp as keyof TypographyValue]
                : token.original.value?.[tokenProp as keyof TypographyValue]

            const tempToken: TransformedToken = {
                ...token,
                $value: propValue,
                value: propValue,
                original: {
                    ...token.original,
                    $value: originalValue || propValue,
                    value: originalValue || propValue,
                },
            }

            const cssValue = getTokenValue(
                tempToken,
                this.dictionary,
                this.usesDtcg,
                this.outputReferences,
                this.CSS_REFERENCE_FORMAT
            )

            properties.push(`${cssProp}: ${cssValue}`)
        }

        return properties.join(";\n  ")
    }

    // Generate CSS custom properties for primitive tokens
    generateCustomProperties(tokens: TransformedToken[]): string {
        if (tokens.length === 0) return ""

        const properties = tokens
            .map((token) => {
                const value = getTokenValue(
                    token,
                    this.dictionary,
                    this.usesDtcg,
                    this.outputReferences,
                    this.CSS_REFERENCE_FORMAT
                )
                return `  --${token.name}: ${value};`
            })
            .join("\n")

        return `:root {\n${properties}\n}\n\n`
    }

    // Generate utility class for a token
    generateUtilityClass(
        token: TypographyToken,
        config: TypographyConfig
    ): string {
        const prefix = config.utilityPrefix || "typography"
        const className = token.name.replace(new RegExp(`^.*?-${prefix}-`), "")
        const properties = this.expandProperties(token)
        return `.${className} {\n  ${properties};\n}\n`
    }

    // Generate semantic element styles
    generateSemanticStyles(
        tokens: TypographyToken[],
        config: TypographyConfig
    ): string {
        if (!config.semanticRules) return ""

        const styles: string[] = []

        for (const token of tokens) {
            for (const rule of config.semanticRules) {
                if (rule.condition(token)) {
                    const properties = this.expandProperties(token)
                    styles.push(`${rule.selector} {\n  ${properties};\n}`)
                    break // Only apply first matching rule
                }
            }
        }

        return styles.join("\n") + (styles.length > 0 ? "\n" : "")
    }


    // Generate modifier classes for variant tokens
    generateVariantModifierClasses(
        baseTokens: TypographyToken[],
        variantTokens: TypographyToken[],
        config: TypographyConfig
    ): string {
        if (variantTokens.length === 0) return ""

        const styles: string[] = []
        const prefix = config.utilityPrefix || "typography"

        for (const variantToken of variantTokens) {
            const path = variantToken.path || []
            if (path.length === 0) continue

            const variantName = path[path.length - 1]
            const basePath = path.slice(0, -1)
            
            // Find the corresponding base token
            const baseToken = baseTokens.find(base => 
                base.path?.length === basePath.length &&
                base.path.every((segment, i) => segment === basePath[i])
            )

            if (!baseToken) continue

            // Generate base class name from the base token for utility classes
            const baseClassName = baseToken.name.replace(new RegExp(`^.*?-${prefix}-`), "")
            
            // Generate only the properties that are different from default
            const properties: string[] = []
            const value = variantToken.$value

            for (const [tokenProp, cssProp] of Object.entries(CSS_PROPERTY_MAP)) {
                const propValue = value[tokenProp as keyof TypographyValue]
                if (!propValue) continue

                const originalValue = this.usesDtcg
                    ? variantToken.original.$value?.[tokenProp as keyof TypographyValue]
                    : variantToken.original.value?.[tokenProp as keyof TypographyValue]

                const tempToken: TransformedToken = {
                    ...variantToken,
                    $value: propValue,
                    value: propValue,
                    original: {
                        ...variantToken.original,
                        $value: originalValue || propValue,
                        value: originalValue || propValue,
                    },
                }

                const cssValue = getTokenValue(
                    tempToken,
                    this.dictionary,
                    this.usesDtcg,
                    this.outputReferences,
                    this.CSS_REFERENCE_FORMAT
                )

                properties.push(`${cssProp}: ${cssValue}`)
            }

            if (properties.length > 0) {
                // Generate utility class modifier
                styles.push(
                    `.${baseClassName}.${variantName} {\n  ${properties.join(";\n  ")};\n}`
                )

                // Also generate semantic element modifiers if this base token matches a semantic rule
                if (config.semanticRules) {
                    for (const rule of config.semanticRules) {
                        if (rule.condition(baseToken)) {
                            styles.push(
                                `${rule.selector}.${variantName} {\n  ${properties.join(";\n  ")};\n}`
                            )
                            break // Only apply first matching rule
                        }
                    }
                }
            }
        }

        return styles.join("\n") + (styles.length > 0 ? "\n" : "")
    }
}

// ============================================================================
// MAIN FORMATTER
// ============================================================================

export const cssTypographyFormat: Format = {
    name: "css/typography",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: FormatterOptions
    }) => {
        // Extract options with defaults
        const {
            categoryFilter,
            outputReferences = false,
            usesDtcg = false,
            typography = DEFAULT_TYPOGRAPHY_CONFIG,
        } = options || {}

        // Filter and classify tokens
        const allTokens = categoryFilter
            ? dictionary.allTokens.filter(categoryFilter)
            : dictionary.allTokens

        const primitiveTokens = allTokens.filter(TokenClassifier.isPrimitive)
        const typographyTokens = allTokens.filter(
            TokenClassifier.isTypography
        ) as TypographyToken[]
        const compositeTokens = typographyTokens.filter(
            TokenClassifier.isComposite
        )

        // Separate base tokens and variant tokens
        const { baseTokens, variantTokens } = separateTokensByType(compositeTokens)

        // Check if we have any tokens to process
        if (primitiveTokens.length === 0 && compositeTokens.length === 0) {
            return ""
        }

        // Initialize CSS generator
        const generator = new CSSGenerator(
            dictionary,
            usesDtcg,
            outputReferences
        )

        // Build CSS output
        const sections: string[] = [FILE_HEADER]

        // 1. Custom properties for primitives
        const customProps = generator.generateCustomProperties(primitiveTokens)
        if (customProps) sections.push(customProps)

        // 2. Semantic HTML elements
        const semanticStyles = generator.generateSemanticStyles(
            baseTokens,
            typography
        )
        if (semanticStyles) {
            sections.push("/* Semantic HTML elements */\n" + semanticStyles)
        }

        // 3. Utility classes
        if (baseTokens.length > 0) {
            sections.push(
                "/* Typography utility classes */\n" +
                    baseTokens
                        .map((t) =>
                            generator.generateUtilityClass(t, typography)
                        )
                        .join("")
            )
        }

        // 4. Variant modifier classes
        const variantModifiers = generator.generateVariantModifierClasses(
            baseTokens,
            variantTokens,
            typography
        )
        if (variantModifiers) {
            sections.push("/* Variant modifier classes */\n" + variantModifiers)
        }

        return sections.join("\n")
    },
}
