export interface BuildConfig {
    logLevel: "silent" | "default" | "verbose"
    useDtcg: boolean
}

export const BUILD_CONFIG: BuildConfig = {
    logLevel: "default",
    useDtcg: true,
}
