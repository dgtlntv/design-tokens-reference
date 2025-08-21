import type {
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"

export interface TypographyValue {
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

export interface TypographyToken extends TransformedToken {
    $type: "typography"
    $value: TypographyValue
    value: TypographyValue
}

export interface SemanticRule {
    selector: string
    condition: (token: TypographyToken) => boolean
}

export interface TypographyConfig {
    semanticRules?: SemanticRule[]
    utilityPrefix?: string
    boldSuffix?: string
    boldModifierClass?: string
}

export interface FormatterOptions {
    categoryFilter?: (token: TransformedToken) => boolean
    outputReferences?: OutputReferences
    usesDtcg?: boolean
    typography?: TypographyConfig
}
