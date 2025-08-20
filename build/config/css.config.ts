import type { PlatformConfig, TransformedToken } from "style-dictionary/types"

export const CSS_PLATFORM_CONFIG: PlatformConfig = {
    transforms: ["name/kebab", "dimension/w3c", "color/w3c", "fontFamily/css"],
    fileExtension: "css",
    defaultFormat: "css/variables",
    categoryOverrides: {
        typography: {
            format: "css/typography",
            filter: (token: TransformedToken) => {
                // Typography composite tokens
                if (token.$type === "typography") return true

                // Typography primitive tokens by path
                if (token.path?.[0] === "typography") return true

                // Typography primitive tokens by type
                if (
                    ["fontFamily", "fontWeight", "fontStyle"].includes(
                        token.$type || ""
                    )
                )
                    return true

                // Include dimension tokens needed for typography references
                if (
                    token.path?.[0] === "dimension" &&
                    ["letterSpacing", "size"].includes(token.path[1])
                )
                    return true

                return false
            },
        },
    },
}
