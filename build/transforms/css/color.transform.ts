import type { Transform, TransformedToken } from "style-dictionary/types"
import type {
    ColorValue,
    ColorSpace,
} from "../../types/tokens.types"

function isColorValue(value: unknown): value is ColorValue {
    return (
        value !== null &&
        typeof value === "object" &&
        "colorSpace" in value &&
        "components" in value
    )
}

// Helper function to create alpha string
function createAlphaString(alpha: number): string {
    return alpha !== 1 ? ` / ${alpha}` : ""
}

// Factory function for RGB-based color spaces
function createRGBFormatter(colorSpaceName: string) {
    return ({ components, alpha = 1 }: ColorValue): string => {
        const [r, g, b] = components.map((c) => (c === "none" ? "none" : c))
        return `color(${colorSpaceName} ${r} ${g} ${b}${createAlphaString(alpha)})`
    }
}

// Factory function for XYZ color spaces
function createXYZFormatter(colorSpaceName: string) {
    return ({ components, alpha = 1 }: ColorValue): string => {
        const [x, y, z] = components.map((c) => (c === "none" ? "none" : c))
        return `color(${colorSpaceName} ${x} ${y} ${z}${createAlphaString(alpha)})`
    }
}

const colorSpaceFormatters: Record<ColorSpace, (value: ColorValue) => string> =
    {
        srgb: ({ components, alpha = 1 }) => {
            const [r, g, b] = components.map((c) =>
                c === "none" ? "none" : Math.round(Number(c) * 255)
            )
            return alpha !== 1
                ? `rgba(${r}, ${g}, ${b}, ${alpha})`
                : `rgb(${r}, ${g}, ${b})`
        },

        "srgb-linear": createRGBFormatter("srgb-linear"),

        hsl: ({ components, alpha = 1 }) => {
            const [h, s, l] = components.map((c, index) => {
                if (c === "none") return "none"
                return index === 0 ? c : `${c}%`
            })
            return `hsl(${h} ${s} ${l}${createAlphaString(alpha)})`
        },

        hwb: ({ components, alpha = 1 }) => {
            const [h, w, b] = components.map((c, index) => {
                if (c === "none") return "none"
                return index === 0 ? c : `${c}%`
            })
            return `hwb(${h} ${w} ${b}${createAlphaString(alpha)})`
        },

        lab: ({ components, alpha = 1 }) => {
            const [l, a, b] = components.map((c, index) => {
                if (c === "none") return "none"
                return index === 0 ? `${c}%` : c
            })
            return `lab(${l} ${a} ${b}${createAlphaString(alpha)})`
        },

        lch: ({ components, alpha = 1 }) => {
            const [l, c, h] = components.map((comp, index) => {
                if (comp === "none") return "none"
                return index === 0 ? `${comp}%` : comp
            })
            return `lch(${l} ${c} ${h}${createAlphaString(alpha)})`
        },

        oklab: ({ components, alpha = 1 }) => {
            const [l, a, b] = components.map((c) => (c === "none" ? "none" : c))
            return `oklab(${l} ${a} ${b}${createAlphaString(alpha)})`
        },

        oklch: ({ components, alpha = 1 }) => {
            const [l, c, h] = components.map((c) => (c === "none" ? "none" : c))
            return `oklch(${l} ${c} ${h}${createAlphaString(alpha)})`
        },

        "display-p3": createRGBFormatter("display-p3"),
        "a98-rgb": createRGBFormatter("a98-rgb"),
        "prophoto-rgb": createRGBFormatter("prophoto-rgb"),
        rec2020: createRGBFormatter("rec2020"),
        "xyz-d65": createXYZFormatter("xyz-d65"),
        "xyz-d50": createXYZFormatter("xyz-d50"),
    }

export const colorW3cCssTransform: Transform = {
    name: "color/w3c-css",
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
        const formatter = colorSpaceFormatters[value.colorSpace]

        if (!formatter) {
            console.warn(`Unsupported color space: ${value.colorSpace}`)
            return token.$value
        }

        return formatter(value)
    },
}
