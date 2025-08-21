import StyleDictionary from "style-dictionary"
import { cssTypographyFormat } from "./css/typography.formatter"
import { jsonFigmaTypographyFormat } from "./json/figma-typography.formatter"
import { jsonNestedReferencesFormat } from "./json/nested-references.formatter"

export function registerFormatters(): void {
    StyleDictionary.registerFormat(cssTypographyFormat)
    StyleDictionary.registerFormat(jsonNestedReferencesFormat)
    StyleDictionary.registerFormat(jsonFigmaTypographyFormat)
}
