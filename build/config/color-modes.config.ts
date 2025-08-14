import { ModeConfig } from "../types/shared.types"

/**
 * This configuration defines the available color modes (light and dark) and sets
 * the default mode for token processing. It's used by the color formatter to
 * categorize tokens and generate appropriate CSS for different color schemes.
 * The modes set here are matched against the modes defined in the $extensions
 * of a token.
 *
 * The light mode is set as the default, meaning light mode tokens will be used
 * as base values in CSS, with dark mode tokens applied via media queries or
 * light-dark() functions depending on the selected color mode strategy.
 */
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
