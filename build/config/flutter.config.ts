import type { PlatformConfig } from "style-dictionary/types"

export const FLUTTER_PLATFORM_CONFIG: PlatformConfig = {
    transformGroup: "flutter",
    transforms: ["name/camel"],
    fileExtension: "dart",
    defaultFormat: "flutter/class.dart",
}
