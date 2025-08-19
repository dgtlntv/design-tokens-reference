/**
 * Build process types for design token compilation.
 * Contains types specific to the build pipeline and execution.
 */

import type { Platform } from "./platform.types"

/** Options for building design tokens */
export interface BuildOptions {
    /** The tier name to build (e.g., "primitive", "semantic") */
    tier: string
    /** The target platform (defaults to "css") */
    platform?: Platform
}

/** Result object returned after a build operation */
export interface BuildResult {
    /** The tier that was built */
    tier: string
    /** Whether the build completed successfully */
    success: boolean
    /** Error object if the build failed */
    error?: Error
    /** Build duration in milliseconds */
    duration?: number
}