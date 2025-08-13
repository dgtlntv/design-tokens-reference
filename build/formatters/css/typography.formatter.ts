import type {
    Dictionary,
    Format,
    LocalOptions,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { getPlatform } from "../../config"
import type { CSSTypographyConfig } from "../../config/platforms/css.config"
import type { CSSPlatformOptions } from "../../types/platform.types"
import type { ExtendedLocalOptions } from "../../types/shared.types"
import { getTokenValue } from "../../utils/token.util"

const FILE_HEADER =
    "/**\n * Do not edit directly, this file was auto-generated.\n */\n\n"

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
}

function isTypographyToken(token: TransformedToken): token is TypographyToken {
    return token.$type === "typography"
}

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

function isCompositeTypographyToken(token: TypographyToken): boolean {
    const value = token.$value
    return typeof value === "object" && value !== null
}

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

        // Generate semantic HTML elements
        if (typographyConfig?.semanticElements) {
            css += "/* Semantic HTML elements */\n"
            compositeTokens.forEach((token) => {
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

        // Generate utility classes for composite tokens
        css += "/* Typography utility classes */\n"
        compositeTokens.forEach((token) => {
            css += generateUtilityClass(
                token,
                dictionary,
                usesDtcg,
                outputReferences,
                typographyConfig
            )
        })

        return css
    },
}
