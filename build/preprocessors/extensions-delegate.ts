/*
 * Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * MODIFICATIONS:
 * This file has been modified from the original Style Dictionary source.
 * Original: https://github.com/style-dictionary/style-dictionary/blob/9f84a81e65776562d66f0b0fb087043c785bb031/lib/utils/typeDtcgDelegate.js
 * Modified to delegate $extensions instead of $type, and adapted from JavaScript to TypeScript.
 */

import type {
    DesignToken,
    DesignTokens,
    PreprocessedTokens,
} from "style-dictionary/types"

/**
 * Type guard to check if a value is a plain object.
 * @param obj - The value to check
 * @returns True if the value is a plain object
 */
function isPlainObject(obj: any): obj is Record<string, any> {
    return (
        obj !== null && typeof obj === "object" && obj.constructor === Object
    )
}

/**
 * Delegates group-level $extensions to individual tokens, similar to how $type works.
 * Based on Style Dictionary's typeDtcgDelegate utility.
 * 
 * This preprocessor ensures that tokens inherit extensions from their parent groups,
 * allowing for cleaner token organization while maintaining extension data on individual tokens.
 * 
 * @param tokens - The token tree to process
 * @returns Preprocessed tokens with delegated extensions
 */
export function extensionsDelegate(tokens: DesignTokens): PreprocessedTokens {
    const clone = structuredClone(tokens) as PreprocessedTokens

    const recurse = (slice: DesignTokens | DesignToken, extensions?: any) => {
        let currentExtensions = extensions // keep track of extensions through the stack
        const keys = Object.keys(slice)

        // If we don't have $extensions on this level but we have inherited extensions,
        // and this is a token level (has $value), apply the inherited extensions
        if (
            !keys.includes("$extensions") &&
            currentExtensions &&
            keys.includes("$value")
        ) {
            slice.$extensions = currentExtensions
        }

        // If this level has $extensions, update our current extensions
        if (slice.$extensions) {
            // Merge with parent extensions (child extensions override parent)
            currentExtensions = currentExtensions
                ? { ...currentExtensions, ...slice.$extensions }
                : slice.$extensions

            // Remove group level $extensions (keep only on token level)
            if (slice.$value === undefined) {
                delete slice.$extensions
            }
        }

        // Recurse into child objects
        Object.values(slice).forEach((val) => {
            if (isPlainObject(val)) {
                recurse(val, currentExtensions)
            }
        })
    }

    recurse(clone)
    return clone
}
