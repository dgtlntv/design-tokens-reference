export type ColorMode = "light" | "dark"

export interface ColorModeConfig {
    modes: {
        light: ColorMode
        dark: ColorMode
    }
    defaultMode: ColorMode
}

export const COLOR_MODES: ColorModeConfig = {
    modes: {
        light: "light",
        dark: "dark",
    },
    defaultMode: "light",
}
