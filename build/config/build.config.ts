export interface BuildConfig {
    outputPath: string
    logLevel: "silent" | "default" | "verbose"
    useDtcg: boolean
    cleanOutputBeforeBuild: boolean
    generateDocs: boolean
    throwOnBuildError: boolean
    parallelBuilds: boolean
}

export const BUILD_CONFIG: BuildConfig = {
    outputPath: "dist",
    logLevel: "default",
    useDtcg: true,
    cleanOutputBeforeBuild: false,
    generateDocs: false,
    throwOnBuildError: true,
    parallelBuilds: true,
}

// Development overrides
export const DEV_BUILD_CONFIG: Partial<BuildConfig> = {
    logLevel: "verbose",
    cleanOutputBeforeBuild: false,
    throwOnBuildError: false,
}

// Production overrides
export const PROD_BUILD_CONFIG: Partial<BuildConfig> = {
    logLevel: "silent",
    cleanOutputBeforeBuild: true,
    generateDocs: true,
    throwOnBuildError: true,
}

// Test overrides
export const TEST_BUILD_CONFIG: Partial<BuildConfig> = {
    logLevel: "silent",
    cleanOutputBeforeBuild: true,
    throwOnBuildError: false,
    parallelBuilds: false,
}
