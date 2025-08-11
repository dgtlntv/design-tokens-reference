import StyleDictionary from "style-dictionary"
import { extensionsDelegate } from "./extensions-delegate"

export function registerPreprocessors(): void {
    StyleDictionary.registerPreprocessor({
        name: "extensions-delegate",
        preprocessor: (dictionary) => extensionsDelegate(dictionary)
    })
}

export { extensionsDelegate } from "./extensions-delegate"