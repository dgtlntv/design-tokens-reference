import { CSS_PLATFORM_CONFIG } from "./css.config"
import { TOKEN_PATHS } from "./token-paths.config"
import type { TokenPaths } from "../types"

// Filter token paths based on tier
function getTokenPathsForTier(tier: string): TokenPaths {
    if (tier === "all") {
        return TOKEN_PATHS
    }

    // Return only the specified tier
    return {
        [tier]: (TOKEN_PATHS as Record<string, TokenPaths>)[tier],
    }
}

export { CSS_PLATFORM_CONFIG, TOKEN_PATHS, getTokenPathsForTier }
