import type { PlatformConfig, TransformedToken } from "style-dictionary/types"
import { CSS_PLATFORM_CONFIG } from "../config/platforms/css.config"

/**
 * Creates a CSS platform configuration for Style Dictionary based on a specific tier and category.
 * This function customizes the base CSS platform configuration for targeted builds.
 *
 * @param tier - The tier name to use for CSS prefixes (e.g., 'sites', 'docs', 'apps')
 * @param category - Optional category to filter for (e.g., 'color', 'dimension', 'typography')
 * @param excludePrimitives - Whether to exclude primitive tokens from output
 * @param filenameTier - Optional separate tier name for filenames (defaults to tier)
 * @returns A complete PlatformConfig object ready for use with Style Dictionary
 */
export function createCSSPlatform(tier: string, category?: string, excludePrimitives = false, filenameTier?: string): PlatformConfig {
    // If no specific category, generate all files (legacy behavior)
    if (!category) {
        return {
            prefix: `${CSS_PLATFORM_CONFIG.prefix}-${tier}`,
            buildPath: CSS_PLATFORM_CONFIG.buildPath,
            transforms: CSS_PLATFORM_CONFIG.transforms,
            files: CSS_PLATFORM_CONFIG.files.map((file: any) => ({
                destination: file.destination.replace("{tier}", tier),
                format: file.format,
                filter: file.filter,
                options: {
                    ...CSS_PLATFORM_CONFIG.options,
                },
            })),
        }
    }

    // For specific categories, generate only the relevant file
    let fileConfig
    let filter: (token: TransformedToken) => boolean

    switch (category) {
        case 'color':
            filter = (token: TransformedToken) => {
                if (token.$type !== "color") return false
                // If excluding primitives, only include tokens that don't come from primitive files
                if (excludePrimitives) {
                    return !token.filePath?.includes('/primitive/')
                }
                return true
            }
            fileConfig = {
                destination: `${filenameTier || tier}.css`,
                format: "css/variables"
            }
            break
        case 'dimension':
            filter = (token: TransformedToken) => {
                if (token.$type !== "dimension") return false
                // If excluding primitives, only include tokens that don't come from primitive files
                if (excludePrimitives) {
                    return !token.filePath?.includes('/primitive/')
                }
                return true
            }
            fileConfig = {
                destination: `${filenameTier || tier}.css`,
                format: "css/variables"
            }
            break
        case 'typography':
            filter = (token: TransformedToken) => {
                if (token.$type === "typography") return true
                if (token.path && token.path.length > 0 && token.path[0] === "typography") return true
                return (token.$type === "fontFamily" || token.$type === "fontWeight" || token.$type === "fontStyle")
            }
            fileConfig = {
                destination: `${filenameTier || tier}.css`,
                format: "css/typography"
            }
            break
        case 'assets':
            filter = (token: TransformedToken) => token.$type === "asset"
            fileConfig = {
                destination: `${filenameTier || tier}.css`,
                format: "css/variables"
            }
            break
        case 'grid':
            filter = (token: TransformedToken) => token.$type === "grid"
            fileConfig = {
                destination: `${filenameTier || tier}.css`,
                format: "css/variables"
            }
            break
        case 'motion':
            filter = (token: TransformedToken) => token.$type === "duration"
            fileConfig = {
                destination: `${filenameTier || tier}.css`,
                format: "css/variables"
            }
            break
        case 'shadows':
            filter = (token: TransformedToken) => token.$type === "shadow"
            fileConfig = {
                destination: `${filenameTier || tier}.css`,
                format: "css/variables"
            }
            break
        default:
            throw new Error(`Unknown category: ${category}`)
    }

    return {
        prefix: `${CSS_PLATFORM_CONFIG.prefix}-${tier}`,
        buildPath: CSS_PLATFORM_CONFIG.buildPath,
        transforms: CSS_PLATFORM_CONFIG.transforms,
        files: [{
            destination: fileConfig.destination,
            format: fileConfig.format,
            filter: filter,
            options: {
                ...CSS_PLATFORM_CONFIG.options,
            },
        }],
    }
}
