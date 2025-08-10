export type ColorMode = "light" | "dark"
export type ColorModeStrategy =
    | "light-dark-function"
    | "media-query"
    | "data-attribute"

export interface ColorModeConfig {
    modes: {
        light: ColorMode
        dark: ColorMode
    }
    defaultMode: ColorMode
    strategy: ColorModeStrategy
    dataAttributeName?: string // For data-attribute strategy
}

export const COLOR_MODES: ColorModeConfig = {
    modes: {
        light: "light",
        dark: "dark",
    },
    defaultMode: "light",
    strategy: "light-dark-function",
    dataAttributeName: "data-theme", // Used if strategy is 'data-attribute'
}
