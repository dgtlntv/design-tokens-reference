import StyleDictionary from 'style-dictionary'
import { figmaMetadataAction } from './figma/figma-metadata.action'
import { figmaThemesAction } from './figma/figma-themes.action'
import { cssIndexAction } from './css/css-index.action'

export function registerActions(): void {
  StyleDictionary.registerAction(figmaMetadataAction)
  StyleDictionary.registerAction(figmaThemesAction)
  StyleDictionary.registerAction(cssIndexAction)
}

export { figmaMetadataAction, figmaThemesAction, cssIndexAction }