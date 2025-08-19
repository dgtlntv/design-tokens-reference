/**
 * Represents a color value with color space information and components.
 */
export interface ColorValue {
    /** The color space used for this color value */
    colorSpace: ColorSpace
    /** Array of color components (numbers or "none" string for missing components) */
    components: (number | string)[]
    /** Optional alpha/transparency value (0-1), defaults to 1 if not specified */
    alpha?: number
}

/**
 * Supported color spaces for design tokens.
 * Includes standard web color spaces and newer wide-gamut color spaces.
 */
export type ColorSpace =
    | "srgb"        // Standard RGB color space
    | "srgb-linear" // Linear sRGB color space
    | "hsl"         // Hue, Saturation, Lightness
    | "hwb"         // Hue, Whiteness, Blackness
    | "lab"         // CIE L*a*b* color space
    | "lch"         // CIE L*C*h* color space (cylindrical Lab)
    | "oklab"       // Oklab perceptual color space
    | "oklch"       // Oklch (cylindrical Oklab)
    | "display-p3"  // Display P3 wide-gamut color space
    | "a98-rgb"     // Adobe RGB (1998) color space
    | "prophoto-rgb"// ProPhoto RGB color space
    | "rec2020"     // Rec. 2020 color space
    | "xyz-d65"     // CIE XYZ color space with D65 illuminant
    | "xyz-d50"     // CIE XYZ color space with D50 illuminant

/**
 * Represents a dimension value with numeric value and unit.
 */
export interface DimensionValue {
    /** The numeric value of the dimension */
    value: number
    /** The unit of measurement (e.g., "px", "rem", "em", "%") */
    unit: string
}

