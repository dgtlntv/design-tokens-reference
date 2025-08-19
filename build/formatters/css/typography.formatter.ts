import type {
    Dictionary,
    Format,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { getPlatform } from "../../config"
import type { 
    CSSTypographyConfig, 
    CSSPlatformOptions, 
    ExtendedLocalOptions, 
    TypographyValue, 
    TypographyToken 
} from "../../types"
import { getTokenValue } from "../../utils/token.util"

/**
 * Standard file header for generated typography CSS files.
 */
const FILE_HEADER =
    "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

/**
 * Type guard to check if a token is a composite typography token.
 * Typography tokens contain multiple font-related properties in a single token.
 *
 * @param token - Token to check
 * @returns True if the token is a typography token
 */
function isTypographyToken(token: TransformedToken): token is TypographyToken {
    return token.$type === "typography"
}

/**
 * Checks if a typography token is a bold variant based on configuration.
 * Bold variant tokens contain only fontWeight properties and are meant
 * to be used in combination with their base tokens.
 *
 * @param token - Typography token to check
 * @param config - Typography configuration with bold variant settings
 * @returns True if the token is a bold variant
 */
function isBoldVariantToken(token: TypographyToken, config?: CSSTypographyConfig): boolean {
    if (!config?.boldVariants) return false
    
    const tokenPath = token.path || []
    const lastPathSegment = tokenPath[tokenPath.length - 1]
    return config.boldVariants.isVariantToken(lastPathSegment || "", config.boldVariants.tokenSuffix)
}

/**
 * Extracts the base token name from a bold variant token using configuration.
 * For example, with suffix '-bold': 'primary-bold' returns 'primary'.
 *
 * @param boldVariantToken - Bold variant token
 * @param config - Typography configuration with bold variant settings
 * @returns Base token name without the variant suffix
 */
function extractBaseTokenNameFromVariant(boldVariantToken: TypographyToken, config: CSSTypographyConfig): string {
    const tokenPath = boldVariantToken.path || []
    const lastPathSegment = tokenPath[tokenPath.length - 1]
    return config.boldVariants.extractBaseName(lastPathSegment || "", config.boldVariants.tokenSuffix)
}

/**
 * Checks if a token is a primitive typography token.
 * Primitive typography tokens contain a single typography property (fontFamily, fontWeight, etc.)
 * rather than a composite object with multiple properties.
 *
 * @param token - Token to check
 * @returns True if the token is a primitive typography token
 */
function isPrimitiveTypographyToken(token: TransformedToken): boolean {
    return (
        token.$type === "fontFamily" ||
        token.$type === "fontWeight" ||
        token.$type === "fontStyle" ||
        // Check path for other typography primitives
        (token.path &&
            token.path.length > 0 &&
            token.path[0] === "typography" &&
            (token.path.includes("textDecoration") ||
                token.path.includes("letterCase") ||
                token.path.includes("fontPosition") ||
                token.path.includes("figureStyle") ||
                token.path.includes("fontStyle")))
    )
}

/**
 * Checks if a typography token contains composite (multiple) properties.
 * Composite tokens have an object value with multiple typography properties.
 *
 * @param token - Typography token to check
 * @returns True if the token contains multiple typography properties
 */
function isCompositeTypographyToken(token: TypographyToken): boolean {
    const value = token.$value
    return typeof value === "object" && value !== null
}

/**
 * Expands a composite typography token into individual CSS property declarations.
 * This function takes a typography token with multiple properties and converts each
 * property to its corresponding CSS declaration with proper value resolution.
 *
 * @param token - The composite typography token to expand
 * @param dictionary - Style Dictionary dictionary for reference resolution
 * @param usesDtcg - Whether to use DTCG token format
 * @param outputReferences - Whether to output CSS custom property references
 * @returns String of CSS property declarations separated by semicolons and newlines
 *
 * @example
 * ```typescript
 * const token = {
 *   $type: 'typography',
 *   $value: { fontFamily: 'Arial', fontSize: '16px', fontWeight: 700 }
 * };
 * const css = expandTypographyProperties(token, dictionary, true, true);
 * // Returns: "font-family: Arial;\n  font-size: 16px;\n  font-weight: 700"
 * ```
 */
function expandTypographyProperties(
    token: TypographyToken,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences
): string {
    const value = token.$value
    const properties: string[] = []
    const tokenConfig = getPlatform("css")?.options?.tokenConfig

    // Property mappings for CSS output
    const propertyMappings: Record<string, string> = {
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
                    value: originalPropValue || propValue,
                },
            }

            const cssValue = getTokenValue(
                propToken,
                dictionary,
                usesDtcg,
                outputReferences,
                tokenConfig
            )

            properties.push(`${cssProperty}: ${cssValue}`)
        }
    }

    return properties.join(";\n  ")
}

