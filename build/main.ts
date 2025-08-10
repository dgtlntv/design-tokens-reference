import { TokenBuilder } from "./builder/token-builder"
import { tierService } from "./services/tier.service"
import { configFactory, getEnvironmentConfig } from "./config"
import type { BuildResult } from "./types/shared.types"

class CLI {
    private builder: TokenBuilder
    private startTime: number = 0

    constructor() {
        this.builder = new TokenBuilder()
    }

    async run(): Promise<void> {
        const tier = process.argv[2]
        const availableTiers = tierService.getAllTierNames()
        const environment = getEnvironmentConfig()

        console.log(`🔧 Environment: ${environment.name}`)
        console.log(
            `📦 Enabled platforms: ${configFactory.getEnabledPlatforms().join(", ")}`
        )

        if (!tier) {
            this.printUsage(availableTiers)
            process.exit(1)
        }

        this.startTime = Date.now()

        if (tier === "all") {
            await this.buildAllTiers(availableTiers)
        } else if (tierService.tierExists(tier)) {
            await this.buildSingleTier(tier)
        } else {
            this.printUsage(availableTiers)
            process.exit(1)
        }
    }

    private async buildAllTiers(tiers: string[]): Promise<void> {
        console.log("Building tokens for all tiers...")
        const buildConfig = configFactory.getBuildConfig()

        const buildPromises = tiers.map(
            async (tierName): Promise<BuildResult> => {
                const tierStart = Date.now()
                console.log(`Building tokens for tier: ${tierName}`)

                try {
                    await this.builder.build({ tier: tierName })
                    const duration = Date.now() - tierStart
                    console.log(`✅ Built ${tierName}.css (${duration}ms)`)
                    return { tier: tierName, success: true, duration }
                } catch (error) {
                    const err = error as Error
                    console.error(
                        `❌ Failed to build ${tierName}.css:`,
                        err.message
                    )
                    return { tier: tierName, success: false, error: err }
                }
            }
        )

        const results = buildConfig.parallelBuilds
            ? await Promise.all(buildPromises)
            : await this.runSequentially(buildPromises)

        this.handleResults(results)
    }

    private async runSequentially<T>(promises: Promise<T>[]): Promise<T[]> {
        const results: T[] = []
        for (const promise of promises) {
            results.push(await promise)
        }
        return results
    }

    private async buildSingleTier(tier: string): Promise<void> {
        console.log(`Building tokens for tier: ${tier}`)
        console.log(`  Description: ${tierService.getTierDescription(tier)}`)

        const tierStart = Date.now()

        try {
            await this.builder.build({ tier })
            const duration = Date.now() - tierStart
            console.log(`✅ Built ${tier}.css (${duration}ms)`)
        } catch (error) {
            const err = error as Error
            console.error(`❌ Failed to build ${tier}.css:`, err.message)
            process.exit(1)
        }
    }

    private handleResults(results: BuildResult[]): void {
        const failed = results.filter((r) => !r.success)
        const totalDuration = Date.now() - this.startTime

        if (failed.length > 0) {
            console.error(`\n❌ ${failed.length} tier(s) failed to build:`)
            failed.forEach((f) => {
                console.error(`  - ${f.tier}: ${f.error?.message}`)
            })
            process.exit(1)
        } else {
            console.log(
                `\n🎉 All tiers built successfully in ${totalDuration}ms!`
            )
        }
    }

    private printUsage(availableTiers: string[]): void {
        console.log("Usage: node cli.js <tier|all>")
        console.log(`Available tiers: ${availableTiers.join(", ")}, all`)
        console.log("\nEnvironment variables:")
        console.log("  NODE_ENV=development|production|test")
    }
}

// Main execution
if (require.main === module) {
    const cli = new CLI()
    cli.run().catch((error: Error) => {
        console.error("❌ Build failed:", error)
        process.exit(1)
    })
}

// Export for testing
export { CLI }
