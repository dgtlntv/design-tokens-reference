import type { TransformedToken } from "style-dictionary/types"
import type {
    CSSPlatformOptions,
    PlatformConfig,
} from "../../types/platform.types"

/**
 * Configuration for a single CSS file output.
 * Defines the file destination, format to use, and token filtering criteria.
 */
interface CSSFileConfig {
    /** File destination path, may include placeholders like {tier} */
    readonly destination: string
    /** Style Dictionary format name to use for this file */
    readonly format: string
    /** Filter function to determine which tokens are included in this file */
    readonly filter: (token: TransformedToken) => boolean
}

/**
 * Configuration for semantic HTML elements in typography output.
 * Defines patterns and conditions for mapping typography tokens to HTML elements.
 */
interface TypographySemanticElement {
    /** Pattern template for the element (e.g., "heading-{n}") */
    pattern: string
    /** CSS selector template for the element (e.g., "h{n}") */
    elementTemplate: string
    /** Function to determine if a token should use this element mapping */
    condition: (tokenName: string, tokenPath: string[]) => boolean
}

/**
 * Configuration for custom typography element mappings.
 * Allows for specific token-to-element mappings that don't follow standard patterns.
 */
interface TypographyCustomElement {
    /** Pattern identifier for the custom element */
    pattern: string
    /** CSS selector template for the custom element */
    elementTemplate: string
    /** Function to determine if a token should use this custom mapping */
    condition: (tokenName: string) => boolean
}

/**
 * Complete configuration for semantic HTML element generation.
 * Includes standard patterns for headings, text, and custom element mappings.
 */
interface TypographySemanticElements {
    /** Configuration for heading elements (h1-h6) */
    headings: TypographySemanticElement
    /** Configuration for text/paragraph elements */
    text: TypographySemanticElement
    /** Array of custom element mappings */
    custom: TypographyCustomElement[]
}

/**
 * Configuration for typography utility class generation.
 */
interface TypographyUtilities {
    /** Function to transform token names into CSS class names */
    nameTransform: (tokenName: string) => string
}

/**
 * Complete typography configuration for CSS output.
 * Controls how typography tokens are converted to CSS rules and utility classes.
 */
export interface CSSTypographyConfig {
    /** Configuration for semantic HTML element styling */
    semanticElements: TypographySemanticElements
    /** Configuration for utility class generation */
    utilities: TypographyUtilities
}

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
}

/**
 * This configuration defines how design tokens are processed and output as CSS files.
 * It includes transforms, formatters, file definitions, and advanced features like
 * color mode strategies and typography configurations.
 */
export const CSS_PLATFORM_CONFIG: PlatformConfig & {
    options: CSSPlatformOptions & { typography?: CSSTypographyConfig }
    files: CSSFileConfig[]
} = {
    prefix: "canonical",
    buildPath: "dist/css/",
    transforms: ["name/kebab", "dimension/w3c", "color/w3c", "fontFamily/css"],
    options: {
        defaultSelector: ":root",
        outputReferences: true,
        colorModeStrategy: "media-query",
        tokenConfig: {
            referenceFormat: "var(--{name})",
        },
        typography: CSS_TYPOGRAPHY_CONFIG,
    },
    files: [
        {
            destination: "{tier}-colors.css",
            format: "css/colors",
            filter: (token: TransformedToken) => token.$type === "color",
        },
        {
            destination: "{tier}-dimensions.css",
            format: "css/dimensions",
            filter: (token: TransformedToken) => token.$type === "dimension",
        },
        {
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
                return (
                    token.$type === "fontFamily" ||
                    token.$type === "fontWeight" ||
                    token.$type === "fontStyle"
                )
            },
        },
        {
            destination: "{tier}-assets.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.$type === "asset"
            },
        },
        {
            destination: "{tier}-grid.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.$type === "grid"
            },
        },
        {
            destination: "{tier}-motion.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.$type === "duration"
            },
        },
        {
            destination: "{tier}-shadows.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.$type === "shadow"
            },
        },
    ],
}
