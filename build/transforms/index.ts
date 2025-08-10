import StyleDictionary from "style-dictionary"
import { dimensionW3cCssTransform } from "./css/dimension.transform"
import { colorW3cCssTransform } from "./css/color.transform"

export function registerTransforms(): void {
    StyleDictionary.registerTransform(dimensionW3cCssTransform)
    StyleDictionary.registerTransform(colorW3cCssTransform)
}

export const CSS_TRANSFORMS = [
    "name/kebab",
    "dimension/w3c-css",
    "color/w3c-css",
    "fontFamily/css",
]
