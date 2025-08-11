import { ModeConfig } from "../types/shared.types"

export const DIMENSION_MODES: ModeConfig<{
    small: string
    medium: string
    large: string
    "x-large": string
}> = {
    modes: {
        small: "small",
        medium: "medium",
        large: "large",
        "x-large": "x-large",
    },
}
