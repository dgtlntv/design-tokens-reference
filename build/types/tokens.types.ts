export interface ColorToken {
    $type: "color"
    $value: ColorValue | string
    name: string
    original: {
        $value: ColorValue | string
    }
}

export interface ColorValue {
    colorSpace: ColorSpace
    components: (number | string)[]
    alpha?: number
}

export type ColorSpace =
    | "srgb"
    | "srgb-linear"
    | "hsl"
    | "hwb"
    | "lab"
    | "lch"
    | "oklab"
    | "oklch"
    | "display-p3"
    | "a98-rgb"
    | "prophoto-rgb"
    | "rec2020"
    | "xyz-d65"
    | "xyz-d50"

export interface DimensionToken {
    $type: "dimension"
    $value: DimensionValue | string | number
    name: string
    original: {
        $value: DimensionValue | string | number
    }
}

export interface DimensionValue {
    value: number
    unit: string
}

export interface Token {
    $type?: string
    $value: unknown
    name: string
    original: {
        $value: unknown
    }
}

export type DesignToken = ColorToken | DimensionToken | Token
