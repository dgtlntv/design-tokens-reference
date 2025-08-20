import type {
    Dictionary,
    Format,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { getTokenValue } from "../../utils/token.util"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TypographyValue {
    fontFamily?: string
    fontSize?: string | number
    fontWeight?: string | number
    lineHeight?: string | number
    letterSpacing?: string | number
    fontStyle?: string
    textDecoration?: string
    letterCase?: string
    figureStyle?: string
    fontPosition?: string
}

interface TypographyToken extends TransformedToken {
    $type: "typography"
    $value: TypographyValue
    value: TypographyValue
}

interface SemanticRule {
    selector: string
    condition: (token: TypographyToken) => boolean
}

interface TypographyConfig {
    semanticRules?: SemanticRule[]
    utilityPrefix?: string
    boldSuffix?: string
    boldModifierClass?: string
}

interface FormatterOptions {
    // Filter for tokens
    categoryFilter?: (token: TransformedToken) => boolean

    // CSS output options
    outputReferences?: OutputReferences
    usesDtcg?: boolean

    // Typography specific configuration
    typography?: TypographyConfig
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_TYPOGRAPHY_CONFIG: TypographyConfig = {
    semanticRules: [
        // Headings h1-h6
        {
            selector: "h1",
            condition: (t) => t.name.endsWith("heading-1") ?? false,
        },
        {
            selector: "h2",
            condition: (t) => t.name.endsWith("heading-2") ?? false,
        },
        {
            selector: "h3",
            condition: (t) => t.name.endsWith("heading-3") ?? false,
        },
        {
            selector: "h4",
            condition: (t) => t.name.endsWith("heading-4") ?? false,
        },
        {
            selector: "h5",
            condition: (t) => t.name.endsWith("heading-5") ?? false,
        },
        {
            selector: "h6",
            condition: (t) => t.name.endsWith("heading-6") ?? false,
        },

        // Display heading
        {
            selector: "h1.display",
            condition: (t) => t.name.endsWith("-heading-display"),
        },

        // Text variants
        { selector: "p", condition: (t) => t.name.endsWith("-text-primary") },
        {
            selector: "p.text-secondary",
            condition: (t) => t.name.endsWith("-text-secondary"),
        },
        {
            selector: "p.text-tertiary",
            condition: (t) => t.name.endsWith("-text-tertiary"),
        },
    ],
    utilityPrefix: "typography",
    boldSuffix: "-bold",
    boldModifierClass: "text-bold",
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
        return token.filePath.includes('/primitive/') && token.$type !== 'dimension'
    }

    static isComposite(token: TypographyToken): boolean {
        return typeof token.$value === "object" && token.$value !== null
    }

    static isBoldVariant(
        token: TypographyToken,
        config: TypographyConfig
    ): boolean {
        const suffix = config.boldSuffix || "-bold"
        const lastSegment = token.path?.[token.path.length - 1] || ""
        return lastSegment.endsWith(suffix)
    }

    static getBaseName(
        token: TypographyToken,
        config: TypographyConfig
    ): string {
        const suffix = config.boldSuffix || "-bold"
        const lastSegment = token.path?.[token.path.length - 1] || ""
        return lastSegment.endsWith(suffix)
            ? lastSegment.slice(0, -suffix.length)
            : lastSegment
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

    // Generate bold element styles for semantic HTML
    generateBoldSemanticStyles(
        baseTokens: TypographyToken[],
        boldTokens: TypographyToken[],
        config: TypographyConfig
    ): string {
        if (!config.semanticRules || boldTokens.length === 0) return ""

        // Create mapping of base names to bold tokens
        const boldMap = new Map<string, TypographyToken>()
        for (const boldToken of boldTokens) {
            const baseName = TokenClassifier.getBaseName(boldToken, config)
            boldMap.set(baseName, boldToken)
        }

        const styles: string[] = []

        for (const baseToken of baseTokens) {
            const baseName = TokenClassifier.getBaseName(baseToken, config)
            const boldToken = boldMap.get(baseName)

            if (!boldToken?.$value.fontWeight) continue

            // Find matching semantic rule
            const rule = config.semanticRules.find((r) =>
                r.condition(baseToken)
            )
            if (!rule) continue

            const fontWeight = getTokenValue(
                {
                    ...boldToken,
                    $value: boldToken.$value.fontWeight!,
                    value: boldToken.$value.fontWeight!,
                },
                this.dictionary,
                this.usesDtcg,
                this.outputReferences,
                this.CSS_REFERENCE_FORMAT
            )

            styles.push(
                `${rule.selector} strong, ${rule.selector} b {\n  font-weight: ${fontWeight};\n}`
            )
        }

        return styles.join("\n") + (styles.length > 0 ? "\n" : "")
    }

    // Generate compound modifier classes for bold variants
    generateBoldModifierClasses(
        baseTokens: TypographyToken[],
        boldTokens: TypographyToken[],
        config: TypographyConfig
    ): string {
        if (boldTokens.length === 0) return ""

        // Create mapping of base names to bold tokens
        const boldMap = new Map<string, TypographyToken>()
        for (const boldToken of boldTokens) {
            const baseName = TokenClassifier.getBaseName(boldToken, config)
            boldMap.set(baseName, boldToken)
        }

        const styles: string[] = []
        const prefix = config.utilityPrefix || "typography"
        const modifierClass = config.boldModifierClass || "text-bold"

        for (const baseToken of baseTokens) {
            const baseName = TokenClassifier.getBaseName(baseToken, config)
            const boldToken = boldMap.get(baseName)

            if (!boldToken?.$value.fontWeight) continue

            const className = baseToken.name.replace(
                new RegExp(`^.*?-${prefix}-`),
                ""
            )
            const fontWeight = getTokenValue(
                {
                    ...boldToken,
                    $value: boldToken.$value.fontWeight!,
                    value: boldToken.$value.fontWeight!,
                },
                this.dictionary,
                this.usesDtcg,
                this.outputReferences,
                this.CSS_REFERENCE_FORMAT
            )

            styles.push(
                `.${className}.${modifierClass} {\n  font-weight: ${fontWeight};\n}`
            )
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

        // Separate base and bold tokens
        const baseTokens = compositeTokens.filter(
            (t) => !TokenClassifier.isBoldVariant(t, typography)
        )
        const boldTokens = compositeTokens.filter((t) =>
            TokenClassifier.isBoldVariant(t, typography)
        )

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

        // 3. Bold semantic elements
        const boldSemanticStyles = generator.generateBoldSemanticStyles(
            baseTokens,
            boldTokens,
            typography
        )
        if (boldSemanticStyles) {
            sections.push(
                "/* Semantic bold elements (strong, b) */\n" +
                    boldSemanticStyles
            )
        }

        // 4. Utility classes
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

        // 5. Bold modifier classes
        const boldModifiers = generator.generateBoldModifierClasses(
            baseTokens,
            boldTokens,
            typography
        )
        if (boldModifiers) {
            sections.push("/* Bold modifier classes */\n" + boldModifiers)
        }

        return sections.join("\n")
    },
}
