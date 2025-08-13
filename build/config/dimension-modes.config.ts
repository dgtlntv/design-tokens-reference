import { ModeConfig } from "../types/shared.types"

export const DIMENSION_MODES: ModeConfig<{
    small: string
    medium: string
    large: string
    xLarge: string
}> = {
    modes: {
        small: "460px",
        medium: "620px",
        large: "1036px",
        xLarge: "1681px",
    },
    defaultMode: "small",
}
