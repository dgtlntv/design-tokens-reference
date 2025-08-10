import StyleDictionary from "style-dictionary"
import { cssVariablesCombinedFormat } from "./css/variables.formatter"

export function registerFormatters(): void {
    StyleDictionary.registerFormat(cssVariablesCombinedFormat)
}
