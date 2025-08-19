import type { PlatformConfig, TransformedToken } from "style-dictionary/types"
import {
    getCSSFileConfig,
    CSS_BASE_CONFIG,
} from "../config/css.config"

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
export function createCSSPlatform(
    tier: string,
    category?: string,
    excludePrimitives = false,
    filenameTier?: string
): PlatformConfig {
    // If no specific category, generate all files using base configuration
    if (!category) {
        return {
            prefix: `${CSS_BASE_CONFIG.prefix}-${tier}`,
            buildPath: CSS_BASE_CONFIG.buildPath,
            transforms: CSS_BASE_CONFIG.transforms,
            files: CSS_BASE_CONFIG.files.map((file) => ({
                destination:
                    file.destination?.replace("{tier}", tier) || `${tier}.css`,
                format: file.format,
                filter: file.filter,
                options: {
                    ...CSS_BASE_CONFIG.options,
                },
            })),
        }
    }

    // For specific categories, get the matching file configuration
    const categoryFileConfig = getCSSFileConfig(category)

    if (!categoryFileConfig) {
        throw new Error(
            `No file configuration found for category: ${category}`
        )
    }

    return {
        prefix: `${CSS_BASE_CONFIG.prefix}-${tier}`,
        buildPath: CSS_BASE_CONFIG.buildPath,
        transforms: CSS_BASE_CONFIG.transforms,
        files: [
            {
                destination: (filenameTier || tier) + ".css",
                format: categoryFileConfig.format,
                filter: excludePrimitives
                    ? (token: TransformedToken) => {
                          if (!categoryFileConfig.filter) return true
                          if (!categoryFileConfig.filter(token)) return false
                          return !token.filePath?.includes("/primitive/")
                      }
                    : categoryFileConfig.filter,
                options: {
                    ...CSS_BASE_CONFIG.options,
                },
            },
        ],
    }
}
