import StyleDictionary from "style-dictionary"
import { cssColorsFormat } from "./css/colors.formatter"
import { cssDimensionsFormat } from "./css/dimensions.formatter"
import { cssGenericFormat } from "./css/generic.formatter"
import { cssTypographyFormat } from "./css/typography.formatter"

export function registerFormatters(): void {
    StyleDictionary.registerFormat(cssColorsFormat)
    StyleDictionary.registerFormat(cssDimensionsFormat)
    StyleDictionary.registerFormat(cssTypographyFormat)
    StyleDictionary.registerFormat(cssGenericFormat)
}
