import type { TransformedToken, File } from "style-dictionary/types"

/**
 * Internal business metadata for CSS file configurations.
 * This is separate from Style Dictionary's file config and contains our custom properties.
 */
export interface CSSFileMetadata {
    /** Category name for this file configuration */
    readonly category: string
}

/**
 * Style Dictionary-compatible file configuration.
 * This matches Style Dictionary's expected File interface exactly.
 */
export interface CSSFileConfig extends File {
    /** File destination path, may include placeholders like {tier} */
    readonly destination: string
    /** Style Dictionary format name to use for this file */
    readonly format: string
    /** Filter function to determine which tokens are included in this file */
    readonly filter?: (token: TransformedToken) => boolean
}

/**
 * Internal configuration combining Style Dictionary file config with our metadata.
 * Used only within our configuration management, never passed to Style Dictionary.
 */
export interface CSSFileDefinition {
    readonly metadata: CSSFileMetadata
    readonly config: CSSFileConfig
}

/**
 * Configuration for semantic HTML elements in typography output.
 * Defines patterns and conditions for mapping typography tokens to HTML elements.
 */
export interface TypographySemanticElement {
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
export interface TypographyCustomElement {
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
export interface TypographySemanticElements {
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
export interface TypographyUtilities {
    /** Function to transform token names into CSS class names */
    nameTransform: (tokenName: string) => string
}

/**
 * Configuration for bold variant token handling.
 */
export interface TypographyBoldVariants {
    /** Suffix pattern to identify bold variant tokens (e.g., '-bold') */
    tokenSuffix: string
    /** CSS modifier class name to use for bold utilities (e.g., 'text-bold') */
    modifierClass: string
    /** Function to check if a token path segment indicates a bold variant */
    isVariantToken: (pathSegment: string, suffix: string) => boolean
    /** Function to extract base token name from a bold variant token */
    extractBaseName: (pathSegment: string, suffix: string) => string
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
    /** Configuration for bold variant token handling */
    boldVariants: TypographyBoldVariants
}

/**
 * Typography token value structure for composite typography tokens.
 * Contains all possible typography-related properties that can be defined in a token.
 */
export interface TypographyValue {
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

/**
 * Extended TransformedToken interface for typography tokens.
 * Ensures the $value property conforms to the TypographyValue structure.
 */
export interface TypographyToken extends TransformedToken {
    $value: TypographyValue
}