import { ModeConfig } from "../types/shared.types"

/**
 * This configuration defines the available color modes (light and dark) and contrast modes
 * (normal and high contrast) and sets the default modes for token processing. It's used by 
 * the color formatter to categorize tokens and generate appropriate CSS for different 
 * color schemes and contrast levels.
 * The modes set here are matched against the modes defined in the $extensions of a token.
 *
 * The light mode and normal contrast are set as defaults, meaning light/normalContrast 
 * mode tokens will be used as base values in CSS, with other mode combinations applied 
 * via media queries or light-dark() functions depending on the selected color mode strategy.
 */
export const COLOR_MODES: ModeConfig<{
    light: string
    dark: string
}> & {
    contrastModes: {
        normalContrast: string
        highContrast: string
    }
    defaultContrastMode: string
} = {
    modes: {
        light: "light",
        dark: "dark",
    },
    defaultMode: "light",
    contrastModes: {
        normalContrast: "normalContrast",
        highContrast: "highContrast",
    },
    defaultContrastMode: "normalContrast",
}
