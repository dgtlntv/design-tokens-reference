import fs from 'fs/promises'
import path from 'path'
import type { Action } from 'style-dictionary/types'

export const figmaMetadataAction: Action = {
  name: 'figma-metadata',
  do: async (dictionary, config) => {
    const buildPath = config.buildPath || 'dist/figma/'
    const metadataPath = path.join(buildPath, '$metadata.json')
    
    const metadata = {
      "tokenSetOrder": [
        "apps/color/dark/highContrast",
        "apps/color/dark/normalContrast",
        "apps/color/light/highContrast",
        "apps/color/light/normalContrast",
        "apps/color/primitive",
        "apps/dimension/large",
        "apps/dimension/medium",
        "apps/dimension/primitive",
        "apps/dimension/small",
        "apps/dimension/xLarge",
        "apps/typography",
        "docs/color/dark/highContrast",
        "docs/color/dark/normalContrast",
        "docs/color/light/highContrast",
        "docs/color/light/normalContrast",
        "docs/color/primitive",
        "docs/dimension/large",
        "docs/dimension/medium",
        "docs/dimension/primitive",
        "docs/dimension/small",
        "docs/dimension/xLarge",
        "docs/typography",
        "sites/color/dark/highContrast",
        "sites/color/dark/normalContrast",
        "sites/color/light/highContrast",
        "sites/color/light/normalContrast",
        "sites/color/primitive",
        "sites/dimension/large",
        "sites/dimension/medium",
        "sites/dimension/primitive",
        "sites/dimension/small",
        "sites/dimension/xLarge",
        "sites/typography"
      ]
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    console.log(`✓ Generated Figma metadata: ${metadataPath}`)
  }
}