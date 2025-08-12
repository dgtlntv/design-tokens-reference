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

export const CSS_PLATFORM_CONFIG: PlatformConfig & {
    options: CSSPlatformOptions
    files: CSSFileConfig[]
} = {
    prefix: "canonical",
    buildPath: "dist/css/",
    transforms: [
        "name/kebab",
        "dimension/w3c",
        "color/w3c", 
        "fontFamily/css",
    ],
    options: {
        defaultSelector: ":root",
        outputReferences: true,
        colorModeStrategy: "media-query",
        tokenConfig: {
            referenceFormat: "var(--{name})",
        },
    },
    files: [
        {
            destination: "{tier}-colors.css",
            format: "css/colors",
            filter: (token: TransformedToken) => token.$type === "color" || token.type === "color"
        },
        {
            destination: "{tier}-dimensions.css",
            format: "css/dimensions",
            filter: (token: TransformedToken) => token.$type === "dimension" || token.type === "dimension"
        },
        {
            destination: "{tier}-typography.css",
            format: "css/typography",
            filter: (token: TransformedToken) => {
                // Typography composite tokens
                if (token.$type === "typography" || token.type === "typography") {
                    return true
                }
                // Typography primitive tokens by path
                if (token.path && token.path.length > 0 && token.path[0] === "typography") {
                    return true
                }
                // Typography primitive tokens by type
                return token.$type === "fontFamily" || token.type === "fontFamily" ||
                       token.$type === "fontWeight" || token.type === "fontWeight" ||
                       token.$type === "fontStyle" || token.type === "fontStyle"
            }
        },
        {
            destination: "{tier}-assets.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.path?.includes("assets") ||
                       token.path?.includes("icon") ||
                       token.path?.includes("image") ||
                       token.$type === "asset" ||
                       token.type === "asset"
            }
        },
        {
            destination: "{tier}-grid.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.path?.includes("grid") ||
                       token.path?.includes("breakpoint") ||
                       token.path?.includes("container") ||
                       token.$type === "grid" ||
                       token.type === "grid"
            }
        },
        {
            destination: "{tier}-motion.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.path?.includes("motion") ||
                       token.path?.includes("transition") ||
                       token.path?.includes("animation") ||
                       token.path?.includes("duration") ||
                       token.path?.includes("easing") ||
                       token.$type === "transition" ||
                       token.type === "transition" ||
                       token.$type === "duration" ||
                       token.type === "duration"
            }
        },
        {
            destination: "{tier}-shadows.css",
            format: "css/generic",
            filter: (token: TransformedToken) => {
                return token.path?.includes("shadow") ||
                       token.path?.includes("elevation") ||
                       token.$type === "shadow" ||
                       token.type === "shadow"
            }
        }
    ]
}