/**
 * Generates a CSS utility class for a typography token.
 * Creates a reusable CSS class that applies all typography properties from the token.
 *
 * @param token - The typography token to create a utility class for
 * @param dictionary - Style Dictionary dictionary for reference resolution
 * @param usesDtcg - Whether to use DTCG token format
 * @param outputReferences - Whether to output CSS custom property references
 * @param config - Typography configuration for class naming and customization
 * @returns CSS utility class as a string
 *
 * @example
 * ```typescript
 * const utilityClass = generateUtilityClass(headingToken, dictionary, true, true, config);
 * // Returns: ".heading-1 {\n  font-family: Arial;\n  font-size: 24px;\n  font-weight: 700;\n}"
 * ```
 */
function generateUtilityClass(
    token: TypographyToken,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    config?: CSSTypographyConfig
): string {
    // Use config's nameTransform if available
    const className = config?.utilities.nameTransform
        ? config.utilities.nameTransform(token.name)
        : token.name.replace(/^.*?-typography-/, "")

    return `.${className} {\n  ${expandTypographyProperties(token, dictionary, usesDtcg, outputReferences)};\n}\n`
}

// generateBoldCustomProperties function removed - bold variants are now handled through semantic rules and compound classes

/**
 * Generates CSS rules for bold elements (strong, b) within semantic HTML elements.
 * Creates rules like 'h1 strong, h1 b { font-weight: bold; }' using the appropriate
 * bold variant token for each semantic element.
 *
 * @param baseTokens - Array of base typography tokens
 * @param boldTokens - Array of bold variant tokens  
 * @param dictionary - Style Dictionary dictionary for reference resolution
 * @param usesDtcg - Whether to use DTCG token format
 * @param outputReferences - Whether to output CSS custom property references
 * @param config - Typography configuration with semantic element mappings
 * @returns CSS rules for semantic bold elements
 */
function generateSemanticBoldRules(
    baseTokens: TypographyToken[],
    boldTokens: TypographyToken[],
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    config?: CSSTypographyConfig,
    tokenConfig?: any
): string {
    if (!config?.semanticElements || boldTokens.length === 0) return ""

    let css = ""
    
    // Create a map of base token names to their bold variants
    const boldTokenMap = new Map<string, TypographyToken>()
    boldTokens.forEach((boldToken) => {
        const baseTokenName = extractBaseTokenNameFromVariant(boldToken, config)
        boldTokenMap.set(baseTokenName, boldToken)
    })

    // Generate rules for semantic elements that have bold variants
    baseTokens.forEach((baseToken) => {
        const tokenPath = baseToken.path || []
        const tokenName = baseToken.name
        const lastPathSegment = tokenPath[tokenPath.length - 1]
        const boldToken = boldTokenMap.get(lastPathSegment || "")
        
        if (!boldToken || !boldToken.$value.fontWeight) return

        let selectors: string[] = []

        // Check custom elements first (they have priority)
        let matched = false
        for (const customElement of config.semanticElements.custom) {
            if (customElement.condition(tokenName)) {
                const baseSelector = customElement.elementTemplate
                selectors.push(`${baseSelector} strong`, `${baseSelector} b`)
                matched = true
                break // Stop after first match to avoid duplicates
            }
        }

        // Only check other configurations if no custom element matched
        if (!matched) {
            // Check headings configuration
            if (config.semanticElements.headings.condition(tokenName, tokenPath)) {
                const headingLevel = tokenPath[tokenPath.length - 1]
                const element = config.semanticElements.headings.elementTemplate.replace(
                    "{n}",
                    headingLevel
                )
                selectors.push(`${element} strong`, `${element} b`)
            }

            // Check text configuration
            if (config.semanticElements.text.condition(tokenName, tokenPath)) {
                const textVariant = tokenPath[tokenPath.length - 1]
                const element = config.semanticElements.text.elementTemplate.replace(
                    "{variant}",
                    textVariant
                )
                selectors.push(`${element} strong`, `${element} b`)
            }
        }

        if (selectors.length > 0) {
            const fontWeight = boldToken.$value.fontWeight!
            const cssValue = getTokenValue(
                { ...boldToken, $value: fontWeight, value: fontWeight },
                dictionary,
                usesDtcg,
                outputReferences,
                tokenConfig
            )
            css += `${selectors.join(", ")} {\n  font-weight: ${cssValue};\n}\n`
        }
    })
    
    return css
}

