import type { TierConfig } from "../config/tiers.config"
import type { ResolvedTokenPaths } from "../types/shared.types"
import { TIERS_CONFIG } from "../config"

export class TierService {
    private readonly basePaths = TIERS_CONFIG.basePaths
    private readonly tiers = TIERS_CONFIG.tiers

    /**
     * Resolves a source reference (like "sites.primitive") to its actual file path
     */
    private resolveSourcePath(sourceRef: string): string | null {
        const [tier, type] = sourceRef.split(".")
        return this.basePaths[tier]?.[type] || null
    }

    /**
     * Get resolved file paths for a specific tier
     */
    getTokenPaths(tierName: string): ResolvedTokenPaths {
        const tier = this.tiers[tierName]
        if (!tier) {
            throw new Error(`Tier "${tierName}" not found`)
        }

        const include = tier.include
            .map((ref) => this.resolveSourcePath(ref))
            .filter((path): path is string => path !== null)

        const source = tier.source
            .map((ref) => this.resolveSourcePath(ref))
            .filter((path): path is string => path !== null)

        return { include, source }
    }

    /**
     * Get all available tier names
     */
    getAllTierNames(): string[] {
        return Object.keys(this.tiers)
    }

    /**
     * Get configuration for a specific tier
     */
    getTierConfig(tierName: string): TierConfig {
        const tier = this.tiers[tierName]
        if (!tier) {
            throw new Error(`Tier "${tierName}" not found`)
        }
        return tier
    }

    /**
     * Check if a tier exists
     */
    tierExists(tierName: string): boolean {
        return tierName in this.tiers
    }

    /**
     * Get tier description
     */
    getTierDescription(tierName: string): string {
        return this.getTierConfig(tierName).description
    }
}

// Export singleton instance
export const tierService = new TierService()
