export type Environment = "development" | "production" | "test"

export interface EnvironmentConfig {
    name: Environment
    isDevelopment: boolean
    isProduction: boolean
    isTest: boolean
    features: {
        enableHotReload: boolean
        enableSourceMaps: boolean
        enableMinification: boolean
        enableCaching: boolean
        enableAnalytics: boolean
    }
}

export function getEnvironmentConfig(): EnvironmentConfig {
    const env = (process.env.NODE_ENV as Environment) || "development"

    return {
        name: env,
        isDevelopment: env === "development",
        isProduction: env === "production",
        isTest: env === "test",
        features: {
            enableHotReload: env === "development",
            enableSourceMaps: env !== "production",
            enableMinification: env === "production",
            enableCaching: env === "production",
            enableAnalytics: env === "production",
        },
    }
}
