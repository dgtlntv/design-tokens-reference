import { ModeConfig } from "../types/shared.types"

export const COLOR_MODES: ModeConfig<{
    light: string
    dark: string
}> = {
    modes: {
        light: "light",
        dark: "dark",
    },
    defaultMode: "light",
}
