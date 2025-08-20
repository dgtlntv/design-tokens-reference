import type { Config, TransformedToken } from "style-dictionary/types"
import type { ExtendedConfig, TokenPath, TokenPaths } from "../types"

export function generateStyleDictionaryConfigs(
    tokenPaths: TokenPaths,
    baseConfig: ExtendedConfig
): Config[] {
    const configs: Config[] = []

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

function isTokenPath(obj: unknown): obj is TokenPath {
    return (
        obj !== null &&
        typeof obj === "object" &&
        ("source" in obj || "include" in obj || "reference" in obj)
    )
}

function createReferenceFilter(
    referencePaths: string[]
): (token: TransformedToken) => boolean {
    return (token: TransformedToken) => {
        // Check if the token comes from a reference file
        // Style Dictionary may provide the source file path in various properties
        const tokenWithFile = token as TransformedToken & {
            filePath?: string
            file?: string
        }

        const tokenFilePath = tokenWithFile.filePath || tokenWithFile.file

        if (!tokenFilePath) return true

        // Normalize paths for comparison
        const normalizedTokenPath = tokenFilePath
            .replace(/\\/g, "/")
            .replace(/^\.\//, "")

        return !referencePaths.some((refPath) => {
            const normalizedRefPath = refPath
                .replace(/\\/g, "/")
                .replace(/^\.\//, "")
            return (
                normalizedTokenPath === normalizedRefPath ||
                normalizedTokenPath.endsWith(normalizedRefPath)
            )
        })
    }
}

function createConfig(
    path: string[],
    tokenPath: TokenPath,
    baseConfig: ExtendedConfig
): Config | null {
    if (!tokenPath.source && !tokenPath.include && !tokenPath.reference)
        return null

    const { platforms: basePlatforms, ...restOfBaseConfig } = baseConfig
    const platforms: Config["platforms"] = {}

    // Prepare reference paths for filtering
    const referencePaths = tokenPath.reference
        ? Array.isArray(tokenPath.reference)
            ? tokenPath.reference
            : [tokenPath.reference]
        : []

    for (const [platformName, platformConfig] of Object.entries(
        basePlatforms
    )) {
        const category = path[1]
        const categoryOverride = platformConfig.categoryOverrides?.[category]

        // Create combined filter if we have both category override and reference filter
        let combinedFilter: ((token: TransformedToken) => boolean) | undefined

        if (referencePaths.length > 0 && categoryOverride?.filter) {
            // Combine reference filter with category override filter
            const referenceFilter = createReferenceFilter(referencePaths)
            const categoryFilter = categoryOverride.filter
            combinedFilter = (token: TransformedToken) =>
                referenceFilter(token) && categoryFilter(token)
        } else if (referencePaths.length > 0) {
            // Only reference filter
            combinedFilter = createReferenceFilter(referencePaths)
        } else if (categoryOverride?.filter) {
            // Only category override filter
            combinedFilter = categoryOverride.filter
        }

        platforms[platformName] = {
            ...platformConfig,
            files: [
                {
                    destination: `${path.join("/")}.${platformConfig.fileExtension}`,
                    format:
                        categoryOverride?.format ||
                        platformConfig.defaultFormat,
                    ...(combinedFilter && { filter: combinedFilter }),
                },
            ],
        }
    }

    const sources = Array.isArray(tokenPath.source)
        ? tokenPath.source
        : tokenPath.source
          ? [tokenPath.source]
          : undefined

    // Combine includes and references into the include array
    const includeFiles: string[] = []

    if (tokenPath.include) {
        const includes = Array.isArray(tokenPath.include)
            ? tokenPath.include
            : [tokenPath.include]
        includeFiles.push(...includes)
    }

    if (tokenPath.reference) {
        const references = Array.isArray(tokenPath.reference)
            ? tokenPath.reference
            : [tokenPath.reference]
        includeFiles.push(...references)
    }

    const finalIncludes = includeFiles.length > 0 ? includeFiles : undefined

    return {
        ...restOfBaseConfig,
        ...(sources && { source: sources }),
        ...(finalIncludes && { include: finalIncludes }),
        platforms,
    }
}
