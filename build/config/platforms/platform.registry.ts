import type { PlatformConfig } from "../../types/platform.types"
import { CSS_PLATFORM_CONFIG } from "./css.config"
import { FIGMA_PLATFORM_CONFIG } from "./figma.config"
import { FLUTTER_PLATFORM_CONFIG } from "./flutter.config"

export class PlatformRegistry {
    private platforms: Map<string, PlatformConfig>

    constructor() {
        this.platforms = new Map()
        this.registerDefaults()
    }

    private registerDefaults(): void {
        this.register("css", CSS_PLATFORM_CONFIG)
        this.register("figma", FIGMA_PLATFORM_CONFIG)
        this.register("flutter", FLUTTER_PLATFORM_CONFIG)
    }

    register(name: string, config: PlatformConfig): void {
        this.platforms.set(name, config)
    }

    get(name: string): PlatformConfig | undefined {
        return this.platforms.get(name)
    }

    getAll(): Map<string, PlatformConfig> {
        return new Map(this.platforms)
    }

    has(name: string): boolean {
        return this.platforms.has(name)
    }

    getEnabledPlatforms(): string[] {
        return Array.from(this.platforms.entries())
            .filter(([_, config]) => config.enabled)
            .map(([name]) => name)
    }
}

export const platformRegistry = new PlatformRegistry()
