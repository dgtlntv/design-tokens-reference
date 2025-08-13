import type { TransformedToken } from "style-dictionary/types"
import type {
    CSSPlatformOptions,
    PlatformConfig,
} from "../../types/platform.types"

interface CSSFileConfig {
    readonly destination: string
    readonly format: string
    readonly filter: (token: TransformedToken) => boolean
}

interface TypographySemanticElement {
    pattern: string
    elementTemplate: string
    condition: (tokenName: string, tokenPath: string[]) => boolean
}

interface TypographyCustomElement {
    pattern: string
    elementTemplate: string
    condition: (tokenName: string) => boolean
}

interface TypographySemanticElements {
    headings: TypographySemanticElement
    text: TypographySemanticElement
    custom: TypographyCustomElement[]
}

interface TypographyUtilities {
    nameTransform: (tokenName: string) => string
}

export interface CSSTypographyConfig {
    semanticElements: TypographySemanticElements
    utilities: TypographyUtilities
}

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
                return ["primary", "secondary", "tertiary"].includes(textVariant)
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
                condition: (tokenName) =>
                    tokenName.endsWith("-text-primary"),
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