/**
 * Generates compound modifier classes for typography utility classes.
 * Creates rules like '.text-primary.text-bold { font-weight: 600; }' that allow
 * combining base typography classes with bold modifiers.
 *
 * @param baseTokens - Array of base typography tokens
 * @param boldTokens - Array of bold variant tokens
 * @param dictionary - Style Dictionary dictionary for reference resolution
 * @param usesDtcg - Whether to use DTCG token format
 * @param outputReferences - Whether to output CSS custom property references
 * @param config - Typography configuration
 * @returns CSS compound modifier classes
 */
function generateCompoundModifierClasses(
    baseTokens: TypographyToken[],
    boldTokens: TypographyToken[],
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    config?: CSSTypographyConfig,
    tokenConfig?: any
): string {
    if (boldTokens.length === 0 || !config?.boldVariants) return ""
    
    let css = ""
    
    // Create a map of base token names to their bold variants
    const boldTokenMap = new Map<string, TypographyToken>()
    boldTokens.forEach((boldToken) => {
        const baseTokenName = extractBaseTokenNameFromVariant(boldToken, config)
        boldTokenMap.set(baseTokenName, boldToken)
    })

    // Generate compound classes for base tokens that have bold variants
    baseTokens.forEach((baseToken) => {
        const tokenPath = baseToken.path || []
        const lastPathSegment = tokenPath[tokenPath.length - 1]
        const boldToken = boldTokenMap.get(lastPathSegment || "")
        
        if (!boldToken || !boldToken.$value.fontWeight) return

        // Generate utility class name using config's nameTransform if available
        const className = config?.utilities.nameTransform
            ? config.utilities.nameTransform(baseToken.name)
            : baseToken.name.replace(/^.*?-typography-/, "")

        const fontWeight = boldToken.$value.fontWeight!
        const cssValue = getTokenValue(
            { ...boldToken, $value: fontWeight, value: fontWeight },
            dictionary,
            usesDtcg,
            outputReferences,
            tokenConfig
        )
        
        const modifierClass = config.boldVariants.modifierClass
        css += `.${className}.${modifierClass} {\n  font-weight: ${cssValue};\n}\n`
    })
    
    return css
}

/**
 * Generates CSS rules for semantic HTML elements based on typography tokens.
 * This function creates CSS that targets semantic elements (h1-h6, p, etc.) directly,
 * allowing typography tokens to be applied automatically to HTML elements.
 *
 * @param token - The typography token to create semantic element styles for
 * @param dictionary - Style Dictionary dictionary for reference resolution
 * @param usesDtcg - Whether to use DTCG token format
 * @param outputReferences - Whether to output CSS custom property references
 * @param config - Typography configuration with semantic element mappings
 * @returns CSS rule for semantic elements, or empty string if no mapping exists
 *
 * @example
 * ```typescript
 * const semanticCSS = generateSemanticElement(headingToken, dictionary, true, true, config);
 * // Returns: "h1 {\n  font-family: Arial;\n  font-size: 32px;\n  font-weight: 700;\n}"
 * ```
 */
function generateSemanticElement(
    token: TypographyToken,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    config?: CSSTypographyConfig
): string {
    if (!config?.semanticElements) return ""

    const tokenPath = token.path || []
    const tokenName = token.name
    const properties = expandTypographyProperties(
        token,
        dictionary,
        usesDtcg,
        outputReferences
    )

    // Check custom elements first (they have higher priority)
    for (const customElement of config.semanticElements.custom) {
        if (customElement.condition(tokenName)) {
            return `${customElement.elementTemplate} {\n  ${properties};\n}\n`
        }
    }

    // Check headings configuration
    const headingsConfig = config.semanticElements.headings
    if (headingsConfig.condition(tokenName, tokenPath)) {
        const headingLevel = tokenPath[tokenPath.length - 1]
        const element = headingsConfig.elementTemplate.replace(
            "{n}",
            headingLevel
        )
        return `${element} {\n  ${properties};\n}\n`
    }

    // Check text configuration
    const textConfig = config.semanticElements.text
    if (textConfig.condition(tokenName, tokenPath)) {
        const textVariant = tokenPath[tokenPath.length - 1]
        const element = textConfig.elementTemplate.replace(
            "{variant}",
            textVariant
        )
        return `${element} {\n  ${properties};\n}\n`
    }

    return ""
}

