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
    classPrefix: string
    generateFor: string
    nameTransform: (tokenName: string) => string
}

export interface TypographyConfig {
    semanticElements: TypographySemanticElements
    utilities: TypographyUtilities
    generateCSSProperties: boolean
    cssPropertyPrefix: string
}

export const TYPOGRAPHY_CONFIG: TypographyConfig = {
    semanticElements: {
        headings: {
            pattern: "heading-{n}",
            elementTemplate: "h{n}",
            condition: (tokenName, tokenPath) => {
                // Match tokens that have heading in their path and end with a number or 'display'
                return (
                    tokenPath.includes("heading") &&
                    (!!tokenName.match(/-heading-\d+$/) ||
                        tokenName.endsWith("-heading-display"))
                )
            },
        },
        text: {
            pattern: "text-{variant}",
            elementTemplate: "p{variant}",
            condition: (tokenName, tokenPath) => {
                // Match tokens that have text in their path
                return (
                    tokenPath.includes("text") && tokenName.includes("-text-")
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
        ],
    },
    utilities: {
        classPrefix: "",
        generateFor: "all",
        nameTransform: (tokenName: string) => {
            // Remove brand/site prefix and keep the typography part
            // e.g., 'canonical-sites-typography-heading-1' -> 'heading-1'
            return tokenName.replace(/^.*?-typography-/, "")
        },
    },
    generateCSSProperties: true,
    cssPropertyPrefix: "--",
}
