import type { Transform } from "style-dictionary/types"
import type { DimensionToken, DimensionValue } from "../types/tokens.types"

function isDimensionValue(value: unknown): value is DimensionValue {
    return (
        value !== null &&
        typeof value === "object" &&
        "value" in value &&
        "unit" in value
    )
}

export const dimensionW3cCssTransform: Transform = {
    name: "dimension/w3c-css",
    type: "value",
    filter: (token): token is DimensionToken => {
        return (
            token.$type === "dimension" &&
            token.$value !== null &&
            isDimensionValue(token.$value)
        )
    },
    transform: (token: DimensionToken) => {
        const value = token.$value as DimensionValue
        return `${value.value}${value.unit}`
    },
}
