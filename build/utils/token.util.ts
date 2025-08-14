import type {
    Dictionary,
    OutputReferences,
    TransformedToken,
} from "style-dictionary/types"
import { getReferences, usesReferences } from "style-dictionary/utils"
import type { PlatformTokenConfig } from "../types/platform.types"
import type { TokenExtensions } from "../types/tokens.types"

/**
 * Extracts the final value from a token, handling references and DTCG format.
 * 
 * @param token - The transformed token to extract value from
 * @param dictionary - Style Dictionary instance containing all tokens
 * @param usesDtcg - Whether to use DTCG format ($value vs value)
 * @param outputReferences - Configuration for outputting token references
 * @param platformConfig - Optional platform-specific token configuration
 * @returns The final string value for the token
 */
export function getTokenValue(
    token: TransformedToken,
    dictionary: Dictionary,
    usesDtcg: boolean,
    outputReferences: OutputReferences,
    platformConfig?: PlatformTokenConfig
): string {
    const originalValue = usesDtcg
        ? token.original.$value
        : token.original.value

    const shouldOutputRef =
        usesReferences(originalValue) &&
        (typeof outputReferences === "function"
            ? outputReferences(token, { dictionary, usesDtcg })
            : outputReferences)

    if (shouldOutputRef) {
        const refs = getReferences(originalValue, dictionary.tokens, {
            usesDtcg,
        })
        let value = JSON.stringify(usesDtcg ? token.$value : token.value)

        refs.forEach((ref: TransformedToken) => {
            const refValue = JSON.stringify(usesDtcg ? ref.$value : ref.value)
            const referenceFormat =
                platformConfig?.referenceFormat || "var(--{name})"
            const formattedRef = referenceFormat.replace("{name}", ref.name)
            value = value.replace(refValue, formattedRef)
        })

        return value.replace(/"/g, "")
    }

    return String(usesDtcg ? token.$value : token.value)
}

/**
 * Removes a mode segment from a token's path array.
 * Used to normalize token names by removing mode-specific path segments.
 * 
 * @param token - The transformed token containing the path
 * @param mode - The mode string to remove from the path
 * @returns A new path array with the mode segment removed
 */
export function stripModeFromTokenPath(
    token: TransformedToken,
    mode: string
): string[] {
    const path = token.path || []

    // Find the index of the mode in the path
    const modeIndex = path.indexOf(mode)

    if (modeIndex === -1) {
        // Mode not found in path, return original path
        return path
    }

    // Create a new path without the mode segment
    return [...path.slice(0, modeIndex), ...path.slice(modeIndex + 1)]
}

/**
 * Removes multiple mode segments from a token's path array.
 * Used to normalize token names by removing all mode-specific path segments.
 * 
 * @param token - The transformed token containing the path
 * @param modes - Array of mode strings to remove from the path
 * @returns A new path array with all mode segments removed
 */
export function stripModesFromTokenPath(
    token: TransformedToken,
    modes: string[]
): string[] {
    let path = token.path || []

    // Remove each mode from the path
    modes.forEach(mode => {
        const modeIndex = path.indexOf(mode)
        if (modeIndex !== -1) {
            path = [...path.slice(0, modeIndex), ...path.slice(modeIndex + 1)]
        }
    })

    return path
}

/**
 * Removes color scheme and contrast mode segments from a token's path.
 * Uses the token's mode extension data to determine which segments to remove.
 * 
 * @param token - The transformed token containing the path
 * @returns A new path array with mode segments removed
 */
export function stripAllModesFromTokenPath(
    token: TransformedToken
): string[] {
    const colorScheme = getSpecificModeFromToken(token, 'colorScheme')
    const contrastMode = getSpecificModeFromToken(token, 'contrast')
    
    const modesToRemove: string[] = []
    if (colorScheme) modesToRemove.push(colorScheme)
    if (contrastMode) modesToRemove.push(contrastMode)
    
    return stripModesFromTokenPath(token, modesToRemove)
}

/**
 * Extracts the mode information from a token's extensions.
 * Looks for canonical.modes extension data.
 * 
 * @param token - The transformed token to extract mode from
 * @returns The mode string/array if found, null otherwise
 */
export function getModeFromTokenExtensions(
    token: TransformedToken
): string | string[] | null {
    const extensions = token.$extensions as TokenExtensions | undefined
    if (extensions && extensions["canonical.modes"]) {
        return extensions["canonical.modes"].mode || null
    }
    return null
}

/**
 * Extracts specific mode type from a token's mode array or string.
 * 
 * @param token - The transformed token to extract mode from
 * @param modeType - The type of mode to extract ('colorScheme' or 'contrast')
 * @returns The specific mode string if found, null otherwise
 */
export function getSpecificModeFromToken(
    token: TransformedToken,
    modeType: 'colorScheme' | 'contrast'
): string | null {
    const mode = getModeFromTokenExtensions(token)
    
    if (!mode) return null
    
    // Handle legacy single string mode (assume light/dark are color schemes)
    if (typeof mode === 'string') {
        if (modeType === 'colorScheme') {
            return mode === 'light' || mode === 'dark' ? mode : null
        }
        return null // No contrast info in legacy mode
    }
    
    // Handle array mode
    if (Array.isArray(mode)) {
        if (modeType === 'colorScheme') {
            return mode.find(m => m === 'light' || m === 'dark') || null
        } else if (modeType === 'contrast') {
            return mode.find(m => m === 'normalContrast' || m === 'highContrast') || null
        }
    }
    
    return null
}

/**
 * Checks if a token matches the specified color scheme and contrast mode.
 * 
 * @param token - The transformed token to check
 * @param colorScheme - The color scheme to match ('light' or 'dark')
 * @param contrastMode - The contrast mode to match ('normalContrast' or 'highContrast')
 * @returns True if the token matches both modes
 */
export function tokenMatchesModes(
    token: TransformedToken,
    colorScheme: string,
    contrastMode?: string
): boolean {
    const tokenColorScheme = getSpecificModeFromToken(token, 'colorScheme')
    const tokenContrastMode = getSpecificModeFromToken(token, 'contrast')
    
    const colorSchemeMatches = tokenColorScheme === colorScheme
    const contrastMatches = contrastMode ? tokenContrastMode === contrastMode : true
    
    return colorSchemeMatches && contrastMatches
}
