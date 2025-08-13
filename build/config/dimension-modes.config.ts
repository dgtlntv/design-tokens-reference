import { ModeConfig } from "../types/shared.types"

/**
 * This configuration defines breakpoint modes for responsive dimension tokens and sets
 * the default breakpoint for token processing. It implements a mobile-first approach
 * where the smallest breakpoint (small) is used as the base, with larger breakpoints
 * applied via min-width media queries.
 */
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
