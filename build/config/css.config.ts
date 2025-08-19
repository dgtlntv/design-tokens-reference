import type { TransformedToken } from "style-dictionary/types"
import type { CSSFileConfig, CSSFileDefinition, CSSTypographyConfig } from "../types/css.types"

/**
 * Typography configuration for CSS output.
 */
const CSS_TYPOGRAPHY_CONFIG: CSSTypographyConfig = {
    semanticElements: {
        headings: {
            pattern: "heading-{n}",
            elementTemplate: "h{n}",
            condition: (_, tokenPath) => tokenPath.includes("heading"),
        },
        text: {
            pattern: "text-{variant}",
            elementTemplate: "p.text-{variant}",
            condition: (_, tokenPath) => {
                if (!tokenPath.includes("text")) return false
                const textVariant = tokenPath[tokenPath.length - 1]
                return ["primary", "secondary", "tertiary"].includes(textVariant)
            },
        },
        custom: [
            {
                pattern: "heading-display",
                elementTemplate: "h1.display",
                condition: (tokenName) => tokenName.endsWith("-heading-display"),
            },
            {
                pattern: "text-primary",
                elementTemplate: "p",
                condition: (tokenName) => tokenName.endsWith("-text-primary"),
            },
        ],
    },
    utilities: {
        nameTransform: (tokenName: string) => tokenName.replace(/^.*?-typography-/, ""),
    },
    boldVariants: {
        tokenSuffix: "-bold",
        modifierClass: "text-bold",
        isVariantToken: (pathSegment: string, suffix: string) => pathSegment?.endsWith(suffix) || false,
        extractBaseName: (pathSegment: string, suffix: string) => {
            if (pathSegment?.endsWith(suffix)) {
                return pathSegment.slice(0, -suffix.length)
            }
            return pathSegment || ""
        },
    },
}

/**
 * Helper to create standard CSS file configurations.
 * Most token categories follow the same pattern: {tier}-{category}.css with css/variables format.
 */
const createStandardFileConfig = (category: string, tokenType: string): CSSFileDefinition => ({
    metadata: { category },
    config: {
        destination: `{tier}-${category}.css`,
        format: "css/variables",
        filter: (token: TransformedToken) => token.$type === tokenType,
    },
})

/**
 * File configurations for different token categories.
 */
export const CSS_FILE_DEFINITIONS: CSSFileDefinition[] = [
    createStandardFileConfig("color", "color"),
    createStandardFileConfig("dimension", "dimension"),
    createStandardFileConfig("assets", "asset"),
    createStandardFileConfig("grid", "grid"),
    createStandardFileConfig("motion", "duration"),
    createStandardFileConfig("shadows", "shadow"),
    
    // Typography has special handling
    {
        metadata: { category: "typography" },
        config: {
            destination: "{tier}-typography.css",
            format: "css/typography",
            filter: (token: TransformedToken) => {
                // Typography composite tokens
                if (token.$type === "typography") return true
                
                // Typography primitive tokens by path
                if (token.path?.[0] === "typography") return true
                
                // Typography primitive tokens by type
                if (["fontFamily", "fontWeight", "fontStyle"].includes(token.$type || "")) return true
                
                // Include dimension tokens needed for typography references
                if (token.path?.[0] === "dimension" && 
                    ["letterSpacing", "size"].includes(token.path[1])) return true
                
                return false
            },
        },
    },
]

/**
 * Get file configuration for a specific category.
 */
export const getCSSFileConfig = (category: string): CSSFileConfig | undefined => {
    return CSS_FILE_DEFINITIONS.find(def => def.metadata.category === category)?.config
}

/**
 * Base CSS platform configuration.
 */
export const CSS_BASE_CONFIG = {
    prefix: "canonical",
    buildPath: "dist/css/",
    transforms: ["name/kebab", "dimension/w3c", "color/w3c", "fontFamily/css"],
    options: {
        defaultSelector: ":root",
        outputReferences: true,
        tokenConfig: {
            referenceFormat: "var(--{name})",
        },
        typography: CSS_TYPOGRAPHY_CONFIG,
    },
    files: CSS_FILE_DEFINITIONS.map(def => def.config),
}