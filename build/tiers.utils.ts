import { readFileSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

// Get current directory for JSON import
const __filename: string = fileURLToPath(import.meta.url)
const __dirname: string = dirname(__filename)

interface BasePaths {
    [tierName: string]: {
        [type: string]: string
    }
}

interface TierConfig {
    include: string[]
    source: string[]
}

interface Tiers {
    [tierName: string]: TierConfig
}

interface TiersConfig {
    basePaths: BasePaths
    tiers: Tiers
}

// Load tiers configuration
const tiersConfig: TiersConfig = JSON.parse(
    readFileSync(join(__dirname, "tiers.json"), "utf8")
)

const { basePaths, tiers }: TiersConfig = tiersConfig

/**
 * Resolves a source reference (like "sites.primitive") to its actual file path
 */
function resolveSourcePath(sourceRef: string): string | null {
    const [tier, type]: string[] = sourceRef.split(".")
    return basePaths[tier]?.[type] || null
}

/**
 * Get resolved file paths for a specific tier, separated into includes and sources
 */
export function getTokenPathsForTier(tierName: string): { include: string[], source: string[] } {
    const tier: TierConfig = tiers[tierName]
    if (!tier) {
        throw new Error(`Tier "${tierName}" not found`)
    }

    const include = tier.include.map(resolveSourcePath).filter(Boolean) as string[]
    const source = tier.source.map(resolveSourcePath).filter(Boolean) as string[]

    return { include, source }
}

/**
 * Get resolved file paths for a specific tier (legacy - backwards compatibility)
 */
export function getSourcesForTier(tierName: string): string[] {
    const { include, source } = getTokenPathsForTier(tierName)
    return [...include, ...source]
}

/**
 * Get all tier names
 */
export function getAllTierNames(): string[] {
    return Object.keys(tiers)
}
