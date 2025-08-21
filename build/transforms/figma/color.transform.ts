import Color, { type Coords, type ColorObject } from "colorjs.io"
import type { Transform, TransformedToken } from "style-dictionary/types"
import type { ColorValue } from "../../types"

/**
 * Type guard to check if a value is a ColorValue object.
 * @param value - The value to check
 * @returns True if the value is a valid ColorValue
 */
function isColorValue(value: unknown): value is ColorValue {
    return (
        value !== null &&
        typeof value === "object" &&
        "colorSpace" in value &&
        "components" in value
    )
}

/**
 * Converts a W3C ColorValue object to a colorjs.io Color instance.
 * @param colorValue - The W3C color value to convert
 * @returns A colorjs.io Color instance
 */
function w3cColorToColorJS(colorValue: ColorValue): Color {
    const { colorSpace, components, alpha = 1 } = colorValue
    
    // Handle "none" values by converting them to 0
    const processedComponents = components.map(c => c === "none" ? 0 : Number(c))
    
    // Map W3C color space names to colorjs.io ColorSpace objects
    const colorSpaceMap = {
        "srgb": Color.spaces.srgb,
        "srgb-linear": Color.spaces["srgb-linear"], 
        "display-p3": Color.spaces.p3,
        "a98-rgb": Color.spaces.a98rgb,
        "prophoto-rgb": Color.spaces.prophoto,
        "rec2020": Color.spaces.rec2020,
        "xyz-d65": Color.spaces["xyz-d65"],
        "xyz-d50": Color.spaces["xyz-d50"],
        "lab": Color.spaces.lab,
        "lch": Color.spaces.lch,
        "oklab": Color.spaces.oklab,
        "oklch": Color.spaces.oklch,
        "hsl": Color.spaces.hsl,
        "hwb": Color.spaces.hwb
    }
    
    const jsColorSpace = colorSpaceMap[colorSpace]
    if (!jsColorSpace) {
        console.warn(`Unsupported color space: ${colorSpace}, falling back to sRGB`)
    }
    
    // Ensure we have exactly 3 coordinates as required by Coords type
    const coords: Coords = [
        processedComponents[0] || 0,
        processedComponents[1] || 0,
        processedComponents[2] || 0
    ]
    
    try {
        const colorObject: ColorObject = {
            space: jsColorSpace || Color.spaces.srgb,
            coords: coords,
            alpha: alpha
        }
        return new Color(colorObject)
    } catch (error) {
        console.warn(`Failed to convert color from ${colorSpace}:`, error)
        // Fallback: try to create from sRGB
        const fallbackColorObject: ColorObject = {
            space: Color.spaces.srgb,
            coords: coords,
            alpha: alpha
        }
        return new Color(fallbackColorObject)
    }
}

/**
 * Style Dictionary transform for converting W3C color token values to hex strings for Figma.
 * Supports all major color spaces and converts them to hex format using colorjs.io.
 * 
 * @example
 * // Input token:
 * {
 *   $type: "color",
 *   $value: {
 *     colorSpace: "oklch",
 *     components: [0.7, 0.15, 180],
 *     alpha: 1
 *   }
 * }
 * 
 * // Output: "#89c442"
 */
export const colorW3cFigmaTransform: Transform = {
    name: "color/figma/hex",
    type: "value",
    filter: (token: TransformedToken) => {
        return (
            token.$type === "color" &&
            token.$value !== null &&
            isColorValue(token.$value)
        )
    },
    transform: (token: TransformedToken) => {
        const value = token.$value as ColorValue
        
        try {
            const color = w3cColorToColorJS(value)
            
            // Convert to hex string
            // If alpha is less than 1, include alpha in hex (8-digit hex)
            if (value.alpha !== undefined && value.alpha < 1) {
                return color.to("srgb").toString({ format: "hex", alpha: true })
            } else {
                return color.to("srgb").toString({ format: "hex" })
            }
        } catch (error) {
            console.warn(`Failed to transform color token "${token.name}":`, error)
            return token.$value
        }
    },
}