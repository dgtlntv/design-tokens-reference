import fs from 'fs/promises'
import path from 'path'
import type { Action } from 'style-dictionary/types'

async function findCssFiles(tierPath: string, relativePath: string = ''): Promise<string[]> {
  const files: string[] = []
  
  try {
    const entries = await fs.readdir(path.join(tierPath, relativePath), { withFileTypes: true })
    
    for (const entry of entries) {
      const entryPath = path.join(relativePath, entry.name)
      
      if (entry.isDirectory()) {
        // Recursively search subdirectories
        const subFiles = await findCssFiles(tierPath, entryPath)
        files.push(...subFiles)
      } else if (entry.isFile() && entry.name.endsWith('.css') && entry.name !== 'index.css') {
        // Add CSS files (excluding index.css to avoid circular imports)
        files.push(entryPath)
      }
    }
  } catch (error) {
    // Directory might not exist yet during first run
    console.log(`Note: Could not read directory ${path.join(tierPath, relativePath)}`)
  }
  
  return files.sort()
}

function generateColorImports(colorFiles: string[]): string {
  let colorSection = `/* Color tokens with media queries and data attribute overrides */\n`
  
  // Default: light/normalContrast
  const defaultFile = colorFiles.find(file => file === 'color/light/normalContrast.css')
  if (defaultFile) {
    colorSection += `@import './${defaultFile}';\n\n`
  }
  
  // Media queries for color scheme and contrast preferences
  const darkNormal = colorFiles.find(file => file === 'color/dark/normalContrast.css')
  const lightHigh = colorFiles.find(file => file === 'color/light/highContrast.css')  
  const darkHigh = colorFiles.find(file => file === 'color/dark/highContrast.css')
  
  if (darkNormal) {
    colorSection += `@media (prefers-color-scheme: dark) {\n  @import './${darkNormal}';\n}\n\n`
  }
  
  if (lightHigh) {
    colorSection += `@media (prefers-contrast: more) {\n  @import './${lightHigh}';\n}\n\n`
  }
  
  if (darkHigh) {
    colorSection += `@media (prefers-color-scheme: dark) and (prefers-contrast: more) {\n  @import './${darkHigh}';\n}\n\n`
  }
  
  // Data attribute overrides
  colorSection += `/* Data attribute overrides */\n`
  
  // Full overrides (both theme and contrast specified)
  if (colorFiles.find(file => file === 'color/light/normalContrast.css')) {
    colorSection += `[data-theme="light"][data-contrast="normal"] {\n  @import './color/light/normalContrast.css';\n}\n\n`
  }
  
  if (colorFiles.find(file => file === 'color/light/highContrast.css')) {
    colorSection += `[data-theme="light"][data-contrast="high"] {\n  @import './color/light/highContrast.css';\n}\n\n`
  }
  
  if (colorFiles.find(file => file === 'color/dark/normalContrast.css')) {
    colorSection += `[data-theme="dark"][data-contrast="normal"] {\n  @import './color/dark/normalContrast.css';\n}\n\n`
  }
  
  if (colorFiles.find(file => file === 'color/dark/highContrast.css')) {
    colorSection += `[data-theme="dark"][data-contrast="high"] {\n  @import './color/dark/highContrast.css';\n}\n\n`
  }
  
  // Partial overrides (only theme set, contrast from media query)
  if (darkNormal && lightHigh) {
    colorSection += `[data-theme="light"]:not([data-contrast]) {\n  @import './color/light/normalContrast.css';\n}\n`
    colorSection += `[data-theme="light"]:not([data-contrast]) {\n  @media (prefers-contrast: more) {\n    @import './color/light/highContrast.css';\n  }\n}\n\n`
    
    colorSection += `[data-theme="dark"]:not([data-contrast]) {\n  @import './color/dark/normalContrast.css';\n}\n`
    colorSection += `[data-theme="dark"]:not([data-contrast]) {\n  @media (prefers-contrast: more) {\n    @import './color/dark/highContrast.css';\n  }\n}\n\n`
  }
  
  // Partial overrides (only contrast set, theme from media query)  
  if (darkNormal && lightHigh) {
    colorSection += `[data-contrast="normal"]:not([data-theme]) {\n  @import './color/light/normalContrast.css';\n}\n`
    colorSection += `[data-contrast="normal"]:not([data-theme]) {\n  @media (prefers-color-scheme: dark) {\n    @import './color/dark/normalContrast.css';\n  }\n}\n\n`
    
    colorSection += `[data-contrast="high"]:not([data-theme]) {\n  @import './color/light/highContrast.css';\n}\n`
    colorSection += `[data-contrast="high"]:not([data-theme]) {\n  @media (prefers-color-scheme: dark) {\n    @import './color/dark/highContrast.css';\n  }\n}\n\n`
  }
  
  return colorSection
}