/**
 * This formatter generates comprehensive CSS for typography tokens, supporting both
 * primitive typography tokens (single properties like fontFamily) and composite
 * typography tokens (multiple properties in one token). It can generate CSS custom
 * properties, utility classes, and semantic HTML element styles.
 */
export const cssTypographyFormat: Format = {
    name: "css/typography",
    format: ({
        dictionary,
        options,
    }: {
        dictionary: Dictionary
        options?: ExtendedLocalOptions
    }) => {
        const cssConfig = getPlatform("css")
        const defaultOptions: Partial<CSSPlatformOptions> =
            cssConfig?.options || {}

        const {
            outputReferences = defaultOptions.outputReferences || false,
            usesDtcg = false,
        } = options || {}

        // Use categoryFilter for initial broad filtering, then categorize
        const categoryFilter = options?.categoryFilter
        const candidateTokens = categoryFilter
            ? dictionary.allTokens.filter(categoryFilter)
            : dictionary.allTokens

        // Categorize the filtered tokens
        const typographyTokens = candidateTokens.filter(
            isTypographyToken
        ) as TypographyToken[]

        const primitiveTypographyTokens = candidateTokens.filter(
            isPrimitiveTypographyToken
        )

        if (
            typographyTokens.length === 0 &&
            primitiveTypographyTokens.length === 0
        ) {
            return ""
        }

        let css = FILE_HEADER
        const tokenConfig = cssConfig?.options?.tokenConfig
        const typographyConfig = cssConfig?.options?.typography
        // Generate CSS custom properties for primitive typography tokens
        if (primitiveTypographyTokens.length > 0) {
            css += ":root {\n"
            primitiveTypographyTokens.forEach((token) => {
                css += `  --${token.name}: ${getTokenValue(token, dictionary, usesDtcg, outputReferences, tokenConfig)};\n`
            })
            css += "}\n\n"
        }

        const compositeTokens = typographyTokens.filter((token) =>
            isCompositeTypographyToken(token)
        )
        
        // Separate base tokens from bold variant tokens
        const baseTokens = compositeTokens.filter((token) => !isBoldVariantToken(token, typographyConfig))
        const boldTokens = compositeTokens.filter((token) => isBoldVariantToken(token, typographyConfig))

        // Note: Bold variant tokens are handled through semantic element rules and compound modifier classes

        // Generate semantic HTML elements
        if (typographyConfig?.semanticElements) {
            css += "/* Semantic HTML elements */\n"
            baseTokens.forEach((token) => {
                const semanticCSS = generateSemanticElement(
                    token,
                    dictionary,
                    usesDtcg,
                    outputReferences,
                    typographyConfig
                )
                if (semanticCSS) {
                    css += semanticCSS
                }
            })
            css += "\n"
        }

        // Generate semantic bold element rules (strong, b tags)
        if (typographyConfig?.semanticElements && boldTokens.length > 0) {
            css += "/* Semantic bold elements (strong, b) */\n"
            css += generateSemanticBoldRules(
                baseTokens,
                boldTokens,
                dictionary,
                usesDtcg,
                outputReferences,
                typographyConfig,
                tokenConfig
            )
            css += "\n"
        }

        // Generate utility classes for base tokens only
        css += "/* Typography utility classes */\n"
        baseTokens.forEach((token) => {
            css += generateUtilityClass(
                token,
                dictionary,
                usesDtcg,
                outputReferences,
                typographyConfig
            )
        })
        
        // Generate compound modifier classes for bold variants
        if (boldTokens.length > 0) {
            css += "\n/* Bold modifier classes */\n"
            css += generateCompoundModifierClasses(
                baseTokens,
                boldTokens,
                dictionary,
                usesDtcg,
                outputReferences,
                typographyConfig,
                tokenConfig
            )
        }
        return css
    },
}
