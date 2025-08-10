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

export interface DimensionValue {
    value: number
    unit: string
}

export interface CanonicalModesExtension {
    mode: string
}

export interface TokenExtensions {
    "canonical.modes"?: CanonicalModesExtension
}
