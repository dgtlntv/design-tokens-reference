import StyleDictionary from "style-dictionary"
import { colorW3cCssTransform } from "./css/color.transform"
import { dimensionW3cCssTransform } from "./css/dimension.transform"

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
