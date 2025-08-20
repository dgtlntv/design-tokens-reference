import { TransformedToken } from "style-dictionary"

export interface TokenPath {
    source?: string | string[]
    include?: string | string[]
}

export interface TokenPaths {
    [key: string]: TokenPath | TokenPaths
}

export interface PlatformOverride {
    format?: string
    filter?: (token: TransformedToken) => boolean
}

export interface PlatformConfig {
    transformGroup?: string
    transforms?: string[]
    formatters?: any[]
    fileExtension: string
    defaultFormat: string
    categoryOverrides?: {
        [category: string]: PlatformOverride
    }
}

export interface BaseConfig {
    preprocessors?: string[]
    platforms: {
        [platform: string]: PlatformConfig
    }
}

export interface StyleDictionaryConfig {
    source?: string[]
    include?: string[]
    preprocessors?: string[]
    platforms: {
        [platform: string]: {
            transformGroup?: string
            transforms?: string[]
            formatters?: any[]
            files: Array<{
                destination: string
                format: string
                filter?: (token: TransformedToken) => boolean
            }>
        }
    }
}

export function generateStyleDictionaryConfigs(
    tokenPaths: TokenPaths,
    baseConfig: BaseConfig
): StyleDictionaryConfig[] {
    const configs: StyleDictionaryConfig[] = []

    // Recursively traverse the token paths
    function traverse(obj: TokenPaths, path: string[] = []): void {
        for (const [key, value] of Object.entries(obj)) {
            const currentPath = [...path, key]

            // Check if this is a TokenPath (has source or include) or nested object
            if (isTokenPath(value)) {
                const config = createConfig(
                    currentPath,
                    value as TokenPath,
                    baseConfig
                )
                if (config) configs.push(config)
            } else {
                // Continue traversing deeper
                traverse(value as TokenPaths, currentPath)
            }
        }
    }

    traverse(tokenPaths)
    return configs
}

function isTokenPath(obj: any): boolean {
    return (
        obj && typeof obj === "object" && ("source" in obj || "include" in obj)
    )
}

function createConfig(
    path: string[],
    tokenPath: TokenPath,
    baseConfig: BaseConfig
): StyleDictionaryConfig | null {
    // Extract tier, category, and any additional path segments
    const [tier, category, ...subPaths] = path

    // Skip if no sources or includes
    if (!tokenPath.source && !tokenPath.include) return null

    // Build platform configurations
    const platforms: StyleDictionaryConfig["platforms"] = {}

    for (const [platformName, platformConfig] of Object.entries(
        baseConfig.platforms
    )) {
        // Generate destination path from the full path array
        const destination = `${path.join("/")}.${platformConfig.fileExtension}`

        // Check for category-specific overrides
        const categoryOverride = platformConfig.categoryOverrides?.[category]

        platforms[platformName] = {
            ...(platformConfig.transformGroup && {
                transformGroup: platformConfig.transformGroup,
            }),
            ...(platformConfig.transforms && {
                transforms: platformConfig.transforms,
            }),
            ...(platformConfig.formatters && {
                formatters: platformConfig.formatters,
            }),
            files: [
                {
                    destination,
                    format:
                        categoryOverride?.format ||
                        platformConfig.defaultFormat,
                    ...(categoryOverride?.filter && {
                        filter: categoryOverride.filter,
                    }),
                },
            ],
        }
    }

    // Prepare source and include arrays
    const sources = tokenPath.source
        ? Array.isArray(tokenPath.source)
            ? tokenPath.source
            : [tokenPath.source]
        : undefined

    const includes = tokenPath.include
        ? Array.isArray(tokenPath.include)
            ? tokenPath.include
            : [tokenPath.include]
        : undefined

    return {
        ...(sources && { source: sources }),
        ...(includes && { include: includes }),
        ...(baseConfig.preprocessors && {
            preprocessors: baseConfig.preprocessors,
        }),
        platforms,
    }
}
