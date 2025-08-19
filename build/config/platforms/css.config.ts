import type { TransformedToken } from "style-dictionary/types"
import type {
    CSSFileConfig,
    CSSFileDefinition,
    CSSTypographyConfig,
} from "../../types/css.types"
import type { CSSPlatformOptions } from "../../types/platform.types"

/**
 * Typography configuration for CSS output.
 *
 * This configuration defines how typography tokens are converted into CSS output,
 * including semantic HTML element styling and utility class generation. It supports
 * automatic mapping of typography tokens to appropriate HTML elements (h1-h6, p)
 * and generates utility classes for direct application.
 */
export const CSS_TYPOGRAPHY_CONFIG: CSSTypographyConfig = {
    semanticElements: {
        headings: {
            pattern: "heading-{n}",
            elementTemplate: "h{n}",
            condition: (tokenName, tokenPath) => {
                // Match tokens that have heading in their path and end with a number or 'display'
                return tokenPath.includes("heading")
            },
        },
        text: {
            pattern: "text-{variant}",
            elementTemplate: "p.text-{variant}",
            condition: (tokenName, tokenPath) => {
                // Only match composite text tokens (primary, secondary, tertiary)
                // Exclude single-property tokens like italic, underline, etc.
                if (!tokenPath.includes("text")) return false

                const textVariant = tokenPath[tokenPath.length - 1]
                return ["primary", "secondary", "tertiary"].includes(
                    textVariant
                )
            },
        },
        custom: [
            // Display heading gets special treatment
            {
                pattern: "heading-display",
                elementTemplate: "h1.display",
                condition: (tokenName) =>
                    tokenName.endsWith("-heading-display"),
            },
            // Primary text should just be 'p' without class
            {
                pattern: "text-primary",
                elementTemplate: "p",
                condition: (tokenName) => tokenName.endsWith("-text-primary"),
            },
        ],
    },
    utilities: {
        nameTransform: (tokenName: string) => {
            // Remove brand/tiers prefix and keep the typography part
            // e.g., 'canonical-sites-typography-heading-1' -> 'heading-1'
            return tokenName.replace(/^.*?-typography-/, "")
        },
    },
    boldVariants: {
        tokenSuffix: "-bold",
        modifierClass: "text-bold",
        isVariantToken: (pathSegment: string, suffix: string) => {
            return pathSegment?.endsWith(suffix) || false
        },
        extractBaseName: (pathSegment: string, suffix: string) => {
            if (pathSegment?.endsWith(suffix)) {
                return pathSegment.slice(0, -suffix.length)
            }
            return pathSegment || ""
        },
    },
}

/**
 * Base CSS platform options that can be extended for specific configurations.
 */
export const CSS_BASE_OPTIONS: CSSPlatformOptions = {
    defaultSelector: ":root",
    outputReferences: true,
    tokenConfig: {
        referenceFormat: "var(--{name})",
    },
    typography: CSS_TYPOGRAPHY_CONFIG,
}

/**
 * File configurations for different token categories.
 * Each configuration defines how tokens of that category should be processed and output.
 */
export const CSS_FILE_DEFINITIONS: CSSFileDefinition[] = [
    {
        metadata: { category: "color" },
        config: {
            destination: "{tier}-colors.css",
            format: "css/variables",
            filter: (token: TransformedToken) => token.$type === "color",
        },
    },
    {
        metadata: { category: "dimension" },
        config: {
            destination: "{tier}-dimensions.css",
            format: "css/variables",
            filter: (token: TransformedToken) => token.$type === "dimension",
        },
    },
    {
        metadata: { category: "typography" },
        config: {
            destination: "{tier}-typography.css",
            format: "css/typography",
            filter: (token: TransformedToken) => {
                // Typography composite tokens
                if (token.$type === "typography") {
                    return true
                }
                // Typography primitive tokens by path
                if (
                    token.path &&
                    token.path.length > 0 &&
                    token.path[0] === "typography"
                ) {
                    return true
                }
                // Typography primitive tokens by type
                if (
                    token.$type === "fontFamily" ||
                    token.$type === "fontWeight" ||
                    token.$type === "fontStyle"
                ) {
                    return true
                }
                // Include dimension tokens needed for typography references
                if (
                    token.path &&
                    token.path.length >= 2 &&
                    token.path[0] === "dimension" &&
                    (token.path[1] === "letterSpacing" ||
                        token.path[1] === "size")
                ) {
                    return true
                }
                return false
            },
        },
    },
    {
        metadata: { category: "assets" },
        config: {
            destination: "{tier}-assets.css",
            format: "css/variables",
            filter: (token: TransformedToken) => token.$type === "asset",
        },
    },
    {
        metadata: { category: "grid" },
        config: {
            destination: "{tier}-grid.css",
            format: "css/variables",
            filter: (token: TransformedToken) => token.$type === "grid",
        },
    },
    {
        metadata: { category: "motion" },
        config: {
            destination: "{tier}-motion.css",
            format: "css/variables",
            filter: (token: TransformedToken) => token.$type === "duration",
        },
    },
    {
        metadata: { category: "shadows" },
        config: {
            destination: "{tier}-shadows.css",
            format: "css/variables",
            filter: (token: TransformedToken) => token.$type === "shadow",
        },
    },
]

/**
 * Map of category names to their file configurations for easy lookup.
 */
export const CSS_FILE_CONFIG_MAP = new Map<string, CSSFileConfig>(
    CSS_FILE_DEFINITIONS.map((def) => [def.metadata.category, def.config])
)

/**
 * Base CSS platform configuration that can be used to create specific platform instances.
 */
export const CSS_BASE_CONFIG = {
    prefix: "canonical",
    buildPath: "dist/css/",
    transforms: ["name/kebab", "dimension/w3c", "color/w3c", "fontFamily/css"],
    options: CSS_BASE_OPTIONS,
    files: CSS_FILE_DEFINITIONS.map((def) => def.config),
}