function generateDimensionImports(dimensionFiles: string[]): string {
  let dimensionSection = `/* Dimension tokens with breakpoint media queries */\n`
  
  // Default: small
  const defaultFile = dimensionFiles.find(file => file === 'dimension/small.css')
  if (defaultFile) {
    dimensionSection += `@import './${defaultFile}';\n\n`
  }
  
  // Breakpoint media queries
  const mediumFile = dimensionFiles.find(file => file === 'dimension/medium.css')
  const largeFile = dimensionFiles.find(file => file === 'dimension/large.css')
  const xLargeFile = dimensionFiles.find(file => file === 'dimension/xLarge.css')
  
  if (mediumFile) {
    dimensionSection += `@media (min-width: 620px) {\n  @import './${mediumFile}';\n}\n\n`
  }
  
  if (largeFile) {
    dimensionSection += `@media (min-width: 1036px) {\n  @import './${largeFile}';\n}\n\n`
  }
  
  if (xLargeFile) {
    dimensionSection += `@media (min-width: 1681px) {\n  @import './${xLargeFile}';\n}\n\n`
  }
  
  return dimensionSection
}

export const cssIndexAction: Action = {
  name: 'css-index',
  do: async (dictionary, config) => {
    const buildPath = 'dist/css/'
    
    // Extract tier from individual file destination
    const firstFile = config.files?.[0]
    if (!firstFile || !firstFile.destination) return
    
    // Extract tier from destination path (e.g., "apps/color/primitive.css" -> "apps")
    const tierMatch = firstFile.destination.match(/^([^\/]+)\//)
    if (!tierMatch) return
    
    const tier = tierMatch[1]
    const tierPath = path.join(buildPath, tier)
    const indexPath = path.join(tierPath, 'index.css')
    
    // Dynamically find all CSS files in the tier directory
    const cssFiles = await findCssFiles(tierPath)
    
    if (cssFiles.length === 0) {
      console.log(`Note: No CSS files found in ${tierPath}`)
      return
    }
    
    // Categorize files
    const primitiveFiles = cssFiles.filter(file => file.includes('primitive'))
    const colorFiles = cssFiles.filter(file => file.startsWith('color/') && !file.includes('primitive'))
    const dimensionFiles = cssFiles.filter(file => file.startsWith('dimension/') && !file.includes('primitive'))
    const otherFiles = cssFiles.filter(file => !file.startsWith('color/') && !file.startsWith('dimension/') && !file.includes('primitive'))
    
    // Generate imports for different categories
    let indexContent = `/* Auto-generated index file for ${tier} tier CSS tokens */\n\n`
    
    // Handle primitive files first (base tokens)
    if (primitiveFiles.length > 0) {
      indexContent += primitiveFiles
        .map(file => `@import './${file}';`)
        .join('\n') + '\n\n'
    }
    
    // Handle other files (like typography) normally
    if (otherFiles.length > 0) {
      indexContent += otherFiles
        .map(file => `@import './${file}';`)
        .join('\n') + '\n\n'
    }
    
    // Handle color files with media queries and data attributes
    if (colorFiles.length > 0) {
      indexContent += generateColorImports(colorFiles)
    }
    
    // Handle dimension files with breakpoint media queries
    if (dimensionFiles.length > 0) {
      indexContent += generateDimensionImports(dimensionFiles)
    }
    
    await fs.writeFile(indexPath, indexContent)
    console.log(`✓ Generated CSS index: ${indexPath} (${cssFiles.length} imports)`)
  }
}