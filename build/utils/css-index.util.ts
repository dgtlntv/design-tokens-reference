import { promises as fs } from "fs"
import path from "path"

/**
 * Breakpoint configuration for dimension modes
 */
const DIMENSION_BREAKPOINTS = {
    small: null, // Default, no media query
    medium: "620px",
    large: "1036px", 
    xLarge: "1681px",
} as const

/**
 * Color mode configuration
 */
const COLOR_MODES = {
    light: null, // Default, no media query
    dark: "(prefers-color-scheme: dark)",
} as const

/**
 * Generates CSS index file with imports and media queries for a specific tier
 */
export async function generateCSSIndex(tier: string, buildPath: string = "dist/css/"): Promise<void> {
    const imports: string[] = []

    try {
        // Read all CSS files for this tier
        const allFiles = await fs.readdir(buildPath)
        const tierFiles = allFiles.filter(file => 
            file.startsWith(`${tier}-`) && file.endsWith('.css')
        )

        // Separate files by category
        const primitiveFiles: string[] = []
        const colorModeFiles: string[] = []
        const dimensionModeFiles: string[] = []
        const regularFiles: string[] = []

        for (const file of tierFiles) {
            if (file.includes('-primitive.css')) {
                primitiveFiles.push(file)
            } else if (file.includes('-color-')) {
                colorModeFiles.push(file)
            } else if (file.includes('-dimension-')) {
                dimensionModeFiles.push(file)
            } else {
                regularFiles.push(file)
            }
        }

        // Add primitive files first (always imported)
        primitiveFiles.forEach(file => {
            imports.push(`@import "./${file}";`)
        })

        // Add regular files (typography, assets, etc.)
        regularFiles.forEach(file => {
            imports.push(`@import "./${file}";`)
        })

        // Add color mode imports with media queries (light first, then dark)
        const sortedColorFiles = colorModeFiles.sort((a, b) => {
            const getColorOrder = (file: string) => {
                if (file.includes('-color-light.css')) return 0
                if (file.includes('-color-dark.css')) return 1
                return 999
            }
            return getColorOrder(a) - getColorOrder(b)
        })

        sortedColorFiles.forEach(file => {
            const mode = Object.keys(COLOR_MODES).find(m => file.includes(`-color-${m}.css`))
            if (mode) {
                const mediaQuery = COLOR_MODES[mode as keyof typeof COLOR_MODES]
                if (mediaQuery) {
                    imports.push(`@import "./${file}" ${mediaQuery};`)
                } else {
                    // Light mode is default - no media query
                    imports.push(`@import "./${file}";`)
                }
            }
        })

        // Add dimension mode imports with media queries
        const sortedDimensionFiles = dimensionModeFiles.sort((a, b) => {
            const getModeOrder = (file: string) => {
                if (file.includes('-small.css')) return 0
                if (file.includes('-medium.css')) return 1
                if (file.includes('-large.css')) return 2
                if (file.includes('-xLarge.css')) return 3
                return 999
            }
            return getModeOrder(a) - getModeOrder(b)
        })

        sortedDimensionFiles.forEach(file => {
            const mode = Object.keys(DIMENSION_BREAKPOINTS).find(m => 
                file.includes(`-dimension-${m}.css`)
            )
            if (mode) {
                const breakpoint = DIMENSION_BREAKPOINTS[mode as keyof typeof DIMENSION_BREAKPOINTS]
                if (breakpoint) {
                    imports.push(`@import "./${file}" (min-width: ${breakpoint});`)
                } else {
                    // Small is default - no media query needed
                    imports.push(`@import "./${file}";`)
                }
            }
        })

        // Generate the index file content
        const indexContent = [
            `/**`,
            ` * Auto-generated CSS index for ${tier} tier`,
            ` * Do not edit directly - regenerated on each build`,
            ` */`,
            ``,
            ...imports,
            ``
        ].join('\n')

        // Write the index file
        const indexFilePath = path.join(buildPath, `${tier}.css`)
        await fs.writeFile(indexFilePath, indexContent, 'utf-8')
        
        console.log(`✅ Generated ${indexFilePath}`)

    } catch (error) {
        console.error(`❌ Failed to generate CSS index for ${tier}:`, error)
        throw error
    }
}

