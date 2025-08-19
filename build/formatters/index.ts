import StyleDictionary from "style-dictionary"
import { cssTypographyFormat } from "./css/typography.formatter"

export function registerFormatters(): void {
    StyleDictionary.registerFormat(cssTypographyFormat)
}
